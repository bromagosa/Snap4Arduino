// init decorator

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
    var myself = this;

    myself.originalInit(globals);

    myself.arduino = {
        board : undefined,	// Reference to arduino board - to be created by new firmata.Board()
        connecting : false,	// Flag to avoid multiple attempts to connect
        disconnecting : false,  // Flag to avoid serialport communication when it is being closed
        justConnected: false,	// Flag to avoid double attempts
        keepAliveIntervalID: null
    };

    // This function just asks for the version and checks if we've received it after a timeout
    myself.arduino.keepAlive = function() {
        if (myself.arduino.board.version.major !== undefined) {
            // Everything looks fine, let's try again
            myself.arduino.board.version = {};
            myself.arduino.board.reportVersion(nop);
        } else {
            // Connection dropped! Let's disconnect!
            myself.arduino.disconnect(); 
        }
    }

    myself.arduino.disconnect = function(silent) {

        if (this.isBoardReady()) { // Prevent disconnection attempts before board is actually connected
            this.disconnecting = true;
            this.board.sp.close();
            this.closeHandler(silent);
        } else if (!this.board) {  // Don't send info message if the board has been connected
            if (!silent) {
                ide.inform(myself.name, localize('Board is not connected'))
            }
        } 
    }

    // This should belong to the IDE
    myself.arduino.showMessage = function(msg) {
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

        if (!this.message.key) { this.message.key = 'message' + myself.name + msg };

        this.message.labelString = myself.name;
        this.message.createLabel();
        if (msg) { this.message.addBody(txt) };
        this.message.drawNew();
        this.message.fixLayout();
        this.message.popUp(world);
        this.message.show();
    }

    myself.arduino.hideMessage = function() {
        if (this.message) {
            this.message.cancel();
            this.message = null;
        }
    }

    myself.arduino.attemptConnection = function() {

        if (!this.connecting) {
            if (this.board === undefined) {
                // Get list of ports (Arduino compatible)
                var ports = world.Arduino.getSerialPorts(function(ports) {
                    // Check if there is at least one port on ports object (which for some reason was defined as an array)
                    if (Object.keys(ports).length == 0) {
                        ide.inform(myself.name, localize('Could not connect an Arduino\nNo boards found'));
                        return;
                    } else if (Object.keys(ports).length == 1) {
                        myself.arduino.connect(ports[Object.keys(ports)[0]]);
                    } else if (Object.keys(ports).length > 1) { 
                        var portMenu = new MenuMorph(this, 'select a port');
                        Object.keys(ports).forEach(function(each) {
                            portMenu.addItem(each, function() { 
                                myself.arduino.connect(each);
                            })
                        });
                        portMenu.popUpAtHand(world);		
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

    }

    myself.arduino.closeHandler = function(silent) {

        var portName = 'unknown',
            thisArduino = myself.arduino;

        if (thisArduino.board) {
            portName = thisArduino.board.sp.path;
            
            thisArduino.board.sp.removeListener('disconnect', thisArduino.disconnectHandler);
            thisArduino.board.sp.removeListener('close', thisArduino.closeHandler);
            thisArduino.board.sp.removeListener('error', thisArduino.errorHandler);

            thisArduino.board = undefined;
        };

        clearInterval(thisArduino.keepAliveIntervalID);

        world.Arduino.unlockPort(thisArduino.port);
        thisArduino.connecting = false;
        thisArduino.disconnecting = false;

        if (thisArduino.disconnected & !silent) {
            ide.inform(myself.name, localize('Board was disconnected from port\n') + portName + '\n\nIt seems that someone pulled the cable!');
            thisArduino.disconnected = false;
        } else if (!silent) {
            ide.inform(myself.name, localize('Board was disconnected from port\n') + portName);
        }
    }

    myself.arduino.disconnectHandler = function() {
        // This fires up when the cable is plugged, but only in recent versions of the serialport plugin
        myself.arduino.disconnected = true;
    }

    myself.arduino.errorHandler = function(err) {
        ide.inform(myself.name, localize('An error was detected on the board\n\n') + err, myself.arduino.disconnect(true));
    }

    myself.arduino.connect = function(port) {

        this.disconnect(true);

        this.showMessage(localize('Connecting board at port\n') + port);
        this.connecting = true;

        this.board = new world.Arduino.firmata.Board(port, function(err) { 
            if (!err) { 

                // Clear timeout to avoid problems if connection is closed before timeout is completed
                clearTimeout(myself.arduino.connectionTimeout); 

                // Start the keepAlive interval
                myself.arduino.keepAliveIntervalID = setInterval(myself.arduino.keepAlive, 5000);

                myself.arduino.board.sp.on('disconnect', myself.arduino.disconnectHandler);
                myself.arduino.board.sp.on('close', myself.arduino.closeHandler);
                myself.arduino.board.sp.on('error', myself.arduino.errorHandler);

                world.Arduino.lockPort(port);
                myself.arduino.port = myself.arduino.board.sp.path;
                myself.arduino.connecting = false;
                myself.arduino.justConnected = true;
                myself.arduino.board.connected = true;

                myself.arduino.hideMessage();
                ide.inform(myself.name, localize('An Arduino board has been connected. Happy prototyping!'));   
            } else {
                myself.arduino.hideMessage();
                ide.inform(myself.name, localize('Error connecting the board.') + ' ' + err, myself.arduino.closeHandler(true));
            }
            return;
        });

        // Set timeout to check if device does not speak firmata (in such case new Board callback was never called, but board object exists) 
        myself.arduino.connectionTimeout = setTimeout(function() {
            // If board.versionReceived == false, the board has not established a firmata connection
            if (myself.arduino.board && !myself.arduino.board.versionReceived) {
                var port = myself.arduino.board.sp.path;

                myself.arduino.hideMessage();
                ide.inform(myself.name, localize('Could not talk to Arduino in port\n') + port + '\n\n' + localize('Check if firmata is loaded.'))

            // silently closing the connection attempt
            myself.arduino.disconnect(true); 
            }
        }, 10000)
    }

    myself.arduino.isBoardReady = function() {
        return ((this.board !== undefined) 
                && (this.board.pins.length>0) 
                && (!this.disconnecting));
    }
}



// Definition of a new Arduino Category

SpriteMorph.prototype.categories.push('arduino');
SpriteMorph.prototype.blockColor['arduino'] = new Color(64, 136, 182);

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initArduinoBlocks = function() {

    this.blocks.reportAnalogReading = 
    {
        only: SpriteMorph,
        type: 'reporter',
        category: 'arduino',
        spec: 'analog reading %analogPin',
        translatable: true
    };

    this.blocks.reportDigitalReading = 
    {
        only: SpriteMorph,
        type: 'predicate',
        category: 'arduino',
        spec: 'digital reading %digitalPin',
        translatable: true
    };

    this.blocks.connectArduino =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'connect arduino at %port'
    };

    // Keeping this block spec, although it's not used anymore!
    this.blocks.setPinMode =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'setup digital pin %digitalPin as %pinMode',
        defaults: [null, 'servo'],
        translatable: true
    };

    this.blocks.digitalWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set digital pin %digitalPin to %b',
        translatable: true
    };

    this.blocks.servoWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set servo %servoPin to %servoValue',
        defaults: [null, 'clockwise'],
        translatable: true
    };

    this.blocks.pwmWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set PWM pin %pwmPin to %n',
        translatable: true
    };

    // Ardui... nization? 
    // Whatever, let's dumb this language down:

    this.blocks.receiveGo.translatable = true;
    this.blocks.doWait.translatable = true;
    this.blocks.doForever.translatable = true;
    this.blocks.doRepeat.translatable = true;
    this.blocks.doIf.translatable = true;
    this.blocks.doIfElse.translatable = true;
    this.blocks.reportSum.translatable = true;
    this.blocks.reportDifference.translatable = true;
    this.blocks.reportProduct.translatable = true;
    this.blocks.reportQuotient.translatable = true;
    this.blocks.reportModulus.translatable = true;
    this.blocks.reportMonadic.translatable = true;
    this.blocks.reportRandom.translatable = true;
    this.blocks.reportLessThan.translatable = true;
    this.blocks.reportEquals.translatable = true;
    this.blocks.reportGreaterThan.translatable = true;
    this.blocks.reportAnd.translatable = true;
    this.blocks.reportOr.translatable = true;
    this.blocks.reportNot.translatable = true;
    this.blocks.reportTrue.translatable = true;
    this.blocks.reportFalse.translatable = true;
    this.blocks.reportJoinWords.translatable = true;
    this.blocks.doSetVar.translatable = true;
    this.blocks.doChangeVar.translatable = true;
    this.blocks.doDeclareVariables.translatable = true;

    StageMorph.prototype.codeMappings['delim'] = ',';
    StageMorph.prototype.codeMappings['tempvars_delim'] = ',';
    StageMorph.prototype.codeMappings['string'] = '"<#1>"';

    StageMorph.prototype.codeMappings['doWait'] = 'delay(<#1> * 1000);';
    StageMorph.prototype.codeMappings['doForever'] = 'void loop() {\n  <#1>\n}';
    StageMorph.prototype.codeMappings['doRepeat'] = 'for (int i = 0; i < <#1>; i++) {\n  <#2>\n}';
    StageMorph.prototype.codeMappings['doIf'] = 'if (<#1>) {\n  <#2>\n}';
    StageMorph.prototype.codeMappings['doIfElse'] = 'if (<#1>) {\n  <#2>\n} else {\n  <#3>\n}';

    StageMorph.prototype.codeMappings['reportSum'] = '(<#1> + <#2>)';
    StageMorph.prototype.codeMappings['reportDifference'] = '(<#1> - <#2>)';
    StageMorph.prototype.codeMappings['reportProduct'] = '(<#1> * <#2>)';
    StageMorph.prototype.codeMappings['reportQuotient'] = '(<#1> / <#2>)';
    StageMorph.prototype.codeMappings['reportModulus'] = '(<#1> % <#2>)';
    StageMorph.prototype.codeMappings['reportMonadic'] = '<#1>(<#2>)';
    StageMorph.prototype.codeMappings['reportRandom'] = 'random(<#1>, <#2>)';
    StageMorph.prototype.codeMappings['reportLessThan'] = '(<#1> < <#2>)';
    StageMorph.prototype.codeMappings['reportEquals'] = '(<#1> == <#2>)';
    StageMorph.prototype.codeMappings['reportGreaterThan'] = '(<#1> > <#2>)';
    StageMorph.prototype.codeMappings['reportAnd'] = '(<#1> && <#2>)';
    StageMorph.prototype.codeMappings['reportOr'] = '(<#1> || <#2>)';
    StageMorph.prototype.codeMappings['reportNot'] = '!(<#1>)';
    StageMorph.prototype.codeMappings['reportTrue'] = 'true';
    StageMorph.prototype.codeMappings['reportFalse'] = 'false';

    StageMorph.prototype.codeMappings['doSetVar'] = '<#1> = <#2>;';
    StageMorph.prototype.codeMappings['doChangeVar'] = '<#1> += <#2>;';
    StageMorph.prototype.codeMappings['doDeclareVariables'] = 'int <#1>;'; // How do we deal with types? Damn types...

    StageMorph.prototype.codeMappings['reportAnalogReading'] = 'analogRead(<#1>)';
    StageMorph.prototype.codeMappings['reportDigitalReading'] = 'digitalRead(<#1>)';
    StageMorph.prototype.codeMappings['setPinMode'] = 'pinMode(<#1>, <#2>);';
    StageMorph.prototype.codeMappings['digitalWrite'] = 'digitalWrite(<#1>, <#2>);';
    StageMorph.prototype.codeMappings['servoWrite'] = 'servo<#1>.write(<#2>);';
    StageMorph.prototype.codeMappings['pwmWrite'] = 'analogWrite(<#1>, <#2>);';
}

