var path = process.argv.filter(function(any) { return any.substring(2,8) === '/dev/tty' }),
    port = process.argv.filter(function(any) { return Number(any).toString() === any }),
    lininoMode = !port[0] && process.argv.indexOf('--linino') > -1,
    debugMode = !port[0] && process.argv.indexOf('--debug') > -1,
    WebSocketServer = require('ws').Server,
    webSocketServer = new WebSocketServer({ port: port[0] || 8888 }),
    board = {},
    commands = {};

if (lininoMode) {
    require('./ideino-linino-lib/utils/proto.js');
    var linino = require('./ideino-linino-lib');
    board = new linino.Board();
    board.connect(function () {
        board.pins = {};
        board.analogPins = {};
        board.MODES.ANALOG = 'A';
        console.log('MCU ready\nLininoIO mode');
    });
} else {
    var firmata = require('firmata');
    board = new firmata.Board(
            path[0] || '/dev/ttySAMD',
            function() { console.log('MCU ready\nFirmata mode'); });
}

webSocketServer.on('connection', function (ws) {
    console.log('Websocket client connected');
    console.log('Sending board specs to client');
    ws.send(JSON.stringify(board.pin));
    ws.on('message', function (message) {
        if (debugMode) { console.log(message); }
        try {
            commands[message[0]].call(null, message[1], message[2] || ws);
        } catch (err) {
            console.error('Unparseable message:\n' + message);
            console.error(err);
            return;
        }
    });
});

/*
   `commands` is a command containing object.
   Keys are ints because we need to cut bottlenecks everywhere.

   0 → digital write
   1 → analog write
   2 → servo write
   3 → digital read
   4 → analog read
   5 → set pin mode

*/

// digitalWrite
commands[0] = function (pin, booleanValue) {
    if (!board.pins[pin] || board.pins[pin].mode !== board.MODES.OUTPUT) {
        if (debugMode) { console.log('setting pin mode to digital output'); }
        commands[5](pin, board.MODES.OUTPUT);
    }
    board.digitalWrite(
            lininoMode ?
                pin.toString() :
                pin,
            booleanValue === 1 ?
                board.HIGH :
                board.LOW);
};

// analogWrite
commands[1] = function (pin, value) {
    if (!board.pins[pin] || board.pins[pin].mode !== board.MODES.PWM) {
        commands[5](lininoMode ? 'P' + pin : pin, board.MODES.PWM);
        if (debugMode) { console.log('setting pin mode to PWM'); }
    }
    board.analogWrite(lininoMode ? 'P' + pin : pin, value);
};

// servoWrite
commands[2] = function (pin, value) {
    if (!board.pins[pin] || board.pins[pin].mode !== board.MODES.SERVO) {
        if (debugMode) { console.log('setting pin mode to servo'); }
        commands[5](lininoMode ? 'S' + pin : pin, board.MODES.SERVO);
    }

    var numericValue;

    switch (value[0]) {
        case 'clockwise':
            numericValue = 1200;
            break;
        case 'counter-clockwise':
            numericValue = 1700;
            break;
        case 'stopped':
            numericValue = 1500;
            break;
        case 'disconnected':
            commands.digitalWrite(pin, false);
            return null;
        default:
            numericValue = value;
            break;
    }

    board.servoWrite(lininoMode ? 'S' + pin : pin, parseInt(numericValue));
};

// digitalRead
commands[3] = function (pin, ws) {
    if (!board.pins[pin] || board.pins[pin].mode !== board.MODES.INPUT) {
        if (debugMode) { console.log('setting pin mode to digital input'); }
        commands[5](pin, board.MODES.INPUT);
        board.digitalRead(lininoMode ? 'D' + pin : pin, function(value) { 
            console.log('digital change');
            board.pins[pin].value = value === 1;
            ws.send('[' + pin + ',' + board.pins[pin].value + ']');
        });
    } 
};

// analogRead
commands[4] = function (pin, ws) {
    realPin = lininoMode ?
        board.pin.analog[pin.toString()] :
        board.pins[board.analogPins[pin]];

    if (!board.pins[realPin] || board.pins[realPin].mode !== board.MODES.ANALOG) {
        if (debugMode) { console.log('setting pin mode to analog input'); }
        commands[5](realPin, board.MODES.ANALOG);
        board.analogRead(realPin, function(value) { 
            board.pins[realPin].value = value;
        });
    }

    ws.send('["A' + pin + '",' + (board.pins[realPin].value || 0) + ']');
};

// pinMode
commands[5] = function (pin, mode) {
    if (mode !== 'A') {
        board.pinMode(lininoMode ? pin.toString() : pin, mode);
    }

    if (!board.pins[pin]) {
        board.pins[pin] = {};
    }

    board.pins[pin].mode = mode;
};
