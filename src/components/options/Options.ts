declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from './Authentication'
import { Organizations } from './Organizations';
import { Configuration } from './Configuration';

export class Options extends BasicComponent {
    private _organizationId: string = null;
    private _userToken: string = null;
    private _hostedSearchPage: string = null;

    private _loginValidationTimer: any = null;

    constructor() {
        super ('Options');
    }

    public getOrganizationId(): string {
        return this._organizationId;
    }

    public getHostedSearchPage(): string {
        return this._hostedSearchPage;
    }

    public getUserToken(): string {
        return this._userToken;
    }

    /*
        Save option items in the local storage
    */
    public saveOptions(): void {
        let context: Options = this;
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_organization': context._organizationId,
                'coveoforgooglecloudsearch_hostedSearchPage': context._hostedSearchPage
            }, 
            function() {
                document.getElementById('messages').innerHTML = 'Saved!';
                setTimeout(function() {
                    document.getElementById('messages').innerHTML = '';
                }, 1000);
            }
        );

        chrome.runtime.sendMessage({
            command: "loadOptions"
        });
    }

    /*
        Get option items from the local storage
    */
    public loadOptions(callback: Function = null): void {
        let context: any = this;

        chrome.storage.local.get(
            {
                'coveoforgooglecloudsearch_usertoken': null,
                'coveoforgooglecloudsearch_organization': null,
                'coveoforgooglecloudsearch_hostedSearchPage': null
            }, 
            function(items) {
                context._organizationId = items['coveoforgooglecloudsearch_organization'];
                context._userToken = items['coveoforgooglecloudsearch_usertoken'];
                context._hostedSearchPage = items['coveoforgooglecloudsearch_hostedSearchPage'];

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
            this.loadHostedSearchPages(this._organizationId);
        } else {
            this._userToken = null;

            let context: Options = this;

            document.getElementById('organizations').innerHTML = '';
            document.getElementById('pages').innerHTML = '';

            this._loginValidationTimer = setTimeout(function() {
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

    private loadOrganizations(): void {
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

    private loadHostedSearchPages(organizationId): void {
        let context: Options = this;

        Organizations.getHostedSearchPagesList(
            this._userToken,
            organizationId,
            function (response: any) {
                document.getElementById('pages').innerHTML = '<option value="null">Please select a search page</option>';
                for (let index in response) {
                    let searchPage: any = response[index];
                    
                    let option: HTMLOptionElement = document.createElement('option');
                    option.value = searchPage['name'];
                    option.innerHTML = searchPage['title'];
                    if (searchPage['name'] === context._hostedSearchPage) {
                        option.selected = true;
                    }
                    document.getElementById('pages').appendChild(option);
                }

                
            }
        );
    } 

    public render(parent: string): void {
        let context: Options = this;

        super.render(parent, `
            <h4>Organization</h4>
            <br />
            <select id="organizations" class="FullWidthSelect">
                <option value="none">Please select an organization</option>
            </select>
            <br /><br />
            <h4>Popup Search Page</h4>
            <br />
            <select id="pages" class="FullWidthSelect">
                <option value="none">Please select a search page</option>
            </select>
            <br /><br />
            <h4>Login status</h4>
            <iframe id="loginFrame" style="border: none; width: 300px; height: 300px;" src="login.html"></iframe>
            <div id="messages"></div>
        `);

        document.getElementById('organizations').addEventListener("change", function() {
            let select: HTMLSelectElement = document.getElementById('organizations') as HTMLSelectElement;
            context._organizationId = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            context.saveOptions();
            context.loadHostedSearchPages(context._organizationId);
        });

        document.getElementById('pages').addEventListener("change", function() {
            let select: HTMLSelectElement = document.getElementById('pages') as HTMLSelectElement;
            context._hostedSearchPage = (select.options[select.selectedIndex] as HTMLOptionElement).value;
            context.saveOptions();
        });
    }
}
