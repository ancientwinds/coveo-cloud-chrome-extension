declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from './Authentication'
import { Organizations } from './Organizations';
import { PlatformUrls } from './PlatformUrls';

export class Options extends BasicComponent {
    private _environment: string = null;
    private _organizationId: string = null;
    private _userToken: string = null;

    constructor() {
        super ('Options');

    }

    /*
        Ask the background page to save the options
    */
    public saveOptions(): void {
        document.getElementById('messages').innerHTML = 'Saving...';
        let message = chrome.runtime.sendMessage(
            {
                command: 'saveOptions',
                environment: this._environment,
                organizationId: this._organizationId
            }, function (message) {
                document.getElementById('messages').innerHTML = 'Saved!';
                setTimeout(function () {
                    document.getElementById('messages').innerHTML = '';
                }, 1000)
            }
        );
    }

    public clearOrganizations(): void {
        document.getElementById('organizations').innerHTML = '<option value="none">Please select an organization</option>';
    }

    public validateOptions() {
        let context: Options = this;

        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message: any) {
                if (message.userToken != context._userToken) {
                    context._userToken = message.userToken;
                    let auth: Authentication = new Authentication();
                    auth.unregister();
    
                    auth.validateToken(
                        message.environment,
                        message.userToken,
                        function(xhttp: any) {
                            context.afterTokenValidation(xhttp);
                        }
                    );
                }
            }
        );
    }

    public afterTokenValidation(xhttp): void {
        if (xhttp.readyState == 4 && xhttp.status == "200") {

        } else {
            let context: Options = this;

            this.clearOrganizations();
        }
    }

    private loadOrganizations(): void {
        this.clearOrganizations();

        let context: Options = this;
        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message: any) {
                Organizations.getOrganizationList(
                    message.userToken,
                    message.environment,
                    function (response: any) {
                        for (let index in response['items']) {
                            let organization: any = response['items'][index];
                            
                            let option: HTMLOptionElement = document.createElement('option');
                            option.value = organization['id'];
                            option.innerHTML = organization['displayName'];
                            if (organization['id'] === message.organizationId) {
                                option.selected = true;
                            }
                            document.getElementById('organizations').appendChild(option);
                        }
                    }
                );
            }
        );
    }

    private loadOptions(): void {
        let context: Options = this;

        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message: any) {
                context._userToken = message.userToken;
                context._environment = message.environment;
                context._organizationId = message.organizationId;

                let options: any = (document.getElementById('environment') as HTMLSelectElement).options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value == context._environment) {
                        (document.getElementById('environment') as HTMLSelectElement).selectedIndex = i;
                        break;
                    }
                }
        
                context.loadOrganizations();
            }
        );
    }

    private watchIfLoginStateChanged(): void {
        let context: Options = this;
        
        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message: any) {
                if (context._userToken != message.userToken) {
                    let userIsLoggedIn = chrome.runtime.sendMessage(
                        {
                            command: 'isUserLoggedIn'
                        },
                        function (userIsLoggedInMessage: any) {
                            if (userIsLoggedInMessage.userIsLoggedIn) {
                                context.loadOptions();
                            } else {
                                context.clearOrganizations();
                            }
                        }
                    );

                    chrome.runtime.sendMessage({
                        command: 'search',
                        queryExpression: '',
                        origin: window.location.href 
                    });
                }
                
                setTimeout(function () {
                    context.watchIfLoginStateChanged()
                }, 1000);
            }
        );
    }

    public render(parent: string): void {
        let context: Options = this;

        super.render(parent, `
            <h4>Environment</h4>
            <br />
            <select id="environment" class="FullWidthSelect">
                <option value="production">Coveo Cloud</option>
                <option value="hipaa">Coveo Cloud HIPAA</option>
                <option value="qa">Coveo Cloud Internal Testing</option>
            </select>
            <h4>Organization</h4>
            <br />
            <select id="organizations" class="FullWidthSelect">
                <option value="none">Please select an organization</option>
            </select>
            <br /><br />
            <h4>Login status</h4>
            <iframe id="loginFrame" style="border: none; width: 300px; height: 300px;" src="login.html"></iframe>
            <div id="messages"></div>
        `);

        let userIsLoggedIn = chrome.runtime.sendMessage(
            {
                command: 'isUserLoggedIn'
            },
            function (userIsLoggedInMessage: any) {
                context._userToken = userIsLoggedInMessage.userToken;

                if (userIsLoggedInMessage.userIsLoggedIn) {
                    context.loadOptions();
                }
                
                context.watchIfLoginStateChanged();
            }
        );

        document.getElementById('environment').addEventListener("change", function() {
            let select: HTMLSelectElement = document.getElementById('environment') as HTMLSelectElement;
            context._environment = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            context._userToken = null;
            context._organizationId = null;

            chrome.runtime.sendMessage(
                {
                    command: 'logout'
                },
                function (message) {
                    context.saveOptions();
                    context.clearOrganizations();
                }
            );
        });

        document.getElementById('organizations').addEventListener("change", function() {
            let select: HTMLSelectElement = document.getElementById('organizations') as HTMLSelectElement;
            context._organizationId = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            context.saveOptions();
        });
    }
}
