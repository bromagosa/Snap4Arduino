// HTTP protocol, based on S4A's

IDE_Morph.prototype.originalInit = IDE_Morph.prototype.init;
IDE_Morph.prototype.init = function(globals) {
    this.originalInit(globals);

    var myself = this;

    if (this.httpServer) { this.httpServer.close() };
    this.httpServer = require('http').createServer(function(request, response) { myself.handleHTTPRequest(request, response) });
    this.httpServer.listen(42001, function() {});
}

IDE_Morph.prototype.handleHTTPRequest = function(request, response) {
    var myself = this;

    response.setHeader('Access-Control-Allow-Origin', '*');

    function parse(message) {

        if (message.length > 0) {

            // If the command came inside a POST body, it needs to be split by spaces,
            // otherwise it came in a GET URL and it needs to be split by "="

            var command = message.indexOf('=') > 0 ? message.split('=') : message.split(' ');

            switch (command[0]) {
                case 'broadcast':
                    var message = command[1],
                        stage = myself.stage,
                        hats = [];

                    if (message.length > 0) {

                        stage.lastMessage = message;

                        stage.children.concat(stage).forEach(function (morph) {
                            if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
                                hats = hats.concat(morph.allHatBlocksFor(message));
                            }
                        });

                        hats.forEach(function (block) {
                            stage.threads.startProcess(
                                    block,
                                    stage.isThreadSafe
                                    )});

                        response.end('broadcast ' + message);

                    } else {
                        response.end('no message provided');
                    }
                    break;

                case 'vars-update':
                    var varName = command[1],
                        value = command[2],
                        stage = myself.stage;

                    stage.globalVariables().setVar(varName, value, stage);
                    response.end('updating variable ' + command[1] + ' to value ' + command[2]);
                    break;

                case 'send-messages':
                    var contents = 'broadcast',
                        stage = myself.stage;

                    stage.children.concat(stage).forEach(function(morph) {
                        if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
                            morph.allMessageNames().forEach(function(message) {
                                contents += ' "' + message + '"';
                            });
                        }
                    });

                    response.end(contents);
                    break;

                case 'send-vars':
                    var contents = 'sensor-update',
                        stage = myself.stage;

                    Object.keys(stage.globalVariables().vars).forEach(function(varName) {
                        contents += ' "' + varName + '" ' + stage.globalVariables().vars[varName].value;
                    });

                    response.end(contents);
                    break;
            }
        }
    }

    if (request.method === 'POST') {

        var body = '';

        request.addListener('data', function(chunk) {
            body += chunk;
        });

        request.addListener('end', function(chunk){
            if (chunk) { 
                body += chunk;
            }
            parse(body);
        });

    } else if (request.method === 'GET') {
        parse(request.url.slice(1));
    }

    response.end('Unknown command');
}

