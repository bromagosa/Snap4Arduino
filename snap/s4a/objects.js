// init decorator

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
    this.originalInit(globals);
    this.arduino = new Arduino(this);
};

// Definition of a new Arduino Category

SpriteMorph.prototype.categories.push('arduino');
SpriteMorph.prototype.blockColor['arduino'] = new Color(64, 136, 182);

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initArduinoBlocks = function () {

    this.blocks.reportAnalogReading = 
    {
        only: SpriteMorph,
        type: 'reporter',
        category: 'arduino',
        spec: 'analog reading %analogPin',
        translatable: true
    };

    this.blocks.reportDigitalReading = 
    {
        only: SpriteMorph,
        type: 'predicate',
        category: 'arduino',
        spec: 'digital reading %digitalPin',
        translatable: true
    };

    this.blocks.connectArduino =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'connect arduino at %s'
    };

    this.blocks.disconnectArduino =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'disconnect arduino'
    };

    // Keeping this block spec, although it's not used anymore!
    this.blocks.setPinMode =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'setup digital pin %digitalPin as %pinMode',
        defaults: [null, 'servo'],
        translatable: true
    };

    this.blocks.digitalWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set digital pin %digitalPin to %b',
        translatable: true
    };

    this.blocks.servoWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set servo %servoPin to %servoValue',
        defaults: [null, 'clockwise'],
        translatable: true
    };

    this.blocks.pwmWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set analog pin %pwmPin to %n',
        translatable: true
    };

    // Ardui... nization? 
    // Whatever, let's dumb this language down:

    this.blocks.receiveGo.translatable = true;
    this.blocks.doWait.translatable = true;
    this.blocks.doForever.translatable = true;
    this.blocks.doRepeat.translatable = true;
    this.blocks.doIf.translatable = true;
    this.blocks.doIfElse.translatable = true;
    this.blocks.reportSum.translatable = true;
    this.blocks.reportDifference.translatable = true;
    this.blocks.reportProduct.translatable = true;
    this.blocks.reportQuotient.translatable = true;
    this.blocks.reportModulus.translatable = true;
    this.blocks.reportMonadic.translatable = true;
    this.blocks.reportRandom.translatable = true;
    this.blocks.reportLessThan.translatable = true;
    this.blocks.reportEquals.translatable = true;
    this.blocks.reportGreaterThan.translatable = true;
    this.blocks.reportAnd.translatable = true;
    this.blocks.reportOr.translatable = true;
    this.blocks.reportNot.translatable = true;
    this.blocks.reportBoolean.translatable = true;
    this.blocks.reportJoinWords.translatable = true;
    this.blocks.doSetVar.translatable = true;
    this.blocks.doChangeVar.translatable = true;
    this.blocks.doDeclareVariables.translatable = true;

    StageMorph.prototype.codeMappings['delim'] = ',';
    StageMorph.prototype.codeMappings['tempvars_delim'] = ',';
    StageMorph.prototype.codeMappings['string'] = '"<#1>"';

    StageMorph.prototype.codeMappings['doWait'] = 'delay(<#1> * 1000);';
    StageMorph.prototype.codeMappings['doForever'] = 'void loop() {\n  <#1>\n}';
    StageMorph.prototype.codeMappings['doRepeat'] = 'for (int i = 0; i < <#1>; i++) {\n  <#2>\n}';
    StageMorph.prototype.codeMappings['doIf'] = 'if (<#1>) {\n  <#2>\n}';
    StageMorph.prototype.codeMappings['doIfElse'] = 'if (<#1>) {\n  <#2>\n} else {\n  <#3>\n}';

    StageMorph.prototype.codeMappings['reportSum'] = '(<#1> + <#2>)';
    StageMorph.prototype.codeMappings['reportDifference'] = '(<#1> - <#2>)';
    StageMorph.prototype.codeMappings['reportProduct'] = '(<#1> * <#2>)';
    StageMorph.prototype.codeMappings['reportQuotient'] = '(<#1> / <#2>)';
    StageMorph.prototype.codeMappings['reportModulus'] = '(<#1> % <#2>)';
    StageMorph.prototype.codeMappings['reportMonadic'] = '<#1>(<#2>)';
    StageMorph.prototype.codeMappings['reportRandom'] = 'random(<#1>, <#2>)';
    StageMorph.prototype.codeMappings['reportLessThan'] = '(<#1> < <#2>)';
    StageMorph.prototype.codeMappings['reportEquals'] = '(<#1> == <#2>)';
    StageMorph.prototype.codeMappings['reportGreaterThan'] = '(<#1> > <#2>)';
    StageMorph.prototype.codeMappings['reportAnd'] = '(<#1> && <#2>)';
    StageMorph.prototype.codeMappings['reportOr'] = '(<#1> || <#2>)';
    StageMorph.prototype.codeMappings['reportNot'] = '!(<#1>)';
    StageMorph.prototype.codeMappings['reportBoolean'] = '<#1>';

    StageMorph.prototype.codeMappings['doSetVar'] = '<#1> = <#2>;';
    StageMorph.prototype.codeMappings['doChangeVar'] = '<#1> += <#2>;';
    StageMorph.prototype.codeMappings['doDeclareVariables'] = 'int <#1>;'; // How do we deal with types? Damn types...

    StageMorph.prototype.codeMappings['reportAnalogReading'] = 'analogRead(<#1>)';
    StageMorph.prototype.codeMappings['reportDigitalReading'] = 'digitalRead(<#1>)';
    StageMorph.prototype.codeMappings['setPinMode'] = 'pinMode(<#1>, <#2>);';
    StageMorph.prototype.codeMappings['digitalWrite'] = 'digitalWrite(<#1>, <#2>);';
    StageMorph.prototype.codeMappings['servoWrite'] = 'servo<#1>.write(<#2>);';
    StageMorph.prototype.codeMappings['pwmWrite'] = 'analogWrite(<#1>, <#2>);';
}

