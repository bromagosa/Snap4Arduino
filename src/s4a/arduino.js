// utility functions
unique = function (anArray) {
    return anArray.filter(function (elem, pos) { 
        return anArray.indexOf(elem) == pos; 
    });
};

// Arduino prototype
function Arduino (owner) {
    this.owner = owner;
    this.board = undefined;	// Reference to arduino board - to be created by new firmata.Board()
    this.connecting = false;	// Flag to avoid multiple attempts to connect
    this.disconnecting = false;  // Flag to avoid serialport communication when it is being closed
    this.justConnected = false;	// Flag to avoid double attempts
    this.keepAliveIntervalID = null;
};

// This function just asks for the version and checks if we've received it after a timeout
Arduino.prototype.keepAlive = function () {
    if (Arduino.keepAlive) {
        if (this.board.version.major !== undefined) {
            // Everything looks fine, let's try again
            this.board.version = {};
            try {
                this.board.reportVersion(nop);
            } catch (err) {
                this.disconnect();
            }
        } else {
            // Connection dropped! Let's disconnect!
            this.disconnect(); 
        }
    }
};

Arduino.prototype.disconnect = function (silent) {
    // Prevent disconnection attempts before board is actually connected
    if (this.board && this.isBoardReady()) {
        this.disconnecting = true;
        if (this.port === 'network') {
            this.board.sp.destroy();
        } else {
            if (this.board.sp && !this.board.sp.disconnected) {
                if (!this.connecting) {
                    // otherwise something went wrong in the middle of a connection attempt
                    this.board.sp.close();
                } 
            }
        }
        this.closeHandler(silent);
    } else {
        if (!silent) {
            ide.inform(this.owner.name, localize('Board is not connected'))
        }
    } 
};

// This should belong to the IDE
Arduino.prototype.showMessage = function (msg) {
    if (!this.message) { this.message = new DialogBoxMorph() };

    var txt = new TextMorph(
            msg,
            this.fontSize,
            this.fontStyle,
            true,
            false,
            'center',
            null,
            null,
            MorphicPreferences.isFlat ? null : new Point(1, 1),
            new Color(255, 255, 255)
            );

    if (!this.message.key) { this.message.key = 'message' + this.owner.name + msg };

    this.message.labelString = this.owner.name;
    this.message.createLabel();
    if (msg) { this.message.addBody(txt) };
    this.message.drawNew();
    this.message.fixLayout();
    this.message.popUp(world);
    this.message.show();
};

Arduino.prototype.hideMessage = function () {
    if (this.message) {
        this.message.cancel();
        this.message = null;
    }
};

Arduino.prototype.attemptConnection = function () {
    var myself = this,
        networkPortsEnabled = Arduino.prototype.networkPortsEnabled;

    if (!this.connecting) {
        if (this.board === undefined) {
            // Get list of ports (Arduino compatible)
            Arduino.getSerialPorts(function (ports) {
                var portMenu = new MenuMorph(this, 'select a port'),
                    portCount = Object.keys(ports).length;

                if (portCount >= 1) {
                    Object.keys(ports).forEach(function (each) {
                        portMenu.addItem(each, function () { 
                            myself.connect(each);
                        })
                    });
                }
                if (networkPortsEnabled) {
                    portMenu.addLine();
                    portMenu.addItem('Network port', function () {
                        myself.networkDialog();
                    });
                }
                if (networkPortsEnabled || portCount > 1) {
                    portMenu.popUpAtHand(world);
                } else if (!networkPortsEnabled && portCount === 1) {
                    myself.connect(Object.keys(ports)[0]);
                }
            });
        } else {
            ide.inform(myself.name, localize('There is already a board connected to this sprite'));
        }
    }

    if (this.justConnected) {
        this.justConnected = undefined;
        return;
    }
};

Arduino.prototype.closeHandler = function (silent) {

    var portName = 'unknown';

    clearInterval(this.keepAliveIntervalID);

    if (this.board) {
        portName = this.board.sp.path;

        this.board.sp.removeAllListeners();
        this.board.sp = undefined;

        this.board = undefined;
    };

    Arduino.unlockPort(this.port);
    this.connecting = false;
    this.disconnecting = false;

    if (this.gotUnplugged & !silent) {
        ide.inform(
                this.owner.name,
                localize('Board was disconnected from port\n') 
                + portName 
                + '\n\nIt seems that someone pulled the cable!');
        this.gotUnplugged = false;
    } else if (!silent) {
        ide.inform(this.owner.name, localize('Board was disconnected from port\n') + portName);
    }
};

