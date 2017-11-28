declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { CoveoButton } from './CoveoButton';
import { ResultList } from './ResultList';
import { ChangeWatcher } from '../utilities/ChangeWatcher';

export class CoveoSearch extends BasicComponent {
    private _constantQueryExpression: string = '';

    private _coveoButton: CoveoButton = new CoveoButton();
    private _resultList: ResultList = new ResultList(this._guid);
    private _changeWatcher: ChangeWatcher = null;

    private _boundHtmlElement: string = null;

    private _userToken: string = null;

    constructor() {
        super('CoveoSearch');
    }

    public setUserToken(userToken: string) {
        this._userToken = userToken;
    }

    public search(args: {}): void {
        (document.getElementById(`${this._resultList.getSearchBarId()}-searchinput`) as HTMLInputElement).value = args['searchQuery'];

        if (args['searchQuery']) {  
            $('.SearchBar span')[0].style.display = 'block';
        } else {
            $('.SearchBar span')[0].style.display = 'none';
        }

        let organizationId = 'coveolabspublic';
        let constantQueryExpression = 'NOT (@filetype=(Txt, .oleFile, Folder))';

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                /*
                let results = JSON.parse(xhttp.responseText);
                let totalCount = results.totalCount;
                let coveoResultCaption = document.getElementById(coveoResultCaptionId);
                coveoResultCaption.innerHTML = totalCount;
                let duration = results.duration;
                console.log(`Found ${totalCount} results in ${duration} ms`);
                // TODO : Display number of coveo results...
                // TODO : Add facets
                let resultList = document.getElementById(coveoSearchContainerId);
                resultList.innerHTML = `
                    <div class="resultsStats">
                        Coveo found ${totalCount} result(s) in ${duration} ms
                    </div>
                `;
                results.results.forEach(function(item){
                    let result = document.createElement('div');
                    var resultDate = new Date(0);
                    resultDate.setUTCSeconds(item.raw.date);
                    let resultTemplate = `
                        <div class="coveoResultItem">
                            <div class="coveoFileType">${item.raw.filetype}</div>
                            <div class="coveoTitle"><a href="${item.clickUri}">${item.title}</a></div>
                            <div class="coveoDate">${resultDate}</div>
                            <div class="coveoAuthor">${item.raw.author}</div>
                            <div class="coveoDescription">${item.excerpt}</div>
                        </div>
                    `;
                    result.innerHTML = resultTemplate;
                    resultList.appendChild(result);
                });
                */
            }
        };

        //let url = `https://platformqa.cloud.coveo.com/rest/search/v2/?organizationId=${organizationId}&q=${args['searchQuery']}&cq=${constantQueryExpression}`;
        let url = `https://platformqa.cloud.coveo.com/rest/search/v2/?organizationId=coveo-labs&q=${args['searchQuery']}&cq=${this._constantQueryExpression}`;
        xhttp.open('GET', url, true);
        xhttp.setRequestHeader('Authorization', `Bearer ${this._userToken}`);
        xhttp.send();
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
