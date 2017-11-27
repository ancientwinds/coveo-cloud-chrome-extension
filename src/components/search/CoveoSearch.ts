declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { CoveoButton } from './CoveoButton';
import { ResultList } from './ResultList';
import { ChangeWatcher } from '../utilities/ChangeWatcher';

export class CoveoSearch extends BasicComponent {
    private _coveoButton: CoveoButton = new CoveoButton();
    private _resultList: ResultList = new ResultList();
    private _changeWatcher: ChangeWatcher = null;

    private _boundHtmlElement: string = null;

    constructor() {
        super('CoveoSearch');
    }

    public search(args: {}): void {
        console.log(args);
    }

    public render(parent: string, htmlElementIdToBind?: string): void {
        super.render(parent, `
            <div id="${this._guid}">

            </div>
        `);

        let context: CoveoSearch = this;

        if (htmlElementIdToBind) {
            this._boundHtmlElement = htmlElementIdToBind;

            this._changeWatcher = new ChangeWatcher(htmlElementIdToBind, function (searchQuery: string) {
                ComponentStore.execute(context._guid, 'search', context.btoaAndStringify({'searchQuery': searchQuery}));
            }, 200);
        }

        this._coveoButton.render('body', this._resultList.getComponentId());
        this._resultList.render('body');
    }
}