Arduino.prototype.disconnectHandler = function () {
    // This fires up when the cable is unplugged
    this.gotUnplugged = true;
};

Arduino.prototype.errorHandler = function (err) {
    ide.inform(
            this.owner.name,
            localize('An error was detected on the board\n\n')
            + err,
            this.disconnect(true));
};

Arduino.prototype.networkDialog = function () {
    new DialogBoxMorph(
            this, // target
            'connectNetwork', // action
            this // environment
            ).prompt(
                'Enter hostname or ip address:', // title
                this.hostname, // default
                this.owner.world() // world
                );
};

Arduino.prototype.connectNetwork = function (host) {
    var myself = this,
        net = require('net'),
        hostname,
        port;

    if (host.indexOf('tcp://') === 0) {
        host = host.slice(6);
    }

    hostname = host.split(':')[0];
    port = host.split(':')[1] || 23;

    this.hostname = 'tcp://' + hostname + ':' + port;

    this.owner.parentThatIsA(IDE_Morph).saveSetting('network-serial-hostname', this.hostname);

    this.disconnect(true);

    this.showMessage(localize('Connecting to network port:\n') + this.hostname + '\n\n' + localize('This may take a few seconds...'));
    this.connecting = true;

    var client = net.connect(
            { 
                host: hostname,
                port: port
            },
            function () {
                var socket = this;
                myself.board = new Arduino.firmata.Board(socket, function(err) {
                    if (!err) {
                        // Clear timeout to avoid problems if connection is closed before timeout is completed
                        clearTimeout(myself.connectionTimeout);

                        // Start the keepAlive interval
                        myself.keepAliveIntervalID = setInterval(function () { myself.keepAlive }, 5000);

                        myself.board.sp.on('disconnect', function () { myself.disconnectHandler.call(myself) });
                        myself.board.sp.on('close', function () { myself.closeHandler.call(myself) } );
                        myself.board.sp.on('error', function () { myself.errorHandler.call(myself) } );

                        myself.port = 'network';
                        myself.connecting = false;
                        myself.justConnected = true;
                        myself.board.connected = true;
                        myself.board.sp.path = myself.hostname;

                        myself.hideMessage();
                        ide.inform(myself.owner.name, localize('An Arduino board has been connected. Happy prototyping!'));
                    } else {
                        myself.hideMessage();
                        ide.inform(myself.owner.name, localize('Error connecting the board.\n') + err, myself.closeHandler(true));
                    }
                    return;
                });
            });

    client.on('error', function(err) {
        myself.hideMessage();
        if (err.code === 'EHOSTUNREACH') {
            ide.inform(
                    myself.owner.name, 
                    localize('Unable to connect to board\n')
                    + myself.hostname + '\n\n'
                    + localize('Make sure the board is powered on'));
        } else if (err.code === 'ECONNREFUSED') {
            ide.inform(
                    myself.owner.name,
                    localize('Unable to connect to board\n')
                    + myself.hostname + '\n\n'
                    + localize('Make sure the hostname and port are correct'));
        } else {
            ide.inform(myself.owner.name, localize('Unable to connect to board\n') + myself.hostname);
        }
        client.destroy();
        myself.connecting = false;
        myself.justConnected = false;
    });
};

Arduino.prototype.verifyPort = function (port, okCallback, failCallback) {
    // The only way to know if this is a proper serial port is to attempt a connection
    try {
        chrome.serial.connect(
                port, 
                { bitrate: 57600 },
                function (info) { 
                    if (info) { 
                        chrome.serial.disconnect( info.connectionId, okCallback);
                    } else {
                        failCallback('Port ' + port + ' does not seem to exist');
                    }
                });
    } catch(err) {
        failCallback(err);
    }
};

