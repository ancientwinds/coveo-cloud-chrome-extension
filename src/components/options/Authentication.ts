declare var chrome: any;
declare let $: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { PlatformUrls } from './PlatformUrls';
import { Url } from '../../commons/utils/Url';

/*
* Classe d'authentication. Utilise la même authentication que notre swagger.
*/
export class Authentication  extends BasicComponent {
    private _lastToken: string = null;

    private static _loginValidationTimer = null;

    constructor() {
        super ('Authentication');
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

        let context = this;
        let removeToken = chrome.runtime.sendMessage(
            {
                command: 'saveUserToken',
                userToken: null
            },
            function (removeTokenResponse: any) {
                let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
                    function (message: any) {
                        window.open(`${PlatformUrls.getPlatformUrl(message.environment)}/oauth/authorize?response_type=token&redirect_uri=${redirect_uri}&realm=Platform&client_id=Swagger&scope=full&state=oauth2`);
        
                        // As all the pages are opened in an incognito mode, we need to validate if the login occured...
                        Authentication._loginValidationTimer = setInterval(function() {
                            let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
                                function (message: any) {
                                    if (context._lastToken != message.userToken) {
                                        let auth: Authentication = new Authentication();
                                        context._lastToken = message.userToken;
                                        auth.validateToken(message.environment, message.userToken, context.afterTokenValidation);
                                    }
                                }
                            );
                        }, 500);
                    }
                );
            }
        );
    }

    public logout(): void {
        let message = chrome.runtime.sendMessage(
            {
                command: 'saveUserToken',
                userToken: null
            },
            function (message) {
                $('#validToken').hide();
                $('#invalidToken').show();
            }
        );
    }

    public validateToken(environment: string, token: string = '', callback: Function): void {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', PlatformUrls.getPlatformUrl(environment) + '/rest/oauth2clients/Swagger', true);
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

        chrome.runtime.sendMessage(
            {
                command: "loadOptions"
            },
            function (message) {

            }
        );
    }

    public processOAuthReturn(): void {
        let userToken: string = Url.getHashParameter('access_token');

        chrome.runtime.sendMessage(
            {
                command: "saveUserToken",
                userToken: userToken
            },
            function (message) {
                window.close();
            }
        );
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

        let context: Authentication = this;

        document.getElementById('loginButton').addEventListener('click', function () {
            ComponentStore.execute(context._guid, 'login', context.btoaAndStringify({}));
        });

        document.getElementById('logoutButton').addEventListener('click', function () {
            ComponentStore.execute(context._guid, 'logout', context.btoaAndStringify({}));
        });


        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message: any) {
                context.validateToken(message.environment, message.userToken, context.afterTokenValidation);
            }
        );
    }
}

