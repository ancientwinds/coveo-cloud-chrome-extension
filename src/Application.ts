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
import { PlatformUrls } from './components/options/PlatformUrls';

export class Application extends BasicComponent {
    private _authentication: Authentication;
    private _options: Options;
    private _popup: Popup;
    private _background: Background;
    private _changeWatcher: ChangeWatcher;

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
        if (Url.checkIfUrlLocationContains('cloudsearch.google.com')) {
            this.watchInput('[data-placeholder="Search"] input:nth-child(2)', true);
        } else if (Url.checkIfUrlLocationContains('drive.google.com')) {
            this.watchInput('[name="q"]');
        } else if (Url.checkIfUrlLocationContains('outlook.office.com')) {
            this.watchInput('[autoid="_is_3"]', true);
        } else if (Url.checkIfUrlLocationContains('coveo.com')) {
            if (document.getElementById('searchBox')) {
                this.watchInput('[id="searchBox"]');
            } else {
                this.watchInput('[form="coveo-dummy-form"]');
            }
        } else if (Url.checkIfUrlLocationContains('www.amazon.com')) {
            this.watchInput('[name="field-keywords"]');
        } else if (Url.checkIfExtensionLocation('popup.html')) {
            this._popup = new Popup();
            this._popup.render('body');
        } else if (!Url.checkIfUrlLocationContains('cloud.coveo.com/pages')) {
            this.watchInput('[name="q"]');
        }

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                this.executeSearch();
            }
        }, false);

        this.executeSearch();
    }

    private executeSearch(): void {
        if (this._changeWatcher) {
            this._changeWatcher.executeCallback();
        } else {
            this.search('');
        }
    }

    public watchInput(querySelector: string, ignoreActualElementExistence: boolean = false): void {
        let searchBox: HTMLInputElement = (document.querySelector(querySelector) as HTMLInputElement);
        if (searchBox || ignoreActualElementExistence) {
            this._changeWatcher = new ChangeWatcher(querySelector, (searchQuery: string) => {
                this.search(searchQuery);
            }, 200, !ignoreActualElementExistence);
        } else {
            this.search('');
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

        chrome.storage.local.get(
            {
                'coveoforgooglecloudsearch_environment': 'production'
            },
            (items) => {
                if (Url.checkIfExtensionLocation('login.html')) {
                    this._authentication = new Authentication();
                    this._authentication.render(`#${this._guid}`);
                } else if (Url.checkIfExtensionLocation('o2c.html')) {
                    this._authentication = new Authentication();
                    this._authentication.processOAuthReturn();
                } else if (Url.checkIfExtensionLocation('options.html')) {
                    this._options = new Options();
                    this._options.render(`#${this._guid}`);
                } else if (Url.checkIfExtensionLocation('background.html')) {
                    this._background = new Background();
                    this._background.loadOptions(() => {
                        this._background.listenForMessages();
                    });
                } else {
                    this.bindSearch();
                }
            }
        );
    }
}

export let _application: Application = null;

$(document).ready(() => {
    _application = new Application();
    _application.render();
});
