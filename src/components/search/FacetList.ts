declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { FacetItem } from './FacetItem';
import { CoveoSearch } from './CoveoSearch';

export class FacetList extends BasicComponent {
    private _coveoSearchId: string = null;
    private _facets: Array<FacetItem> = [];

    constructor() {
        super('Facets');
    }

    public setCoveoSearchId(coveoSearchId: string): void {
        this._coveoSearchId = coveoSearchId
    }

    public clearFacets(): void {
        this._facets = [];
        $(`#${this._guid}`).html('');
    }

    public updateFacets(groupByResults: any, coveoSearchId: string): void {;
        let context: FacetList = this;
        groupByResults.forEach(function (grouping: any) {
            if (grouping.values.length > 0) {
                var result: FacetItem = new FacetItem(grouping, true, false);
                result.setCoveoSearchId(coveoSearchId)
                result.render(`#${context._guid}`);
            }
        });

        var facetCheckBoxes = document.querySelectorAll('.FacetCheckbox');
        
        [].forEach.call(facetCheckBoxes, function(checkbox) {
            checkbox.addEventListener('click', function () {
                ComponentStore.execute(
                    context._coveoSearchId,
                    'toggleAdvancedQueryExpressionItem',
                    context.btoaAndStringify({
                        'aq': this.value,
                    })
                );

                (ComponentStore.getComponents().Item(context._coveoSearchId) as CoveoSearch).showClearButton();
            });
        });
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                Facets here...
            </div>
        `);
    }
}
