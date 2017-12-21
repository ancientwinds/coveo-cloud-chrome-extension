/// <reference path="../../node_modules/jquery-ts/index.d.ts" />
declare const $: any;

import { Guid } from '../commons/utils/Guid';
import { ComponentStore } from './ComponentStore';

export class BasicComponent {
    protected _guid: string = new Guid().toString();
    protected _className: string = "BasicComponent";
    protected _visible: boolean = true;

    constructor(className: string, visible: boolean = true, registerComponent: boolean = true) {
        this._className = className;
        if (registerComponent) {
            ComponentStore.registerComponent(this);
        }
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

    public render(target: string, html: string, showComponent: boolean = true): void {
        $(target).append(html);
        $(target).html($(target).html().replace(/&nbsp;/g, ''));
        $('#' + this._guid).addClass(this._className);
        if (this._visible) {
            $(target).hide().fadeIn('fast');
        }
        
    }

    public append(target: string, html: string): void {
        $(target).append(html);
    }

    public unregister() {
        ComponentStore.unregisterComponent(this);
    }

    public clear(): void {
        $('#' + this._guid).remove();
    }

    public remove(): void {
        this.clear();
        this.unregister();
    }
}