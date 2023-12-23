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

// Can't decorate this function.
// Snap4Arduino has an extra Arduino category 
BlockDialogMorph.prototype.fixCategoriesLayout = function () {
    var buttonWidth = this.categories.children[0].width(), // all the same
        buttonHeight = this.categories.children[0].height(), // all the same
        more = SpriteMorph.prototype.customCategories.size,
        xPadding = 15,
        yPadding = 2,
        border = 10, // this.categories.border,
        l = this.categories.left(),
        t = this.categories.top(),
        scroller,
        row,
        col,
        i;

    this.categories.setWidth(
        3 * xPadding + 2 * buttonWidth
    );

    this.categories.children.forEach((button, i) => {
        if (i < 8) {
            row = i % 4;
            col = Math.ceil((i + 1) / 4);
        } else if (i < 10) {
            row = 4;
            col = 10 - i;
        } else {
            row = i - 5;
            col = 1;
        }
        button.setPosition(new Point(
            l + (col * xPadding + ((col - 1) * buttonWidth)),
            t + ((row + 1) * yPadding + (row * buttonHeight) + border) +
                (i > 10 ? border / 2 : 0) 
        )); // 9 -> 10
    });

    if (MorphicPreferences.isFlat) {
        this.categories.corner = 0;
        this.categories.border = 0;
        this.categories.edge = 0;
    }
    // Scroller from 6 (5 in Snap!) because Snap4Arduino
    // has already an extra categories row (for Other and Arduino)
    if (more > 5) { // 6 -> 5
        scroller = new ScrollFrameMorph(
            null,
            null,
            SpriteMorph.prototype.sliderColor.lighter()
        );
        scroller.setColor(this.categories.color);
        scroller.acceptsDrops = false;
        scroller.contents.acceptsDrops = false;
        scroller.setPosition(
            new Point(
                this.categories.left() + this.categories.border,
                this.categories.children[11].top() // 10 -> 11
            )
        );
        scroller.setWidth(this.categories.width() - this.categories.border * 2);
        scroller.setHeight(buttonHeight * 5 + yPadding * 4); // 6,5 -> 5,4

        for (i = 0; i < more; i += 1) {
            scroller.addContents(this.categories.children[11]); // 10 -> 11
        }
        this.categories.add(scroller);
        this.categories.setHeight(
            (6 + 1) * yPadding // 5 -> 6
                + 6 * buttonHeight // 5 -> 6
                + 5 * (yPadding + buttonHeight) + border + 2 // 6 -> 5
                + 2 * border
        );
    } else {
        this.categories.setHeight(
            (6 + 1) * yPadding // 5 -> 6
                + 6 * buttonHeight // 5 -> 6
                + (more ? (more * (yPadding + buttonHeight) + border / 2) : 0)
                + 2 * border
        );
    }
};
