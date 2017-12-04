declare let chrome: any;

export class Url {
    public static convertWindowHashToDict() {
        let hashDict = {};
        
        if (window.location.hash) {
            let hashes = window.location.hash.substring(1).split('&');
    
            if (hashes) {
                hashes.map((hash) => {
                    let keyValue = hash.split('=');
                    if (/(\w+?)=(.*)/.test(hash)){
                        hashDict[RegExp.$1] = RegExp.$2;
                    }
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