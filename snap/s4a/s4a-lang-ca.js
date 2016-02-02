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

    'digital input':
        'entrada digital',

    'digital output':
        'sortida digital',

    'PWM':
        'PWM',

    'servo':
        'servo',

    'clockwise':
        'sentit horari',

    'counter-clockwise':
        'sentit anti-horari',

    'stopped':
        'aturat',

    'angle (0-180)':
        'angle (0-180)',

    'connect to Arduino':
        'connectar a Arduino',

    'disconnect Arduino':
        'desconnectar Arduino',

    'Connect Arduino':
        'Connectar Arduino',

    'Disconnect Arduino':
        'Desconnectar Arduino',

    'analog reading %analogPin':
        'lectura analògica %analogPin',

    'digital reading %digitalPin':
        'lectura digital %digitalPin',

    'connect arduino at %port':
        'connectar arduino al port %port',

    'setup digital pin %digitalPin as %pinMode':
        'configurar pin %digitalPin com a %pinMode',

    'set digital pin %digitalPin to %b':
        'posar pin digital %digitalPin a %b',

    'set servo %servoPin to %servoValue':
        'posar servo %servoPin a %servoValue',

    'set PWM pin %pwmPin to %n':
        'posar pin PWM %pwmPin a %n',

    'Connecting board at port\n': 
        'Connectant placa al port\n',

    'An Arduino board has been connected. Happy prototyping!':
        'S\'ha connectat correctament una placa Arduino.\nFeliç prototipatge!',

    'Board was disconnected from port\n':
        'S\'ha desconnectat la placa del port\n',

    'It seems that someone pulled the cable!':
        'Sembla que algú ha desconnectat el cable!',

    'Error connecting the board.':
        'Error en connectar a la placa',

    'There is already a board connected to this sprite':
        'Aquest objecte ja té una placa connectada',

    'Could not connect an Arduino\nNo boards found':
        'No s\'ha pogut connectar cap Arduino\nNo s\'ha trobat cap placa',

    'Could not talk to Arduino in port\n':
        'No s\'ha pogut establir comunicació amb Arduino al port\n',

    'Check if firmata is loaded.':
        'Reviseu que Firmata hi estigui carregat.',

    'An error was detected on the board\n\n':
        'S\'ha detectat un error a la placa\n\n',

    'Board is not connected':
        'La placa no està connectada',

    'New Arduino translatable project':
        'Nou projecte traduïble a Arduino' 

};

// Add attributes to original SnapTranslator.dict.ca
for (var attrname in s4aTempDict) { SnapTranslator.dict.ca[attrname] = s4aTempDict[attrname]; }
