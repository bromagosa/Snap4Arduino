s4aTempDict = {

/*
    Special characters: (see <http://0xcc.net/jsescape/>)

    Ä, ä   \u00c4, \u00e4
    Ö, ö   \u00d6, \u00f6
    Ü, ü   \u00dc, \u00fc
    ß      \u00df
*/
    // primitive blocks:

    /*
        Attention Translators:
        ----------------------
        At this time your translation of block specs will only work
        correctly, if the order of formal parameters and their types
        are unchanged. Placeholders for inputs (formal parameters) are
        indicated by a preceding % prefix and followed by a type
        abbreviation.

        For example:

            'say %s for %n secs'

        can currently not be changed into

            'say %n secs long %s'

        and still work as intended.

        Similarly

            'point towards %dst'

        cannot be changed into

            'point towards %cst'

        without breaking its functionality.
    */

    // arduino:
    'Connect Arduino':
        '连接Arduino',

    'Disconnect Arduino':
        '断开与Arduino的连接',

    'analog reading %analogPin':
        '模拟信号针脚 %analogPin 读取中',

    'digital reading %digitalPin':
        '数字信号针脚 %digitalPin 读取中',

    'connect arduino at %s':
        '连接arduino端口 %s',

    'disconnect arduino':
        '断开与arduino的连接',

    'setup digital pin %digitalPin as %pinMode':
        '配置数字针脚 %digitalPin 为 %pinMode',

    'set digital pin %digitalPin to %b':
        '设数字针脚 %digitalPin 为 %b',

    'set servo %servoPin to %servoValue':
        '设置伺服针脚 %servoPin 为 %servoValue',

    'set pin %pwmPin to value %n':
        '设置PWM %pwmPin 为 %n',

    'Connecting board at port\n': 
        '正在连接到主板的\n端口',

    'An Arduino board has been connected. Happy prototyping!':
        '一块Arduino主板已经连接成功，祝你编程愉快！',

    'Board was disconnected from port\n':
        '主板已经从端口\n断开连接',

    'It seems that someone pulled the cable!':
        '貌似某人把电线拉开啦！',

    'Error connecting the board.':
        '连接主板错误',

    'There is already a board connected to this sprite':    //此处的SPRITE不知道翻译成对象对不对
        '已经有一快板连接到这个对象了',

    'Could not connect an Arduino\nNo boards found':
        '没有发现主板无法连接Arduino\n',

    'Could not talk to Arduino in port\n':
        '无法与Arduino端口\n进行通讯',

    'Check if firmata is loaded.':
        '检查是否已经加载Firmata协议.',

    'An error was detected on the board\n\n':
        '检测到主板上的一个错误\n\n',

    'Board is not connected':
        '主板没有连接'

};

// Add attributes to original SnapTranslator.dict.zh
for (var attrname in s4aTempDict) { SnapTranslator.dict.zh[attrname] = s4aTempDict[attrname]; }
