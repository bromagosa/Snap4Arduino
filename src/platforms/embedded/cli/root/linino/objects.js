// blockTemplates decorator

SpriteMorph.prototype.blockTemplates = function(category) {
    var myself = this;

    var blocks = myself.originalBlockTemplates(category); 

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
    };

    function blockBySelector (selector) {
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
        button.selector = 'addCustomBlock';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);
    }

    return blocks;
};

// Needed for updating watchers

SpriteMorph.prototype.reportAnalogReading = Process.prototype.reportAnalogReading;
SpriteMorph.prototype.reportDigitalReading = Process.prototype.reportDigitalReading;
