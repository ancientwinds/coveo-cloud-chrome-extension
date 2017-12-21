declare let chrome: any;

import { PlatformUrls } from './PlatformUrls';

export class Organizations {
    public static getOrganizationList(userToken: string, environment: string, callback: Function): void {
        let url: string = `${PlatformUrls.getPlatformUrl(environment)}/rest/organizations?sortBy=displayName&order=ASC&page=0&perPage=100`;

        let xhttp = new XMLHttpRequest();
        
        xhttp.open('GET', url, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.setRequestHeader('Authorization', 'Bearer ' + userToken);
        xhttp.onload = function () {
            callback(JSON.parse(xhttp.response));
        };

        xhttp.send();
    }
}
