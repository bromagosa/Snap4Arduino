var SnapCloud = new Cloud(
    'https://snap.apps.miosoft.com/SnapCloudLocal'
    );

Cloud.prototype.overrideUrl = function () {
    this.url = 'https://snap.apps.miosoft.com/SnapCloud';
};

Cloud.prototype.revertUrl = function () {
    this.url = 'https://snap.apps.miosoft.com/SnapCloudLocal';
};

Cloud.prototype.originalSignup = Cloud.prototype.signup;
Cloud.prototype.signup = function (username, email, callBack, errorCall) {
    this.overrideUrl();
    this.originalSignup(username, email, callBack, errorCall);
    this.revertUrl();
};

Cloud.prototype.originalResetPassword = Cloud.prototype.resetPassword;
Cloud.prototype.resetPassword = function (username, callBack, errorCall) {
    this.overrideUrl();
    this.originalResetPassword(username, callBack, errorCall);
    this.revertUrl();
};
