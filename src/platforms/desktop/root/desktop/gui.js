IDE_Morph.prototype.originalOpenIn = IDE_Morph.prototype.openIn;
IDE_Morph.prototype.openIn = function (world) {
    this.originalOpenIn(world);
    this.checkForNewVersion();
};

IDE_Morph.prototype.checkForNewVersion = function () {
    var myself = this,
        latest = this.getURL('http://snap4arduino.org/downloads/LATEST'),
        current = this.version();
    
    if (current !== latest) {
        this.confirm(
            'A new version of Snap4Arduino has been released: ' 
                + latest 
                + '\nDo you wish to download it?',
            'New version available',
            function () {
                myself.downloadVersion(latest);
            });
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
