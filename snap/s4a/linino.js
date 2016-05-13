// Linino WebSockets protocol

WorldMorph.prototype.ws = new WebSocket("ws://localhost:8080");

WorldMorph.prototype.ws.onopen = function() {
    this.send("Hello Tian!");
};

WorldMorph.prototype.ws.onmessage = function (evt) { 
    var message;
    try {
        message = JSON.parse(evt.data);
    } catch (err) {
        console.log('Unparseable message!\n' + err);
        return;
    }
    message.pin
};

WorldMorph.prototype.send = function (object) {
    this.ws.send(JSON.stringify(object));
}

WorldMorph.prototype.ws.onclose = function () { 
    alert('WebSockets connection dropped!');
};
