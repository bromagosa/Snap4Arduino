Process.prototype.reportAnalogReading = function (pin) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

        if (board.pins[board.analogPins[pin]].mode !== board.MODES.ANALOG) {
            board.pinMode(board.analogPins[pin], board.MODES.ANALOG);
        }

        board.analogRead(pin, function(value) { board.pins[board.analogPins[pin]].value = value });

        // Ugly hack that fixes issue #5
        // "say" block inside a "forever" loop shows only first reading on GNU/Linux and MS-Windows
        // Until we find the source of the problem and a cleaner solution...

        if (!this.context.justRead) {
            this.context.justRead = true;
        } else {
            this.context.justRead = false;
            return board.pins[board.analogPins[pin]].value;
        }

        this.pushContext('doYield');
        this.pushContext();

    } else {
        throw new Error(localize('Arduino not connected'));	
    }
};

Process.prototype.reportDigitalReading = function (pin) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

        if (board.pins[pin].mode !== board.MODES.INPUT) {
            board.pinMode(pin, board.MODES.INPUT);
        }

        board.digitalRead(pin, function(value) { board.pins[pin].value = value });
        return board.pins[pin].value === 1;

    } else {
        throw new Error(localize('Arduino not connected'));		
    }
};

