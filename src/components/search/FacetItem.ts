declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { UIHelper } from '../utilities/UIHelper';
import { CoveoSearch } from './CoveoSearch';

export class FacetItem extends BasicComponent {
    private _facet: any = {};
    private _coveoSearchId: string = null;

    constructor(facet: any, visible: boolean, registerComponent: boolean) {
        super('FacetItem', visible, registerComponent);
        this._facet = facet;
    }

    public setCoveoSearchId(coveoSearchId: string): void {
        this._coveoSearchId = coveoSearchId;
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                <div class="FacetTitle">${UIHelper.getCleanFacetName(this._facet.field)}</div>
                <ul id="${this._guid}-values" class="FacetValues">
                    
                </ul>
            </div>
        `);

        let context: FacetItem = this;
        let checkedString: string = this._facet.values.length > 1? '' : ' checked="true"';

        this._facet.values.forEach(function (value) {
            let facetId: string = `${context._facet.field}.${value.value.replace(/ /g, '')}`;
            $(`#${context._guid}-values`).append(`<li><input${checkedString} class="FacetCheckbox" id="${facetId}" type="checkbox" value="@${context._facet.field}='${value.value}'" /><label for="${facetId}"> ${value.value} (${value.numberOfResults})</label></li>`);
        });
    }
}
