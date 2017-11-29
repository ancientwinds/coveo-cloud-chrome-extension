declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class ResultItem extends BasicComponent {
    private _item: any = {};

    constructor(item: any, visible: boolean, registerComponent: boolean) {
        super('ResultItem', visible, registerComponent);
        this._item = item;
    }

    public render(parent: string): void {
        var resultDate = new Date(0);
        resultDate.setUTCSeconds(this._item.raw.date);
        
        super.render(parent, `
            <div id="${this._guid}">
                <div class="coveoFileType">${this._item.raw.filetype}</div>
                <div class="coveoTitle"><a href="${this._item.clickUri}">${this._item.title}</a></div>
                <div class="coveoDate">${resultDate} - </div><div class="coveoAuthor">${this._item.raw.author}</div>
                <div class="coveoDescription">${this._item.excerpt}</div>
            </div>
        `);

        // TODO: Binder les actions
    }
}
