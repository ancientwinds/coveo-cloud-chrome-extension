declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { CoveoButton } from './CoveoButton';
import { ComponentStore } from '../../components/ComponentStore';

export class CoveoSearch extends BasicComponent {
    private _coveoButton: CoveoButton = new CoveoButton();
    constructor() {
        super('CoveoSearch');
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
            Patate
            </div>
        `);

        this._coveoButton.render('body');
    }
}
