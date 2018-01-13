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
    public saveOptions(): Promise<any> {
        return new Promise(resolve=> {
            document.getElementById('messages').innerHTML = 'Saving...';
            chrome.runtime.sendMessage(
                {
                    command: 'saveOptions',
                    environment: this._environment,
                    organizationId: this._organizationId
                }, (message) => {
                    resolve();
                    document.getElementById('messages').innerHTML = 'Saved!';
                    setTimeout(() => {
                        document.getElementById('messages').innerHTML = '';
                    }, 1000)
                }
            );
        });
    }

    public clearOrganizations(): void {
        $('#organizations')
            .html('<option value="none">Please select an organization</option>')
            .trigger('chosen:updated')
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

        Organizations.getOrganizationList(
            this._userToken,
            this._environment,
            (response: any) => {
                (response.items || []).forEach( (organization: any, index:number ) => {
                    let option: HTMLOptionElement = document.createElement('option');
                    option.value = organization.id;
                    option.innerHTML = organization.displayName;
                    if (organization.id === this._organizationId) {
                        option.selected = true;
                    }
                    document.getElementById('organizations').appendChild(option);
                });

                if (response.items && response.items.length) {
                    $('#organizations').prop('disabled', false)
                }

                $('#organizations')
                    .chosen({
                        allow_single_deselect: true,
                        disable_search_threshold: 10,
                    });

                $('#organizations').on('change', this.onChangeOrg.bind(this));
            }
        );
    }

    private updateSelectOption(id, val): void {
        let selectEl = $(id);
        $('*[selected]', selectEl).removeAttr('selected');
        $(`option[value="${val}"]`, selectEl).attr('selected', 'selected');
        selectEl.trigger('chosen:updated');
    }

    private loadOptions(): void {
        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                this._userToken = message.userToken;
                this._environment = message.environment;
                this._organizationId = message.organizationId;

                this.updateSelectOption('#environment', this._environment);

                this.loadOrganizations();
            }
        );
    }

    private watchIfLoginStateChanged(): void {
        chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                if (this._userToken != message.userToken) {
                    window.location.reload();
                }

                setTimeout(() => {
                    this.watchIfLoginStateChanged()
                }, 1000);
            }
        );
    }

    private onChangeEnv(evt, params) {
        this._environment = params.selected;
        this._userToken = null;
        this._organizationId = null;

        this.saveOptions().then(()=>{
            chrome.runtime.sendMessage( { command: 'logout' },
                (message) => {
                    window.location.reload();
                }
            );
        });
    }

    private onChangeOrg(evt, params) {
        this._organizationId = params.selected;
        this.saveOptions();
    }

    public render(parent: string): void {
        super.render(parent, `
            <h3>Environment</h3>
            <select id="environment" class="chosen js-chosen-single-select FullWidthSelect">
                <option value="production">Coveo Cloud</option>
                <option value="hipaa">Coveo Cloud HIPAA</option>
                <option value="qa">Coveo Cloud Internal Testing</option>
            </select>

            <h3>Organization</h3>
            <select id="organizations" class="chosen js-chosen-single-select FullWidthSelect" disabled>
                <option value="none">Please select an organization</option>
            </select>

            <h3>Login status</h3>
            <iframe id="loginFrame" style="border: none; width: 100%; min-height: 100px;" src="login.html"></iframe>

            <div id="messages" style="flex: 1;min-height: 50px;"></div>
        `);

        $('#environment').chosen({
            allow_single_deselect: true,
            disable_search_threshold: 10,
        });

        $('#environment').on('change', this.onChangeEnv.bind(this));

        this.loadOptions();
        this.watchIfLoginStateChanged();
    }
}
