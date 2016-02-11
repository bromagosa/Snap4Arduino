// userMenu proxy

SpriteIconMorph.prototype.originalUserMenu = SpriteIconMorph.prototype.userMenu;
SpriteIconMorph.prototype.userMenu = function () {
    menu = this.originalUserMenu();
    menu.addLine();
    var myself = this;
    menu.addItem('connect to Arduino', function() { myself.object.arduino.attemptConnection() });
    menu.addItem('disconnect Arduino', function() { myself.object.arduino.disconnect() });
    return menu;
}

// HTTP protocol, based on S4A's

IDE_Morph.prototype.originalInit = IDE_Morph.prototype.init;
IDE_Morph.prototype.init = function(globals) {
    this.originalInit(globals);

    var myself = this;

    if (this.httpServer) { this.httpServer.close() };
    this.httpServer = require('http').createServer(function(request, response) { myself.handleHTTPRequest(request, response) });
    this.httpServer.listen(42001, function() {});
}

IDE_Morph.prototype.handleHTTPRequest = function(request, response) {
    var myself = this;

    response.setHeader('Access-Control-Allow-Origin', '*');

    function parse(message) {

        if (message.length > 0) {

            // If the command came inside a POST body, it needs to be split by spaces,
            // otherwise it came in a GET URL and it needs to be split by "="

            var command = message.indexOf('=') > 0 ? message.split('=') : message.split(' ');

            switch (command[0]) {
                case 'broadcast':
                    var message = command[1],
                        stage = myself.stage,
                        hats = [];

                    if (message.length > 0) {

                        stage.lastMessage = message;

                        stage.children.concat(stage).forEach(function (morph) {
                            if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
                                hats = hats.concat(morph.allHatBlocksFor(message));
                            }
                        });

                        hats.forEach(function (block) {
                            stage.threads.startProcess(
                                    block,
                                    stage.isThreadSafe
                                    )});

                        response.end('broadcast ' + message);

                    } else {
                        response.end('no message provided');
                    }
                    break;

                case 'vars-update':
                    var varName = command[1],
                        value = command[2],
                        stage = myself.stage;

                    stage.globalVariables().setVar(varName, value, stage);
                    response.end('updating variable ' + command[1] + ' to value ' + command[2]);
                    break;

                case 'send-messages':
                    var contents = 'broadcast',
                        stage = myself.stage;

                    stage.children.concat(stage).forEach(function(morph) {
                        if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
                            morph.allMessageNames().forEach(function(message) {
                                contents += ' "' + message + '"';
                            });
                        }
                    });

                    response.end(contents);
                    break;

                case 'send-vars':
                    var contents = 'sensor-update',
                        stage = myself.stage;

                    Object.keys(stage.globalVariables().vars).forEach(function(varName) {
                        contents += ' "' + varName + '" ' + stage.globalVariables().vars[varName].value;
                    });

                    response.end(contents);
                    break;
            }
        }
    }

    if (request.method === 'POST') {

        var body = '';

        request.addListener('data', function(chunk) {
            body += chunk;
        });

        request.addListener('end', function(chunk){
            if (chunk) { 
                body += chunk;
            }
            parse(body);
        });

    } else if (request.method === 'GET') {
        parse(request.url.slice(1));
    }

    response.end('Unknown command');
}

// Override Snap! menus
// ToDo: Duplicate code! This is terrible style... we need to think of a better way 

IDE_Morph.prototype.snapMenu = function () {
    var menu,
    world = this.world();

    menu = new MenuMorph(this);
    menu.addItem('About Snap!...', 'aboutSnap');
    menu.addItem('About Snap4Arduino...', 'aboutSnap4Arduino');
    menu.addLine();
    menu.addItem(
        'Snap! reference manual',
        function () {
            window.open('http://snap.berkeley.edu/snapsource/help/SnapManual.pdf', 'SnapReferenceManual');
        }
    );
    menu.addItem(
        'Snap! website',
        function () {
            window.open('http://snap.berkeley.edu/', 'SnapWebsite');
        }
    );
    menu.addItem('Snap4Arduino website', 
                 function() {
                     window.open('http://s4a.cat/snap', 'Snap4ArduinoWebsite'); 
                 }
                );
                menu.addItem(
                    'Download Snap! source',
                    function () {
                        window.open(
                            'http://snap.berkeley.edu/snapsource/snap.zip',
                            'SnapSource'
                        );
                    }
                );
                menu.addItem(
                    'Snap4Arduino repository',
                    function () {
                        window.open(
                            'http://github.com/edutec/Snap4Arduino',
                            'SnapSource'
                        );
                    }
                );

                if (world.isDevMode) {
                    menu.addLine();
                    menu.addItem(
                        'Switch back to user mode',
                        'switchToUserMode',
                        'disable deep-Morphic\ncontext menus'
                        + '\nand show user-friendly ones',
                        new Color(0, 100, 0)
                    );
                } else if (world.currentKey === 16) { // shift-click
                    menu.addLine();
                    menu.addItem(
                        'Switch to dev mode',
                        'switchToDevMode',
                        'enable Morphic\ncontext menus\nand inspectors,'
                        + '\nnot user-friendly!',
                        new Color(100, 0, 0)
                    );
                }
                menu.popup(world, this.logo.bottomLeft());
};

