declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { CoveoButton } from './CoveoButton';
import { ResultList } from './ResultList';
import { ChangeWatcher } from '../utilities/ChangeWatcher';

export class CoveoSearch extends BasicComponent {
    private _advancedQueryExpression: Array<string> = [];
    private _constantQueryExpression: string = 'NOT (@filetype=(Txt, .oleFile, Folder))';
    private _groupByExpression: string = `[
        {"maximumNumberOfValues":5,"completeFacetWithStandardValues":true,"field":"@author","sortCriteria":"occurrences","injectionDepth":1000},
        {"maximumNumberOfValues":5,"completeFacetWithStandardValues":true,"field":"@filetype","sortCriteria":"occurrences","injectionDepth":1000}
    ]`;

    private _coveoButton: CoveoButton = new CoveoButton();
    private _resultList: ResultList = new ResultList(this._guid);
    private _changeWatcher: ChangeWatcher = null;

    private _boundHtmlElement: string = null;

    private _userToken: string = null;
    private _organizationId: string = null;

    constructor() {
        super('CoveoSearch');
    }

    public setUserToken(userToken: string) {
        this._userToken = userToken;
    }

    public setOrganizationId(organizationId: string) {
        this._organizationId = organizationId;
    }

    public toggleAdvancedQueryExpressionItem(args: {}): void {
        if (!args['aq']) {
            args['aq'] = '';
        }
        if (!args['refreshSearch']) {
            args['refreshSearch'] = true;
        }
        
        let index: number = this._advancedQueryExpression.indexOf(args['aq']);
        if (index > -1) {
            this._advancedQueryExpression.splice(index, 1);
        } else {
            this._advancedQueryExpression.push(args['aq']);
        }

        if (args['refreshSearch']) {
            this.refreshSearch();
        }
    }

    public clearAdvancedQueryExpression(refreshSearch: boolean = true): void {
        this._advancedQueryExpression = [];
        if (refreshSearch) {
            this.refreshSearch();
        }
    }

    public showClearButton(): void {
        $('.SearchBar div')[0].style.display = 'block';
    }

    public getAdvancedQueryExpression(): string {
        return this._advancedQueryExpression.join(' AND ');
    }

    public search(args: {}): void {
        (document.getElementById(`${this._resultList.getSearchBarId()}-searchinput`) as HTMLInputElement).value = args['searchQuery'];

        if (args['searchQuery']) {  
            $('.SearchBar div')[0].style.display = 'block';
        } else {
            $('.SearchBar div')[0].style.display = 'none';
        }

        let context: CoveoSearch = this;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let results: any = JSON.parse(xhttp.responseText);

                context._coveoButton.updateNumberOfResultsLabel(results.totalCount);
                context._resultList.clearResults();
                context._resultList.showResults(results, context._guid);
            }
        };

        let url = `https://platformqa.cloud.coveo.com/rest/search/v2/?organizationId=${this._organizationId}&q=${args['searchQuery']}&aq=${this.getAdvancedQueryExpression()}&cq=${this._constantQueryExpression}&groupBy=${this._groupByExpression}`;
        xhttp.open('GET', url, true);
        xhttp.setRequestHeader('Authorization', `Bearer ${this._userToken}`);
        xhttp.send();
    }

    public refreshSearch() {
        this.search({
            'searchQuery': (document.getElementById(`${this._resultList.getSearchBarId()}-searchinput`) as HTMLInputElement).value
        });
    }

    public renderBasicComponents(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">

            </div>
        `);

        this._coveoButton.render('body', this._resultList.getComponentId());
        this._resultList.render('body');
    }
    
    public renderUserIsNotLoggedIn(parent: string) {
        this.renderBasicComponents(parent);

        this._resultList.renderUserIsNotLoggedIn(parent);
    }

    public render(parent: string, htmlElementIdToBind?: string): void {
        this.renderBasicComponents(parent);

        let context: CoveoSearch = this;

        if (htmlElementIdToBind) {
            this._boundHtmlElement = htmlElementIdToBind;

            this._changeWatcher = new ChangeWatcher(htmlElementIdToBind, function (searchQuery: string) {
                ComponentStore.execute(context._guid, 'search', context.btoaAndStringify({'searchQuery': searchQuery}));
            }, 200);
        }

        // Binder les événements comme ESC et le click out pour fermer l'overlay.
    }
}
