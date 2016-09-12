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

IDE_Morph.prototype.aboutSnap4Arduino = function () {
    var dlg, aboutTxt, creditsTxt, translations,
    module, aboutBtn, creditsBtn,
    world = this.world();

    aboutTxt = 'Snap4Arduino! ' + this.version() +'\n\n'
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
    + 'Alberto Firpo: Italian translation\n'
    + 'Yaroslav Kirov: Ukrainian and Russian translations\n'
    + 'Lior Assouline: Hebrew translation\n'
    + 'Manuel Menezes de Sequeira: Portuguese (Portugal) translation';

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
