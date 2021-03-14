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

    'clockwise (1500-1000)':
        'sentit horari (1500-1000)',

    'counter-clockwise':
        'sentit anti-horari',

    'counter-clockwise (1500-2000)':
        'sentit anti-horari (1500-2000)',

    'stopped':
        'aturat',

    'stopped (1500)':
        'aturat (1500)',

    'disconnected':
        'desconnectat',

    'angle (0-180)':
        'angle (0-180)',

    'connect to Arduino':
        'connecta a Arduino',

    'disconnect Arduino':
        'desconnecta Arduino',

    'Connect Arduino':
        'Connecta Arduino',

    'Disconnect Arduino':
        'Desconnecta Arduino',

    'arduino connected?':
        'arduino connectat?',

    'analog reading %analogPin':
        'lectura analògica %analogPin',

    'digital reading %digitalPin':
        'lectura digital %digitalPin',

    'connect arduino at %s':
        'connecta l\'Arduino al port %s',

    'disconnect arduino':
        'desconnecta l\'Arduino',

    'setup digital pin %digitalPin as %pinMode':
        'configura pin %digitalPin com a %pinMode',

    'set digital pin %digitalPin to %b':
        'posa el pin digital %digitalPin a %b',

    'set servo %digitalPin to %servoValue':
        'posa el servo %digitalPin a %servoValue',

    'set pin %pwmPin to value %n':
        'posa el pin %pwmPin al valor %n',

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
        'Nou projecte traduïble a Arduino', 

    'select a port':
        'selecciona un port',

    'Network port':
        'Port de xarxa',

    'Enter hostname or ip address:':
        'Introdueix el nom de l\'host o adreça IP',

    'Connecting to network port:\n':
        'Connectant a port de xarxa:\n',

    'This may take a few seconds...':
        'Aquesta operació pot trigar uns segons...',

    'Network serial ports':
        'Ports sèrie sobre xarxa',

    'Open from URL...':
        'Obre des d\'una URL...',

    'Save, share and get URL...':
        'Desa, comparteix i mostra la URL...',

    'This project is now public at the following URL:':
        'Aquest projecte és públic, accessible des de la URL:',

    'About Snap4Arduino...':
        'Sobre Snap4Arduino...',
   
    'Snap4Arduino website':
        'Web de Snap4Arduino',
  
    'Snap4Arduino repository':
        'Repositori de Snap4Arduino',
 
    'Start a Snap Jr. session':
        'Inicia una sessió de Snap Júnior',

    'Start Snap4Arduino in an\nicon-based blocks mode\nfor the youngest programmers':
        'Inicia Snap4Arduino en un\nmode de blocs amb icones\nper els/les programadors/es més joves',

    'Loading Snap Jr.':
        'S\'està carregant Snap Júnior',

    'Show project URL':
        'Mostra la URL del projecte',

    'HTTP server':
        'Servidor HTTP',

    'uncheck to stop\nHTTP server':
        'desmarqueu per aturar\nel servidor HTTP',

    'check to start\nHTTP server, allowing\nremote control\nof Snap4Arduino':
        'marqueu per iniciar\nel servidor HTTP, permetent\nel control remot\nde Snap4Arduino',

    'Public stage':
        'Escenari públic',

    'uncheck to prevent the stage\nfrom being viewed\nfrom the HTTP server':
        'desmarqueu per evitar que l\'escenari\nes vegi des del servidor HTTP',

    'check to allow the stage\nto be viewed\nfrom the HTTP server':
        'marqueu per permetre que l\'escenari\nes vegi des del servidor HTTP',
    'red':
        'vermell',
    'blue':
        'blau',
