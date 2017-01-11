IDE_Morph.prototype.version = function () {
    return this.versionName;
};

IDE_Morph.prototype.originalGetURL = IDE_Morph.prototype.getURL;
IDE_Morph.prototype.getURL = function (url, callback) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.onload = function(e) {
        callback(this.responseText);
    };
    request.send();
};
