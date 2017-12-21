declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from '../options/Authentication';
import { Options } from '../options/Options';
import { PlatformUrls } from '../options/PlatformUrls'

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
        let context: Background = this;
        
        chrome.storage.local.get(
            {
                'coveoforgooglecloudsearch_environment': 'production',
                'coveoforgooglecloudsearch_usertoken': null,
                'coveoforgooglecloudsearch_organization': null
            }, 
            function(items) {
                context._environment = items['coveoforgooglecloudsearch_environment'];
                if (!context._environment) {
                    context._environment = 'production';
                }
                context._organizationId = items['coveoforgooglecloudsearch_organization'];
                context._userToken = items['coveoforgooglecloudsearch_usertoken'];

                if (callback) {
                    callback();
                }
            }
        );
    }

    public validateOptions(): void {
        if (this._userToken && this._environment) {
            let context: Background = this;
            context._authentication.validateToken(this._environment, this._userToken, function(xhttp: any) {
                if (xhttp.status === 200) {
                    context.search(context._activeQuery);
                } else {
                    context.updateLabel('...');
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
        let context: Background = this;

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if (request.command == 'updateLabel') {
                    chrome.browserAction.setBadgeText({text: request.labelText});
                } else if (request.command == 'getActiveQueryAndOptions') {
                    sendResponse({
                        activeQuery: context._activeQuery,
                        environment: context._environment,
                        organizationId: context._organizationId,
                        userToken: context._userToken
                    });
                } else if (request.command == 'loadOptions') {
                    context.loadOptions(function () {
                        sendResponse({
                            environment: context._environment,
                            organizationId: context._organizationId,
                            userToken: context._userToken
                        });
                    });
                } else if (request.command == 'search') {
                    // TODO : do something with request.origin?;
                    context.search(request.queryExpression);
                } else if (request.command == 'isUserLoggedIn') {
                    context.isUserLoggedIn(function (message) {
                        sendResponse(message);
                    });
                } else if (request.command == 'saveOptions') {
                    context.saveOptions(request.environment, request.organizationId, sendResponse);
                } else if (request.command == 'saveUserToken') {
                    context.saveUserToken(request.userToken, function (message: any) {
                        sendResponse(message);
                    });
                } else if (request.command == 'logout') {
                    context.saveUserToken(null, function (message: any) {
                        sendResponse(message);
                    });
                }
                return true; 
        });
    }

    private saveUserToken(userToken: string, callback: Function): void {
        let context: Background = this;
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_usertoken': userToken
            }, 
            function() {
                context._userToken = userToken;
                callback({
                    environment: context._environment,
                    organizationId: context._organizationId,
                    userToken: context._userToken
                });
            }
        );
    }

    private saveOptions(environment: string, organizationId: string, sendResponse: Function): void {
        let context: Background = this;
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_environment': environment,
                'coveoforgooglecloudsearch_organization': organizationId,
            }, 
            function() {
                context._environment = environment;
                context._organizationId = organizationId;
                sendResponse({
                    environment: context._environment,
                    organizationId: context._organizationId,
                    userToken: context._userToken
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

    public render(parent: string): void {
    }
}
