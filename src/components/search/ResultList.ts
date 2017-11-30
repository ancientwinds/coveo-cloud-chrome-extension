declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { ResultItem } from './ResultItem';
import { ResultStats } from './ResultStats';
import { FacetList } from './FacetList';
import { SearchBar } from './SearchBar';
import { CoveoSearch } from './CoveoSearch';

export class ResultList extends BasicComponent {
    private _searchBar: SearchBar = new SearchBar();
    private _resultStats: ResultStats = new ResultStats();
    private _facets: FacetList = new FacetList();
    private _coveoSearchId: string = null;

    constructor(coveoSearchId: string) {
        super('ResultList');
        this._coveoSearchId = coveoSearchId;
        this._searchBar.setCoveoSearchId(coveoSearchId);
        this._facets.setCoveoSearchId(coveoSearchId);
    }

    public appendResults(results): void {
        // TODO: Do something
    }

    public clearResults(): void {
        this._facets.clearFacets();
        $(`#${this._guid}-results`).html('');
    }

    public showResults(results: any, coveoSearchId: string) {
        let renderingContainer: string = `#${this._guid}-results`;
        this._resultStats.updateStats(results.totalCount, results.duration / 1000);
        this._facets.updateFacets(results.groupByResults, coveoSearchId);
        results.results.forEach(function(item){
            let result: ResultItem = new ResultItem(item, true, false);
            result.render(renderingContainer);
        });
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
            User is not logo login, please go in the extension options by going in the Coveo extension settings.
        `);

        this.bindUIEvents();

        $(`#${this._guid}-wrap`).show();
    }
    
    public render(parent: string): void {
        this.renderBasicComponents(parent);

        // Render child components
        this._searchBar.render(`#${this._guid}-wrap`);
        this._resultStats.render(`#${this._guid}-wrap`);
        this.append(`#${this._guid}-wrap`, `
            <div id="${this._guid}-resultsContainer" class="ResultListResultsContainer">
            </div>
        `);
        this._facets.render(`#${this._guid}-resultsContainer`);

        $(`#${this._guid}-resultsContainer`).append(`<div id="${this._guid}-results" class="ResultListResults"></div>`);

        // Hide the result page.
        document.getElementById(this._guid).style.display = 'none';

        this.bindUIEvents();
    }

    private bindUIEvents() {
        // Bind escape actions
        document.getElementById(`${this._guid}-wrap`).addEventListener('click', function(e) {
            e.stopPropagation();
        });

        let context: ResultList = this;
        document.getElementById(this._guid).addEventListener('click', function() {
            document.getElementById(context._guid).style.display = 'none';
        });

        document.addEventListener('keydown', function (e) {
            if (e.keyCode == 27) { // Escape
                document.getElementById(context._guid).style.display = 'none';
            } else if (e.altKey && e.keyCode == 83) { // ALT+s
                document.getElementById(context._guid).style.display = 'block';
            }
        });
    }
}
