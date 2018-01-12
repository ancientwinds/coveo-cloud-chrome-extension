import {  } from '../components/BasicComponent';
import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';

export class ChangeWatcher extends BasicComponent {
    private _querySelector: string = null;
    private _callBack: Function = null;
    private _timeout: any;
    private _currentValue: string = '';
    private _watchIntervalInMiliseconds: number = null;
    private _clearIntervalOnElementNotFound: boolean = true;

    constructor(querySelector: string, callback: Function, watchIntervalInMiliseconds: number, clearIntervalOnElementNotFound: boolean = true) {
        super('ChangeWatcher');
        this._querySelector = querySelector;
        this._callBack = callback;
        this._watchIntervalInMiliseconds = watchIntervalInMiliseconds;
        this._clearIntervalOnElementNotFound = clearIntervalOnElementNotFound;

        this.watchForChanges()
    }

    public executeCallback(): void {
        if ((document.querySelector(this._querySelector) as HTMLInputElement).value) {
            this._currentValue = (document.querySelector(this._querySelector) as HTMLInputElement).value;
        }

        this._callBack(this._currentValue);
    }

    public watchForChanges(): void {
        let watchAgain = this.watchForChanges.bind(this);
        let element: HTMLInputElement = (document.querySelector(this._querySelector) as HTMLInputElement)

        if (element) {
            try {
                if (element.value !== this._currentValue) {
                    this._currentValue = element.value;
                    this._callBack(element.value);
                }
            } catch (e) {
                // Nothing to do.
            }
            this._timeout = setTimeout(watchAgain, this._watchIntervalInMiliseconds);
        }
        else if (this._clearIntervalOnElementNotFound) {
             clearTimeout(this._timeout);
        }
        else {
            this._timeout = setTimeout(watchAgain, this._watchIntervalInMiliseconds);
       }
    }

    public stopWatching(): void {
        clearTimeout(this._timeout);
        this._timeout = null;
    }
}