import {  } from '../components/BasicComponent';
import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';

export class ChangeWatcher extends BasicComponent {
    private _htmlElementId: string = null;
    private _callBack: Function = null;
    private _interval: any;
    private _currentValue: string = '';
    private _watchIntervalInMiliseconds: number = null;

    constructor(htmlElementId: string, callback: Function, watchIntervalInMiliseconds: number) {
        super('ChangeWatcher');
        this._htmlElementId = htmlElementId;
        this._callBack = callback;
        this._watchIntervalInMiliseconds = watchIntervalInMiliseconds;

        this.watchForChanges()

/*         let context: ChangeWatcher = this;

        this._interval = setInterval(function() {
            ComponentStore.execute(context._guid, 'watchForChanges', context.btoaAndStringify({}))
        }, this._watchIntervalInMiliseconds); */
    }

    public watchForChanges(): void {
        if (document.getElementById(this._htmlElementId)) {
            if ((document.getElementById(this._htmlElementId) as HTMLInputElement).value) {
                if ((document.getElementById(this._htmlElementId) as HTMLInputElement).value != this._currentValue) {
                    this._currentValue = (document.getElementById(this._htmlElementId) as HTMLInputElement).value;
                    this._callBack((document.getElementById(this._htmlElementId) as HTMLInputElement).value);
                }
            }

            let context: ChangeWatcher = this;
            this._interval = setTimeout(function() {
                ComponentStore.execute(context._guid, 'watchForChanges', context.btoaAndStringify({}))
            }, this._watchIntervalInMiliseconds);
        } else  {
            console.warn(`ChangeWatcher: Element ${this._htmlElementId} was not found on the page.`);

            clearInterval(this._interval);
        }
    }

    public stopWatching(): void {
        clearInterval(this._interval);
        this._interval = null;
    }
}