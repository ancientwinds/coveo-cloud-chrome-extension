/// <reference path="../../node_modules/jquery-ts/index.d.ts" />
declare const $: any;

import { Guid } from '../commons/utils/Guid';
import { ComponentStore } from './ComponentStore';

export class BasicComponent {
    protected _guid: string = new Guid().toString();
    protected _className = "BasicComponent";

    constructor(className: string) {
        this._className = className;
        ComponentStore.registerComponent(this);
    }

    public getComponentId(): string {
        return this._guid;
    }

    public getClassName(): string {
        return this._className;
    }

    public getFunctionCallString(functionToCall: string, args: {}) {
        return `myApp._componentStore.execute('${this._guid}', '${functionToCall}', '${this.btoaAndStringify(args)}')`;
    }

    public btoaAndStringify(args: {}): string {
        return btoa(JSON.stringify(args));
    }

    public render(target: string, html: string): void {
        // console.log(`Rendering component ${this._guid} of type ${this._className}`);
        $(target).append(html);
        $(target).html($(target).html().replace(/&nbsp;/g, ''));
        $('#' + this._guid).addClass(this._className);
        $(target).hide().fadeIn('fast');
    }

    public remove(): void {
        $('#' + this._guid).remove();
        ComponentStore.unregisterComponent(this);
    }
}