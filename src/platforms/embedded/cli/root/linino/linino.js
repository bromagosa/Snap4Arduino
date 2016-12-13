// Linino WebSockets protocol

WorldMorph.prototype.initWebsockets = function () {
    var myself = this;

    this.ws = new WebSocket('ws://' + window.location.hostname + ':8888');

    this.ws.binaryType = 'arraybuffer';

    this.ws.onmessage = function (evt) { 
        if (!WorldMorph.prototype.board) {
            WorldMorph.prototype.initBoard(JSON.parse(evt.data));
        } else {
            try {
                var data = JSON.parse(evt.data);
                world.board.pins[data[0]].value = data[1];
            } catch (err) {
                console.error('Unparseable message!\n' + evt.data + '\n' + err);
                return;
            }
        }
    };

    this.ws.onclose = function () { 
        ide.confirm(
                'WebSockets connection dropped!\nDo you wish to try to reconnect?',
                'Connection error',
                function () { 
                    myself.ws.onclose = nop;
                    myself.initWebsockets(); 
                }
                );
    };

};

WorldMorph.prototype.send = function (array) {
    this.ws.send(new Uint8Array(array).buffer);
};

WorldMorph.prototype.initBoard = function (pinConfig) {
    var myself = this;

    this.board = { 
        pins: [ 
            { supportedModes: [] },
            { supportedModes: [] }
        ]
    };

    Object.keys(pinConfig.digital).forEach(
            function (each) {
                if (each === Number(each).toString()) {
                    myself.board.pins[Number(each)] = { supportedModes: ['digital'] };
                }
            });

    myself.board.analogPins = Object.keys(pinConfig.analog).filter(
            function (pinName) {
                myself.board.pins['A' + Number(pinName)] = { supportedModes: ['analog'] };
                return pinName === Number(pinName).toString();
            });

    ['servo', 'pwm'].forEach(function (modeName) {
        Object.keys(pinConfig[modeName]).forEach(
                function (each) {
                    if (each === Number(each).toString()) {
                        myself.board.pins[Number(each)].supportedModes.push(modeName);
                    }
                });
    });
};

WorldMorph.prototype.originalInit = WorldMorph.prototype.init;
WorldMorph.prototype.init = function (aCanvas, fillPage) {
    this.originalInit(aCanvas, fillPage);
    this.initWebsockets();
};

Arduino = nop;
