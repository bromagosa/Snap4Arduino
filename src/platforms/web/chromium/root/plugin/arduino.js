Arduino.prototype.attemptConnection = function () {
    var myself = this;

    if (!this.connecting) {
        if (this.board === undefined) {
            // Get list of ports (Arduino compatible)
            var ports = world.Arduino.getSerialPorts(function (ports) {
                var portMenu = new MenuMorph(this, 'select a port');
                if (Object.keys(ports).length >= 1) {
                    Object.keys(ports).forEach(function (each) {
                        portMenu.addItem(each, function () { 
                            myself.connect(each);
                        })
                    });
                }
                portMenu.popUpAtHand(world);
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

window.onunload = function (evt) {
    ide.sprites.asArray().forEach(function (each) { each.arduino.disconnect(true); });
};

Arduino.prototype.connect = function (port) {
    var myself = this;

    this.disconnect(true);

    this.showMessage(localize('Connecting board at port\n') + port);
    this.connecting = true;

    // Hyper convoluted due to the async nature of Firmata
    // Brace yourselves, you're about to dive into the Amazing Callback Vortex
    new world.Arduino.firmata.Board(port, function (boardId) { 
        var board,
        retries = 0,
        boardReadyInterval = setInterval(
                function () {
                    postal.sendCommand('getBoard', [ boardId ], function (board) {
                        myself.board = board;
                        if (board && board.versionReceived) {
                            clearInterval(boardReadyInterval);
                            // We need to populate the board with functions that make use of the browser plugin
                            myself.populateBoard(myself.board);

                            myself.keepAliveIntervalID = setInterval(function() { myself.keepAlive() }, 5000);

                            // These should be handled at plugin side
                            // myself.board.sp.on('disconnect', myself.disconnectHandler);
                            // myself.board.sp.on('close', myself.closeHandler);
                            // myself.board.sp.on('error', myself.errorHandler);

                            world.Arduino.lockPort(port);
                            myself.port = myself.board.sp.path;
                            myself.connecting = false;
                            myself.justConnected = true;
                            myself.board.connected = true;

                            myself.hideMessage();
                            ide.inform(myself.owner.name, localize('An Arduino board has been connected. Happy prototyping!'));
                        }
                    });

                    if (retries > 40) {
                        clearInterval(boardReadyInterval);
                        myself.board = null;
                        myself.hideMessage();
                        ide.inform(
                                myself.owner.name,
                                localize('Could not talk to Arduino in port\n')
                                + port + '\n\n' + localize('Check if firmata is loaded.')
                                );
                    }

                    retries ++;
                },
        250);
    });
};

Arduino.prototype.populateBoard = function (board) {
    board.sp.close = postal.commandSender('closeSerial', board.id);
    board.sp.removeListener = nop;

    // pin is already converted to absolute position, we don't care whether it's analog or not
    board.pinMode = function (pin, mode) { postal.sendCommand('pinMode', [ board.id, pin, mode ], function() { board.pins[pin].mode = mode }) };
    board.digitalWrite = function (pin, value) { postal.sendCommand('digitalWrite', [ board.id, pin, value ]) };
    board.servoWrite = function (pin, value) { postal.sendCommand('servoWrite', [ board.id, pin, value ]) };
    board.analogWrite = function (pin, value) { postal.sendCommand('analogWrite', [ board.id, pin, value ]) };
    board.digitalRead = function (pin, callback) { postal.sendCommand('digitalRead', [ board.id, pin ], callback) };
    board.analogRead = function (pin, callback) { postal.sendCommand('analogRead', [ board.id, pin ], callback) };
};
