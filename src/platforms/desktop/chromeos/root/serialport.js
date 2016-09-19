/*global chrome*/
var EventEmitter = require('./events.js').EventEmitter;
var util = require('./util.js');

function SerialPort(port, options) {

    var self = this;
    var id;
    var bytesToRead = options.buffersize || 1;
    var reading = false;

    function onOpen (info) {
        console.log('onOpen', info);
        if(info){
            id = self.id = info.connectionId;
            if (id < 0) {
                self.emit("error", new Error("Cannot connect to " + port));
                return;
            }
            self.path = port;
            self.emit("open");
            chrome.serial.onReceive.addListener(function(obj){
                if(id == obj.connectionId){
                    var data = new Uint8Array(obj.data);
                    self.emit("data", data);
                }
            });
        } else {
            console.log('can\'t connect to ', port);
        }

    }

    chrome.serial.connect(port, {
        bitrate: options.baudrate || 9600
    }, onOpen);

}

SerialPort.prototype.write = function (data) {
    function onWrite() {
        // log("onWrite", arguments);
    }

    data = new Uint8Array(data);
    // console.log("OUT", data);
    if(this.id){
        chrome.serial.send(this.id, data.buffer, onWrite);
    }

};

SerialPort.prototype.close = function() {
    chrome.serial.disconnect(this.id, function() {});
}

util.inherits(SerialPort, EventEmitter);

exports.SerialPort = SerialPort;
