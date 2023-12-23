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
        'sarrera digitala',

    'digital output':
        'irteera digitala',

    'PWM':
        'PWM',

    'servo':
        'serbomotorra',

    'clockwise':
        'erlojuaren noranzkoan',

    'clockwise (1500-1000)':
        'erlojuaren noranzkoan (1500-1000)',

    'counter-clockwise':
        'erlojuaren aurkako noranzkoan',

    'counter-clockwise (1500-2000)':
        'erlojuaren aurkako noranzkoan (1500-2000)',

    'stopped':
        'geldituta',

    'stopped (1500)':
        'geldituta (1500)',

    'disconnected':
        'deskonektatuta',

    'angle (0-180)':
        'angelua (0-180)',

    'connect to Arduino':
        'konektatu Arduinoa',

    'disconnect Arduino':
        'deskonektatu Arduinoa',

    'Connect Arduino':
        'Konektatu Arduinoa',

    'Disconnect Arduino':
        'Deskonektatu Arduinoa',

    'arduino connected?':
        'arduinoa konektatuta?',

    'analog reading %analogPin':
        'irakurketa analogikoa %analogPin pinean',

    'digital reading %digitalPin':
        'irakurketa digitala %digitalPin pinean',

    'connect arduino at %s':
        'konektatu arduinoa %s atakan',

    'disconnect arduino':
        'deskonektatu arduinoa',

    'setup digital pin %digitalPin as %pinMode':
        'konfiguratu %digitalPin pin digitala %pinMode bezala',

    'set digital pin %digitalPin to %b':
        'ezarri %digitalPin pin digitalean %b balioa',

    'set servo %digitalPin to %servoValue':
        'ezarri %digitalPin serbomotorra %servoValue bezala',

    'set pin %pwmPin to value %n':
        'ezarri %pwmPin pinean %n balioa',

    'Connecting board at port\n': 
        'Plaka atakan konektatzen\n',

    'An Arduino board has been connected. Happy prototyping!':
        'Arduino plaka bat konektatu da.\nPrototipatze zoriontsua!',

    'Board was disconnected from port\n':
        'Plaka atakatik deskonektatu da\n',

    'It seems that someone pulled the cable!':
        'Norbaitek kablea atera duela dirudi!',

    'Error connecting the board.':
        'Errorea plaka konektatzean.',

    'There is already a board connected to this sprite':
        'Dagoeneko plaka bat dago objektu honetara konektatuta',

    'Could not connect an Arduino\nNo boards found':
        'Ezin izan da Arduinoa konektatu\nEz da plakarik aurkitu',

    'Could not talk to Arduino in port\n':
        'Ezin izan da atakako Arduinoarekin komunikatu\n',

    'Check if firmata is loaded.':
        'Egiaztatu firmata kargatuta dagoen.',

    'An error was detected on the board\n\n':
        'Errore bat detektatu da plakan\n\n',

    'Board is not connected':
        'Plaka ez dago konektatuta',

    'New Arduino translatable project':
        'Arduino proiektu itzulgarri berria', 

    'select a port':
        'hautatu ataka',

    'Network port':
        'Sareko ataka',

    'Enter hostname or ip address:':
        'Sartu ostalari-izena edo IP helbidea:',

    'Connecting to network port:\n':
        'Sareko atakara konektatzen:\n',

    'This may take a few seconds...':
        'Honek segundo batzuk beharko ditu...',

    'Network serial ports':
        'Sareko serieko atakak',

    'Open from URL...':
        'Ireki URLtik...',

    'Save, share and get URL...':
        'Gorde, partekatu eta eskuratu URLa...',

    'This project is now public at the following URL:':
        'Proiektu hau publikoki eskuragarri dago ondorengo URLan:',

    'About Snap4Arduino...':
        'Snap4Arduino-ri buruz...',
   
    'Snap4Arduino website':
        'Snap4Arduino webgunea',
  
    'Snap4Arduino repository':
        'Snap4Arduino biltegia',
 
    'Start a Snap Jr. session':
        'Hasi Snap Jr. saioa',

    'Start Snap4Arduino in an\nicon-based blocks mode\nfor the youngest programmers':
        'Hasi Snap4Arduino\nikonoetan oinarritutako bloke moduan\nprogramatzaile gazteenentzat',

    'Loading Snap Jr.':
        'Snap Jr. kargatzen'

};

// Add attributes to original SnapTranslator.dict.eu
for (var attrname in s4aTempDict) { SnapTranslator.dict.eu[attrname] = s4aTempDict[attrname]; }
