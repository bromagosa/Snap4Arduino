Process.prototype.reportAnalogReading = function (pin) {
    var sprite = this.blockReceiver();

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board; 

        if (board.pins[board.analogPins[pin]].mode != board.MODES.ANALOG) {
            board.pinMode(board.analogPins[pin], board.MODES.ANALOG);
            board.pins[board.analogPins[pin]].report = -1;
        } else {
            if (board.pins[board.analogPins[pin]].report == -1) {
                board.pins[board.analogPins[pin]].report = 1;
            } else if (board.pins[board.analogPins[pin]].report == 1) {
                board.pins[board.analogPins[pin]].report = 0;
                board.getAnalogPinValue(board.analogPins[pin]);
            } else if (board.pins[board.analogPins[pin]].report == 2) {
                board.pins[board.analogPins[pin]].report = 1;
                return board.pins[board.analogPins[pin]].value;
            }
        }

        this.pushContext('doYield');
        this.pushContext();
    } else {
        throw new Error(localize('Arduino not connected'));	
    }
};

Process.prototype.reportDigitalReading = function (pin) {
    var sprite = this.blockReceiver(),
        check;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board; 

        if (board.pins[pin].mode != board.MODES.INPUT) {
            board.pinMode(pin, board.MODES.INPUT);
            board.pins[pin].report = -1;
        } else {
            if (board.pins[pin].report == -1) {
                board.reportDigitalPin(pin, 1);
                board.pins[pin].report = 1;
            }else if (board.pins[pin].report == 1) {
                board.pins[pin].report = 0;
                board.getDigitalPinValue(pin);
            } else if (board.pins[pin].report == 2) {
                board.pins[pin].report = 1;
                return board.pins[pin].value == 1;
            }
        }

        this.pushContext('doYield');
        this.pushContext();
    } else {
        throw new Error(localize('Arduino not connected'));		
    }
};

