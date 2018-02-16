Cloud.prototype.urlForMyProject = function (projectName) {
    if (!this.username) {
        ide.showMessage('You are not logged in:\n' + err);
        throw new Error('You are not logged in:\n' + err);
        return;
    }

    return 'http://snap4arduino.rocks/run#present:Username=' + 
        encodeURIComponent(this.username) + '&ProjectName=' + 
        encodeURIComponent(projectName);
};

