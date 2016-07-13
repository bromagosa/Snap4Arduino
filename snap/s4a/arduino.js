function Arduino (owner) {
    this.owner = owner;
    this.board = undefined;	// Reference to arduino board - to be created by new firmata.Board()
    this.connecting = false;	// Flag to avoid multiple attempts to connect
    this.disconnecting = false;  // Flag to avoid serialport communication when it is being closed
    this.justConnected = false;	// Flag to avoid double attempts
    this.keepAliveIntervalID = null;
    this.hostname = 'arduino.local:23'; // Default hostname and port for network connection
};

// This function just asks for the version and checks if we've received it after a timeout
Arduino.prototype.keepAlive = function () {
    if (world.Arduino.keepAlive) {
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
            if (!this.board.sp.disconnected && this.board.sp) {
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
            world.Arduino.getSerialPorts(function (ports) {
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

    world.Arduino.unlockPort(this.port);
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
        hostname = host.split(':')[0],
        port = host.split(':')[1] || 80;

    this.hostname = hostname + ':' + port;

    this.disconnect(true);

    this.showMessage(localize('Connecting to network port:\n' + this.hostname + '\n\n' + localize('This may take a few seconds...')));
    this.connecting = true;

    var client = net.connect(
            { 
                host: hostname,
                port: port
            },
            function () {
                var socket = this;
                myself.board = new world.Arduino.firmata.Board(socket, function(err) {
                    if (!err) {
                        // Clear timeout to avoid problems if connection is closed before timeout is completed
                        clearTimeout(myself.connectionTimeout);

                        // Start the keepAlive interval
                        myself.keepAliveIntervalID = setInterval(function () { myself.keepAlive }, 5000);

                        myself.board.sp.on('disconnect', myself.disconnectHandler);
                        myself.board.sp.on('close', myself.closeHandler);
                        myself.board.sp.on('error', myself.errorHandler);

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
                        if (chrome.runtime.lastError) {
                            console.log(chrome.runtime.lastError.message);
                        }
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
        myself.board = new world.Arduino.firmata.Board(port, function (err) { 
            // Clear timeout to avoid problems if connection is closed before timeout is completed
            clearTimeout(myself.connectionTimeout); 
            if (!err) { 
                // Start the keepAlive interval
                myself.keepAliveIntervalID = setInterval(function() { myself.keepAlive() }, 5000);

                myself.board.sp.on('disconnect', myself.disconnectHandler);
                myself.board.sp.on('close', myself.closeHandler);
                myself.board.sp.on('error', myself.errorHandler);

                world.Arduino.lockPort(port);
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

