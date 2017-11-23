declare let chrome: any;
declare let $: any;

import { Url } from './commons/utils/Url';
import { BasicComponent } from './components/BasicComponent';
import { Authentication } from './components/options/Authentication';
import { Options } from './components/options/Options';
import { CoveoSearch } from './components/search/CoveoSearch';
import { ComponentStore } from './components/ComponentStore';

export class Application extends BasicComponent {
    private _authentication: Authentication = new Authentication();
    private _options: Options = new Options();
    private _coveoSearch: CoveoSearch = new CoveoSearch();

    constructor() {
        super('Application');
    }

    public render(): void {
        super.render('body', `
            <div id="${this._guid}">
            </div>
        `);

        if (Url.checkIfUrlLocationContains('/login.html')) {
            this._authentication.render(`#${this._guid}`);
        } else if (Url.checkIfUrlLocationContains('/o2c.html')) {
            this._authentication.processOAuthReturn();
        } else if (Url.checkIfUrlLocationContains('/options.html')) {
            this._options.render(`#${this._guid}`);
        //} else if (Url.checkIfUrlLocationContains('cloudsearch.google.com/cloudsearch?')) {
        } else if (Url.checkIfUrlLocationContains('perdu.com')) {
            this._coveoSearch.render('body');
        } else if (Url.checkIfUrlLocationContains('cloudsearch.google.com/cloudsearch/search')) {
            // Google Cloud Search full search page
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
