declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class ResultItem extends BasicComponent {
    constructor() {
        super('ResultItem');
    }

    public render(parent: string, item: any): void {
        var resultDate = new Date(0);
        resultDate.setUTCSeconds(item.raw.date);
        
        super.render(parent, `
            <div id="${this._guid}">
                <div class="coveoFileType">${item.raw.filetype}</div>
                <div class="coveoTitle"><a href="${item.clickUri}">${item.title}</a></div>
                <div class="coveoDate">${resultDate}</div>
                <div class="coveoAuthor">${item.raw.author}</div>
                <div class="coveoDescription">${item.excerpt}</div>
            </div>
        `);

        // TODO: Binder les actions
    }
}
