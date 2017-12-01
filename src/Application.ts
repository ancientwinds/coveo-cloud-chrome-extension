declare let chrome: any;
declare let $: any;

import { Url } from './commons/utils/Url';
import { BasicComponent } from './components/BasicComponent';
import { Authentication } from './components/options/Authentication';
import { Options } from './components/options/Options';
import { Popup } from './components/popup/Popup';
import { Background } from './components/background/Background';
import { ChangeWatcher } from './components/utilities/ChangeWatcher';
import { ComponentStore } from './components/ComponentStore';

export class Application extends BasicComponent {
    private _authentication: Authentication = new Authentication();
    private _options: Options = new Options();
    private _popup: Popup = new Popup();
    private _background: Background = new Background();
    private _changeWatcher: ChangeWatcher

    constructor() {
        super('Application');
    }

    public renderBasicComponents(): void {
        super.append('body', `
            <div id="${this._guid}">
            </div>
        `);
    }

    public bindSearch() {
        let context: Application = this;

        if (Url.checkIfUrlLocationContains('cloudsearch.google.com')) {
            this.watchInput('[data-placeholder="Search"] input:nth-child(2)', true);
        } else if (Url.checkIfUrlLocationContains('drive.google.com')) {
            this.watchInput('[name="q"]');
        } else if (Url.checkIfUrlLocationContains('outlook.office.com')) {
            this.watchInput('[autoid="_is_3"]', true);
        } else if (Url.checkIfUrlLocationContains('html/popup.html')) {
            this._popup.render('body');
        } else if (!Url.checkIfUrlLocationContains('cloud.coveo.com/pages')) {
            this.watchInput('[name="q"]');
        }

        if (!Url.checkIfUrlLocationContains('cloud.coveo.com/pages') && !Url.checkIfUrlLocationContains('html/popup.html')){
            this.search('');
        }

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden && context._changeWatcher) {
                context._changeWatcher.executeCallback();
            }
        }, false);
    }

    public watchInput(querySelector: string, ignoreActualElementExistence: boolean = false): void {
        let searchBox: HTMLInputElement = (document.querySelector(querySelector) as HTMLInputElement);
        if (searchBox || ignoreActualElementExistence) {
            let context: Application = this;
            this._changeWatcher = new ChangeWatcher(querySelector, function (searchQuery: string) { 
                context.search(searchQuery);
            }, 200, !ignoreActualElementExistence); 
        }
    }

    public search(query: string): void {
        chrome.runtime.sendMessage({
            command: 'search',
            queryExpression: query,
            origin: window.location.href 
        });
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
        } else if (Url.checkIfUrlLocationContains('/background.html')) {
            this._background.loadOptions();
            this._background.listenForMessages();
        } else {
            this.bindSearch();
        }
    }
}

export let _application: Application = null;

$(document).ready(function () {
    _application = new Application();
    _application.render();
});
