IDE_Morph.prototype.originalOpenIn = IDE_Morph.prototype.openIn;
IDE_Morph.prototype.openIn = function (world) {
    this.originalOpenIn(world);
    this.checkForNewVersion();
    this.checkForCLIparams();
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
        fileName,
        param = 
            nw.App.argv.find(
                function (any) {
                    return any.indexOf('--load=') == 0; 
                }
            );
        
    if (param) {
        fileName = param.split('=')[1];
        require('fs').readFile(
            fileName,
            'utf8',
            function (err, data) {
                if (err) {
                    myself.inform(
                        'Error reading ' + fileName, 
                        'The file system reported:\n\n' + err);
                } else {
                    myself.droppedText(data);
                }
            }
        );
    }
};
