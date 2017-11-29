declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';

export class FacetItem extends BasicComponent {
    private _facet: any = {};

    constructor(facet: any, visible: boolean, registerComponent: boolean) {
        super('FacetItem', visible, registerComponent);
        this._facet = facet;
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                <div class="FacetTitle">${this._facet.field}</div>
                <ul id="${this._guid}-values" class="FacetValues">
                    
                </ul>
            </div>
        `);

        let renderingContainer: string = `#${this._guid}-values`;
        this._facet.values.forEach(function (value) {
            $(renderingContainer).append(`<li>${value.value} (${value.numberOfResults})</li>`);
        });

        // TODO: Binder les actions, en passant par l'aq
    }
}
