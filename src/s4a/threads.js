Process.prototype.connectArduino = function (port) {
    var sprite = this.homeContext.receiver;

    if (!sprite.arduino.connecting) {
        sprite.arduino.connecting = true;
        if (sprite.arduino.board === undefined) {
            if (port.indexOf('tcp://') === 0) {
                sprite.arduino.connectNetwork(port.slice(6));
            } else {
                // Second parameter tells `connect` to verify port before connecting
                // Since one can enter arbitrary text in this block, it is important
                // to do so!
                sprite.arduino.connect(port, true);
            }
        }
    }

    if (sprite.arduino.justConnected) {
        sprite.arduino.justConnected = undefined;
        return;
    }

    if (sprite.arduino.board && sprite.arduino.board.connected) {
        return;
    }

    this.pushContext('doYield');
    this.pushContext();
};

Process.prototype.disconnectArduino = function (port) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.board && sprite.arduino.board.connected) {
        sprite.arduino.disconnect(true); // silent
    }
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
            if (board.pins[pin].supportedModes.indexOf(val) > -1) {	
                board.pinMode(pin, val);
            } else { 
                return null;
            }
        }

        if (board.pins[pin].mode === val) {
            this.context.pinSet = true;
            return null;
        }

        this.pushContext('doYield');
        this.pushContext();
    } else {
        throw new Error(localize('RIO not connected'));	
    }
};

Process.prototype.servoWrite = function (pin, value) {
    var sprite = this.homeContext.receiver;

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board,
            numericValue;

        if (value[0] == 'disconnected') {
            if (board.pins[pin].mode != board.MODES.OUTPUT) {
                board.pinMode(pin, board.MODES.OUTPUT);
            }
            return null;
        }

        if (board.pins[pin].mode != board.MODES.SERVO) {
            board.pinMode(pin, board.MODES.SERVO);
            board.servoConfig(pin, 600, 2400);
        }

        switch (value[0]) {
            case 'clockwise':
                numericValue = 1200;
                break;
            case 'counter-clockwise':
                numericValue = 1800;
                break;
            case 'stopped':
                numericValue = 1500;
                break;
            default:
                numericValue = value;
        }
        board.servoWrite(pin, numericValue);
        return null;
    } else {
        throw new Error(localize('Arduino not connected'));			
    }

    this.isAtomic = true;

    this.pushContext();
};

Process.prototype.servodis = function (pin) {
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board,
            numericValue;

        
            if (board.pins[pinValue].mode != board.MODES.OUTPUT) {
                board.pinMode(pinValue, board.MODES.OUTPUT);
            
            return null;
       
    } else {
        			
    }}

    this.isAtomic = true;

    this.pushContext();
};


Process.prototype.qservo = function (pin, min, max, value) {
    var sprite = this.homeContext.receiver;
    var i,j,k;    
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board,
            numericValue;

        if (board.pins[pinValue].mode != board.MODES.SERVO) {
            board.pinMode(pinValue, board.MODES.SERVO);
            board.servoConfig(pinValue, 600, 2400);
        }
     
     if(min<=max)
      { 
        numericValue = max - min;

        for(i=numericValue;i>0;i--)
            {
              board.servoWrite(pinValue, min);
              ++min;
              k = value * 100000;
              for(j=0; j<k; j++) {}
            }
       
     } 
 
     if(max<min)
      { 
        numericValue = min - max;
       
          for(i=numericValue;i>0;i--)
            {
              board.servoWrite(pinValue, min);
              --min;
              k = value * 100000;
              for(j=0; j<k; j++) {}
            }
       
     } 

    return null;
   } 

    else {
           throw new Error(localize('RIO not connected'));			
         }

    this.isAtomic = true;

    this.pushContext();
};


