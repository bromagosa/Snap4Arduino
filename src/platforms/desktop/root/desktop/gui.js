IDE_Morph.prototype.originalOpenIn = IDE_Morph.prototype.openIn;
IDE_Morph.prototype.openIn = function (world) {
    this.checkForCLIparams();
    this.originalOpenIn(world);
    this.checkForNewVersion();
};

IDE_Morph.prototype.checkForNewVersion = function () {
    var myself = this,
        latest = this.getURL('http://snap4arduino.org/downloads/LATEST'),
        current = this.version();

    function outdatedVersion (current, latest) {
        var current = current.split('.'),
            latest = latest.split('.'),
            versionLength = Math.max(current.length, latest.length);

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

    if (outdatedVersion(current, latest)) {
        this.confirm(
            'A new version of Snap4Arduino has been released: ' 
                + latest 
                + '\nDo you wish to download it?',
            'New version available',
            function () {
                myself.downloadVersion(latest);
            }
        );
    }
};

IDE_Morph.prototype.downloadVersion = function (versionName) {
    var os = this.osName();

    nw.Shell.openExternal(
        'http://snap4arduino.org/downloads/'
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
