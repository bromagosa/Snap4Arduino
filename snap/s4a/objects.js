// init decorator

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
    this.originalInit(globals);
    this.arduino = new Arduino(this);
};

// Definition of a new Arduino Category

SpriteMorph.prototype.categories.push('arduino');
SpriteMorph.prototype.blockColor['arduino'] = new Color(64, 136, 182);

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initArduinoBlocks = function () {

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
        spec: 'connect arduino at %s'
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
};

SpriteMorph.prototype.initBlocks();

// blockTemplates decorator

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;
SpriteMorph.prototype.blockTemplates = function (category) {
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

    function blockBySelector (selector) {
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    };

    if (category === 'arduino') {
        blocks.push(arduinoConnectButton);
        blocks.push(arduinoDisconnectButton);
        blocks.push('-');
        blocks.push(blockBySelector('connectArduino'));
        blocks.push('-');
        blocks.push(blockBySelector('servoWrite'));
        blocks.push(blockBySelector('digitalWrite'));
        blocks.push(blockBySelector('pwmWrite'));
        blocks.push('-');
        blocks.push(blockBySelector('reportAnalogReading'));
        blocks.push(blockBySelector('reportDigitalReading'));
    };

    return blocks;
};
