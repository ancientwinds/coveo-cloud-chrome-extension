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

    private _validate(isValid: boolean): void {
        if (isValid) {
            $('#validToken').show();
            $('#invalidToken').hide();
        }
        else {
            $('#validToken').hide();
            $('#invalidToken').show();
        }
    }

    public getUserToken(callback: Function): void {
        chrome.storage.local.get(
            ['coveoforgooglecloudsearch_usertoken'],
            (items) => {
                callback(items['coveoforgooglecloudsearch_usertoken']);
            }
        );
    }

    public login(): void {
        let redirect_uri = window.location.href;

        redirect_uri = redirect_uri.replace('login.html', 'o2c.html');
        redirect_uri = encodeURIComponent(redirect_uri);

        chrome.runtime.sendMessage(
            {
                command: 'saveUserToken',
                userToken: null
            },
            (removeTokenResponse: any) => {
                chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
                    (message: any) => {
                        let client_id = /egcobhndnfihpdffpfmmebdojcbnfpee/.test(redirect_uri) ? 'CoveoSearchExtension' : 'Swagger';
                        window.open(`${PlatformUrls.getPlatformUrl(message.environment)}/oauth/authorize?response_type=token&redirect_uri=${redirect_uri}&realm=Platform&client_id=${client_id}&scope=full&state=oauth2`);

                        // As all the pages are opened in an incognito mode, we need to validate if the login occured...
                        Authentication._loginValidationTimer = setInterval(() => {
                            let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
                                (message: any) => {
                                    if (this._lastToken != message.userToken) {
                                        let auth: Authentication = new Authentication();
                                        this._lastToken = message.userToken;
                                        auth.validateToken(message.environment, message.userToken, this.afterTokenValidation.bind(this));
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
        chrome.runtime.sendMessage(
            {
                command: 'saveUserToken',
                userToken: null
            },
            () => {
                this._validate(false);
            }
        );
    }

    public validateToken(environment: string, token: string = '', callback: Function): void {
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', PlatformUrls.getPlatformUrl(environment) + '/rest/organizations', true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.setRequestHeader('Authorization', 'Bearer ' + token);
        xhttp.onload = function () {
            callback(xhttp);
        };

        xhttp.send();
    }

    public afterTokenValidation(xhttp: any): void {
        this._validate(xhttp.status === 200);

        chrome.runtime.sendMessage(
            {
                command: "loadOptions"
            },
            () => {
                // Nothing to do here.
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
            () => {
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

        document.getElementById('loginButton').addEventListener('click', () => {
            this.login();
        });

        document.getElementById('logoutButton').addEventListener('click', () => {
            this.logout();
        });

        chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            (message: any) => {
                this.validateToken(message.environment, message.userToken, this.afterTokenValidation.bind(this));
            }
        );
    }
}

