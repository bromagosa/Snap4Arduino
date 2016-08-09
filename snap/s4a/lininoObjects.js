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
        transpilable: true
    };

    this.blocks.reportDigitalReading = 
    {
        only: SpriteMorph,
        type: 'predicate',
        category: 'arduino',
        spec: 'digital reading %digitalPin',
        transpilable: true
    };

    this.blocks.digitalWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set digital pin %digitalPin to %b',
        transpilable: true
    };

    this.blocks.servoWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set servo %servoPin to %servoValue',
        defaults: [null, 'clockwise'],
        transpilable: true
    };

    this.blocks.pwmWrite =
    {
        only: SpriteMorph,
        type: 'command',
        category: 'arduino',
        spec: 'set analog pin %pwmPin to %n',
        transpilable: true
    };
};

SpriteMorph.prototype.initBlocks =  function() {
    this.originalInitBlocks();
    this.initArduinoBlocks();
};

SpriteMorph.prototype.initBlocks();

// blockTemplates decorator

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;
SpriteMorph.prototype.blockTemplates = function(category) {
    var myself = this;

    var blocks = myself.originalBlockTemplates(category); 

    function blockBySelector(selector) {
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    };

    if (category === 'arduino') {
        blocks.push(blockBySelector('servoWrite'));
        blocks.push(blockBySelector('digitalWrite'));
        blocks.push(blockBySelector('pwmWrite'));
        blocks.push('-');
        blocks.push(blockBySelector('reportAnalogReading'));
        blocks.push(blockBySelector('reportDigitalReading'));
    };

    return blocks;
}
