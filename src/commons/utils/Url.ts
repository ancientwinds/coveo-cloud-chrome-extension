declare let chrome: any;

export class Url {
    public static convertWindowHashToDict() {
        let hashDict = {};
        
        if (window.location.hash) {
            let hashes = window.location.hash.substring(1, window.location.hash.length).split('&');
    
            if (hashes) {
                hashes.map((hash) => {
                    let keyValue = hash.split('=');
                    
                    hashDict[keyValue[0]] = keyValue[1];
                });
            }
        }
    
        return hashDict;
    }

    public static  hashParameterToLocalStorage(parameterName: string, storageKey: string, closeWindow: boolean = false) {
        let params = Url.convertWindowHashToDict();
        if (params['access_token']) {
            chrome.storage.local.set(
                {
                    'coveoforgooglecloudsearch_usertoken': params['access_token']
                }, 
                function() {
                    // Add a confirmation?
                }
            );
        }
        window.close();
        
    }

    public static checkIfUrlLocationContains(searchValue: string): boolean {
        return window.location.href.indexOf(searchValue) > -1 ? true : false;
    }
}