Process.prototype.reportAnalogReading = function (pin) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board; 

        if (board.pins[board.analogPins[pin]].mode != board.MODES.ANALOG) {
            board.pinMode(board.analogPins[pin], board.MODES.ANALOG);
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

        if (board.pins[pin].mode != board.MODES.INPUT) {
            board.pinMode(pin, board.MODES.INPUT);
            board.digitalRead(pin, function(value) { board.pins[pin].value = value });
        }
        return board.pins[pin].value == 1;
    } else {
        throw new Error(localize('Arduino not connected'));		
    }
};
Process.prototype.reportInfrared = function (pin) {
    
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

             if (board.pins[pinValue].mode != board.MODES.INPUT) {
            board.pinMode(pinValue, board.MODES.INPUT);
            board.digitalRead(pinValue, function(value) { board.pins[pinValue].value = value });
        }
        return board.pins[pinValue].value == 1;
    } else {
        throw new Error(localize('RIO not connected'));		
    }
};
Process.prototype.reportqanalog = function (pin) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board; 
        var pinValue;
        switch (pin[0]) {
            case '1':
                pinValue = 0;
                break;
            case '2':
                pinValue = 1;
                break;
            case '3':
                pinValue = 2;
                break;
            case '4':
                pinValue = 3;
                break;
            }

        if (board.pins[board.analogPins[pinValue]].mode != board.MODES.ANALOG) {
            board.pinMode(board.analogPins[pinValue], board.MODES.ANALOG);
        }

        // Ugly hack that fixes issue #5
        // "say" block inside a "forever" loop shows only first reading on GNU/Linux and MS-Windows
        // Until we find the source of the problem and a cleaner solution...

        if (!this.context.justRead) {
            this.context.justRead = true;
        } else {
            this.context.justRead = false;
            return board.pins[board.analogPins[pinValue]].value;
        }

        this.pushContext('doYield');
        this.pushContext();

    } else {
        throw new Error(localize('RIO not connected'));	
    }
};
Process.prototype.reportLDR = function (pin) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {

        var board = sprite.arduino.board; 
        var pinValue;
        switch (pin[0]) {
            case '1':
                pinValue = 0;
                break;
            case '2':
                pinValue = 1;
                break;
            case '3':
                pinValue = 2;
                break;
            case '4':
                pinValue = 3;
                break;
            }

        if (board.pins[board.analogPins[pinValue]].mode != board.MODES.ANALOG) {
            board.pinMode(board.analogPins[pinValue], board.MODES.ANALOG);
        }

        // Ugly hack that fixes issue #5
        // "say" block inside a "forever" loop shows only first reading on GNU/Linux and MS-Windows
        // Until we find the source of the problem and a cleaner solution...

        if (!this.context.justRead) {
            this.context.justRead = true;
        } else {
            this.context.justRead = false;
            return board.pins[board.analogPins[pinValue]].value;
        }

        this.pushContext('doYield');
        this.pushContext();

    } else {
        throw new Error(localize('RIO not connected'));	
    }
};

Process.prototype.reportPIR = function (pin) {
    
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

             if (board.pins[pinValue].mode != board.MODES.INPUT) {
            board.pinMode(pinValue, board.MODES.INPUT);
            board.digitalRead(pinValue, function(value) { board.pins[pinValue].value = value });
        }
        return board.pins[pinValue].value == 1;
    } else {
        throw new Error(localize('RIO not connected'));		
    }
};
Process.prototype.reportLimitSwitch = function (pin) {
    
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

             if (board.pins[pinValue].mode != board.MODES.INPUT) {
            board.pinMode(pinValue, board.MODES.INPUT);
            board.digitalRead(pinValue, function(value) { board.pins[pinValue].value = value });
        }
        return board.pins[pinValue].value == 1;
    } else {
        throw new Error(localize('RIO not connected'));		
    }
};

Process.prototype.reportqdigital = function (pin) {
    
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

             if (board.pins[pinValue].mode != board.MODES.INPUT) {
            board.pinMode(pinValue, board.MODES.INPUT);
            board.digitalRead(pinValue, function(value) { board.pins[pinValue].value = value });
        }
        return board.pins[pinValue].value == 1;
    } else {
        throw new Error(localize('RIO not connected'));		
    }
};


Process.prototype.digitalWrite = function (pin, booleanValue) {
    var sprite = this.homeContext.receiver;
    
    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board,
            val = booleanValue ? board.HIGH : board.LOW;

        if (board.pins[pin].mode != board.MODES.OUTPUT) {
            board.pinMode(pin, board.MODES.OUTPUT);
        }
        board.digitalWrite(pin, val);
    } else {
        throw new Error(localize('Arduino not connected'));
    }

    this.isAtomic = true;

    this.pushContext();
};

