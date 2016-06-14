// Linino WebSockets protocol

WorldMorph.prototype.ws = new WebSocket('ws://arduino.local:8888');

WorldMorph.prototype.ws.binaryType = 'arraybuffer';

WorldMorph.prototype.send = function (array) {
    this.ws.send(new Uint8Array(array).buffer);
};

WorldMorph.prototype.ws.onmessage = function (evt) { 
    try {
        var data = JSON.parse(evt.data);
        world.board.pins[data[0]] = data[1];
    } catch (err) {
        console.log('Unparseable message!\n' + err);
        return;
    }
};

WorldMorph.prototype.ws.onclose = function () { 
    ide.inform('Connection error', 'WebSockets connection dropped!');
};

WorldMorph.prototype.board = { pins: {} };
