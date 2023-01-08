// adding labelParts

SyntaxElementMorph.prototype.labelParts = {
    ...SyntaxElementMorph.prototype.labelParts,
    '%servoValue': {
        type: 'input',
        menu: {
            'angle (0-180)' : [90],
            'stopped (1500)' : ['stopped'], 
            'clockwise (1500-1000)' : ['clockwise'],
            'counter-clockwise (1500-2000)' : ['counter-clockwise'],
            'disconnected' : ['disconnected']
            }
    },
    '%pinMode': {
        type: 'input',
        menu: {
            'digital input' : ['digital input'],
            'digital output' : ['digital output'] ,
            'PWM' : ['PWM'],
            'servo' : ['servo']
            }
    },
    '%digitalPin': {
        type: 'input',
        tags: 'numeric',
        menu: 'digitalPinMenu'
    },
    '%pwmPin': {
        type: 'input',
        tags: 'numeric',
        menu: 'pwmPinMenu'
    },
    '%analogPin': {
        type: 'input',
        tags: 'numeric',
        menu: 'analogPinMenu'
    }
};

InputSlotMorph.prototype.digitalPinMenu = function (searching) {
    var dict = {},
        sprite = ide.currentSprite,
        board = sprite.arduino.board; // Get board associated to currentSprite
    // All digitals have modes INPUT, OUTPUT, SERVO AND PULLUP
    if (!searching && board) { dict = sprite.arduino.pinsSettableToMode(board.MODES.INPUT); }
    return dict;
};

InputSlotMorph.prototype.pwmPinMenu = function (searching) {
    var dict = {},
        sprite = ide.currentSprite,
        board = sprite.arduino.board; // Get board associated to currentSprite
    if (!searching && board) {
        Object.keys(sprite.arduino.pinsSettableToMode(board.MODES.PWM)).forEach(
            function (each) { dict[each + '~'] = each }
        );
    }
    return dict;
};

InputSlotMorph.prototype.analogPinMenu = function (searching) {
    var dict = {},
        sprite = ide.currentSprite,
        board = sprite.arduino.board; // Get board associated to currentSprite
    if (!searching && board) {
        board.analogPins.forEach(
            function (each) {
                analogPin = (each - board.analogPins[0]).toString();
                dict[analogPin] = analogPin;
            }
        );    }
    return dict;
};


BlockMorph.prototype.originalUserMenu = BlockMorph.prototype.userMenu;
BlockMorph.prototype.userMenu = function () {
    var menu = this.originalUserMenu();
    if (StageMorph.prototype.enableCodeMapping && this.selector == 'receiveGo') {
        menu.addLine();
        menu.addItem(
                'export as Arduino sketch...',
                'transpileToC'
                );
    }
    return menu;
};

// Refreshing watchers state info when pin is changed 
SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;
SyntaxElementMorph.prototype.labelPart = function (spec) {
    var part = this.originalLabelPart(spec),
        block = this;
    if (part.choices === 'analogPinMenu' || part.choices === 'digitalPinMenu') {
        part.originalChanged = part.changed;
        part.changed = function () {
            part.originalChanged();
            if (block.toggle) { block.toggle.refresh(); }
        };
    }
    return part;
};

BlockMorph.prototype.transpileToC = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        safeChars = {"á": "a", "à": "a", "ä": "a",
                     "é": "e", "è": "e", "ë": "e",
                     "í": "i", "ì": "i", "ï": "i",
                     "ó": "o", "ò": "o", "ö": "o",
                     "ú": "u", "ù": "u", "ü": "u",
                     "Á": "A", "À": "A", "Ä": "A",
                     "É": "E", "È": "E", "Ë": "E",
                     "Í": "I", "Ì": "I", "Ï": "I",
                     "Ó": "O", "Ò": "O", "Ö": "O",
                     "Ú": "U", "Ù": "U", "Ü": "U",
                     "ç":"c", "Ç": "C", "ñ": "n", "Ñ": "N"},
        fileName = ide.projectName || 'snap4arduino';

    fileName = fileName.replace(/[^\w ]/g, function(char) {
        return safeChars[char] || char;
    });
    fileName = fileName.replace(/ /g,'_')
    fileName = fileName.replace(/[^a-zA-Z0-9_]/g,'');
    try {
        ide.saveFileAs(
                this.world().Arduino.transpile(
                    this.mappedCode(),
                    this.parentThatIsA(ScriptsMorph).children.filter(
                        function (each) {
                            return each instanceof HatBlockMorph &&
                                each.selector == 'receiveMessage';
                        })),
                'application/ino;chartset=utf-8',
                fileName);
    } catch (error) {
        ide.inform('Error exporting to Arduino sketch!', error.message)
    }
};
