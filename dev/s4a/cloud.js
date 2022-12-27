Cloud.prototype.urlForMyProject = function (projectName) {
    if (!this.username) {
        throw new Error('You are not logged in');
        return;
    }

    return 'http://snap4arduino.rocks/run#present:Username=' + 
        encodeURIComponent(this.username) + '&ProjectName=' + 
        encodeURIComponent(projectName);
};

