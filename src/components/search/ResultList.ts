declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { ResultItem } from './ResultItem';

export class ResultList extends BasicComponent {
    constructor() {
        super('ResultList');
    }

    public appendResults(results): void {
        // TODO: Do something
    }

    public clearResults(): void {
        // TODO: Do something
    }

    public showResults(results: any) {
        // TODO: Do something
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                patate
                <div id="${this._guid}-stats"></div>
                <div id="${this._guid}-facets"></div>
                <div id="${this._guid}-results"></div>
                patate end
            </div>
        `);


        // TODO: Binder les actions
    }
}
