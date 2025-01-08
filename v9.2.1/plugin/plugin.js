var currentExtensionId = 'fhmkennllhhclkcjcdaegceilcefedle',
    oldExtensionId = 'meajklokhjoflbimamdbhpdjlondmgpi',
    extensionId = currentExtensionId,
    postal = new Postal(),
    firmata = {
        Board: function(port, callback) {
            chrome.runtime.sendMessage(extensionId, { command: 'connectBoard', args: [ port ] }, callback)
        }
    },
    require = function () {};

// Messaging between web client and plugin

function Postal() {};

// Command sender function factory
Postal.prototype.commandSender = function () {
    var myself = this,
        command = arguments[0],
        args = Array.from(arguments).slice(1),
        callback = typeof args[args.length - 1] === 'function' ? args.splice(args.length - 1) : null;

    return function () { myself.sendCommand(command, args, callback); };
};

Postal.prototype.sendCommand = function (command, args, callback) {
    chrome.runtime.sendMessage(extensionId, { command: command, args: args }, callback);
};

chrome.serial = {
    getDevices: function (callback) { postal.sendCommand('getDevices', null, callback) }
};

// Checking if Snap4Arduino Connector (current or old, with different 'extensionId') are present
chrome.runtime.sendMessage(extensionId, {command:'getDevices'}, function (devices) { 
    if (chrome.runtime.lastError) {
        console.log("Current connector not found");
        extensionId = oldExtensionId;
        chrome.runtime.sendMessage(extensionId, {command:'getDevices'}, function (devices) {
            if (chrome.runtime.lastError) {
                console.log("Old connector has not been found either");
                extensionId = currentExtensionId;
            } else {
                console.log("Old connector found successfully");
            }
        });
    } else {
        console.log("Current connector found successfully");
    }
});
