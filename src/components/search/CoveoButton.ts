declare let chrome: any;
declare let $: any;
declare let toggleDisplay: any;

import { BasicComponent } from '../../components/BasicComponent';
import { ComponentStore } from '../../components/ComponentStore';
import { UIHelper } from '../utilities/UIHelper';

export class CoveoButton extends BasicComponent {
    private _resultListPanelId: string = null;

    constructor() {
        super('CoveoButton');
    }

    public updateNumberOfResultsLabel(numberOfResults: number): void {
        $(`#${this._guid}-caption`).html(numberOfResults);
    }

    public render(parent: string, resultListPanelId): void {
        this._resultListPanelId = resultListPanelId;

        super.render(parent, `
            <div id="${this._guid}">
                <img width="40px" height="52" src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYWxxdWVfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAzOS44ODcgNTIuMjQ5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzOS44ODcgNTIuMjQ5IiB4bWw6c3BhY2U9InByZXNlcnZlIj48ZyBpZD0iUGFnZS0xIj48ZyBpZD0iSW50ZWdyYXRpb25fVjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMjEyLjAwMDAwMCwgLTU5OS4wMDAwMDApIj48ZyBpZD0iR3JvdXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMTIuMDAwMDAwLCA1OTkuMDAwMDAwKSI+PGcgaWQ9ImNvdmVvX2xvZ29fYmx1ZV9vcmFuZ2UiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCAzOS4wMDAwMDApIj48cGF0aCBpZD0iU2hhcGUiIGZpbGw9IiMwMDQ5OTAiIGQ9Ik00Ljk2MSw4LjYwM0M0LjUzMSw4LjA3MiwzLjg4Myw3Ljc2NCwzLjIsNy43NjdjLTEuMTYsMC0yLjA0LDEuMDItMi4wNCwyLjE1NmMwLDEuMjc2LDAuODgxLDIuMTgsMi4xMzMsMi4xOGMwLjY3MywwLDEuMjI5LTAuMzI0LDEuNjkzLTAuODExVjEyLjhjLTAuNTI0LDAuMjc3LTEuMTA4LDAuNDIxLTEuNywwLjQxN0MxLjQ3NywxMy4yMTcsMCwxMS44MjYsMCw5Ljk3MWMwLTEuOTAzLDEuNDg0LTMuMzE3LDMuMzYzLTMuMzE3YzAuNTY4LTAuMDA1LDEuMTI4LDAuMTQsMS42MjMsMC40MTlMNC45NjEsOC42MDN6Ii8+PHBhdGggaWQ9IlNoYXBlXzFfIiBmaWxsPSIjMDA0OTkwIiBkPSJNOC4yMDksOS45NDdjMC4wMTMsMS4xNjIsMC45NjMsMi4wOTUsMi4xMjUsMi4wODdzMi4wOTktMC45NTUsMi4wOTUtMi4xMTdjLTAuMDA0LTEuMTYyLTAuOTQ4LTIuMTAyLTIuMTEtMi4xMDJDOS4xNDcsNy44MjEsOC4yMDMsOC43NzYsOC4yMDksOS45NDcgTTEzLjU4OSw5Ljk0N2MwLjAxMiwwLjg3NC0wLjMzMSwxLjcxNS0wLjk1LDIuMzMxYy0wLjYxOSwwLjYxNi0xLjQ2MiwwLjk1NS0yLjMzNSwwLjkzOWMtMS4xODQsMC4wMjUtMi4yODktMC41OTMtMi44ODktMS42MTVzLTAuNTk5LTIuMjg4LDAtMy4zMDlzMS43MDQtMS42MzksMi44ODktMS42MTVjMC44NzMtMC4wMTYsMS43MTYsMC4zMjMsMi4zMzUsMC45MzljMC42MTksMC42MTYsMC45NjIsMS40NTcsMC45NSwyLjMzMSIvPjxwb2x5Z29uIGlkPSJTaGFwZV8yXyIgZmlsbD0iIzAwNDk5MCIgcG9pbnRzPSIxOC4wODYsMTAuNzEzIDE5Ljg3MSw2Ljg2MyAyMS4xOTMsNi44NjMgMTguMDg2LDEzLjI0IDE1LjAwMyw2Ljg2MyAxNi4zMjQsNi44NjMgIi8+PHBhdGggaWQ9IlNoYXBlXzNfIiBmaWxsPSIjMDA0OTkwIiBkPSJNMjcuMzYxLDkuMjUxYy0wLjE0My0wLjkyNy0wLjc0MS0xLjUzLTEuNjkzLTEuNTNjLTAuOTI3LDAtMS42LDAuNjUtMS43NjMsMS41M0gyNy4zNjF6IE0yMy44NTcsMTAuMTMzYzAsMS4wNDMsMC43MTQsMi4wNCwxLjg1NywyLjA0YzAuOTA0LDAsMS4zOTEtMC40NjQsMS44MzEtMS4yMDZsMSwwLjU1N2MtMC41NjEsMS4wNTQtMS42NjMsMS43MDctMi44NTcsMS42OTNjLTEuODc5LDAtMy4wMTQtMS40MTQtMy4wMTQtMy4yNDZjMC0xLjkwMSwxLjAyLTMuMzE2LDIuOTkxLTMuMzE2czIuODc3LDEuNDM3LDIuODc3LDMuMjY5djAuMjA5SDIzLjg1N3oiLz48cGF0aCBpZD0iU2hhcGVfNF8iIGZpbGw9IiMwMDQ5OTAiIGQ9Ik0zMS41MTEsOS45NDdjMC4wMTMsMS4xNjIsMC45NjMsMi4wOTUsMi4xMjUsMi4wODdzMi4wOTktMC45NTUsMi4wOTUtMi4xMTdjLTAuMDA0LTEuMTYyLTAuOTQ4LTIuMTAyLTIuMTEtMi4xMDJDMzIuNDUsNy44MjEsMzEuNTA2LDguNzc2LDMxLjUxMSw5Ljk0NyBNMzYuOTE0LDkuOTQ3YzAuMDA2LDEuMzMtMC43OSwyLjUzMy0yLjAxNywzLjA0N2MtMS4yMjcsMC41MTQtMi42NDMsMC4yMzYtMy41ODYtMC43MDJjLTAuOTQzLTAuOTM4LTEuMjI3LTIuMzUzLTAuNzE5LTMuNTgzYzAuNTA4LTEuMjMsMS43MDctMi4wMzIsMy4wMzctMi4wMzJDMzQuNTAyLDYuNjYxLDM1LjM0NSw3LDM1Ljk2NCw3LjYxNlMzNi45MjYsOS4wNzQsMzYuOTE0LDkuOTQ3Ii8+PHBvbHlnb24gaWQ9IlNoYXBlXzVfIiBmaWxsPSIjMDA0OTkwIiBwb2ludHM9IjM3LjQ3MSw1Ljg1NyAzOC4yNjQsNS44NTcgMzguMjY0LDYuMDM0IDM3Ljk1Niw2LjAzNCAzNy45NTYsNy4xNTcgMzcuNzgxLDcuMTU3IDM3Ljc4MSw2LjAzOSAzNy40NzEsNi4wMzkgIi8+PHBvbHlnb24gaWQ9IlNoYXBlXzZfIiBmaWxsPSIjMDA0OTkwIiBwb2ludHM9IjM5LjUzMyw1LjgwNyAzOS44ODcsNy4xNTcgMzkuNzE0LDcuMTU3IDM5LjUsNi4zMzMgMzkuMTMxLDcuMjA3IDM4Ljc2MSw2LjMyNiAzOC41NDMsNy4xNTcgMzguMzcsNy4xNTcgMzguNzI0LDUuODA3IDM5LjEzLDYuNzczICIvPjxwb2x5Z29uIGlkPSJTaGFwZV83XyIgZmlsbD0iI0Y1ODAyMCIgcG9pbnRzPSIyOC4xNDksMi45MzMgMjMuMDQ5LDAgMjMuMDQ5LDUuODY2ICIvPjwvZz48cGF0aCBpZD0iUmVjdGFuZ2xlIiBmaWxsPSIjMDA0OTkwIiBkPSJNNCwwaDMwYzEuNjU3LDAsMywxLjM0MywzLDN2MzBjMCwxLjY1Ny0xLjM0MywzLTMsM0g0Yy0xLjY1NywwLTMtMS4zNDMtMy0zVjNDMSwxLjM0MywyLjM0MywwLDQsMHoiLz48L2c+PC9nPjwvZz48L3N2Zz4=" />
                <div id="${this._guid}-caption">?</div>
            </div>
        `);

        let context: CoveoButton = this;
        // Weirdly... for this case... binding the action directly doesn't work, but binding it with a 0 ms delay will work
        // WTF?!
        // TODO: test from time to time if it's fixed for chrome, then remove the hack.
        setTimeout(function() {
            if (document.getElementById(context._guid)) {
                document.getElementById(context._guid).addEventListener('click', function () {
                    UIHelper.toggleDisplay(context._resultListPanelId);
                });
            }
        }, 0);
    }
}