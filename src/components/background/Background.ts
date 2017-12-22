declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from '../options/Authentication';
import { Options } from '../options/Options';
import { PlatformUrls } from '../options/PlatformUrls';

export class Background extends BasicComponent {
    private _constantQueryExpression: string = 'NOT (@filetype=(Txt, .oleFile, Folder))';

    private _activeQuery: string = '';

    private _authentication: Authentication;
    private _environment: string = 'production';
    private _organizationId: string = null;
    private _userToken: string = null;

    constructor() {
        super ('Background');
    }


    public loadOptions(callback: Function = null): void {
        chrome.storage.local.get(
            {
                'coveoforgooglecloudsearch_environment': 'production',
                'coveoforgooglecloudsearch_usertoken': null,
                'coveoforgooglecloudsearch_organization': null
            }, 
            (items) => {
                this._environment = items['coveoforgooglecloudsearch_environment'];
                if (!this._environment) {
                    this._environment = 'production';
                }
                this._organizationId = items['coveoforgooglecloudsearch_organization'];
                this._userToken = items['coveoforgooglecloudsearch_usertoken'];

                if (callback) {
                    callback();
                }
            }
        );
    }

    public validateOptions(): void {
        if (this._userToken && this._environment) {
            this._authentication.validateToken(this._environment, this._userToken, (xhttp: any) => {
                if (xhttp.status === 200) {
                    this.search(this._activeQuery);
                } else {
                    this.updateLabel('...');
                }
            });
        } else {
            this.updateLabel('...');
        }
    }

    public updateLabel(message: string) {
        chrome.browserAction.setBadgeText({text: message});
    }


    public listenForMessages(): void {
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (request.command == 'updateLabel') {
                    chrome.browserAction.setBadgeText({text: request.labelText});
                } else if (request.command == 'getActiveQueryAndOptions') {
                    sendResponse({
                        activeQuery: this._activeQuery,
                        environment: this._environment,
                        organizationId: this._organizationId,
                        userToken: this._userToken
                    });
                } else if (request.command == 'loadOptions') {
                    this.loadOptions(() => {
                        sendResponse({
                            environment: this._environment,
                            organizationId: this._organizationId,
                            userToken: this._userToken
                        });
                    });
                } else if (request.command == 'search') {
                    // TODO : do something with request.origin?;
                    this.search(request.queryExpression);
                } else if (request.command == 'isUserLoggedIn') {
                    this.isUserLoggedIn((message) => {
                        sendResponse(message);
                    });
                } else if (request.command == 'saveOptions') {
                    this.saveOptions(request.environment, request.organizationId, sendResponse);
                } else if (request.command == 'saveUserToken') {
                    this.saveUserToken(request.userToken, (message: any) => {
                        sendResponse(message);
                    });
                } else if (request.command == 'logout') {
                    this.saveUserToken(null, (message: any) => {
                        sendResponse(message);
                    });
                }
                return true; 
        });
    }

    private saveUserToken(userToken: string, callback: Function): void {
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_usertoken': userToken
            }, 
            () => {
                this._userToken = userToken;
                callback({
                    environment: this._environment,
                    organizationId: this._organizationId,
                    userToken: this._userToken
                });
            }
        );
    }

    private saveOptions(environment: string, organizationId: string, sendResponse: Function): void {
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_environment': environment,
                'coveoforgooglecloudsearch_organization': organizationId,
            }, 
            () => {
                this._environment = environment;
                this._organizationId = organizationId;
                sendResponse({
                    environment: this._environment,
                    organizationId: this._organizationId,
                    userToken: this._userToken
                });
            }
        );
    }

    private search(queryExpression: string): void {
        this._activeQuery = queryExpression;

        let url = `${PlatformUrls.getPlatformUrl(this._environment)}/rest/search/v2/?organizationId=${this._organizationId}&q=${queryExpression}&cq=${this._constantQueryExpression}`;
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() { 
            if (this.readyState == 4 && this.status == 200) {
                let results: any = JSON.parse(xhttp.responseText); 
 
                chrome.browserAction.setBadgeText({text: String(results.totalCount)});
            } else {
                chrome.browserAction.setBadgeText({text: "..."});
            }
        }; 
 
        xhttp.open('GET', url, true); 
        xhttp.setRequestHeader('Authorization', `Bearer ${this._userToken}`); 
        xhttp.send(); 
    }

    private isUserLoggedIn(callback: Function): void {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', PlatformUrls.getPlatformUrl(this._environment) + '/rest/oauth2clients/Swagger', true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.setRequestHeader('Authorization', 'Bearer ' + this._userToken);

        let context: Background = this;
        xhttp.onload = function () {
            if (this.readyState == 4 && this.status == 200) {
                callback({
                    userIsLoggedIn: true,
                    userToken: context._userToken
                });
            } else {
                callback({
                    userIsLoggedIn: false,
                    userToken: context._userToken
                });
            }
        };

        xhttp.send();
    }
}
