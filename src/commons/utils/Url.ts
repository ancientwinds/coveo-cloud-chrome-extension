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

    public static  getHashParameter(parameterName: string) {
        let params = Url.convertWindowHashToDict();

        return params['access_token'] || null;
    }


    public static checkIfExtensionLocation(fileName: string): boolean {
        console.log('window.location.href = ', window.location.href);

        // chrome-extension://jaaphohanbmgajiikfkdlblhajcjfjna/html/login.html
        let re = new RegExp('chrome-extension://\\w+/html/' + fileName);
        return re.test(window.location.href);
    }

    public static checkIfUrlLocationContains(searchValue: string): boolean {
        return window.location.href.indexOf(searchValue) > -1 ? true : false;
    }
}