declare const chrome: any;

/*
* Remove the frame option from the Coveo hosted search pages.
* This allows us to embed the login page in the chrome option page.
*/
chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ 'https://search.cloud.coveo.com/pages/coveolabspublic/CoveoForGoogleCloudSearchLogin*' ],
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);