IDE_Morph.prototype.settingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        var on = '\u2611 ',
            off = '\u2610 ';
        if (!hide || shiftClicked) {
            menu.addItem(
                (test ? on : off) + localize(label),
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    menu = new MenuMorph(this);
    menu.addItem('Language...', 'languageMenu');
    menu.addItem(
        'Zoom blocks...',
        'userSetBlocksScale'
    );
    menu.addItem(
        'Stage size...',
        'userSetStageSize'
    );
    menu.addLine();
    addPreference(
        'Blurred shadows',
        'toggleBlurredShadows',
        useBlurredShadows,
        'uncheck to use solid drop\nshadows and highlights',
        'check to use blurred drop\nshadows and highlights',
        true
    );
    addPreference(
        'Zebra coloring',
        'toggleZebraColoring',
        BlockMorph.prototype.zebraContrast,
        'uncheck to disable alternating\ncolors for nested block',
        'check to enable alternating\ncolors for nested blocks',
        true
    );
    addPreference(
        'Dynamic input labels',
        'toggleDynamicInputLabels',
        SyntaxElementMorph.prototype.dynamicInputLabels,
        'uncheck to disable dynamic\nlabels for variadic inputs',
        'check to enable dynamic\nlabels for variadic inputs',
        true
    );
    addPreference(
        'Prefer empty slot drops',
        'togglePreferEmptySlotDrops',
        ScriptsMorph.prototype.isPreferringEmptySlots,
        'uncheck to allow dropped\nreporters to kick out others',
        'settings menu prefer empty slots hint',
        true
    );
    addPreference(
        'Long form input dialog',
        'toggleLongFormInputDialog',
        InputSlotDialogMorph.prototype.isLaunchingExpanded,
        'uncheck to use the input\ndialog in short form',
        'check to always show slot\ntypes in the input dialog'
    );
    addPreference(
        'Plain prototype labels',
        'togglePlainPrototypeLabels',
        BlockLabelPlaceHolderMorph.prototype.plainLabel,
        'uncheck to always show (+) symbols\nin block prototype labels',
        'check to hide (+) symbols\nin block prototype labels'
    );
    addPreference(
        'Virtual keyboard',
        'toggleVirtualKeyboard',
        MorphicPreferences.useVirtualKeyboard,
        'uncheck to disable\nvirtual keyboard support\nfor mobile devices',
        'check to enable\nvirtual keyboard support\nfor mobile devices',
        true
    );
    addPreference(
        'Input sliders',
        'toggleInputSliders',
        MorphicPreferences.useSliderForInput,
        'uncheck to disable\ninput sliders for\nentry fields',
        'check to enable\ninput sliders for\nentry fields'
    );
    if (MorphicPreferences.useSliderForInput) {
        addPreference(
            'Execute on slider change',
            'toggleSliderExecute',
            InputSlotMorph.prototype.executeOnSliderEdit,
            'uncheck to supress\nrunning scripts\nwhen moving the slider',
            'check to run\nthe edited script\nwhen moving the slider'
        );
    }
    addPreference(
        'Clicking sound',
        function () {
            BlockMorph.prototype.toggleSnapSound();
            if (BlockMorph.prototype.snapSound) {
                myself.saveSetting('click', true);
            } else {
                myself.removeSetting('click');
            }
        },
        BlockMorph.prototype.snapSound,
        'uncheck to turn\nblock clicking\nsound off',
        'check to turn\nblock clicking\nsound on'
    );
    addPreference(
        'Animations',
        function () {myself.isAnimating = !myself.isAnimating; },
        myself.isAnimating,
        'uncheck to disable\nIDE animations',
        'check to enable\nIDE animations',
        true
    );
    addPreference(
        'Turbo mode',
        'toggleFastTracking',
        this.stage.isFastTracked,
        'uncheck to run scripts\nat normal speed',
        'check to prioritize\nscript execution'
    );
    addPreference(
        'Cache Inputs',
        function () {
            BlockMorph.prototype.isCachingInputs =
                !BlockMorph.prototype.isCachingInputs;
        },
        BlockMorph.prototype.isCachingInputs,
        'uncheck to stop caching\ninputs (for debugging the evaluator)',
        'check to cache inputs\nboosts recursion',
        true
    );
    addPreference(
        'Rasterize SVGs',
        function () {
            MorphicPreferences.rasterizeSVGs =
                !MorphicPreferences.rasterizeSVGs;
        },
        MorphicPreferences.rasterizeSVGs,
        'uncheck for smooth\nscaling of vector costumes',
        'check to rasterize\nSVGs on import',
        true
    );
    addPreference(
        'Flat design',
        function () {
            if (MorphicPreferences.isFlat) {
                return myself.defaultDesign();
            }
            myself.flatDesign();
        },
        MorphicPreferences.isFlat,
        'uncheck for default\nGUI design',
        'check for alternative\nGUI design',
        false
    );
    addPreference(
        'Project URLs',
        function () {
            myself.projectsInURLs = !myself.projectsInURLs;
            if (myself.projectsInURLs) {
                myself.saveSetting('longurls', true);
            } else {
                myself.removeSetting('longurls');
            }
        },
        myself.projectsInURLs,
        'uncheck to disable\nproject data in URLs',
        'check to enable\nproject data in URLs',
        true
    );
    addPreference(
        'Sprite Nesting',
        function () {
            SpriteMorph.prototype.enableNesting =
                !SpriteMorph.prototype.enableNesting;
        },
        SpriteMorph.prototype.enableNesting,
        'uncheck to disable\nsprite composition',
        'check to enable\nsprite composition',
        true
    );

    menu.addLine(); // everything below this line is stored in the project
    addPreference(
        'Thread safe scripts',
        function () {stage.isThreadSafe = !stage.isThreadSafe; },
            this.stage.isThreadSafe,
        'uncheck to allow\nscript reentrance',
        'check to disallow\nscript reentrance'
    );
    addPreference(
        'Prefer smooth animations',
        'toggleVariableFrameRate',
        StageMorph.prototype.frameRate,
        'uncheck for greater speed\nat variable frame rates',
        'check for smooth, predictable\nanimations across computers'
    );
    addPreference(
        'Flat line ends',
        function () {
            SpriteMorph.prototype.useFlatLineEnds =
                !SpriteMorph.prototype.useFlatLineEnds;
        },
        SpriteMorph.prototype.useFlatLineEnds,
        'uncheck for round ends of lines',
        'check for flat ends of lines'
    );
    menu.popup(world, pos);
};

IDE_Morph.prototype.projectMenu = function () {
    var menu,
    myself = this,
        world = this.world(),
        pos = this.controlBar.projectButton.bottomLeft(),
        graphicsName = this.currentSprite instanceof SpriteMorph ?
        'Costumes' : 'Backgrounds',
    shiftClicked = (world.currentKey === 16);

    menu = new MenuMorph(this);
    menu.addItem('Project notes...', 'editProjectNotes');
    menu.addLine();
    menu.addItem('New', 'createNewProject');
    menu.addItem('Open...', 'openProjectsBrowser');
    menu.addItem('Save', "save");
    menu.addItem('Save As...', 'saveProjectsBrowser');
    menu.addLine();
    menu.addItem(
        'New Arduino translatable project', 
        'createNewArduinoProject',
        'Experimental feature!\nScripts written under this\nmode will be translatable\nas Arduino sketches');
    menu.addLine();
    menu.addItem(
        'Import...',
        function () {
            var inp = document.createElement('input');
            if (myself.filePicker) {
                document.body.removeChild(myself.filePicker);
                myself.filePicker = null;
            }
            inp.type = 'file';
            inp.style.color = "transparent";
            inp.style.backgroundColor = "transparent";
            inp.style.border = "none";
            inp.style.outline = "none";
            inp.style.position = "absolute";
            inp.style.top = "0px";
            inp.style.left = "0px";
            inp.style.width = "0px";
            inp.style.height = "0px";
            inp.addEventListener(
                "change",
                function () {
                    document.body.removeChild(inp);
                    myself.filePicker = null;
                    world.hand.processDrop(inp.files);
                },
                false
            );
            document.body.appendChild(inp);
            myself.filePicker = inp;
            inp.click();
        },
        'file menu import hint' // looks up the actual text in the translator
    );

    menu.addItem(
        shiftClicked ?
            'Export project as plain text...' : 'Export project...',
        function () {
            if (myself.projectName) {
                myself.exportProject(myself.projectName, shiftClicked);
            } else {
                myself.prompt('Export Project As...', function (name) {
                    myself.exportProject(name);
                }, null, 'exportProject');
            }
        },
        'show project data as XML\nin a new browser window',
        shiftClicked ? new Color(100, 0, 0) : null
    );

    menu.addItem(
        'Export blocks...',
        function () {myself.exportGlobalBlocks(); },
        'show global custom block definitions as XML\nin a new browser window'
    );

    if (shiftClicked) {
        menu.addItem(
            'Export all scripts as pic...',
            function () {myself.exportScriptsPicture(); },
            'show a picture of all scripts\nand block definitions',
            new Color(100, 0, 0)
        );
    }

    menu.addLine();
    menu.addItem(
        'Import tools',
        function () {
            myself.droppedText(
                myself.getURLsbeOrRelative(
                    'tools.xml'
                ),
                'tools'
            );
        },
        'load the official library of\npowerful blocks'
    );
    menu.addItem(
        'Libraries...',
        function () {
            // read a list of libraries from an external file,
            var libMenu = new MenuMorph(this, 'Import library'),
                libUrl = 'http://snap.berkeley.edu/snapsource/libraries/' +
            'LIBRARIES';

            function loadLib(name) {
                var url = 'http://snap.berkeley.edu/snapsource/libraries/'
                + name
                + '.xml';
                myself.droppedText(myself.getURL(url), name);
            }

            myself.getURL(libUrl).split('\n').forEach(function (line) {
                if (line.length > 0) {
                    libMenu.addItem(
                        line.substring(line.indexOf('\t') + 1),
                        function () {
                            loadLib(
                                line.substring(0, line.indexOf('\t'))
                            );
                        }
                    );
                }
            });

            libMenu.popup(world, pos);
        },
        'Select categories of additional blocks to add to this project.'
    );

    menu.addItem(
        localize(graphicsName) + '...',
        function () {
            var dir = graphicsName,
                names = myself.getCostumesList(dir),
                libMenu = new MenuMorph(
                    myself,
                    localize('Import') + ' ' + localize(dir)
            );

            function loadCostume(name) {
                var url = dir + '/' + name,
                    img = new Image();
                img.onload = function () {
                    var canvas = newCanvas(new Point(img.width, img.height));
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    myself.droppedImage(canvas, name);
                };
                img.src = url;
            }

            names.forEach(function (line) {
                if (line.length > 0) {
                    libMenu.addItem(
                        line,
                        function () {loadCostume(line); }
                    );
                }
            });
            libMenu.popup(world, pos);
        },
        'Select a costume from the media library'
    );
    menu.addItem(
        localize('Sounds') + '...',
        function () {
            var names = this.getCostumesList('Sounds'),
                libMenu = new MenuMorph(this, 'Import sound');

            function loadSound(name) {
                var url = 'Sounds/' + name,
                    audio = new Audio();
                audio.src = url;
                audio.load();
                myself.droppedAudio(audio, name);
            }

            names.forEach(function (line) {
                if (line.length > 0) {
                    libMenu.addItem(
                        line,
                        function () {loadSound(line); }
                    );
                }
            });
            libMenu.popup(world, pos);
        },
        'Select a sound from the media library'
    );
    menu.popup(world, pos);
};

IDE_Morph.prototype.aboutSnap4Arduino = function () {
    var dlg, aboutTxt, creditsTxt, translations,
    module, aboutBtn, creditsBtn,
    world = this.world();

    aboutTxt = 'Snap4Arduino! ' + require('fs').readFileSync('version') +'\n\n'
    + 'Copyright \u24B8 2015 Citilab\n'
    + 'edutec@citilab.eu\n\n'

    + 'Snap4Arduino is a modification of Snap! developed by the\n'
    + 'Edutec research group at the Citilab, Cornellà de Llobregat\n'
    + '(Barcelona).\n\n'

    + 'The Edutec research group is comprised of:\n'
    + 'Víctor Casado\n'
    + 'Jordi Delgado\n'
    + 'Jose García\n'
    + 'Joan Güell\n'
    + 'Bernat Romagosa\n\n'

    + 'For more information, please visit\n'
    + 'http://s4a.cat/snap\n'
    + 'http://edutec.citilab.eu';

    creditsTxt = localize('Contributors')
    + '\n\nErnesto Laval: MacOSX version, architectural decisions,\n'
    + 'several features and bugfixes, Spanish translation\n'
    + 'Frank Hunleth: GNU/Linux 64b version\n'
    + 'Mareen Przybylla: Early testing, several bug reports,\n'
    + 'German translation\n'
    + 'Steven Tang: Simplified Chinese translation\n'
    + 'Alberto Firpo: Italian Translation';

    dlg = new DialogBoxMorph();
    dlg.inform('About Snap4Arduino', aboutTxt, world);
    creditsBtn = dlg.addButton(
        function () {
            dlg.body.text = creditsTxt;
            dlg.body.drawNew();
            aboutBtn.show();
            creditsBtn.hide();
            dlg.fixLayout();
            dlg.drawNew();
            dlg.setCenter(world.center());
        },
        'Contributions...'
    );
    aboutBtn = dlg.addButton(
        function () {
            dlg.body.text = aboutTxt;
            dlg.body.drawNew();
            aboutBtn.hide();
            creditsBtn.show();
            dlg.fixLayout();
            dlg.drawNew();
            dlg.setCenter(world.center());
        },
        'About Snap4Arduino...'
    );
    aboutBtn.hide();
    dlg.fixLayout();
    dlg.drawNew();
};

IDE_Morph.prototype.getCostumesList = function (dirname) {
    var fs = require('fs'),
        dir,
        costumes = [];

    dir = fs.readdirSync(dirname);
    dir.forEach(
        function (each) {
            costumes.push(each);
        }
    );
    costumes.sort(function (x, y) {
        return x < y ? -1 : 1;
    });
    return costumes;
};


// Snap4Arduino logo

IDE_Morph.prototype.createLogo = function () {
    var myself = this;

    if (this.logo) {
        this.logo.destroy();
    }

    this.logo = new Morph();
    this.logo.texture = 's4a_logo_sm.png'; // Overriden
    this.logo.drawNew = function () {
        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d'),
            gradient = context.createLinearGradient(
                0,
                0,
                this.width(),
                0
        );
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(0.5, myself.frameColor.toString());
        context.fillStyle = MorphicPreferences.isFlat ?
            myself.frameColor.toString() : gradient;
        context.fillRect(0, 0, this.width(), this.height());
        if (this.texture) {
            this.drawTexture(this.texture);
        }
    };

    this.logo.drawCachedTexture = function () {
        var context = this.image.getContext('2d');
        context.drawImage(
            this.cachedTexture,
            5,
            Math.round((this.height() - this.cachedTexture.height) / 2)
        );
        this.changed();
    };

    this.logo.mouseClickLeft = function () {
        myself.snapMenu();
    };

    this.logo.color = new Color();
    this.logo.setExtent(new Point(200, 28)); // dimensions are fixed
    this.add(this.logo);
};

// Exporting

IDE_Morph.prototype.exportProject = function (name, plain) {
    var menu, 
        str,
        myself = this;

    if (name) {
        this.setProjectName(name);
        if (Process.prototype.isCatchingErrors) {
            try {
                menu = this.showMessage('Exporting');
                str = this.serializer.serialize(this.stage);
                saveFile(name, str);
                menu.destroy();
            } catch (err) {
                this.showMessage('Export failed: ' + err);
            }
        } else {
            menu = this.showMessage('Exporting');
            str = this.serializer.serialize(this.stage);
            saveFile(name, str);
            menu.destroy();
        }
    }

    function saveFile(name, contents) {
        var inp = document.createElement('input');
        if (myself.filePicker) {
            document.body.removeChild(myself.filePicker);
            myself.filePicker = null;
        }
        inp.nwsaveas = homePath() + name + '.xml';
        inp.type = 'file';
        inp.style.color = "transparent";
        inp.style.backgroundColor = "transparent";
        inp.style.border = "none";
        inp.style.outline = "none";
        inp.style.position = "absolute";
        inp.style.top = "0px";
        inp.style.left = "0px";
        inp.style.width = "0px";
        inp.style.height = "0px";
        inp.addEventListener(
            "change",
            function (e) {
                document.body.removeChild(inp);
                myself.filePicker = null;

                var fs = require('fs'),
                    fileName = e.target.files[0].path;

                fs.writeFileSync(fileName.slice(-4) === '.xml' ? fileName : fileName + '.xml', contents);
                myself.showMessage('Exported!', 1);
            },
            false
        );
        document.body.appendChild(inp);
        myself.filePicker = inp;
        inp.click();
    }
};


function homePath() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + ((process.platform == 'win32') ? '\\' : '/')
}

