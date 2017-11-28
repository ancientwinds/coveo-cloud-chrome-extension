declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { ResultItem } from './ResultItem';
import { ResultStats } from './ResultStats';
import { Facets } from './Facets';
import { SearchBar } from './SearchBar';

export class ResultList extends BasicComponent {
    private _searchBar: SearchBar = new SearchBar();
    private _resultStats: ResultStats = new ResultStats();
    private _facets: Facets = new Facets();
    private _coveoSearchId: string = null;

    constructor(coveoSearchId: string) {
        super('ResultList');
        this._coveoSearchId = coveoSearchId;
        this._searchBar.setCoveoSearchId(coveoSearchId);
    }

    public appendResults(results): void {
        // TODO: Do something
    }

    public clearResults(): void {
        // TODO: Do something
    }

    public showResults(results: any) {
        // TODO: Do something
    }

    public getSearchBarId(): string {
        return this._searchBar.getComponentId();
    }

    public renderBasicComponents(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                <div id="${this._guid}-wrap" class="ResultListWrap">
                </div>
            </div>
        `);
    }

    public renderUserIsNotLoggedIn(parent) {
        this.renderBasicComponents(parent);

        $(`#${this._guid}-wrap`).html(`
            User is not logo login, please go in the extension options by clicking on blablabla...
        `);

        $(`#${this._guid}-wrap`).show();
    }

    public render(parent: string): void {
        this.renderBasicComponents(parent);

        // Render child components
        this._searchBar.render(`#${this._guid}-wrap`);
        this._resultStats.render(`#${this._guid}-wrap`);
        this._facets.render(`#${this._guid}-wrap`);
        this.append(`#${this._guid}-wrap`, `
            <div id="${this._guid}-results" class="ResultListResults">
                <div id="FAKE_RESULT_ITEM" class="ResultItem">
                    <div class="coveoFileType">DOC</div>
                    <div class="coveoTitle"><a href="http://perdu.com">My title</a></div>
                    <div class="coveoDate">2017-11-27 - </div><div class="coveoAuthor">Jean-Fran&ccedil;ois Cloutier</div>
                    <div class="coveoDescription">This is a description for the fake item.</div>
                </div>
            </div>
        `);

        // Hide the result page.
        document.getElementById(this._guid).style.display = 'none';

        // TODO: Binder les actions
    }
}
