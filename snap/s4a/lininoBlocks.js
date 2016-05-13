function pinsSettableToMode(aMode) {
    // Retrieve a list of pins that support a particular mode
    var sprite = world.children[0].currentSprite,
        board = sprite.arduino.board;

    var pinNumbers = {};
    var pins = board.pins;
    pins.forEach(
        function(each){ 
            if (each.supportedModes.indexOf(aMode) > -1) { 
                var number = pins.indexOf(each).toString(); 
                pinNumbers[number] = number;
            }
        }
    );
    return pinNumbers;
}


// labelPart() proxy

SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;

SyntaxElementMorph.prototype.labelPart = function(spec) {
    var part;
    switch (spec) {
        case '%servoValue':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'angle (0-180)' : 90,
                    'stopped' : ['stopped'], 
                    'clockwise' : ['clockwise'],
                    'counter-clockwise' : ['counter-clockwise'],
                    'disconnected' : ['disconnected']
                }
        );
        break;
        case '%pinMode':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'digital input' : ['digital input'],
                    'digital output' : ['digital output'] ,
                    'PWM' : ['PWM'],
                    'servo' : ['servo']
                },
                true
        );
        break;
        case '%servoPin':
            part = new InputSlotMorph(
                null,
                true,
                function() { 
                    // Get board associated to currentSprite
                    var sprite = world.children[0].currentSprite,
                        board = sprite.arduino.board;

                    if (board) {
                        return pinsSettableToMode(board.MODES.SERVO);
                    } else {
                        return [];
                    }
                }
        );
        break;
        case '%pwmPin':
            part = new InputSlotMorph(
                null,
                true,
                function() { 
                    // Get board associated to currentSprite
                    var sprite = world.children[0].currentSprite,
                        board = sprite.arduino.board;

                    if (board) {
                        return pinsSettableToMode(board.MODES.PWM);
                    } else {
                        return [];
                    }
                }
        );
        break;
        case '%analogPin':
            part = new InputSlotMorph(
                null,
                true,
                function() { 
                    // Get board associated to currentSprite
                    var sprite = world.children[0].currentSprite,
                        board = sprite.arduino.board;

                    if (board) { 
                        return board.analogPins.map(function(each){ return (each - board.analogPins[0]).toString() });
                    } else { 
                        return [];
                    } 
                }
        );
        break;
        case '%digitalPin':
            part = new InputSlotMorph(
                null,
                true,
                function() {
                    // Get board associated to currentSprite
                    var sprite = world.children[0].currentSprite,
                        board = sprite.arduino.board;

                    if (board) {
                        var pinNumbers = [];
                        var pins = board.pins.filter(function(each){ return each.analogChannel == 127 });
                        pins.forEach(function(each){ pinNumbers.push(pins.indexOf(each).toString()) });
                        return pinNumbers;
                    } else {
                        return [];
                    }
                }
        );
        break;
        default:
            part = this.originalLabelPart(spec);
    }
    return part;
}
