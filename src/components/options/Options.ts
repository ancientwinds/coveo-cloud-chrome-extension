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
        chrome.runtime.sendMessage(
            {
                command: 'saveOptions',
                environment: this._environment,
                organizationId: this._organizationId
            }, (message) => {
                document.getElementById('messages').innerHTML = 'Saved!';
                setTimeout(() => {
                    document.getElementById('messages').innerHTML = '';
                }, 1000)
            }
        );
    }

    public clearOrganizations(): void {
        document.getElementById('organizations').innerHTML = '<option value="none">Please select an organization</option>';
    }

    public validateOptions() {
        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                if (message.userToken != this._userToken) {
                    this._userToken = message.userToken;
                    let auth: Authentication = new Authentication();
                    auth.unregister();
    
                    auth.validateToken(
                        message.environment,
                        message.userToken,
                        (xhttp: any) => {
                            this.afterTokenValidation(xhttp);
                        }
                    );
                }
            }
        );
    }

    public afterTokenValidation(xhttp): void {
        if (!(xhttp.readyState == 4 && xhttp.status == "200")) {
            this.clearOrganizations();
        }
    }

    private loadOrganizations(): void {
        this.clearOrganizations();

        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                Organizations.getOrganizationList(
                    message.userToken,
                    message.environment,
                    (response: any) => {
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
        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                this._userToken = message.userToken;
                this._environment = message.environment;
                this._organizationId = message.organizationId;

                let options: any = (document.getElementById('environment') as HTMLSelectElement).options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value == this._environment) {
                        (document.getElementById('environment') as HTMLSelectElement).selectedIndex = i;
                        break;
                    }
                }
        
                this.loadOrganizations();
            }
        );
    }

    private watchIfLoginStateChanged(): void {
        chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                if (this._userToken != message.userToken) {
                    let userIsLoggedIn = chrome.runtime.sendMessage(
                        {
                            command: 'isUserLoggedIn'
                        },
                        (userIsLoggedInMessage: any) => {
                            if (userIsLoggedInMessage.userIsLoggedIn) {
                                this.loadOptions();
                            } else {
                                this.clearOrganizations();
                            }
                        }
                    );

                    chrome.runtime.sendMessage({
                        command: 'search',
                        queryExpression: '',
                        origin: window.location.href 
                    });
                }
                
                setTimeout(() => {
                    this.watchIfLoginStateChanged()
                }, 1000);
            }
        );
    }

    public render(parent: string): void {
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
            (userIsLoggedInMessage: any) => {
                this._userToken = userIsLoggedInMessage.userToken;

                if (userIsLoggedInMessage.userIsLoggedIn) {
                    this.loadOptions();
                }
                
                this.watchIfLoginStateChanged();
            }
        );

        document.getElementById('environment').addEventListener("change", () => {
            let select: HTMLSelectElement = document.getElementById('environment') as HTMLSelectElement;
            this._environment = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            this._userToken = null;
            this._organizationId = null;

            chrome.runtime.sendMessage(
                {
                    command: 'logout'
                },
                (message) => {
                    this.saveOptions();
                    this.clearOrganizations();
                    (document.getElementById('loginFrame') as HTMLIFrameElement).contentWindow.location.reload();
                }
            );
        });

        document.getElementById('organizations').addEventListener("change", () => {
            let select: HTMLSelectElement = document.getElementById('organizations') as HTMLSelectElement;
            this._organizationId = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            this.saveOptions();
        });
    }
}
