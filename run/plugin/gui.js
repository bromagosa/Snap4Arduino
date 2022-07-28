IDE_Morph.prototype.version = function() {
    return this.getURL('version');
};

IDE_Morph.prototype.openIn = function (world) {
    var hash, myself = this, urlLanguage = null;

    this.cloud.initSession(
        function (username) {
            if (username) {
                myself.source = 'cloud';
                if (!myself.cloud.verified) {
                        new DialogBoxMorph().inform(
                            'Unverified account',
                            'Your account is still unverified.\n' +
                            'Please use the verification link that\n' +
                            'was sent to your email address when you\n' +
                            'signed up.\n\n' +
                            'If you cannot find that email, please\n' +
                            'check your spam folder. If you still\n' +
                            'cannot find it, please use the "Resend\n' +
                            'Verification Email..." option in the cloud\n' +
                            'menu.',
                            world,
                            myself.cloudIcon(null, new Color(0, 180, 0))
                        );
                }
            }
        }
    );

    this.buildPanes();
    world.add(this);
    world.userMenu = this.userMenu;

    // override SnapCloud's user message with Morphic
    this.cloud.message = function (string) {
        var m = new MenuMorph(null, string),
            intervalHandle;
        m.popUpCenteredInWorld(world);
        intervalHandle = setInterval(function () {
            m.destroy();
            clearInterval(intervalHandle);
        }, 2000);
    };

    // prevent non-DialogBoxMorphs from being dropped
    // onto the World in user-mode
    world.reactToDropOf = function (morph) {
        if (!(morph instanceof DialogBoxMorph ||
        		(morph instanceof MenuMorph))) {
            if (world.hand.grabOrigin) {
                morph.slideBackTo(world.hand.grabOrigin);
            } else {
                world.hand.grab(morph);
            }
        }
    };

    this.reactToWorldResize(world.bounds);

    function getURL(url) {
        try {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send();
            if (request.status === 200) {
                return request.responseText;
            }
            throw new Error('unable to retrieve ' + url);
        } catch (err) {
            myself.showMessage('unable to retrieve project');
            return '';
        }
    }

    function applyFlags(dict) {
        if (dict.noCloud) {
            myself.cloud.disable();
        }
        if (dict.embedMode) {
            myself.setEmbedMode();
        }
        if (dict.editMode) {
            myself.toggleAppMode(false);
        } else {
            myself.toggleAppMode(true);
        }
        if (!dict.noRun) {
            autoRun();
        }
        if (dict.hideControls) {
            myself.controlBar.hide();
            window.onbeforeunload = nop;
        }
        if (dict.noExitWarning) {
            window.onbeforeunload = nop;
        }
        if (dict.blocksZoom) {
            myself.savingPreferences = false;
            myself.setBlocksScale(Math.max(1,Math.min(dict.blocksZoom, 12)));
            myself.savingPreferences = true;
        }

        // only force my world to get focus if I'm not in embed mode
        // to prevent the iFrame from involuntarily scrolling into view
        if (!myself.isEmbedMode) {
            world.worldCanvas.focus();
        }
    }

    function autoRun () {
        // wait until all costumes and sounds are loaded
        if (isLoadingAssets()) {
            myself.world().animations.push(
                new Animation(nop, nop, 0, 200, nop, autoRun)
            );
        } else {
            myself.runScripts();
        }
    }

    function isLoadingAssets() {
        return myself.sprites.asArray().concat([myself.stage]).some(any =>
            (any.costume ? any.costume.loaded !== true : false) ||
            any.costumes.asArray().some(each => each.loaded !== true) ||
            any.sounds.asArray().some(each => each.loaded !== true)
        );
    }

    // dynamic notifications from non-source text files
    // has some issues, commented out for now
    /*
    this.cloudMsg = getURL('http://snap.berkeley.edu/cloudmsg.txt');
    motd = getURL('http://snap.berkeley.edu/motd.txt');
    if (motd) {
        this.inform('Snap!', motd);
    }
    */

    function interpretUrlAnchors() {
        var dict, idx;

        if (location.hash.substr(0, 6) === '#open:') {
            hash = location.hash.substr(6);
            if (hash.charAt(0) === '%'
                    || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
                hash = decodeURIComponent(hash);
            }
            if (contains(
                    ['project', 'blocks', 'sprites', 'snapdata'].map(
                        function (each) {
                            return hash.substr(0, 8).indexOf(each);
                        }
                    ),
                    1
                )) {
                this.droppedText(hash);
            } else {
                idx = hash.indexOf("&");
                if (idx > 0) {
                    dict = myself.cloud.parseDict(hash.substr(idx));
                    dict.editMode = true;
                    hash = hash.slice(0, idx);
                    applyFlags(dict);
                }
                this.droppedText(getURL(hash));
            }
        } else if (location.hash.substr(0, 5) === '#run:') {
            dict = '';
            hash = location.hash.substr(5);

            //decoding if hash is an encoded URI
            if (hash.charAt(0) === '%'
                    || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
                hash = decodeURIComponent(hash);
            }
            idx = hash.indexOf("&");

            // supporting three URL cases

            // xml project
            if (hash.substr(0, 8) === '<project') {
                this.rawOpenProjectString(
                    hash.slice(0,hash.indexOf('</project>') + 10)
                );
                applyFlags(
                    myself.cloud.parseDict(
                        hash.substr(hash.indexOf('</project>') + 10)
                    )
                );
            // no project, only flags
            } else if (idx == 0){
                applyFlags(myself.cloud.parseDict(hash));
            // xml file path
            // three path types allowed:
            //  (1) absolute (http...),
            //  (2) relative to site ("/path") or
            //  (3) relative to folder ("path")
            } else {
                this.shield = new Morph();
                this.shield.alpha = 0;
                this.shield.setExtent(this.parent.extent());
                this.parent.add(this.shield);
                this.showMessage('Fetching project...');
                if (idx > 0) {
                    dict = myself.cloud.parseDict(hash.substr(idx));
                    hash = hash.slice(0,idx);
                }
                this.getURL(
                    hash,
                    projectData => {
                        var msg;
                        this.nextSteps([
                            () => msg = this.showMessage('Opening project...'),
                            () => {
                                if (projectData.indexOf('<snapdata') === 0) {
                                    this.rawOpenCloudDataString(projectData);
                                } else if (
                                    projectData.indexOf('<project') === 0
                                ) {
                                    this.rawOpenProjectString(projectData);
                                }
                                this.hasChangedMedia = true;
                            },
                            () => {
                                this.shield.destroy();
                                this.shield = null;
                                msg.destroy();
                                // this.toggleAppMode(true);
                                applyFlags(dict);
                            }
                        ]);
                    }
                );
            }
        } else if (location.hash.substr(0, 9) === '#present:') {
            this.shield = new Morph();
            this.shield.color = this.color;
            this.shield.setExtent(this.parent.extent());
            this.parent.add(this.shield);
            myself.showMessage('Fetching project\nfrom the cloud...');

            // make sure to lowercase the username
            dict = myself.cloud.parseDict(location.hash.substr(9));
            dict.Username = dict.Username.toLowerCase();

            myself.cloud.getPublicProject(
                dict.ProjectName,
                dict.Username,
                function (projectData) {
                    var msg;
                    myself.nextSteps([
                        function () {
                            msg = myself.showMessage('Opening project...');
                        },
                        function () {nop(); }, // yield (bug in Chrome)
                        function () {
                            if (projectData.indexOf('<snapdata') === 0) {
                                myself.rawOpenCloudDataString(projectData);
                            } else if (
                                projectData.indexOf('<project') === 0
                            ) {
                                myself.rawOpenProjectString(projectData);
                            }
                            myself.hasChangedMedia = true;
                        },
                        function () {
                            myself.shield.destroy();
                            myself.shield = null;
                            msg.destroy();
                            applyFlags(dict);
                        }
                    ]);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 7) === '#cloud:') {
            this.shield = new Morph();
            this.shield.alpha = 0;
            this.shield.setExtent(this.parent.extent());
            this.parent.add(this.shield);
            myself.showMessage('Fetching project\nfrom the cloud...');

            // make sure to lowercase the username
            dict = myself.cloud.parseDict(location.hash.substr(7));

            myself.cloud.getPublicProject(
                dict.ProjectName,
                dict.Username,
                function (projectData) {
                    var msg;
                    myself.nextSteps([
                        function () {
                            msg = myself.showMessage('Opening project...');
                        },
                        function () {nop(); }, // yield (bug in Chrome)
                        function () {
                            if (projectData.indexOf('<snapdata') === 0) {
                                myself.rawOpenCloudDataString(projectData);
                            } else if (
                                projectData.indexOf('<project') === 0
                            ) {
                                myself.rawOpenProjectString(projectData);
                            }
                            myself.hasChangedMedia = true;
                        },
                        function () {
                            myself.shield.destroy();
                            myself.shield = null;
                            msg.destroy();
                            myself.toggleAppMode(false);
                        }
                    ]);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 4) === '#dl:') {
            myself.showMessage('Fetching project\nfrom the cloud...');

            // make sure to lowercase the username
            dict = myself.cloud.parseDict(location.hash.substr(4));
            dict.Username = dict.Username.toLowerCase();

            myself.cloud.getPublicProject(
                dict.ProjectName,
                dict.Username,
                function (projectData) {
                	myself.saveXMLAs(projectData, dict.ProjectName);
                 	myself.showMessage(
                  	   'Saved project\n' + dict.ProjectName,
                      	2
                 	);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 6) === '#lang:') {
            dict = myself.cloud.parseDict(location.hash.substr(6));
            applyFlags(dict);
        } else if (location.hash.substr(0, 7) === '#signup') {
            this.createCloudAccount();
        } else if (location.hash.substr(0, 7) === '#loadJr') {
            this.startSnapJr();
        }
    this.loadNewProject = false;
    }

    function launcherLangSetting() {
        var langSetting = null;
        if (location.hash.substr(0, 6) === '#lang:') {
            if (location.hash.charAt(8) === '_') {
                langSetting = location.hash.slice(6,11);
            } else {
                langSetting = location.hash.slice(6,8);
            }
        }
        // lang-flag wins lang-anchor setting
        langSetting = myself.cloud.parseDict(location.hash).lang || langSetting;
        return langSetting;
    }

    if (launcherLangSetting()) {
        // launch with this non-persisten lang setting
        this.loadNewProject = true;
        this.setLanguage(launcherLangSetting(), interpretUrlAnchors, true);
    } else if (this.userLanguage) {
        this.loadNewProject = true;
        this.setLanguage(this.userLanguage, interpretUrlAnchors);
    } else {
        interpretUrlAnchors.call(this);
    }
};