/*
 * Override setLanguage function
 */

IDE_Morph.prototype.originalSetLanguage = IDE_Morph.prototype.setLanguage;
IDE_Morph.prototype.setLanguage = function(lang, callback) {
    var myself = this;

    myself.originalSetLanguage(lang, function() {
        myself.setLanguageS4A(lang, callback);
    });
};

IDE_Morph.prototype.setLanguageS4A = function (lang, callback) {
    // Load language script for s4a related functions
    var s4aTranslation = document.getElementById('s4a-language'),
        s4aSrc = 's4a/s4a-lang-' + lang + '.js',
        myself = this;
    if (s4aTranslation) {
        document.head.removeChild(s4aTranslation);
    }
    if (lang === 'en') {
        return this.reflectLanguage('en', callback);
    }
    s4aTranslation = document.createElement('script');
    s4aTranslation.id = 's4a-language';
    s4aTranslation.onload = function () {
        myself.reflectLanguage(lang, callback);
    };
    document.head.appendChild(s4aTranslation);
    s4aTranslation.src = s4aSrc; 
};

// Fix problme with connected board when creating a new project 
// If the board is connected (it is not freed for the new sprites)
IDE_Morph.prototype.originalNewProject = IDE_Morph.prototype.newProject
IDE_Morph.prototype.newProject = function () {
    // Disconnect each sprite before creating the new project
    var sprites = this.sprites.asArray()
    sprites.forEach(function(sprite) {
        if (sprite.arduino && sprite.arduino.board) {
            sprite.arduino.disconnect(true);
        }
    });
    this.originalNewProject();
};

