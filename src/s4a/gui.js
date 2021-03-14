// userMenu proxy

SpriteIconMorph.prototype.originalUserMenu = SpriteIconMorph.prototype.userMenu;
SpriteIconMorph.prototype.userMenu = function () {
    menu = this.originalUserMenu();
    menu.addLine();
    var myself = this;
    menu.addItem(
            'connect to Arduino',
            function () { 
                myself.object.arduino.attemptConnection();
            });
    menu.addItem(
            'disconnect Arduino',
            function () {
                myself.object.arduino.disconnect();
            });
    return menu;
};

// Snap! menus
// Adding Snap4Arduino extra options to snapMenu, projectMenu and settingsMenu
IDE_Morph.prototype.originalSnapMenu = IDE_Morph.prototype.snapMenu;
IDE_Morph.prototype.snapMenu = function () {
    this.originalSnapMenu();
    var menu = this.world().activeMenu;

    // adding s4a items
    menu.addLine();
    menu.addItem('About Snap4Arduino...', 'aboutSnap4Arduino');
    menu.addLine();
    menu.addItem('Snap4Arduino website', 
        function() {
            window.open('http://snap4arduino.rocks', 'Snap4ArduinoWebsite'); 
        }
    );
    menu.addItem('Snap4Arduino repository',
        function () {
            window.open('http://github.com/bromagosa/Snap4Arduino', 'SnapSource');
        }
    );

    menu.popup(this.world(), this.logo.bottomLeft());
};

IDE_Morph.prototype.originalSettingsMenu = IDE_Morph.prototype.settingsMenu;
IDE_Morph.prototype.settingsMenu = function () {
    this.originalSettingsMenu();

    // adding extra s4a items only for Desktop version
    if (document.title == '') {
        var menu = this.world().activeMenu,
            pos = this.controlBar.settingsButton.bottomLeft();

        menu.addLine();
        // http server option
        menu.addItem(
            (this.isServerOn ? '\u2611 ' : '\u2610 ') + localize('HTTP server'),
                'toggleServer',
                this.isServerOn ? 'uncheck to stop\nHTTP server' : 'check to start\nHTTP server, allowing\nremote control\nof Snap4Arduino'
        );
        if (this.isServerOn) {
            menu.addItem(
                (this.isStagePublic ? '\u2611 ' : '\u2610 ') + localize('Public stage'),
                'togglePublicStage',
                this.isStagePublic ? 'uncheck to prevent the stage\nfrom being viewed\nfrom the HTTP server' : 'check to allow the stage\nto be viewed\nfrom the HTTP server'
            );
        }
        // network serial port option
        menu.addItem(
            (Arduino.prototype.networkPortsEnabled ? '\u2611 ' : '\u2610 ') + localize('Network serial ports'),
            function () {
                Arduino.prototype.networkPortsEnabled = !Arduino.prototype.networkPortsEnabled;
                if (Arduino.prototype.networkPortsEnabled) {
                    this.saveSetting('network-ports-enabled', true);
                } else {
                    this.removeSetting('network-ports-enabled');
                }
            },
            Arduino.prototype.networkPortsEnabled ? 'uncheck to disable\nserial ports over\nnetwork' : 'check to enable\nserial ports over\nnetwork'
        );

        menu.popup(this.world(), pos);
    }
};

IDE_Morph.prototype.originalProjectMenu = IDE_Morph.prototype.projectMenu;
IDE_Morph.prototype.projectMenu = function () {
    this.originalProjectMenu();
    var menu = this.world().activeMenu,
        pos = this.controlBar.projectButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    // adding s4a items
    menu.addLine();
    menu.addItem('Open from URL...', 'openFromUrl');
    menu.addItem('Save, share and get URL...', 'saveAndShare');
    menu.addLine();
    menu.addItem(
        'New Arduino translatable project', 
        'createNewArduinoProject',
        'Experimental feature!\nScripts written under this\n'
            + 'mode will be translatable\nas Arduino sketches'
    );
    menu.addLine();
    menu.addItem(
        'Start a Snap Jr. session', 
        'startSnapJr',
        'Start Snap4Arduino in an\nicon-based blocks mode\n'
            + 'for the youngest programmers'
    );

    menu.popup(this.world(), pos);
};