SpriteMorph.prototype.initBlocks =  function() {
    this.originalInitBlocks();
    this.initArduinoBlocks();
};

SpriteMorph.prototype.initBlocks();

// blockTemplates decorator

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;
SpriteMorph.prototype.blockTemplates = function (category) {
    var myself = this;

    var blocks = myself.originalBlockTemplates(category); 

    //  Button that triggers a connection attempt 

    this.arduinoConnectButton = new PushButtonMorph(
            null,
            function () {
                myself.arduino.attemptConnection();
            },
            'Connect Arduino'
            );

    //  Button that triggers a disconnection from board

    this.arduinoDisconnectButton = new PushButtonMorph(
            null,
            function () {
                myself.arduino.disconnect();;
            },
            'Disconnect Arduino'
            );

    function arduinoWatcherToggle (selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var info = SpriteMorph.prototype.blocks[selector];

        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                var reporter = detect(blocks, function (each) {
                        return (each.selector === selector)
                    }),
                    pin = reporter.inputs()[0].contents().text;

                if (!pin) { return };

                myself.arduinoWatcher(
                    selector,
                    localize(info.spec),
                    myself.blockColor[info.category],
                    pin
                );
            },
            null,
            function () {
                var reporter = detect(blocks, function (each) {
                    return (each && each.selector === selector)
                });

                return reporter &&
                    myself.showingArduinoWatcher(selector, reporter.inputs()[0].contents().text);
            },
            null
        );
    }
    function blockBySelector (selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    };

    var analogToggle = arduinoWatcherToggle('reportAnalogReading'),
        reportAnalog = blockBySelector('reportAnalogReading'),
        digitalToggle = arduinoWatcherToggle('reportDigitalReading'),
        reportDigital = blockBySelector('reportDigitalReading');
    
    if (reportAnalog) {
        reportAnalog.toggle = analogToggle;
    }

    if (reportDigital) {
        reportDigital.toggle = digitalToggle;
    }

    if (category === 'arduino') {
        blocks.push(this.arduinoConnectButton);
        blocks.push(this.arduinoDisconnectButton);
        blocks.push('-');
        blocks.push(blockBySelector('connectArduino'));
        blocks.push(blockBySelector('disconnectArduino'));
        blocks.push('-');
        blocks.push(blockBySelector('servoWrite'));
        blocks.push(blockBySelector('digitalWrite'));
        blocks.push(blockBySelector('pwmWrite'));
        blocks.push('-');
        blocks.push(analogToggle);
        blocks.push(reportAnalog);
        blocks.push(digitalToggle);
        blocks.push(reportDigital);

    } else if (category === 'other') {
        button = new PushButtonMorph(
                null,
                function () {
                    var ide = myself.parentThatIsA(IDE_Morph),
                    stage = myself.parentThatIsA(StageMorph);
                    new BlockDialogMorph(
                        null,
                        function (definition) {
                            if (definition.spec !== '') {
                                if (definition.isGlobal) {
                                    stage.globalBlocks.push(definition);
                                } else {
                                    myself.customBlocks.push(definition);
                                }
                                ide.flushPaletteCache();
                                ide.refreshPalette();
                                new BlockEditorMorph(definition, myself).popUp();
                            }
                        },
                        myself
                        ).prompt(
                            'Make a block',
                            null,
                            myself.world()
                            );
                },
                'Make a block'
            );
//        button.userMenu = helpMenu;
        button.selector = 'addCustomBlock';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);
    }

    return blocks;
};

