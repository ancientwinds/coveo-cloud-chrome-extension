declare let chrome: any;
declare let $: any;

import { Url } from './commons/utils/Url';
import { BasicComponent } from './components/BasicComponent';
import { Authentication } from './components/options/Authentication';
import { UIHelper } from './components/utilities/UIHelper';
import { Options } from './components/options/Options';
import { CoveoSearch } from './components/search/CoveoSearch';
import { ComponentStore } from './components/ComponentStore';

export class Application extends BasicComponent {
    private _uiHelper: UIHelper = new UIHelper();
    private _authentication: Authentication = new Authentication();
    private _options: Options = new Options();
    private _coveoSearch: CoveoSearch = new CoveoSearch();

    constructor() {
        super('Application');
    }

    public renderBasicComponents(): void {
        super.render('body', `
            <div id="${this._guid}">
            </div>
        `);


        this._uiHelper.render();
    }

    public renderUserIsLoggedIn() {
        if (Url.checkIfUrlLocationContains('perdu.com')) {
            let div = document.createElement('div');
            div.className = 'coveo-labs';
            let textbox = document.createElement('input');
            textbox.id = 'coveo-test-text-box';
            textbox.className = 'biggest-coveo-search-box-ever'
            textbox.type = 'text';
            textbox.placeholder = 'Coveo Search';
            div.appendChild(textbox);
            document.body.appendChild(div);
            this._coveoSearch.render('body', 'coveo-test-text-box');
            this._coveoSearch.search({'searchQuery': ''});
        } else if (Url.checkIfUrlLocationContains('cloudsearch.google.com/cloudsearch/search')) {
            // Google Cloud Search full search page
        }
    }

    public renderUserIsNotLoggedIn(): void {
        this._coveoSearch.renderUserIsNotLoggedIn('body');
    }

    public render(): void {
        this.renderBasicComponents();

        if (Url.checkIfUrlLocationContains('/login.html')) {
            this._authentication.render(`#${this._guid}`);
        } else if (Url.checkIfUrlLocationContains('/o2c.html')) {
            this._authentication.processOAuthReturn();
        } else if (Url.checkIfUrlLocationContains('/options.html')) {
            this._options.render(`#${this._guid}`);
            this._options.loadOptions();
        } else {
            let context: Application = this;
            
            this._authentication.getUserToken(function(userToken: string) {
                if (userToken) {
                    context._authentication.validateToken(userToken, function(xhttp: any) {
                        if (xhttp.status === 200) {
                            context._coveoSearch.setUserToken(userToken);
                            context._options.loadOptions(function () {
                                context._coveoSearch.setOrganizationId(context._options.getOrganizationId());
                                context.renderUserIsLoggedIn();
                            });
                            
                        } else {
                            context.renderUserIsNotLoggedIn();
                        }  
                    })
                } else {
                    context.renderUserIsNotLoggedIn();
                }
            });
        }
    }
}

export let _application: Application = null;

$(document).ready(function () {
    /*
    setTimeout(function() {
        _application = new Application();
        _application.render();
    }, 3000);
    */
    _application = new Application();
    _application.render();
});