IDE_Morph.prototype.originalApplySavedSettings = IDE_Morph.prototype.applySavedSettings;
IDE_Morph.prototype.applySavedSettings = function () {
    this.originalApplySavedSettings();

    if (this.getSetting('network-ports-enabled')) {
        Arduino.prototype.networkPortsEnabled = true;
    } else {
        Arduino.prototype.networkPortsEnabled = false;
    }

    Arduino.prototype.hostname = this.getSetting('network-serial-hostname') || 'tcp://arduino.local:23';
};

IDE_Morph.prototype.fileImport = function () {
    var myself = this,
        inp = document.createElement('input');
    if (this.filePicker) {
        document.body.removeChild(myself.filePicker);
        this.filePicker = null;
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
    this.filePicker = inp;
    inp.click();
};

//Not decorated to show original Snap! logo
IDE_Morph.prototype.aboutSnap = function () {
    var dlg, aboutTxt, noticeTxt, creditsTxt, versions = '', translations,
        module, btn1, btn2, btn3, btn4, licenseBtn, translatorsBtn,
        world = this.world();

    aboutTxt = 'Snap! 6.7.1\nBuild Your Own Blocks\n\n'
        + 'Copyright \u24B8 2008-2021 Jens M\u00F6nig and '
        + 'Brian Harvey\n'
        + 'jens@moenig.org, bh@cs.berkeley.edu\n\n'
        + '        Snap! is developed by the University of California, '
        + 'Berkeley and SAP        \n'
        + 'with support from the National Science Foundation (NSF),\n'
        + 'MIOsoft and YC Research.\n'
        + 'The design of Snap! is influenced and inspired by Scratch,\n'
        + 'from the Lifelong Kindergarten group at the MIT Media Lab\n\n'

        + 'for more information see https://snap.berkeley.edu';

    noticeTxt = localize('License')
        + '\n\n'
        + 'Snap! is free software: you can redistribute it and/or modify\n'
        + 'it under the terms of the GNU Affero General Public License as\n'
        + 'published by the Free Software Foundation, either version 3 of\n'
        + 'the License, or (at your option) any later version.\n\n'

        + 'This program is distributed in the hope that it will be useful,\n'
        + 'but WITHOUT ANY WARRANTY; without even the implied warranty of\n'
        + 'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n'
        + 'GNU Affero General Public License for more details.\n\n'

        + 'You should have received a copy of the\n'
        + 'GNU Affero General Public License along with this program.\n'
        + 'If not, see http://www.gnu.org/licenses/\n\n'

        + 'Want to use Snap! but scared by the open-source license?\n'
        + 'Get in touch with us, we\'ll make it work.';

    creditsTxt = localize('Contributors')
        + '\n\nNathan Dinsmore: Saving/Loading, Snap-Logo Design, '
        + '\ncountless bugfixes and optimizations'
        + '\nMichael Ball: Time/Date UI, Library Import Dialog,'
        + '\ncountless bugfixes and optimizations'
        + '\nBernat Romagosa: Countless contributions'
        + '\nBartosz Leper: Retina Display Support'
        + '\nZhenlei Jia and Dariusz Dorożalski: IME text editing'
        + '\nKen Kahn: IME support and countless other contributions'
        + '\nJosep Ferràndiz: Video Motion Detection'
        + '\nJoan Guillén: Countless contributions'
        + '\nKartik Chandra: Paint Editor'
        + '\nCarles Paredes: Initial Vector Paint Editor'
        + '\n"Ava" Yuan Yuan, Dylan Servilla: Graphic Effects'
        + '\nKyle Hotchkiss: Block search design'
        + '\nBrian Broll: Many bugfixes and optimizations'
        + '\nIan Reynolds: UI Design, Event Bindings, '
        + 'Sound primitives'
        + '\nJadga Hügle: Icons and countless other contributions'
        + '\nIvan Motyashov: Initial Squeak Porting'
        + '\nLucas Karahadian: Piano Keyboard Design'
        + '\nDavide Della Casa: Morphic Optimizations'
        + '\nAchal Dave: Web Audio'
        + '\nJoe Otto: Morphic Testing and Debugging';

    for (module in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, module)) {
            versions += ('\n' + module + ' (' +
                            modules[module] + ')');
        }
    }
    if (versions !== '') {
        versions = localize('current module versions:') + ' \n\n' +
            'morphic (' + morphicVersion + ')' +
            versions;
    }
    translations = localize('Translations') + '\n' + SnapTranslator.credits();

    dlg = new DialogBoxMorph();

    function txt(textString) {
        var tm = new TextMorph(
                textString,
                dlg.fontSize,
                dlg.fontStyle,
                true,
                false,
                'center',
                null,
                null,
                MorphicPreferences.isFlat ? null : new Point(1, 1),
                WHITE
            ),
            scroller,
            maxHeight = world.height() - dlg.titleFontSize * 10;
        if (tm.height() > maxHeight) {
            scroller = new ScrollFrameMorph();
            scroller.acceptsDrops = false;
            scroller.contents.acceptsDrops = false;
            scroller.bounds.setWidth(tm.width());
            scroller.bounds.setHeight(maxHeight);
            scroller.addContents(tm);
            scroller.color = new Color(0, 0, 0, 0);
            return scroller;
        }
        return tm;
    }


    dlg.inform('About Snap', aboutTxt, world, this.snapLogo); //changed in Snap4Arduino
    btn1 = dlg.buttons.children[0];
    translatorsBtn = dlg.addButton(
        () => {
            dlg.addBody(txt(translations));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Translators...'
    );
    btn2 = dlg.addButton(
        () => {
            dlg.addBody(txt(aboutTxt));
            dlg.body.fixLayout();
            btn1.show();
            btn2.hide();
            btn3.show();
            btn4.show();
            licenseBtn.show();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Back...'
    );
    btn2.hide();
    licenseBtn = dlg.addButton(
        () => {
            dlg.addBody(txt(noticeTxt));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'License...'
    );
    btn3 = dlg.addButton(
        () => {
            dlg.addBody(txt(versions));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Modules...'
    );
    btn4 = dlg.addButton(
        () => {
            dlg.addBody(txt(creditsTxt));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            translatorsBtn.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Credits...'
    );
    translatorsBtn.hide();
    dlg.fixLayout();
};

IDE_Morph.prototype.aboutSnap4Arduino = function () {
    var dlg, aboutTxt, creditsTxt, translations,
    module, aboutBtn, creditsBtn,
    world = this.world();

    dlg = new DialogBoxMorph();

    function txt(textString) {
        var tm = new TextMorph(
                textString,
                dlg.fontSize,
                dlg.fontStyle,
                true,
                false,
                'center',
                null,
                null,
                MorphicPreferences.isFlat ? null : new Point(1, 1),
                WHITE
            ),
            scroller,
            maxHeight = world.height() - dlg.titleFontSize * 10;
        if (tm.height() > maxHeight) {
            scroller = new ScrollFrameMorph();
            scroller.acceptsDrops = false;
            scroller.contents.acceptsDrops = false;
            scroller.bounds.setWidth(tm.width());
            scroller.bounds.setHeight(maxHeight);
            scroller.addContents(tm);
            scroller.color = new Color(0, 0, 0, 0);
            return scroller;
        }
        return tm;
    }

    this.getURL('version', function (version) {
        
        aboutTxt = 'Snap4Arduino ' + version +'\n'
        + 'http://snap4arduino.rocks\n\n'

        + 'Copyright \u24B8 2018-2021 Bernat Romagosa and Joan Guillén\n'
        + 'https://github.com/bromagosa/snap4arduino\n\n'

        + 'Copyright \u24B8 2016-2017 Bernat Romagosa and Arduino.org\n\n'

        + 'Copyright \u24B8 2015 Citilab\n'
        + 'edutec@citilab.eu\n\n'

        + 'Snap4Arduino is a modification of Snap! originally developed\n'
        + 'by the Edutec research group at the Citilab, Cornellà de\n'
        + 'Llobregat (Barcelona).'

        dlg.inform('About Snap4Arduino', aboutTxt, world, this.logo.cachedTexture);
    });
    
    creditsTxt = localize('Contributors')
        + '\n\nErnesto Laval: MacOSX version, architectural decisions,\n'
        + 'several features and bugfixes, Spanish translation\n'
        + 'José García, Joan Güell and Víctor Casado: SnapJr mode,\n'
        + 'architectural decisions, several bug reports, testing and\n'
        + 'unvaluable help in many other regards.\n'
        + 'Josep Ferràndiz: Extensive testing, vision\n'
        + 'Frank Hunleth: GNU/Linux 64b version\n'
        + 'Ove Risberg: Network to serial port functionality\n'
        + 'Mareen Przybylla: Early testing, several bug reports,\n'
        + 'German translation, architectural decisions\n'
        + 'Steven Tang and Jeffrey (Ying-Chieh) Chao:\n\t\tSimplified Chinese translation\n'
        + 'Jeffrey (Ying-Chieh) Chao: Traditional Chinese translation\n'
        + 'Alberto Firpo: Italian translation\n'
        + 'Yaroslav Kirov: Ukrainian and Russian translations\n'
        + 'Sjoerd Dirk Meijer: Dutch translation\n'
        + 'Lior Assouline: Hebrew translation\n'
        + 'Manuel Menezes de Sequeira: Portuguese (Portugal) translation\n'
        + 'Hasso Tepper: Estonian translation\n'
        + 'Triyan W. Nugroho: Bahasa Indonesian translation\n'
        + 'Huseyin Yildiz: Turkish translation\n'
        + 'Lee Jubeen: Korean translation\n'
        + 'Asier Iturralde: Basque translation\n'
        + 'Serhiy Kryzhanovsky: Ukrainian translation';

    creditsBtn = dlg.addButton(
        function () {
            dlg.addBody(txt(creditsTxt));
            dlg.body.fixLayout();
            aboutBtn.show();
            creditsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Contributions...'
    );
    aboutBtn = dlg.addButton(
        function () {
            dlg.addBody(txt(aboutTxt));
            dlg.body.fixLayout();
            aboutBtn.hide();
            creditsBtn.show();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'About Snap4Arduino...'
    );
    aboutBtn.hide();
    dlg.fixLayout();
};

IDE_Morph.prototype.originalGetCostumesList = IDE_Morph.prototype.getCostumesList;
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

    // the logo texture is not loaded dynamically as an image, but instead
    // hard-copied here to avoid tainting the world canvas. This lets us
    // use Snap's (and Morphic's) color pickers to sense any pixel which
    // otherwise would be compromised by annoying browser security.

    // this.logo.texture = this.logoURL; // original code, commented out
    this.logo.texture = 's4a_logo_sm.png'; // Overriden for Snap4Arduino
    this.snapLogo = new Image();
    this.snapLogo.src = "data:image/png;base64," +
        "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" +
        "gg=="; 

    this.logo.render = function (ctx) {
        var gradient = ctx.createLinearGradient(
                0,
                0,
                this.width(),
                0
            );
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(0.5, myself.frameColor.toString());
        ctx.fillStyle = MorphicPreferences.isFlat ?
                myself.frameColor.toString() : gradient;
        ctx.fillRect(0, 0, this.width(), this.height());
        if (this.cachedTexture) {
            this.renderCachedTexture(ctx);
        } else if (this.texture) {
            this.renderTexture(this.texture, ctx);
        }
    };

    this.logo.renderCachedTexture = function (ctx) {
        ctx.drawImage(
            this.cachedTexture,
            5,
            Math.round((this.height() - this.cachedTexture.height) / 2)
        );
        this.changed();
    };

    this.logo.mouseClickLeft = function () {
        myself.snapMenu();
    };

    this.logo.color = BLACK;
    this.logo.setExtent(new Point(200, 28)); // dimensions are fixed
    this.add(this.logo);
};

function homePath() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + ((process.platform == 'win32') ? '\\' : '/')
};

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
        s4aSrc = 's4a/lang-' + lang + '.js',
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
// while a board is connected (it is not freed for the new sprites)
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

IDE_Morph.prototype.pushProject = function () {
    var projectContents = this.serializer.serialize(this.stage),
    myself = this;

    new DialogBoxMorph(
            null,
            function (url) {
                myself.doPushProject(projectContents, url);
            }
    ).withKey('pushProject').prompt(
        'Push project',
        document.location.hostname + ':8080',
        this.world()
        );
};

IDE_Morph.prototype.doPushProject = function (contents, url) {
    var myself = this,
        http = new XMLHttpRequest();

    http.open('POST', 'http://' + url, true);

    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            myself.inform(
                    'Done',
                    http.responseText);
        } else if (http.readyState === 4 && status !== 200) {
            myself.inform(
                    'Error',
                    http.responseText);
        }
    };

    http.send(contents);
};

IDE_Morph.prototype.openFromUrl = function () {
    this.prompt('Enter project URL', function (url) {
        window.location.href = '#' + url.replace(/.*#/g,'') + '&editMode';
        window.onbeforeunload = nop;
        window.location.reload();
    });
};

IDE_Morph.prototype.saveAndShare = function () {
    var myself = this;

    if (!this.projectName) {
        myself.prompt(
                'Please enter a name for your project', 
                function (name) { 
                    myself.projectName = name;
                    myself.doSaveAndShare();
                });
    } else {
        this.doSaveAndShare();
    }
};

IDE_Morph.prototype.doSaveAndShare = function () {
    var myself = this,
        projectName = this.projectName;

    this.showMessage('Saving project\nto the cloud...');
    this.setProjectName(projectName);

    Cloud.saveProject(
        this,
        function () {
            myself.showMessage('sharing\nproject...');
            Cloud.shareProject(
                projectName,
                null, // username is implicit
                function () {
                    myself.showProjectUrl(projectName);
                    myself.showMessage('shared.');
                },
                myself.cloudError()
            );
        },
        this.cloudError()
    );
};

IDE_Morph.prototype.showProjectUrl = function (projectName) {
    var info = new DialogBoxMorph(),
        label = localize('This project is now public at the following URL:'), 
        txt = new InputFieldMorph(
            this.cloud.urlForMyProject(projectName),
            false, // no numeric
            null, // no choices
            false // readOnly, to get a selected text
        );
    info.labelString = label;
    txt.setWidth(Math.max(txt.contents().text.text.length*6,label.length*8));
    info.createLabel();
    info.addBody(txt);
    info.addButton('ok', 'OK');
    info.fixLayout();
    info.popUp(this.world());
};

// SnapJr.

IDE_Morph.prototype.startSnapJr = function () {
    var myself = this;
    this.showMessage(localize('Loading Snap Jr.'));
    this.getURL(
        'Examples/SnapJunior.xml',
        function (contents) {
            myself.droppedText(contents, 'Snap Jr.');
            location.hash = '#loadJr';
        }
    );
};

// EXPERIMENTAL: Arduino translation mode
IDE_Morph.prototype.createNewArduinoProject = function () {
    var myself = this;
    this.confirm(
        'Replace the current project with a new one?',
        'New Arduino translatable Project',
        function () { myself.newArduinoProject(); });
};

IDE_Morph.prototype.newArduinoProject = function() {
    var myself = this;

    this.newProject();
    SpriteMorph.prototype.initBlocks();

    // toggle codification
    StageMorph.prototype.enableCodeMapping = true;
    this.currentSprite.blocksCache.variables = null;

    // UI changes
    // Ok, these decorator names are getting silly
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
   
    SpriteMorph.prototype.categories.forEach(function (category) { 
        Object.keys(defs).forEach(function (selector) {
            if (!defs[selector].transpilable) {
                StageMorph.prototype.hiddenPrimitives[selector] = true;
            }
        });
        myself.flushBlocksCache(category) 
    });

    // hide empty categories
    if (!this.isArduinoTranslationMode) {
        this.categories.children.forEach(function (each) { each.originalPosition = each.position() });
        this.categories.children[9].setPosition(this.categories.children[4].position());
        this.categories.children[8].setPosition(this.categories.children[3].position());
        this.categories.children[7].setPosition(this.categories.children[2].position());
        this.categories.children[5].setPosition(this.categories.children[1].position());
        this.categories.children[1].setPosition(this.categories.children[0].position());

        this.categories.children[0].hide(); // Motion
        this.categories.children[2].hide(); // Looks
        this.categories.children[3].hide(); // Sensing
        this.categories.children[4].hide(); // Sound
        this.categories.children[6].hide(); // Pen

        this.categories.setHeight(this.categories.height() - 30);
    }

    this.isArduinoTranslationMode = true;

    this.currentSprite.paletteCache.variables = null;
    this.refreshPalette();
};

IDE_Morph.prototype.createNewProject = function () {
    var myself = this;
    this.confirm(
            'Replace the current project with a new one?',
            'New Project',
            function () {
                if (myself.isArduinoTranslationMode) {
                    StageMorph.prototype.blockTemplates = StageMorph.prototype.notSoOriginalBlockTemplates;
                    SpriteMorph.prototype.blockTemplates = SpriteMorph.prototype.notSoOriginalBlockTemplates;
                    myself.isArduinoTranslationMode = false;
                    // show all categories
                    
                    myself.categories.children.forEach(function (each) {
                        each.setPosition(each.originalPosition);
                        each.show();
                    });
                    
                    myself.categories.setHeight(myself.categories.height() + 30);
                }
                myself.newProject();
            }
            );
};

IDE_Morph.prototype.version = function () {
    return require('fs').readFileSync('version').toString();
};

// Can't be decorated, and we need to make sure the "other" category
// shows up
IDE_Morph.prototype.createCategories = function () {
    var myself = this;

    if (this.categories) {
        this.categories.destroy();
    }
    this.categories = new Morph();
    this.categories.color = this.groupColor;
    this.categories.bounds.setWidth(this.paletteWidth);
    // this.categories.getRenderColor = ScriptsMorph.prototype.getRenderColor;

    function addCategoryButton(category) {
        var labelWidth = 75,
            colors = [
                myself.frameColor,
                myself.frameColor.darker(MorphicPreferences.isFlat ? 5 : 50),
                SpriteMorph.prototype.blockColor[category]
            ],
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            () => {
                myself.currentCategory = category;
                myself.categories.children.forEach(each =>
                    each.refresh()
                );
                myself.refreshPalette(true);
            },
            category[0].toUpperCase().concat(category.slice(1)), // label
            () => myself.currentCategory === category, // query
            null, // env
            null, // hint
            labelWidth, // minWidth
            true // has preview
        );

        button.corner = 8;
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        if (MorphicPreferences.isFlat) {
            button.labelPressColor = WHITE;
        }
        button.fixLayout();
        button.refresh();
        myself.categories.add(button);
        return button;
    }

    function fixCategoriesLayout() {
        var buttonWidth = myself.categories.children[0].width(),
            buttonHeight = myself.categories.children[0].height(),
            border = 3,
            rows =  Math.ceil((myself.categories.children.length) / 2),
            xPadding = (200 // myself.logo.width()
                - border
                - buttonWidth * 2) / 3,
            yPadding = 2,
            l = myself.categories.left(),
            t = myself.categories.top(),
            i = 0,
            row,
            col;

        myself.categories.children.forEach(button => {
            i += 1;
            row = Math.ceil(i / 2);
            col = 2 - (i % 2);
            button.setPosition(new Point(
                l + (col * xPadding + ((col - 1) * buttonWidth)),
                t + (row * yPadding + ((row - 1) * buttonHeight) + border)
            ));
        });

        myself.categories.setHeight(
            (rows + 1) * yPadding
                + rows * buttonHeight
                + 2 * border
        );
    }

    SpriteMorph.prototype.categories.forEach(cat => {
        if (!contains(['lists'], cat)) {
            addCategoryButton(cat);
        }
    });
    fixCategoriesLayout();
    this.add(this.categories);
};


// Show URL of public projects in project list
ProjectDialogMorph.prototype.originalInstallCloudProjectList = ProjectDialogMorph.prototype.installCloudProjectList;
ProjectDialogMorph.prototype.installCloudProjectList = function (pl) {
    this.originalInstallCloudProjectList(pl);
    this.addUserMenuToListItems();
};

ProjectDialogMorph.prototype.originalBuildFilterField = ProjectDialogMorph.prototype.buildFilterField;
ProjectDialogMorph.prototype.buildFilterField = function () {
    var myself = this;

    this.originalBuildFilterField();

    this.filterField.originalReactToKeystroke = this.filterField.reactToKeystroke;
    this.filterField.reactToKeystroke = function (evt) {
        this.originalReactToKeystroke(evt);
        myself.addUserMenuToListItems();
    };
};

ProjectDialogMorph.prototype.addUserMenuToListItems = function () {
    var ide = this.ide;
    this.listField.listContents.children.forEach(function (menuItem) {
        if (menuItem.labelBold) { // shared project
            menuItem.userMenu = function () {
                var menu = new MenuMorph(this);
                menu.addItem(
                    'Show project URL',
                    function () {
                        ide.showProjectUrl(menuItem.labelString);
                    });
                return menu;
            };
        }
    });
};