Arduino.prototype.connect = function (port, verify) {
    var myself = this;

    this.disconnect(true);

    this.showMessage(localize('Connecting board at port\n') + port);
    this.connecting = true;

    if (verify) {
        this.verifyPort(port, doConnect, fail);
    } else {
        doConnect();
    }

    function fail (err, shouldClose) {
        myself.hideMessage();
        myself.owner.parentThatIsA(StageMorph).threads.processes.forEach(
                function (process) {
                    if (process.topBlock.selector === 'connectArduino') {
                        process.stop(); 
                    }
                });
        ide.inform(
                myself.owner.name,
                localize('Error connecting the board.') + ' ' + err,
                function () {
                    myself.closeHandler(true); 

                });
    };

    function doConnect () {
        myself.board = new Arduino.firmata.Board(port, function (err) { 
            // Clear timeout to avoid problems if connection is closed before timeout is completed
            clearTimeout(myself.connectionTimeout); 
            if (!err) { 
                // Start the keepAlive interval
                myself.keepAliveIntervalID = setInterval(function() { myself.keepAlive() }, 5000);

                myself.board.sp.on('disconnect', function () { myself.disconnectHandler.call(myself) });
                myself.board.sp.on('close', function () { myself.closeHandler.call(myself) } );
                myself.board.sp.on('error', function () { myself.errorHandler.call(myself) } );

                Arduino.lockPort(port);
                myself.port = myself.board.sp.path;
                myself.connecting = false;
                myself.justConnected = true;
                myself.board.connected = true;

                myself.hideMessage();
                ide.inform(myself.owner.name, localize('An Arduino board has been connected. Happy prototyping!'));   
            } else {
                fail(err);
            }
            return;
        });

        // Set timeout to check if device does not speak firmata (in such case new Board callback was never called, but board object exists) 
        this.connectionTimeout = setTimeout(function () {
            // If !board.versionReceived, the board has not established a firmata connection
            if (myself.board && !myself.board.versionReceived) {
                var port = myself.board.sp.path;

                myself.hideMessage();
                ide.inform(
                        myself.owner.name,
                        localize('Could not talk to Arduino in port\n')
                        + port + '\n\n' + localize('Check if firmata is loaded.')
                        );

                // silently closing the connection attempt
                myself.disconnect(true); 
            }
        }, 10000);
    };
};

Arduino.prototype.isBoardReady = function () {
    return ((this.board !== undefined) 
            && (this.board.pins.length > 0) 
            && (!this.disconnecting));
};

Arduino.prototype.pinsSettableToMode = function (aMode) {
    // Retrieve a list of pins that support a particular mode
    var myself = this,
        pinNumbers = {};

    this.board.pins.forEach(
        function (each) { 
            if (each.supportedModes.indexOf(aMode) > -1) { 
                var number = myself.board.pins.indexOf(each).toString(); 
                pinNumbers[number] = number;
            }
        }
    );

    return pinNumbers;
};


// Class attributes and methods

try {
    Arduino.firmata = require('firmata');
} catch (err) {
    console.log('Could not require "firmata", hopefully you are overriding this somewhere');
}

Arduino.portList = [];
Arduino.usedPorts = [];

/**
 * Locks the given port to prevent its use in other connections (until it is unlocked)
 */

Arduino.lockPort = function (port) {
    var usedPorts = this.usedPorts;

    if (usedPorts.indexOf(port) === -1) {
        usedPorts.push(port);
    }
};

/**
 * Unlocks a previously Locked port to permit its use in new connections
 * Should be called when closing connections
 */
Arduino.unlockPort = function (port) {
    var usedPorts = this.usedPorts;

    if (usedPorts.indexOf(port) > -1) {
        usedPorts.splice(usedPorts.indexOf(port));
    }
};

/**
 * Informs whether the port is locked or unlocked
 */
Arduino.isPortLocked = function (port) {
    return (this.usedPorts.indexOf(port) > -1);
};

/**
 * Gets a list of available serial ports (paths) and return it through callback function
 */

Arduino.getSerialPorts = function (callback) {
    var myself = this,
        portList = [],
        portcheck = /usb|DevB|rfcomm|acm|^com/i; // Not sure about rfcomm! We must dig further how bluetooth works in Gnu/Linux

    chrome.serial.getDevices(function (devices) { 
        if (devices) { 
            devices.forEach(function (device) { 
                if (!myself.isPortLocked(device.path) && portcheck.test(device.path)) {
                    portList[device.path] = device.path; 
                }
            });
        }
        callback(portList);
    });
    
};

/* Transpilation from Snap! to Arduino C sketches
 * ==============================================
 *
 * Currently supporting:
 * - Almost all operators
 * - Most control structures
 * - Synchronous broadcasts
 * - All Arduino blocks
 * - Local variables
 *
 * Probably supported in the future:
 * - Async broadcasts
 * - Custom blocks
 * - Simple, homogeneous, fixed-size lists
 *
 * Never going to be supported:
 * - Lists of lists
 * - Heterogeneous lists
 * - Growable lists
 * - Lambda
 * - Sprites, Stage, Sounds, etc.
 * - Multiple boards
 * 
 */

