// In NodeJS we don't have XMLHttpRequests
Process.prototype.reportURL = function (url) {
    var myself = this,
        response;

    if (!this.httpRequest) {
        this.httpRequest = include('http'); 

        this.httpRequest.request(
            'http://' + url,
            function (response) {
                var str = '';
                response.on('data', function (chunk) {
                    str += chunk;
                });
                response.on('end', function () {
                    myself.httpResponse = str;
                    myself.httpRequest = null;
                });
            }
        ).end();
    } else if (this.httpResponse) {
        response = this.httpResponse;
        this.httpResponse = null;
        return response;
    }

    this.pushContext('doYield');
    this.pushContext();
};