//Llibreries
    'Libraries below this point are specific to Snap4Arduino.':
        'Les llibreries de sota són específiques per Snap4Arduino.',
    'Scale between ranges':
        'Escala entre intervals',
    'Scale a value from a range to another. Useful to map sensor values into stage coordinates, or to map sensors into actuators.':
        'Escala un valor d\'un interval a un altre. Útil per mapejar els valors dels sensors a les coordenades de l\'escenari o per passar valors dels sensors directament als actuadors.',
    'SnapJunior Blocks':
        'Blocs de l\'Snap Junior',
    'Icon-based blocks for the youngest programmers.':
        'Blocs amb icones per als programadors i programadores més joves.',
    'SnapJuniorPlus Blocks':
        'Més blocs per l\'Snap Junior',
    'Extra blocks for SnapJunior.':
        'Blocs per afegir funcionalitats a l\'Snap Junior',

    'I2C':
        'I2C',
    'Send and receive data from I2C-enabled sensors and actuators.':
        'Envia i rep dades pel protocol I2C de sensors i actuadors.',
    'Adding extra features to StandardFirmata: tone, pulseIn, pulseOut, ping, nunchuck and dht11 blocks. It requires SA5Firmata_tone firmware.':
        'Afegeix funcionalitats al StandardFirmata: tone, pulseIn, pulseOut, ping, nunchuck i dht11. Requereix que el dispositiu tingui el firmware SA5Firmata_tone.',
    'SA5Firmata with IR features at the expense of simplifying the tone function. It requires SA5Firmata_ir firmware.':
        'SA5Firmata amb funcionalitats IR, limitant les funcionalitats del tone. Requereix que el dispositiu tingui el firmware SA5Firmata_IR.',

    'Blocks for the TdRSTEAM shield v1. Use StandardFirmata or SA5Firmata_tone firmware to add buzzer features.':
        'Blocs per la TdRSTEAM v1. Utilitza el StandardFirmata o el SA5Firmata_tone per afegir les funcionalitas del brunzidor (tone).',
    'Blocks for the TdRSTEAM shield v2, Use StandardFirmata or SA5Firmata_tone firmware to add buzzer features.':
        'Blocs per la TdRSTEAM v2. Utilitza el StandardFirmata o el SA5Firmata_tone per afegir les funcionalitas del brunzidor (tone).',
    'Imagina Shield':
        'Placa Imagina',
    'Blocks for the Imagina shield. Use StandardFirmata, SA5Firmata_tone to add buzzer features or SA5Firmata_IR for buzzer and IR features.':
        'Blocs per la placa Imagina. Utilitza el StandardFirmata, el S5AFirmata_tone per afegir les funcionalitats del brunzidor (tone) o el SA5Firmata_IR per tenir brunzidor (simplificat) i funcionalitats IR.',
    'Echidna Boards':
        'Plaques Echidna',
    'Blocks for the Echidna boards. Use StandarFirmata or SA5Firmata_tone to add more buzzer features.':
        'Blocs per les plaques Echidna. Utilitza el StandardFirmata o el SA5Firmata_tone per afegir les funcionalitats del brunzidor (tone).',
    'Blocks for the NodeMCU board using StandardFirmata. It has also blocks for a motor shield.':
        'Blocs per la placa NodeMCU utilitzant el StandardFirmata. També incorpora blocs per la placa de motors.',
// Temporaly, adding new 6.7.1 Snap! strings (already added for Snap! 7)
    '%la of %l':
        '%la de %l',
    'rank':
        'rang',
    'dimensions':
        'dimensions',
    'flatten':
        'aplanament',
    'columns':
        'columnes',
    'reverse':
        'revers',
    'lines':
        'línies',
   'reshape %l to %nums':
        'redimensiona %l a %nums',
    'Undelete sprites...':
        'Recupera objectes...',
    'Bring back deleted sprites':
        'Recupera objectes esborrats',
    'trash is empty':
        'la paperera està buida',
    'clear undrop queue':
        'esborra la llista d\'accions desades'

};

// Add attributes to original SnapTranslator.dict.ca
for (var attrname in s4aTempDict) { SnapTranslator.dict.ca[attrname] = s4aTempDict[attrname]; }
