IDE_Morph.prototype.originalOpenIn = IDE_Morph.prototype.openIn;
IDE_Morph.prototype.openIn = function (world) {
//    this.checkForCLIparams();
    this.originalOpenIn(world);
    this.checkForNewVersion();
};

IDE_Morph.prototype.original2NewProject = IDE_Morph.prototype.newProject;
IDE_Morph.prototype.newProject = function () {
    var myself = this;
    function asyncDroppedText(aString) {
        if (aString.indexOf('<project') === 0) {
            return myself.openProjectString(aString);
        }
        if (aString.indexOf('<snapdata') === 0) {
            return myself.openCloudDataString(aString);
        }
        if (aString.indexOf('<blocks') === 0) {
            return myself.openBlocksString(aString, 'blocks', true);
        }
        if (aString.indexOf('<sprites') === 0) {
            return myself.openSpritesString(aString);
        }
        if (aString.indexOf('<media') === 0) {
            return myself.openMediaString(aString);
        }
        if (aString.indexOf('<script') === 0) {
            return myself.openScriptString(aString);
        }
    };

    if (this.arePendingCliParams) {

        this.arePendingCliParams = false;

        function loadPendingCli () {
            if (this.loadPendingCliParam) {
                if (this.loadPendingCliParam == 'jr') {
                    this.startSnapJr();
                } else {
                    //this.openProjectString(this.loadPendingCliParam);
                    asyncDroppedText(this.loadPendingCliParam);
                    this.setURL('#open:' + this.loadPendingCliParam);
                }
                this.loadPendingCliParam = false;
            }
        }

        if (this.langPendingCliParam) {
            this.setLanguage(this.langPendingCliParam, loadPendingCli);
            this.langPendingCliParam = false;

        } else {

            loadPendingCli.call(this);
        }

        return;
    } else {

        this.original2NewProject();
    }

};

IDE_Morph.prototype.checkForNewVersion = function () {
    var myself = this;
    this.getURL(
        'https://api.github.com/repos/bromagosa/Snap4Arduino/releases/latest',
        function (response) {
            var currentName = myself.sn4a_version(),
                current = currentName.split('.'),
                latestName = JSON.parse(response).tag_name,
                latest = latestName.split('.'),
                versionLength = Math.max(current.length, latest.length);

            console.log('current: ' + currentName);
            console.log('latest: ' + latestName);

            function outdatedVersion () {
                for (var i = 0; i < versionLength; i += 1) {
                    current[i] = Number(current[i]) || 0;
                    latest[i] = Number(latest[i]) || 0;
                    if (current[i] < latest[i]) {
                        return true;
                    }
                    if (current[i] > latest[i]) {
                        return false;
                    }
                }
                return false;
            };

            if (outdatedVersion()) {
                this.confirm(
                    'A new version of Snap4Arduino has been released: '
                    + latestName
                    + '\nDo you wish to download it?',
                    'New version available',
                    function () {
                        myself.downloadVersion(latestName);
                    }
                );
            }
        }
    );
};

IDE_Morph.prototype.downloadVersion = function (versionName) {
    var os = this.osName();

    nw.Shell.openExternal(
        'https://github.com/bromagosa/Snap4Arduino/releases/download/'
            + versionName 
            + '/Snap4Arduino_desktop-'
            + os
            + '-'
            + this.arch()
            + '_'
            + versionName
            + (os === 'gnu' ? '.tar.gz' : '.zip')
    );
};

IDE_Morph.prototype.osName = function () {
    var platform = require('os').platform(),
        platformDict = {
            'linux' : 'gnu',
            'win32' : 'win',
            'darwin': 'osx'
        };

    return platformDict[platform];
};

IDE_Morph.prototype.arch = function () {
    return ((require('os').arch() === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'))
            ? 64 
            : 32);
};

IDE_Morph.prototype.checkForCLIparams = function () {
    var myself = this,
        language, fileName,
        fs = require('fs'),
        params = nw.App.argv;

    params.forEach(function (each) {
        if (each.indexOf('--load=') === 0) {
            fileName = each.split('=')[1];
            fs.readFile(
                fileName,
                'utf8',
                function (err, data) {
                    if (err) {
                        myself.inform(
                            'Error reading ' + fileName, 
                            'The file system reported:\n\n' + err);
                    } else {
                        if (myself.userLanguage) {
                            location.hash = '#open:' + data;
                            myself.loadNewProject = true;
                        } else {
                            myself.droppedText(data);
                        }
                    }
                }
            ); 
        } else if (each.indexOf('--lang') === 0) {
            language = each.split('=')[1];
            fileName = 's4a/lang-' + language + '.js';
            if (!fs.existsSync(fileName)) {
                // we just need this file to exist, that's all
                fs.writeFileSync(fileName, '');
            }
            myself.userLanguage = (language !== 'en') ? language : null;
            myself.loadNewProject = true;
        }
    });
};