SpriteMorph.prototype.reportAnalogReading = function (pin) {
    if (this.arduino.isBoardReady()) {
        var board = this.arduino.board;

        if (!pin) { return 0 };

        if (board.pins[board.analogPins[pin]].mode != board.MODES.ANALOG) {
            board.pinMode(board.analogPins[pin], board.MODES.ANALOG);
        }

        return board.pins[board.analogPins[pin]].value;

    } else {
        return 0;
    }
};

SpriteMorph.prototype.reportDigitalReading = function (pin) {
    if (this.arduino.isBoardReady()) {
        var board = this.arduino.board;

        if (!pin) { return false };

        if (board.pins[pin].mode != board.MODES.INPUT) {
            board.pinMode(pin, board.MODES.INPUT);
            board.digitalRead(pin, function(value) { board.pins[pin].value = value });
        }
        return board.pins[pin].value == 1;
    } else {
        return false;
    }
};

SpriteMorph.prototype.arduinoWatcher = function (selector, label, color, pin) {
    var stage = this.parentThatIsA(StageMorph),
        watcher,
        others;
    if (!stage) { return; }
    watcher = this.arduinoWatcherFor(stage, selector, pin);
    if (watcher) {
        if (watcher.isVisible) {
            watcher.hide();
        } else {
            watcher.show();
            watcher.fixLayout(); // re-hide hidden parts
            watcher.keepWithin(stage);
        }
        return;
    }

    // if no watcher exists, create a new one
    watcher = new WatcherMorph(
        label.replace(/%.*\s*/, pin),
        color,
        WatcherMorph.prototype.isGlobal(selector) ? stage : this,
        selector
    );
    watcher.pin = pin;
    watcher.update = function () {
        var newValue, sprite, num;

        this.updateLabel();
        newValue = this.target[this.getter](pin);

        if (newValue !== '' && !isNil(newValue)) {
            num = +newValue;
            if (typeof newValue !== 'boolean' && !isNaN(num)) {
                newValue = Math.round(newValue * 1000000000) / 1000000000;
            }
        }
        if (newValue !== this.currentValue) {
            this.changed();
            this.cellMorph.contents = newValue;
            this.cellMorph.drawNew();
            if (!isNaN(newValue)) {
                this.sliderMorph.value = newValue;
                this.sliderMorph.drawNew();
            }
            this.fixLayout();
            this.currentValue = newValue;
        }
    };

    watcher.setPosition(stage.position().add(10));
    others = stage.watchers(watcher.left());
    if (others.length > 0) {
        watcher.setTop(others[others.length - 1].bottom());
    }
    stage.add(watcher);
    watcher.fixLayout();
    watcher.keepWithin(stage);
};

SpriteMorph.prototype.arduinoWatcherFor = function (stage, selector, pin) {
    var myself = this;
    return detect(stage.children, function (morph) {
        return morph instanceof WatcherMorph &&
            morph.getter === selector &&
            morph.target === (morph.isGlobal(selector) ? stage : myself) &&
            morph.pin === pin; 
    });
};

SpriteMorph.prototype.showingArduinoWatcher = function (selector, pin) {
    var stage = this.parentThatIsA(StageMorph),
        watcher;
    if (stage === null) {
        return false;
    }
    watcher = this.arduinoWatcherFor(stage, selector, pin);
    if (watcher) {
        return watcher.isVisible;
    }
    return false;
};

