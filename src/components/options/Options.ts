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
                        (response.items || []).forEach( (organization: any, index:number ) => {
                            let option: HTMLOptionElement = document.createElement('option');
                            option.value = organization.id;
                            option.innerHTML = organization.displayName;
                            if (organization.id === message.organizationId) {
                                option.selected = true;
                            }
                            document.getElementById('organizations').appendChild(option);
                        });

                        $('#organizations').chosen({
                            allow_single_deselect: true,
                            disable_search_threshold: 10,
                        });

                        // $('#environment').on('change', this.onChangeEnv.bind(this));
                        $('#organizations').on('change', this.onChangeOrg.bind(this));
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

    private onChangeEnv(evt, params) {
        console.log('onChangeEnv: ', params.selected);
        this._environment = params.selected;
        this._userToken = null;
        this._organizationId = null;

        chrome.runtime.sendMessage(
            {
                command: 'logout'
            },
            (message) => {
                this.saveOptions();
                console.log('00000 REMALOASD');
                setTimeout(()=>{
                    console.log('REMALOASD');
                    window.location.reload()}, 2000);
                //this.clearOrganizations();
                //(document.getElementById('loginFrame') as HTMLIFrameElement).contentWindow.location.reload();
            }
        );
    }

    private onChangeOrg(evt, params) {
        console.log('onChangeOrg: ', params);
        this._organizationId = params.selected;
        this.saveOptions();
    }

    public render(parent: string): void {
        super.render(parent, `
            <h2>Environment</h2>
            <select id="environment" class="chosen js-chosen-single-select FullWidthSelect">
                <option value="production">Coveo Cloud</option>
                <option value="hipaa">Coveo Cloud HIPAA</option>
                <option value="qa">Coveo Cloud Internal Testing</option>
            </select>

            <h2>Organization</h2>
            <select id="organizations" class="chosen js-chosen-single-select FullWidthSelect">
                <option value="none">Please select an organization</option>
            </select>

            <h2>Login status</h2>
            <iframe id="loginFrame" style="border: none; width: 300px; height: 300px;" src="login.html"></iframe>

            <div id="messages"></div>
        `);

        $('.js-chosen-single-select').chosen({
            allow_single_deselect: true,
            disable_search_threshold: 10,
        });

        $('#environment').on('change', this.onChangeEnv.bind(this));

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
    }
}
