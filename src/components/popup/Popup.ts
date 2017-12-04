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

    private renderNotLoggedIn(parent: string): void {
        super.render(parent, `
            Your are not logged in. To login, right click on the extension's icon, then on "Options".
        `);
    }

    public render(parent: string): void {
        ChromeHeaderModification.applyHeaderModification();

        let context: Popup = this;

        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message) {
                if (message.organizationId) {
                    context.renderIframe(parent, message.activeQuery, message.organizationId, message.hostedSearchPage);
                } else {
                    context.renderNotLoggedIn(parent);
                }
            }
        );
    }
}
