//specialOptionMenus for Snap4Arduino
CustomBlockDefinition.prototype.originalDropDownMenuOf = CustomBlockDefinition.prototype.dropDownMenuOf;

CustomBlockDefinition.prototype.dropDownMenuOf = function (inputName) {
    var fname;
    if (this.declarations.has(inputName) &&
            this.declarations.get(inputName)[2]) {
        if ((this.declarations.get(inputName)[2].indexOf('§_') === 0)) {
            fname = this.declarations.get(inputName)[2].slice(2);
            if (fname == 'digitalPins') {
                return function() { 
                           // Get board associated to currentSprite
                           var sprite = ide.currentSprite,
                               board = sprite.arduino.board;

                           if (board) {
                               return sprite.arduino.pinsSettableToMode(board.MODES.INPUT);
                           } else {
                               return [];
                           }
                       };
            }
            if (fname == 'analogPins') {
                return function() { 
                           // Get board associated to currentSprite
                           var sprite = ide.currentSprite,
                               board = sprite.arduino.board;
                        
                           if (board) { 
                               return board.analogPins.map(
                                   function (each){
                                       return (each - board.analogPins[0]).toString();
                                   });
                           } else { 
                               return [];
                           } 
                       };
            }
            if (fname == 'pwmPins') {
                return function() { 
                           // Get board associated to currentSprite
                           var sprite = ide.currentSprite,
                               board = sprite.arduino.board;

                           if (board) {
                               // Can't use map because we need to construct keys dynamically
                               var pins = {};
                               Object.keys(sprite.arduino.pinsSettableToMode(board.MODES.PWM)).forEach(function (each) { pins[each + '~'] = each });
                               return pins;
                           } else {
                               return [];
                           }
                       };
            }
            if (fname == 'servoValues') {
                return {
                    'angle (0-180)' : [90],
                    'stopped (1500)' : ['stopped'], 
                    'clockwise (1500-1000)' : ['clockwise'],
                    'counter-clockwise (1500-2000)' : ['counter-clockwise'],
                    'disconnected' : ['disconnected']
                };
            }
        }
        return this.originalDropDownMenuOf(inputName);
    }
    return null;
};

BlockLabelFragment.prototype.originalHasSpecialMenu = BlockLabelFragment.prototype.hasSpecialMenu;

BlockLabelFragment.prototype.hasSpecialMenu = function () {
    return this.originalHasSpecialMenu() || contains(
        [
            '§_digitalPins',
            '§_analogPins',
            '§_pwmPins',
            '§_servoValues'
        ],
        this.options
    );
};

InputSlotDialogMorph.prototype.originalSpecialOptionsMenu = InputSlotDialogMorph.prototype.specialOptionsMenu;

InputSlotDialogMorph.prototype.specialOptionsMenu = function () {
    var menu = this.originalSpecialOptionsMenu();
    var myself = this,
        on = '\u26AB ',
        off = '\u26AA ';

    function addSpecialOptions(label, selector) {
        menu.addItem(
            (myself.fragment.options === selector ?
                    on : off) + localize(label),
            selector
        );
    }

    addSpecialOptions('digitalPins', '§_digitalPins');
    addSpecialOptions('analogPins', '§_analogPins');
    addSpecialOptions('pwmPins', '§_pwmPins');
    addSpecialOptions('servoValues', '§_servoValues');
    return menu;
};