// EXPERIMENTAL: Arduino translation mode

IDE_Morph.prototype.createNewArduinoProject = function() {
    var myself = this;
    this.confirm(
        'Replace the current project with a new one?',
        'New Arduino translatable Project',
        function () { myself.newArduinoProject() })
}

IDE_Morph.prototype.newArduinoProject = function() {
    var myself = this;

    this.newProject();
    SpriteMorph.prototype.initBlocks();

    // toggle codification
    StageMorph.prototype.enableCodeMapping = true;
    this.currentSprite.blocksCache.variables = null;

    console.log(StageMorph.prototype.codeMappings);

    // UI changes
    if (!this.isArduinoTranslationMode) {
        SpriteMorph.prototype.notSoOriginalBlockTemplates = SpriteMorph.prototype.blockTemplates;
        SpriteMorph.prototype.blockTemplates = function (category) {
            var blocks = this.notSoOriginalBlockTemplates(category);
            if (category === 'variables') {
                blocks = blocks.splice(1);
                blocks = blocks.splice(0, blocks.length - 1);
            }
            return blocks;
        }

        StageMorph.prototype.notSoOriginalBlockTemplates = StageMorph.prototype.blockTemplates;
        StageMorph.prototype.blockTemplates = function (category) {
            var blocks = this.notSoOriginalBlockTemplates(category);
            if (category === 'variables') {
                blocks = blocks.splice(1);
                blocks = blocks.splice(0, blocks.length - 1);
            }
            return blocks;
        }
    }

    // toggle unusable blocks
    var defs = SpriteMorph.prototype.blocks;
   
    SpriteMorph.prototype.categories.forEach(function(category) { 
        Object.keys(defs).forEach(function (sel) {
            if (!defs[sel].translatable) {
                StageMorph.prototype.hiddenPrimitives[sel] = true;
            }
        });
        myself.flushBlocksCache(category) 
    });

    this.isArduinoTranslationMode = true;

    this.currentSprite.paletteCache.variables = null;
    this.refreshPalette();
}

IDE_Morph.prototype.createNewProject = function () {
    var myself = this;
    this.confirm(
        'Replace the current project with a new one?',
        'New Project',
        function () {
            if (myself.isArduinoTranslationMode) {
                // Ok, these names are getting silly
                StageMorph.prototype.blockTemplates = StageMorph.prototype.notSoOriginalBlockTemplates;
                SpriteMorph.prototype.blockTemplates = SpriteMorph.prototype.notSoOriginalBlockTemplates;
                myself.isArduinoTranslationMode = false;
            }
            myself.newProject();
        }
    );
};

