// SerialPort wrapper for BluetoothSerial

function SerialPort (port, options) {
    var self = this,
        reading = false;

    function onOpen (info) {
        if (info === 'OK') {
            self.path = port;
            self.emit('open');
        } else {
            console.log('can\'t connect to ', port);
        }
    };

    bluetoothSerial.connect(port, onOpen, function (err) { alert(err); });
};

SerialPort.prototype.on = function (evt, callback) {
    if (evt === 'data') {
        bluetoothSerial.subscribeRawData(
                function (rawData) {
                    callback(new Uint8Array(rawData))
                },
                function () {
                    console.log('Lost some data!');
                }); 
    }
};

SerialPort.prototype.write = function (data) {
    function onWrite (result) {
    }
    bluetoothSerial.write(data, onWrite, function (err) { console.log(err); });
};

SerialPort.prototype.close = function() {
    bluetoothSerial.disconnect();
};

util.inherits(SerialPort, EventEmitter);
