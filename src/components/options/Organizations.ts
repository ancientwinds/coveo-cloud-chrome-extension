declare let chrome: any;

import { Configuration } from './Configuration';

export class Organizations {
    public static getOrganizationList(userToken: string, callback: Function): void {
        let url: string = `${Configuration.PLATFORM_URL}/rest/organizations?sortBy=displayName&order=ASC&page=0&perPage=100`;

        let xhttp = new XMLHttpRequest();
        
        xhttp.open('GET', url, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.setRequestHeader('Authorization', 'Bearer ' + userToken);
        xhttp.onreadystatechange = function () {
            callback(JSON.parse(xhttp.response));
        };

        xhttp.send();
    }

    public static getHostedSearchPagesList(userToken: string, organizationId: string, callback: Function): void {
        let url: string = `${Configuration.PLATFORM_URL}/rest/organizations/${organizationId}/pages/?access_token=${userToken}&`;

        let xhttp = new XMLHttpRequest();
        
        xhttp.open('GET', url, true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.setRequestHeader('Authorization', 'Bearer ' + userToken);
        xhttp.onreadystatechange = function () {
            callback(JSON.parse(xhttp.response));
        };

        xhttp.send();
    }
}