Arduino.transpile = function (body, hatBlocks) {
    var lines,
        header = '',
        setupHeader = '',
        broadcasts = '',
        servoPins,
        digitalOutputPins,
        digitalInputPins;

    // First of all, let's deal with possible broadcasts
    if (body.indexOf('!call!') > 0) {
        // Message names are now function names, not strings
        body = body.replace(/!call!"(.*)"/g, '$1');
        broadcasts = this.processBroadcasts(hatBlocks, body);
    }

    lines = [].concat(body.split('\n')).concat(broadcasts.split('\n'));

    // Let's find out what pins we are using, and for what purpose
    servoPins = this.getServoPins(lines);
    digitalOutputPins = this.getDigitalOutputPins(lines);
    digitalInputPins = this.getDigitalInputPins(lines);

    // Now let's construct the program header and the setup header
    if (servoPins.length > 0) { header += '#include <Servo.h>\n\n' };

    servoPins.forEach( function(pin) { 
        header += 'Servo servo' + pin + ';\n'
        setupHeader += '\n  servo' + pin + '.attach(' + pin + ');'
    });

    // Variables should be defined in the program header and taken out from setup
    varLines = body.match(/int .* = 0;/g) || [];
    body = body.replace(/int .* = 0;\n/g, '');
    varLines.forEach(function (each) {
        header += each + '\n';
    });

    header += '\n';

    digitalOutputPins.forEach( function(pin){ setupHeader += '\n  pinMode(' + pin + ', OUTPUT);' });
    digitalInputPins.forEach( function(pin){ setupHeader += '\n  pinMode(' + pin + ', INPUT);' });

    // Of course, if someone's named their vars this way, we've destroyed their project.
    // Sorry! :p
    body = body.replace('"clockwise"', 1200);
    body = body.replace('"stopped"', 1500);
    body = body.replace('"counter-clockwise"', 1700);

    // w.e add the setup header right after "void setup() {"
    body = body.replace('void setup() {', '$&' + setupHeader);

    // If there's no loop function, we need to add an empty one
    if (body.indexOf('void loop()') < 0) {
        body += '\n}\n\nvoid loop() {}\n';
    }

    return this.headerMessage + header + body + broadcasts;
};

Arduino.getServoPins = function (lines) {
    var filtered = lines.filter(function (each) { return each.match(/servo[0-9]*\.write/)} );
    return unique(filtered.map(function (each) { return each.replace(/.*servo([0-9]*)\.write.*/g, '$1') }));
};

Arduino.getDigitalOutputPins = function (lines) {
    var filtered = lines.filter(function (each) { return each.match(/digitalWrite/)});
    return unique(filtered.map(function (each) { return each.replace(/.*digitalWrite\(([0-9]*),.*\).*/g, '$1') }));
};

Arduino.getDigitalInputPins = function (lines) {
    var filtered = lines.filter(function (each) { return each.match(/digitalRead/)});
    return unique(filtered.map(function (each) { return each.replace(/.*digitalRead\(([0-9]*)\).*/g, '$1') }));
};

Arduino.headerMessage =
      '/* ============================================\n'
    + ' *        AUTO-Generated by Snap4Arduino       \n'
    + ' * ============================================\n'
    + ' *\n'
    + ' * Please review this sketch before pushing it.\n'
    + ' *\n'
    + ' * This is an experimental feature, and there  \n'
    + ' * are _several_ Snap!-related functionalities \n'
    + ' * that are, by definition, untranslatable to  \n'
    + ' * static, compiled languages.                 \n'
    + ' *\n'
    + ' * There is NO WARRANTY whatsoever that this   \n'
    + ' * sketch is going to work exactly in the same \n'
    + ' * way as the original Snap4Arduino script.    \n'
    + ' */\n\n'

Arduino.processBroadcasts = function (hatBlocks) {
    var myself = this,
        fullCode = '\n\n';
    
    hatBlocks.forEach(function (each) {
        fullCode += myself.processBroadcast(each);
    });

    return fullCode;
};

Arduino.processBroadcast = function (hatBlock, body) {
    // Need to deal with possible pinModes here too, so servoPins etc need to be refactored.
    var code = hatBlock.mappedCode().replace(/void "(.*)"\(\) {/g, 'void $1() {') + '\n}\n\n';
    return code;
};
