declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from './Authentication'
import { Organizations } from './Organizations';
import { Configuration } from './Configuration';

export class Options extends BasicComponent {
    private _organizationId: string = null;
    private _userToken: string = null;
    private _loginValidationTimer: any = null;

    constructor() {
        super ('Options');
    }

    public getOrganizationId(): string {
        return this._organizationId;
    }

    /*
        Save option items in the local storage
    */
    public saveOptions(): void {
        let context: Options = this;
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_organization': context._organizationId
            }, 
            function() {
                document.getElementById('messages').innerHTML = 'Saved!';
                setTimeout(function() {
                    document.getElementById('messages').innerHTML = '';
                }, 1000);
            }
        );
    }

    /*
        Get option items from the local storage
    */
    public loadOptions(callback: Function = null): void {
        let context: any = this;

        chrome.storage.local.get(
            {
                'coveoforgooglecloudsearch_usertoken': null,
                'coveoforgooglecloudsearch_organization': null
            }, 
            function(items) {
                context._organizationId = items['coveoforgooglecloudsearch_organization'];
                context._userToken = items['coveoforgooglecloudsearch_usertoken'];

                if (callback) {
                    callback(context);
                } else {
                    context.validateOptions();
                }
            }
        );
    }

    public afterTokenValidation(xhttp): void {
        if (xhttp.readyState == 4 && xhttp.status == "200") {
            clearTimeout(this._loginValidationTimer);

            this.loadOrganizations();
        } else {
            this._userToken = null;

            let context: Options = this;

            setTimeout(function() {
                context.loadOptions();
            }, 500);
        }
    }

    public validateOptions() {
        let context: Options = this;

        let auth: Authentication = new Authentication();
        auth.remove();

        auth.validateToken(
            this._userToken,
            function(xhttp: any) {
                context.afterTokenValidation(xhttp);
            }
        );
    }

    public loadOrganizations(): void {
        document.getElementById('messages').innerHTML = this._organizationId;

        let context: Options = this;

        Organizations.getOrganizationList(
            this._userToken,
            function (response: any) {
                for (let index in response['items']) {
                    let organization: any = response['items'][index];
                    
                    let option: HTMLOptionElement = document.createElement('option');
                    option.value = organization['id'];
                    option.innerHTML = organization['displayName'];
                    if (organization['id'] === context._organizationId) {
                        option.selected = true;
                    }
                    document.getElementById('organizations').appendChild(option);
                }
            }
        );
    }

    public render(parent: string): void {
        super.render(parent, `
            <h4>Organization</h4>
            <br />
            <select id="organizations">
                <option value="none">Please select an organization</option>
            </select>
            <br /><br />
            <h4>Login status</h4>
            <iframe id="loginFrame" style="border: none; width: 300px; height: 300px;" src="login.html"></iframe>
            <div id="messages"></div>
        `);

        let context: Options = this;

        document.getElementById('organizations').addEventListener("change", function() {
            let select: HTMLSelectElement = document.getElementById('organizations') as HTMLSelectElement;
            context._organizationId = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            context.saveOptions();
        });
    }
}
