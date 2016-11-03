var SnapListener,
    portArgument = process.argv.filter(function (any) { return Number(any).toString() === any.toString(); });

function SnapListener (port) {
    this.init(port);
};

SnapListener.prototype.init = function (port) {
    var myself = this;
    
    this.httpServer = require('http').createServer(
            function(request, response) {
                myself.handleHTTPRequest(request, response);
            });
    this.httpServer.setTimeout(500);

    this.listening = false;

    if (port) {
        this.listen(port);
    }
};

SnapListener.prototype.listen = function (port) {
    var myself = this;

    this.httpServer.listen(
            port, 
            function() {
                myself.listening = true;
                console.log('Listening for Snap! projects at ' + port);
            });
};

SnapListener.prototype.shutdown = function () {
    var myself = this;

    console.log('Shutting down listener...');
    this.httpServer.close(
            function () {
                myself.listening = false;
                console.log('No longer istening for Snap! projects.');
            });
};

SnapListener.prototype.handleHTTPRequest = function (request, response) {
    var myself = this;

    if (!this.listening) { return; };

    response.setHeader('Access-Control-Allow-Origin', '*');

    if (request.method === 'POST') {

        var body = '';

        request.addListener('data', function (chunk) {
            body += chunk;
        });

        request.addListener('end', function (chunk) {
            if (chunk) {
                body += chunk;
            }
            myself.saveFile(body, response);
        });

    }
};

SnapListener.prototype.saveFile = function (contents, response) {
    try {
        require('fs').writeFile(process.env['HOME'] + '/autorun.xml', contents, function (err) {
            response.statusCode = err ? 500 : 200;
            response.end(err || 'Project received by the board.');
        });
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.end(err);
    }
};

listener = new SnapListener(portArgument.length > 0 ? portArgument[0] : 8080);
