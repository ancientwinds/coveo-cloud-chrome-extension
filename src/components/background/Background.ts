declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from '../options/Authentication';
import { Options } from '../options/Options';

export class Background extends BasicComponent {
    private _constantQueryExpression: string = 'NOT (@filetype=(Txt, .oleFile, Folder))';

    private _activeQuery: string = '';

    private _authentication: Authentication = new Authentication();
    private _options: Options = new Options();

    constructor() {
        super ('Background');
    }

    public loadOptions(): void {
        let context: Background = this;
        
        this._authentication.getUserToken(function(userToken: string) {
            if (userToken) {
                context._authentication.validateToken(userToken, function(xhttp: any) {
                    if (xhttp.status === 200) {
                        context._options.loadOptions(function (options: any) {
                            context.search('');
                        });
                    } else {
                        context.updateLabel('...');
                    }
                })
            } else {
                context.updateLabel('...');
            }
        });
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
                        organizationId: context._options.getOrganizationId(),
                        hostedSearchPage: context._options.getHostedSearchPage()
                    });
                } else if (request.command == 'loadOptions') {
                    context.loadOptions();
                } else if (request.command == 'search') {
                    // TODO : do something with request.origin;
                    context.search(request.queryExpression);
                }

                return true; 
        });
    }

    private search(queryExpression: string): void {
        this._activeQuery = queryExpression;

        let url = `https://platformqa.cloud.coveo.com/rest/search/v2/?organizationId=${this._options.getOrganizationId()}&q=${queryExpression}&cq=${this._constantQueryExpression}`;
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
        xhttp.setRequestHeader('Authorization', `Bearer ${this._options.getUserToken()}`); 
        xhttp.send(); 
    }

    public render(parent: string): void {
        
        super.render(parent, ``);
        this.loadOptions();
    }
}