SpriteMorph.prototype.initBlocks =  function() {
    this.originalInitBlocks();
    this.initArduinoBlocks();
}

SpriteMorph.prototype.initBlocks();

// blockTemplates decorator

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;
SpriteMorph.prototype.blockTemplates = function(category) {
    var myself = this;

    var blocks = myself.originalBlockTemplates(category); 

    //  Button that triggers a connection attempt 

    var arduinoConnectButton = new PushButtonMorph(
            null,
            function () {
                myself.arduino.attemptConnection();
            },
            'Connect Arduino'
            );

    //  Button that triggers a disconnection from board

    var arduinoDisconnectButton = new PushButtonMorph(
            null,
            function () {
                myself.arduino.disconnect();;
            },
            'Disconnect Arduino'
            );

    function blockBySelector(selector) {
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    };

    if (category === 'arduino') {
        blocks.push(arduinoConnectButton);
        blocks.push(arduinoDisconnectButton);
        blocks.push('-');
        blocks.push(blockBySelector('servoWrite'));
        blocks.push(blockBySelector('digitalWrite'));
        blocks.push(blockBySelector('pwmWrite'));
        blocks.push('-');
        blocks.push(blockBySelector('reportAnalogReading'));
        blocks.push(blockBySelector('reportDigitalReading'));
    };

    return blocks;
}
