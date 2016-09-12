Arduino.prototype.isBoardReady = function () {
    return ((this.board !== undefined) 
            && (!this.disconnecting));
};

Process.prototype.setPinMode = function (pin, mode) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board, 
            val;

        switch(mode[0]) {
            case 'digital input': val = board.MODES.INPUT; break;
            case 'digital output': val = board.MODES.OUTPUT; break;
            case 'PWM': val = board.MODES.PWM; break;
            case 'servo': val = board.MODES.SERVO; break;
            case 'analog input': val = board.MODES.ANALOG; break;
        }

        if (this.context.pinSet === undefined) {
            board.pinMode(pin.toString(), val);
            board.pins[pin].mode = val;
        }

        if (!board.pins[pin]) {
            board.pins[pin] = {};
        }

        if (board.pins[pin].mode === val) {
            this.context.pinSet = true;
            return null;
        }

        this.pushContext('doYield');
        this.pushContext();
    } else {
        throw new Error(localize('Arduino not connected'));	
    }
};

Process.prototype.servoWrite = function (pin, value) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board,
            numericValue;

        if (!board.pins[pin]) {
            board.pins[pin] = {};
        }

        if (board.pins[pin].mode != board.MODES.SERVO) {
            board.pinMode(pin.toString(), board.MODES.SERVO);
        }

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
                this.digitalWrite(pin.toString(), false);
                return null;
            default:
                numericValue = value;
            break;
        }
        board.servoWrite(pin.toString(), numericValue);
        return null;
    } else {
        throw new Error(localize('Arduino not connected'));			
    }
};

Process.prototype.reportAnalogReading = function (pin) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board; 

        if (board.pins['A' + pin].mode != board.MODES.ANALOG) {
            board.pinMode(board.pin.analog[pin.toString()], board.MODES.ANALOG);
            board.analogRead(
                    board.pin.analog[pin.toString()],
                    function (value) {
                        board.pins['A' + pin].value = value;
                    });
        }

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

        if (!board.pins[pin]) {
            board.pins[pin] = {};
        }

        if (board.pins[pin].mode != board.MODES.INPUT) {
            board.pinMode(pin, board.MODES.INPUT);
            board.digitalRead(pin.toString(), function(value) { board.pins[pin].value = value });
        }
        return board.pins[pin].value == 1;
    } else {
        throw new Error(localize('Arduino not connected'));		
    }
};

Process.prototype.digitalWrite = function (pin, booleanValue) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board,
            val = booleanValue ? board.HIGH : board.LOW;

        if (!board.pins[pin]) {
            board.pins[pin] = {};
        }

        if (board.pins[pin].mode != board.MODES.OUTPUT) {
            board.pinMode(pin.toString(), board.MODES.OUTPUT);
        }

        board.digitalWrite(pin.toString(), val);

        return null;
    } else {
        throw new Error(localize('Arduino not connected'));
    }
};

Process.prototype.pwmWrite = function (pin, value) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

        if (!board.pins[pin]) {
            board.pins[pin] = {};
        }

        if (board.pins[pin].mode != board.MODES.PWM) {
            board.pinMode(pin.toString(), board.MODES.PWM);
        }

        board.analogWrite(pin.toString(), value);
        return null;
    } else {
        throw new Error(localize('Arduino not connected'));
    }
};
