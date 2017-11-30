declare let chrome: any;
declare let $: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { ChangeWatcher } from '../utilities/ChangeWatcher';

export class SearchBar extends BasicComponent {
    private _changeWatcher: ChangeWatcher = null;
    private _coveoSearchId: string = null;

    constructor(visible: boolean = true) {
        super('SearchBar', visible);
    }

    public setCoveoSearchId(coveoSearchId: string) {
        this._coveoSearchId = coveoSearchId;
    }

    public search(args: {}): void {
        if ($(`#${this._guid}`).is(":visible")) {
            ComponentStore.execute(this._coveoSearchId, 'search', this.btoaAndStringify(args));
        }
    }

    public render(parent: string): void {
        super.render(parent, `
            <div id="${this._guid}">
                <input type="text" id="${this._guid}-searchinput">
                <img width="20px" height="20px" src="data:image/svg+xml;base64,PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMCAyMCIgdmlld0JveD0iMCAwIDIwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9ImN1cnJlbnRDb2xvciI+PHBhdGggZD0ibTguMzY4IDE2LjczNmMtNC42MTQgMC04LjM2OC0zLjc1NC04LjM2OC04LjM2OHMzLjc1NC04LjM2OCA4LjM2OC04LjM2OCA4LjM2OCAzLjc1NCA4LjM2OCA4LjM2OC0zLjc1NCA4LjM2OC04LjM2OCA4LjM2OG0wLTE0LjE2MWMtMy4xOTUgMC01Ljc5MyAyLjU5OS01Ljc5MyA1Ljc5M3MyLjU5OSA1Ljc5MyA1Ljc5MyA1Ljc5MyA1Ljc5My0yLjU5OSA1Ljc5My01Ljc5My0yLjU5OS01Ljc5My01Ljc5My01Ljc5MyIvPjxwYXRoIGQ9Im0xOC43MTMgMjBjLS4zMjkgMC0uNjU5LS4xMjYtLjkxLS4zNzdsLTQuNTUyLTQuNTUxYy0uNTAzLS41MDMtLjUwMy0xLjMxOCAwLTEuODIuNTAzLS41MDMgMS4zMTgtLjUwMyAxLjgyIDBsNC41NTIgNC41NTFjLjUwMy41MDMuNTAzIDEuMzE4IDAgMS44Mi0uMjUyLjI1MS0uNTgxLjM3Ny0uOTEuMzc3Ii8+PC9nPjwvc3ZnPg==" />
                <div id="${this._guid}-clear">&times;</div>
            </div>
        `);


        let context: SearchBar = this;
        // Weirdly... for this case... binding the action directly doesn't work, but binding it with a 0 ms delay will work
        // WTF?!
        // TODO: test from time to time if it's fixed for chrome, then remove the hack.
        setTimeout(function () {
            if (document.getElementById(`${context._guid}-clear`)) {
                document.getElementById(`${context._guid}-clear`).addEventListener('click', function () {
                    ComponentStore.execute(context._coveoSearchId, 'clearAdvancedQueryExpression', context.btoaAndStringify({'refreshSearch': false}));
                    (document.getElementById(`${context._guid}-searchinput`) as HTMLInputElement).value = '';
                    this.style.display='none';
                });
            }
        }, 0);

        this._changeWatcher = new ChangeWatcher(`${this._guid}-searchinput`, function (searchQuery: string) {
            ComponentStore.execute(context._guid, 'search', context.btoaAndStringify({
                'searchQuery': searchQuery
            }));
        }, 200);
    }
}
