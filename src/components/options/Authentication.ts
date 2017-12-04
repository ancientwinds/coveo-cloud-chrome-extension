declare var chrome: any;
declare let $: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Configuration } from './Configuration';
import { Url } from '../../commons/utils/Url';

/*
* Classe d'authentication. Utilise la même authentication que notre swagger.
*/
export class Authentication  extends BasicComponent {
    private _platform = null;
    private _lastToken: string = null;

    private static _loginValidationTimer = null;

    constructor() {
        super ('Authentication');
        this._platform = Configuration.PLATFORM_URL;
    }

    public getUserToken(callback: Function): void {
        chrome.storage.local.get(
            ['coveoforgooglecloudsearch_usertoken'], 
            function(items) {
                callback(items['coveoforgooglecloudsearch_usertoken']);
            }
        );
    }

    public login(): void {
        let redirect_uri = window.location.href;

        redirect_uri = redirect_uri.replace('login.html', 'o2c.html');
        redirect_uri = encodeURIComponent(redirect_uri);

        window.open(`${this._platform}/oauth/authorize?response_type=token&redirect_uri=${redirect_uri}&realm=Platform&client_id=Swagger&scope=full&state=oauth2`);

        // As all the new windows are loaded in incognito mode (chrome extension limitations), we need to validate once in a while if ther're a token in the local storage
        let context = this;
        // TODO: Fix that thing... it loops... forever... 
        Authentication._loginValidationTimer = setInterval(function() {
            chrome.storage.local.get(
                ['coveoforgooglecloudsearch_usertoken'], 
                function(items) {
                    let auth: Authentication = new Authentication();
                    if (items['coveoforgooglecloudsearch_usertoken'] && context._lastToken != items['coveoforgooglecloudsearch_usertoken']) {
                        context._lastToken = items['coveoforgooglecloudsearch_usertoken'];
                        auth.validateToken(items['coveoforgooglecloudsearch_usertoken'], context.afterTokenValidation);
                    }
                }
            );
        }, 500);
    }

    public logout(): void {
        chrome.storage.local.set(
            {
            'coveoforgooglecloudsearch_usertoken': null
            }, 
            function() {
                $('#validToken').hide();
                $('#invalidToken').show();
            }
        );
    }

    public validateToken(token: string = '', callback: Function): void {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', this._platform + '/rest/oauth2clients/Swagger', true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.setRequestHeader('Authorization', 'Bearer ' + token);
        xhttp.onload = function () {
            callback(xhttp);
        };

        xhttp.send();
    }

    public afterTokenValidation(xhttp: any): void {
        if (xhttp.status === 200) {
            $('#validToken').show();
            $('#invalidToken').hide();
        } else {
            $('#validToken').hide();
            $('#invalidToken').show();
        }

        chrome.runtime.sendMessage({
            command: "loadOptions"
        });
    }

    public processOAuthReturn(): void {
        Url.hashParameterToLocalStorage('access_token', 'coveoforgooglecloudsearch_usertoken', true);
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="invalidToken" style="display:none;">
                <button id="loginButton" class="btn">Login</button>
            </div>
            
            <div id="validToken" style="display:none;">
                <span class="token-status-good">Your current token is valid.</span>
                <button id="logoutButton" class="btn">Logout</button>
            </div>
        `);

        let context = this;

        document.getElementById('loginButton').addEventListener('click', function () {
            ComponentStore.execute(context._guid, 'login', context.btoaAndStringify({}));
        });

        document.getElementById('logoutButton').addEventListener('click', function () {
            ComponentStore.execute(context._guid, 'logout', context.btoaAndStringify({}));
        });
    
        chrome.storage.local.get(
            ['coveoforgooglecloudsearch_usertoken'], 
            function(items) {
                if (context.validateToken(items['coveoforgooglecloudsearch_usertoken'], context.afterTokenValidation)) {
                    // Hooray!
                }
            }
        );
    }
}