Process.prototype.setDigital = function (pin, booleanValue) {
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board,
            val = booleanValue ? board.HIGH : board.LOW;

        if (board.pins[pinValue].mode != board.MODES.OUTPUT) {
            board.pinMode(pinValue, board.MODES.OUTPUT);
        }
        board.digitalWrite(pinValue, val);
    } else {
        throw new Error(localize('RIO not connected'));
    }

    this.isAtomic = true;

    this.pushContext();
};

Process.prototype.motor = function (pin, booleanValue, value) {
    var sprite = this.homeContext.receiver;
    var qpin;

    if(pin =="M1")
     {
        pin = 4;
        qpin = 5;
     }

    if(pin =="M2")
     {
        pin = 7;
        qpin = 6;
     }
    

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board,
            val = booleanValue ? board.HIGH : board.LOW;

        if (board.pins[pin].mode != board.MODES.OUTPUT) {
            board.pinMode(pin, board.MODES.OUTPUT);
         }
        if (board.pins[qpin].mode != board.MODES.PWM) {
            board.pinMode(qpin, board.MODES.PWM);
        }

        
        board.digitalWrite(pin, val);
        board.analogWrite(qpin, value);
        
       
    } else {
        throw new Error(localize('Arduino not connected'));
    }

    this.isAtomic = true;

    this.pushContext();
};

Process.prototype.setLed = function (pin, booleanValue) {
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board,
            val = booleanValue ? board.HIGH : board.LOW;

        if (board.pins[pinValue].mode != board.MODES.OUTPUT) {
            board.pinMode(pinValue, board.MODES.OUTPUT);
        }
        board.digitalWrite(pinValue, val);
    } else {
        throw new Error(localize('RIO not connected'));
    }

    this.isAtomic = true;

    this.pushContext();
};
Process.prototype.swapmotor = function (pin, booleanValue) {
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            case '5':
                pinValue = 2;
                break;
            case '6':
                pinValue = 8;
                break;
            }

    this.popContext();
    sprite.startWarp();
    this.pushContext('doYield');

    if (!this.isAtomic) {
        this.pushContext('doStopWarping');
    }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board,
            val = booleanValue ? board.HIGH : board.LOW;

        if (board.pins[pinValue].mode != board.MODES.OUTPUT) {
            board.pinMode(pinValue, board.MODES.OUTPUT);
        }
        board.digitalWrite(pinValue, val);
    } else {
        throw new Error(localize('RIO not connected'));
    }

    this.isAtomic = true;

    this.pushContext();
};

Process.prototype.pwmWrite = function (pin, value) {
    var sprite = this.homeContext.receiver;

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

        if (board.pins[pin].mode != board.MODES.PWM) {
            board.pinMode(pin, board.MODES.PWM);
        }

        board.analogWrite(pin, value);
        return null;
    } else {
        throw new Error(localize('Arduino not connected'));
    }
};
Process.prototype.SetPWM = function (pin, value) {
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

        if (board.pins[pinValue].mode != board.MODES.PWM) {
            board.pinMode(pinValue, board.MODES.PWM);
        }

        board.analogWrite(pinValue, value);
        return null;
    } else {
        throw new Error(localize('RIO not connected'));
    }
};
Process.prototype.Buzzer = function (pin, value) {
    var sprite = this.homeContext.receiver;
    var pinValue;
    switch (pin[0]) {
            case '1':
                pinValue = 3;
                break;
            case '2':
                pinValue = 9;
                break;
            case '3':
                pinValue = 10;
                break;
            case '4':
                pinValue = 11;
                break;
            }

    if (sprite.arduino.isBoardReady()) {
        var board = sprite.arduino.board; 

        if (board.pins[pinValue].mode != board.MODES.PWM) {
            board.pinMode(pinValue, board.MODES.PWM);
        }

        board.analogWrite(pinValue, value);
        return null;
    } else {
        throw new Error(localize('RIO not connected'));
    }
};

