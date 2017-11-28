declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class ResultStats extends BasicComponent {
    constructor() {
        super('ResultStats');
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                Coveo found <b>?</b> result(s) in <b>?</b> seconds
            </div>
        `);

        // TODO: Binder les actions
    }
}
