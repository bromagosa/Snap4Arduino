// Snap4Arduino extensions (s4a_):
SnapExtensions.primitives.set(
    's4a_i2cwrite(address, bytes, reg)',
    function (address, bytes, reg) {
        var board = this.arduino.board;
        if (!board.i2cEnabled) {
            board.i2cConfig();
            board.i2cEnabled = true;
        }
        board.i2cWrite(address, reg, bytes.asArray());
    }
);
SnapExtensions.primitives.set(
    's4a_i2csend(address, bytes)',
    function (address, bytes) {
        var board = this.arduino.board;
        if (!board.i2cEnabled) {
            board.i2cConfig();
            board.i2cEnabled = true;
        }
        board.i2cWrite(address, bytes.asArray());
    }
);
SnapExtensions.primitives.set(
    's4a_i2cread1(address, reg)',
    function (address, reg) {
        var board= this.arduino.board;
        board['i2cResponse-' + Number(address)] = null;
        if (!board.i2cEnabled) {
            board.i2cConfig();
            board.i2cEnabled = true;
        }
        board.i2cReadOnce(
            Number(address),
            Number(reg),
            function (response) {
                board['i2cResponse-' + Number(address)] = response;
            });
    }
);
SnapExtensions.primitives.set(
    's4a_i2cread2(address)',
    function (address) {
        var board = this.arduino.board;
        board.checkArduinoBoardParam('i2cResponse-' + Number(address));
        return board['i2cResponse-' + Number(address)] !== null;
    }
);
SnapExtensions.primitives.set(
    's4a_i2cread3(address)',
    function (address) {
        var board = this.arduino.board;
        board.getArduinoBoardParam('i2cResponse-' + Number(address));
        return new List(board['i2cResponse-' + Number(address)]);
    }
);
SnapExtensions.primitives.set(
    's4a_tone(pin, freq, dur)',
    function (pin, freq, dur) {
        if (this.arduino.board.pins[5].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_tone or SA5Firmata_ir firmware");
        }
        var board = this.arduino.board;
        if (pin === undefined || freq === undefined || pin <= 1 || pin > 255 || freq < 0 || freq > 65535) {
            throw new Error("Required var pin (2-255) and frequency (0-65535)");
        }
        var dur = dur || 0;
        dur = dur & 0xFFFF; //clamping value to 32 bits
        var data =[0xF0, //START_SYSEX
      	    0xC7,  //Tone Command
      	    (dur >> 25) & 0x7F,
      	    (dur >> 18) & 0x7F,
      	    (dur >> 11) & 0x7F,
      	    (dur >> 4) & 0x7F,
      	    ((dur << 3) & parseInt("01111000",2)) | ((freq >> 13) & parseInt("0111",2)),
      	    (freq >> 6) & 0x7F,
      	    ((freq << 1) & parseInt("01111110",2)) | ((pin >> 7) & parseInt("01",2)),
            pin & 0x7F,
      	    0xF7  //END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_pulseOut(pin, stValue, time1, time2, time3)',
    function (pin, stValue, time1, time2, time3) {
        if (this.arduino.board.pins[5].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_tone or SA5Firmata_ir firmware");
        }
        var board = this.arduino.board,
            value = 1;
        if (stValue == "LOW") {value = 0;} //only explicit LOW causes a low pulse 
        if (pin === undefined || pin <= 1 || pin > 255) {
            throw new Error("Required var pin (2-255)");
        }
        //undefined time will be 0 seconds
        var time1 = time1 || 0,
            time2 = time2 || 0,
            time3 = time3 || 0;
        //clamping time values to 11 bits
        time1 = time1 & parseInt("011111111111",2);
        time2 = time2 & parseInt("011111111111",2);
        time3 = time3 & parseInt("011111111111",2);
        var data = [0xF0, //START_SYSEX
            0xC9,  //microsecondsPulseOut Command
            (time1 >> 4) & 0x7F,
            ((time1 << 3) & parseInt("01111000",2)) | ((time2 >> 8) & parseInt("0111",2)),
            (time2 >> 1) & 0x7F,
            ((time2 << 6) & parseInt("01000000",2)) | ((time3 >> 5) & parseInt("0111111",2)),
            ((time3 << 2) & parseInt("01111100",2)) | ((value << 1) & parseInt("010",2)) |           ((pin >> 7) & parseInt("01",2)),
            (pin & 0x7F), 
            0xF7  //END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_pulseIn1(pin, stValue, timeout)',
    function (pin, stValue, timeout) {
        if (this.arduino.board.pins[5].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_tone or SA5Firmata_ir firmware");
        }
        var board = this.arduino.board;
        if (!(typeof world.Arduino.firmata.SYSEX_RESPONSE === 'undefined') && typeof world.Arduino.firmata.SYSEX_RESPONSE[0xC8] === 'undefined') {
            world.Arduino.firmata.SYSEX_RESPONSE[0xC8] = function(board) {
                var pulse = (board.currentBuffer[2] & 0x7F) << 25| (board.currentBuffer[3] & 0x7F) << 18 | (board.currentBuffer[4] & 0x7F) << 11 | (board.currentBuffer[5] & 0x7F) << 4 | (board.currentBuffer[6] & 0x7F) >> 3;
                var pinResp = (board.currentBuffer[6] & parseInt("0111",2)) << 5 | (board.currentBuffer[7] & parseInt("011111",2));
                board.emit("pulseIn-"+pinResp, pulse);
            };
        }
        board["pulseIn-"+pin] = null;
        if (stValue == "LOW") {value = 0;} //only explicit LOW return a low pulse 
        if (pin === undefined || pin <= 1 || pin > 255) {
            throw new Error("Required var pin (2-255)");
        }
        var timeout = timeout || 0; //undefined will be 0, and 0 causes Arduino's default (1s)
        timeout = timeout & 0xFFFFFFFF; //clamping value to 32 bits
        board.once("pulseIn-"+pin, function(data){board["pulseIn-"+pin] = data;});
        var data =[0xF0, //START_SYSEX
            0xC8,  //PulseIn Command
            (timeout >> 25) & 0x7F,
            (timeout >> 18) & 0x7F,
            (timeout >> 11) & 0x7F,
            (timeout >> 4) & 0x7F,
            ((timeout << 3) & parseInt("01111000",2)) | ((value << 2) & parseInt("0100",2)) | ((pin >> 6) & parseInt("011",2)),
            (pin & parseInt("0111111",2)),
            0xF7  //END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_pulseIn2(pin)',
    function (pin) {
        var board = this.arduino.board;
        board.checkArduinoBoardParam("pulseIn-"+pin);
        return (board["pulseIn-"+pin] != null);
    }
);
SnapExtensions.primitives.set(
    's4a_pulseIn3(pin)',
    function (pin) {
        var board = this.arduino.board;
        board.getArduinoBoardParam("pulseIn-"+pin);
        return board["pulseIn-"+pin];
    }
);
SnapExtensions.primitives.set(
    's4a_ping1(pinRec, pinSen, time1, time2)',
    function (pinRec, pinSen, time1, time2) {
        if (this.arduino.board.pins[5].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_tone or SA5Firmata_ir firmware");
        }
        var board = this.arduino.board;
        if (!(typeof world.Arduino.firmata.SYSEX_RESPONSE === 'undefined') && typeof world.Arduino.firmata.SYSEX_RESPONSE[0xCA] === 'undefined') {
            world.Arduino.firmata.SYSEX_RESPONSE[0xCA] = function(board) {
                var pulse = (board.currentBuffer[2] & 0x7F) << 9| (board.currentBuffer[3] & 0x7F) << 2 | (board.currentBuffer[4] & parseInt("01100000",2)) >> 5;
                var pinResponse = (board.currentBuffer[4] & parseInt("011111",2)) << 3 | (board.currentBuffer[5] & parseInt("0111",2));
                board.emit("ping-"+pinResponse, pulse);
            };
        }
        board["ping-"+pinRec] = null;
        if (pinSen === undefined || pinSen <= 1 || pinSen > 255 || pinRec === undefined || pinRec <= 1 || pinRec > 255) {
            throw new Error("Required vars pinSen and pinRec (2-255)");
        }
        board.once("ping-"+pinRec, function(data){board["ping-"+pinRec] = data;});
        var data =[0xF0, //START_SYSEX
            0xCA,  //Ping Command
            (pinSen >> 1) & 0x7F,
            (pinSen << 6) | (time1 & parseInt("011111",2)),
            (pinRec >> 1) & 0x7F,
            (pinRec << 6) | (time2 & parseInt("011111",2)),
            0xF7  //END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_ping2(pinRec)',
    function (pinRec) {
        var board = this.arduino.board;
        board.checkArduinoBoardParam("ping-"+pinRec);
        return (board["ping-"+pinRec] != null);
    }
);
SnapExtensions.primitives.set(
    's4a_ping3(pinRec)',
    function (pinRec) {
        var board = this.arduino.board,
            value = Math.round(board["ping-"+pinRec]/29.15/2);
        board.getArduinoBoardParam("ping-"+pinRec);
        if (value == 0) return 1000;
        return value;
    }
);
SnapExtensions.primitives.set(
    's4a_nunchuk1(command)',
    function (command) {
        var board = this.arduino.board,
            cCode = 0xC0;
        if (this.arduino.board.pins[5].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_tone or SA5Firmata_ir firmware");
        }
        // default command is joyX with value 0xC0
        if (command == "joyY") cCode = 0xC1;
        if (command == "butZ") cCode = 0xC2;
        if (command == "butC") cCode = 0xC3;
        if (command == "accX") cCode = 0xC4;
        if (command == "accY") cCode = 0xC5;
        if (command == "accZ") cCode = 0xC6;
        if (!(typeof world.Arduino.firmata.SYSEX_RESPONSE === 'undefined') && typeof world.Arduino.firmata.SYSEX_RESPONSE[cCode] === 'undefined') {
            world.Arduino.firmata.SYSEX_RESPONSE[cCode] = function(board) {
                if (command == "butZ" || command == "butC") {
                    var value = (board.currentBuffer[2] & 0x7F);
                } else {
                    var value = (board.currentBuffer[2] & 0x7F) | ((board.currentBuffer[3] & 0x7F) << 7);
                }
 	            board.emit(command, value);
            };
        }
        board[command] = null;
        board.once(command, function(data){board[command] = data;});
        var sdata =[0xF0,//START_SYSEX,
            cCode,//nunchuk command
            0xF7//END_SYSEX
        ];
        board.transport.write(new Buffer(sdata));
    }
);
SnapExtensions.primitives.set(
    's4a_nunchuk2(command)',
    function (command) {
        var board = this.arduino.board;
        board.checkArduinoBoardParam(command);
        return (board[command] != null);
    }
);
SnapExtensions.primitives.set(
    's4a_nunchuk3(command)',
    function (command) {
        var board = this.arduino.board;
        board.getArduinoBoardParam(command);
        return board[command];
    }
);
SnapExtensions.primitives.set(
    's4a_dht111(pin, param)',
    function (pin, param) {
        var board = this.arduino.board,
            sparam = 0;
        if (param == "temperature") sparam = 1;
        if (this.arduino.board.pins[5].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_tone or SA5Firmata_ir firmware");
        }
        if (!(typeof world.Arduino.firmata.SYSEX_RESPONSE === 'undefined') && typeof world.Arduino.firmata.SYSEX_RESPONSE[0xCF] === 'undefined') {
            world.Arduino.firmata.SYSEX_RESPONSE[0xCF] = function(board) {
              	 var response = (board.currentBuffer[2] & 0x7F) << 1 | (board.currentBuffer[3] & 0x01);
       	         var rpin = board.currentBuffer[4] >> 1;
      	         var rparam = board.currentBuffer[4] & parseInt("01",2);
      	         board.emit("DHT11-"+rpin+"-"+rparam, response);
             };
        }
        board["DHT11-"+pin+"-"+sparam] = null;
        if (pin === undefined || pin <= 1 || pin > 63) {
            throw new Error("Required var pin (2-63)");
        }
        board.once("DHT11-"+pin+"-"+sparam, function(data){board["DHT11-"+pin+"-"+sparam] = data;});
        var data =[0xF0, //START_SYSEX
            0xCF,  //DHT11 Command
            ((pin << 1) |  sparam) & 0x7F,
            0xF7  //END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_dht112(pin, param)',
    function (pin, param) {
        var board = this.arduino.board,
            sparam = 0;
        if (param == "temperature") sparam = 1;
        board.checkArduinoBoardParam("DHT11-"+pin+"-"+sparam);
        return (board["DHT11-"+pin+"-"+sparam] != null);
    }
);
SnapExtensions.primitives.set(
    's4a_dht113(pin, param)',
    function (pin, param) {
        var board = this.arduino.board,
            sparam = 0;
        if (param == "temperature") sparam = 1;
        board.getArduinoBoardParam("DHT11-"+pin+"-"+sparam);
        if (board["DHT11-"+pin+"-"+sparam] == 255) {
            return;
        } else {
            return board["DHT11-"+pin+"-"+sparam];
        }
    }
);
SnapExtensions.primitives.set(
    's4a_irsend(message, coder)',
    function (message, coder) {
        if (this.arduino.board.pins[6].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_ir firmware");
        }
        var board = this.arduino.board;  //Definition should change according to the context
        if (message === undefined || coder === undefined) {
            throw new Error("Message and coder are required");
        }
        var smessage = parseInt(message,16);
        smessage = smessage & parseInt("FFFFFF",16);
        if (coder == "RC5") {
            scoder = 1;
        } else {
            scoder = 0;
        }
        var data =[0xF0, //START_SYSEX
            0xCE,  //Send IR
            (smessage >> 17) & 0x7F,
            (smessage >> 10) & 0x7F,
            (smessage >> 3) & 0x7F,
            ((smessage << 4) & parseInt("01110000",2)) | (scoder & parseInt("01111",2)),
            0xF7  //END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_irenable(ac)',
    function (ac) {
        if (this.arduino.board.pins[6].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_ir firmware");
        }
        var board = this.arduino.board,
            dat;
        if (ac == "Enable") {
            dat = 0xCC;
        } else {
            dat = 0xCD;
        }
        var data =[0xF0,//START_SYSEX
            dat,//IR act/desact command
            0xF7//END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_irread1()',
    function () {
        var board = this.arduino.board,
            value =1;
        if (this.arduino.board.pins[6].supportedModes.indexOf(0x05) === -1) {
            throw new Error("This block needs a device running SA5Firmata_ir firmware");
        }
        if (!(typeof world.Arduino.firmata.SYSEX_RESPONSE === 'undefined') && typeof world.Arduino.firmata.SYSEX_RESPONSE[0xCB] === 'undefined') {
            world.Arduino.firmata.SYSEX_RESPONSE[0xCB] = function(board) {
                var irResult = (board.currentBuffer[2] & 0x7F) << 25| (board.currentBuffer[3] & 0x7F) << 18 | (board.currentBuffer[4] & 0x7F) << 11 | (board.currentBuffer[5] & 0x7F) << 4 | (board.currentBuffer[6] & 0x7F) >> 3;
                irResult = irResult & 0xFFFFFF;
                board.emit("IRrec", irResult);
            };
        }
        board["IRrec"] = null;
        board.once("IRrec", function(data){board["IRrec"] = data;});
        var data =[0xF0,//START_SYSEX
            0xCB,//IR recv command
            0xF7//END_SYSEX
        ];
        board.transport.write(new Buffer(data));
    }
);
SnapExtensions.primitives.set(
    's4a_irread2()',
    function () {
        var board = this.arduino.board;
        board.checkArduinoBoardParam("IRrec");
        return (board["IRrec"] != null);
    }
);
SnapExtensions.primitives.set(
    's4a_irread3()',
    function () {
        var board = this.arduino.board;
        board.getArduinoBoardParam("IRrec")
        return board["IRrec"].toString(16);
    }
);
