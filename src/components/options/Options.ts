declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Authentication } from './Authentication'

export class Options extends BasicComponent {
    private _organizationId = null;
    private _token = null;
    private _loginValidationTimer = null;

    constructor() {
        super ('Options');
    }

    /*
        Save option items in the local storage
    */
    public saveOptions(): void {
        // Save it using the Chrome extension storage API.
        chrome.storage.local.set(
            {
                'coveoforgooglecloudsearch_organization': this._organizationId
            }, 
            function() {
                // Add a confirmation?
            }
        );
    }
    /*
        Get option items from the local storage
    */
    public loadOptions(): void {
        let context: any = this;
        chrome.storage.local.get(
            {
                'coveoforgooglecloudsearch_usertoken': null,
                'coveoforgooglecloudsearch_organization': null
            }, 
            function(items) {
                context._organization = items.coveoforgooglecloudsearch_organization;
                context._token = items.coveoforgooglecloudsearch_usertoken;

                context.validateOptions();
            }
        );

    }

    public afterTokenValidation(xhttp): void {
        if (xhttp.readyState == 4 && xhttp.status == "200") {
            document.getElementById("loginStatus").innerHTML = "User is logged in.";
            // TODO: Clear timeout
            // TODO: Load orgs... set one... get from local storage, blablabla
        } else {
            this._organizationId = null;
            this._token = null;
            document.getElementById("loginStatus").innerHTML = "Unable to login.";

            // TODO: Set the timer...
        }
    }

    public validateOptions(token, organization) {
        let context = this;

        chrome.storage.local.get(
            ['coveoforgooglecloudsearch_usertoken'], 
            function(items) {
                let auth: Authentication = new Authentication();
                auth.remove();
                /*
                auth.validateToken(
                    items['coveoforgooglecloudsearch_usertoken'],
                    (ComponentStore.getComponents().Item(context._guid) as Options).afterTokenValidation
                );
                */
            }
        );
    }

    public render(parent: string): void {
        super.render(parent, `
            <h4>Login</h4>
        
            <div id="loginStatus"></div>
        
            <iframe id="loginFrame" style="border: none; width: 300px; height: 400px;" src="login.html"></iframe>
        `);
    }
}
