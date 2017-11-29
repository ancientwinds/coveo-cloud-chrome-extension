declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { FacetItem } from './FacetItem';

export class FacetList extends BasicComponent {
    private _coveoSearchId: string = null;

    constructor() {
        super('Facets');
    }

    public setCoveoSearchId(coveoSearchId: string): void {
        this._coveoSearchId = coveoSearchId
    }

    public clearFacets(): void {
        $(`#${this._guid}`).html('');
    }

    public updateFacets(groupByResults: any): void {
        let renderingContainer: string = `#${this._guid}`;

        groupByResults.forEach(function (grouping: any) {
            let result: FacetItem = new FacetItem(grouping, true, false);
            result.render(renderingContainer);
        });
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
