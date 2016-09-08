function pinsSettableToMode(aMode) {
    var pinNumbers = {},
        pins = world.board.pins;

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
                    return pinsSettableToMode('servo');
                }
        );
        break;
        case '%pwmPin':
            part = new InputSlotMorph(
                null,
                true,
                function() { 
                    return pinsSettableToMode('pwm');
                }
        );
        break;
        case '%analogPin':
            part = new InputSlotMorph(
                null,
                true,
                world.board.analogPins
        );
        break;
        case '%digitalPin':
            part = new InputSlotMorph(
                null,
                true,
                function() {
                    return pinsSettableToMode('digital');
                }
        );
        break;
        default:
            part = this.originalLabelPart(spec);
    }
    return part;
}
