declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class ResultStats extends BasicComponent {
    constructor() {
        super('ResultStats');
    }

    public updateStats(numberOfResults: number, executionTimeInSeconds: number) {
        $(`#${this._guid}`).html(`Coveo found <span class="CoveoBold">${numberOfResults}</span> result(s) in <span class="CoveoBold">${executionTimeInSeconds}</span> seconds`);
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
            </div>
        `);
    }
}
