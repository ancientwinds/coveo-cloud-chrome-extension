declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class CoveoButton extends BasicComponent {
    constructor() {
        super('CoveoButton');
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
            Patate
            </div>
        `);
    }
}
