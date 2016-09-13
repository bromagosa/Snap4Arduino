var Firmata = require('./firmata.js'),
    Boards = {},
    lastId = 0,
    dispatcher = new Dispatcher(),
    serialPorts;

setInterval(
        function () {
            chrome.serial.getDevices(function (devices) { serialPorts = devices });
        },
        1500
        );

chrome.runtime.onMessageExternal.addListener(
        function(message, sender, sendResponse) {
            sendResponse(dispatcher[message.command].apply(this, (message.args || [])));
        });


// Command dispatcher

function Dispatcher() {};

Dispatcher.prototype.getDevices = function () {
    return serialPorts;
};

Dispatcher.prototype.connectBoard = function (serialPort) {
    var board = new Firmata.Board(
            serialPort,
            function() {
                Boards[lastId] = board;
                lastId ++;
            });
    board.id = lastId;
    return board.id;
};

Dispatcher.prototype.getBoard = function (boardId) {
    return Boards[boardId];
};

Dispatcher.prototype.closeSerial = function (boardId) {
    Boards[boardId].reset();
    Boards[boardId].sp.close();
    Boards[boardId] = null;
};

Dispatcher.prototype.pinMode = function (boardId, pin, mode) {
    Boards[boardId].pinMode(pin, mode);
};

Dispatcher.prototype.digitalWrite = function (boardId, pin, value) {
    Boards[boardId].digitalWrite(pin, value);
};

Dispatcher.prototype.servoWrite = function (boardId, pin, value) {
    Boards[boardId].servoWrite(pin, value);
};

Dispatcher.prototype.analogWrite = function (boardId, pin, value) {
    Boards[boardId].analogWrite(pin, value);
};

Dispatcher.prototype.digitalRead = function (boardId, pin, sendResponse) {
    var board = Boards[boardId];
    board.digitalRead( pin, function (value) { board.pins[pin].value = value });
    return board.pins[pin].value;
};

Dispatcher.prototype.analogRead = function (boardId, pin, sendResponse) {
    var board = Boards[boardId];
    board.analogRead( pin, function (value) { board.pins[board.analogPins[pin]].value = value });
    return board.pins[board.analogPins[pin]].value;
};
