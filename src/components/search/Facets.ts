declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class Facets extends BasicComponent {
    constructor() {
        super('Facets');
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                Facets here...
            </div>
        `);

        // TODO: Binder les actions
    }
}
