declare let chrome: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { ChromeHeaderModification } from '../../commons/utils/ChromeHeaderModification';
import { Configuration } from '../options/Configuration';

export class Popup extends BasicComponent {
    private _hostedSearchPage: string = null;

    constructor() {
        super ('Popup');
    }

    private renderIframe(parent: string, activeQuery: string, organizationId: string, hostedSearchPage: string): void {
        super.render(parent, `
            <iframe id="loginFrame" style="border: none; width: 100%; height: 100%;" src="${Configuration.PLATFORM_URL}/pages/${organizationId}/${hostedSearchPage}?#q=${activeQuery}"></iframe>
        `);
    }

    public render(parent: string): void {
        ChromeHeaderModification.applyHeaderModification();

        let context: Popup = this;

        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message) {
                context.renderIframe(parent, message.activeQuery, message.organizationId, message.hostedSearchPage);
            }
        );
    }
}
