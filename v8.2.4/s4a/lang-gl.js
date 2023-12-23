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
        'entrada dixital',

    'digital output':
        'saída dixital',

    'PWM':
        'PWM',

    'servo':
        'servo',

    'clockwise':
        'sentido horario',

    'clockwise (1500-1000)':
        'sentido horario (1500-1000)',

    'counter-clockwise':
        'sentido anti-horario',

    'counter-clockwise (1500-2000)':
        'sentido anti-horario (1500-2000)',

    'stopped':
        'parado',

    'stopped (1500)':
        'parado (1500)',

    'disconnected':
        'desconectado',

    'angle (0-180)':
        'ángulo (0-180)',

    'connect to Arduino':
        'conectar a Arduino',

    'disconnect Arduino':
        'desconectar Arduino',

    'Connect Arduino':
        'Conectar Arduino',

    'Disconnect Arduino':
        'Desconectar Arduino',

    'arduino connected?':
        'Arduino está conectado?',

    'analog reading %analogPin':
        'lectura analóxica %analogPin',

    'digital reading %digitalPin':
        'lectura dixital %digitalPin',

    'connect arduino at %s':
        'conectar Arduino ao porto %s',

    'disconnect arduino':
        'desconectar Arduino',

    'setup digital pin %digitalPin as %pinMode':
        'configurar pin %digitalPin como %pinMode',

    'set digital pin %digitalPin to %b':
        'fixar pin dixital %digitalPin en %b',

    'set servo %digitalPin to %servoValue':
        'fixar servo %digitalPin en %servoValue',

    'set pin %pwmPin to value %n':
        'fixar pin %pwmPin ao valor %n',

    'Connecting board at port\n': 
        'Conectando tarxeta no porto\n',

    'An Arduino board has been connected. Happy prototyping!':
        'Conectouse satisfactoriamente unha tarxeta Arduino.\nFeliz prototipaxe!',

    'Board was disconnected from port\n':
        'Desconectouse a tarxeta do porto\n',

    'It seems that someone pulled the cable!':
        'Parece que alguén desconectou o cable!',

    'Error connecting the board.':
        'Produciuse un erro ao conectar a tarxeta',

    'There is already a board connected to this sprite':
        'Xa existe unha tarxeta conectada a este obxecto',

    'Could not connect an Arduino\nNo boards found':
        'Non se puido conectar un Arduino\nNon se atopou ningunha tarxeta',

    'Could not talk to Arduino in port\n':
        'Non se puido comunicar con Arduino no porto\n',

    'Check if firmata is loaded.':
        'Verifique se o firmware Firmata foi cargado.',

    'An error was detected on the board\n\n':
        'Detectouse un erro na tarxeta\n\n',

    'Board is not connected':
        'A tarxeta non está conectada',

    'New Arduino translatable project':
        'Novo proxecto traducible a Arduino', 

    'select a port':
        'seleccione un porto',

    'Network port':
        'Porto de rede',

    'Enter hostname or ip address:':
        'Introduza o nome da máquina ou o seu enderezo IP',

    'Connecting to network port:\n':
        'Conectando ao porto de rede:\n',

    'This may take a few seconds...':
        'isto pode levar uns segundos...',

    'Network serial ports':
        'Portos serie sobre rede',

    'Open from URL...':
        'Abrir dende un URL...',

    'Save, share and get URL...':
        'Garda, comparte e amosa o URL...',

    'This project is now public at the following URL:':
        'Este proxecto é público, accesíbel dende o URL:',

    'About Snap4Arduino...':
        'Sobre Snap4Arduino...',
   
    'Snap4Arduino website':
        'Web do Snap4Arduino',
  
    'Snap4Arduino repository':
        'Repositoro do Snap4Arduino',
 
    'Start a Snap Jr. session':
        'Iniciar unha sesión de Snap Junior',

    'Start Snap4Arduino in an\nicon-based blocks mode\nfor the youngest programmers':
        'Inicia Snap4Arduino nun\nmodo de bloques con iconas\npara os/as programadores/as máis novos/as',

    'Loading Snap Jr.':
        'Snap Junior está a cargarse',

    'HTTP server':
        'Servidor HTTP',

    'uncheck to stop\nHTTP server':
        'desmarque para deter\no servidor HTTP',

    'check to start\nHTTP server, allowing\nremote control\nof Snap4Arduino':
        'márqueo para iniciar\no servidor HTTP, permitindo\no control remoto\nde Snap4Arduino',

    'Public stage':
        'Escenario público',

    'uncheck to prevent the stage\nfrom being viewed\nfrom the HTTP server':
        'desmarqueo para evitar que o escenario\nsexa visto dende o servidor HTTP',

    'check to allow the stage\nto be viewed\nfrom the HTTP server':
        'márqueo para permitir que o escenario\nsexa visto dende o servidor HTTP',
    'red':
        'vermello',
    'blue':
        'azul',
    'SnapJunior Blocks':
        'Bloques do Snap Junior',
    'SnapJuniorPlus Blocks':
        'Máis bloques para o Snap Junior',
    'Icon-based blocks for the youngest programmers.':
        'Bloques con iconas para os programadores e programadoras máis novos/as.',
    'Extra blocks for SnapJunior.':
        'Bloques para engadir funcionalidades ao Snap Junior',
    'Blocks for TdRSTEAM shield v1, using SA5Firmata firmware.':
        'Bloques para a TdRSTEAM v1, empregado o SA5Firmata.',
    'Blocks for TdRSTEAM shield v2, using SA5Firmata firmware.':
        'Bloques para a TdRSTEAM v2, empregando o SA5Firmata.',
    'Libraries below this point are specific to Snap4Arduino.':
        'As bibliotecas baixo este punto son específicas para Snap4Arduino.',
    'End of Snap4Arduino libraries.':
        'Final das bibliotecas do Snap4Arduino.'

};

// Add attributes to original SnapTranslator.dict.gl
for (var attrname in s4aTempDict) { SnapTranslator.dict.gl[attrname] = s4aTempDict[attrname]; }
