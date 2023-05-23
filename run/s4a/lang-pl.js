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
        'wejście cyfrowe',

    'digital output':
        'wyjście cyfrowe',

    'PWM':
        'PWM',

    'servo':
        'serwo',

    'clockwise':
        'zgodnie z ruchem wskazówek',

    'clockwise (1500-1000)':
        'zgodnie z ruchem wskazówek (1500-1000)',

    'counter-clockwise':
        'przeciwnie do ruchu wskazówek',

    'counter-clockwise (1500-2000)':
        'przeciwnie do ruchu wskazówek (1500-2000)',

    'stopped':
        'zatrzymany',

    'stopped (1500)':
        'zatrzymany (1500)',

    'disconnected':
        'odłączony',

    'angle (0-180)':
        'kąt (0-180)',

    'connect to Arduino':
        'połącz z Arduino',

    'disconnect Arduino':
        'odłącz Arduino',

    'Connect Arduino':
        'Połącz z Arduino',

    'Disconnect Arduino':
        'Odłącz Arduino',

	'arduino connected?':
        'Arduino podłączone?',

    'analog reading %analogPin':
        'odczyt analogowy %analogPin',

    'digital reading %digitalPin':
        'odczyt cyfrowy %digitalPin',

    'connect arduino at %s':
        'połącz z Arduino przez port %s',

    'disconnect arduino':
        'odłącz Arduino',

    'setup digital pin %digitalPin as %pinMode':
        'ustal cyfrowy pin %digitalPin jako %pinMode',

    'set digital pin %digitalPin to %b':
        'ustaw cyfrowy pin %digitalPin na %b',

    'set servo %digitalPin to %servoValue':
        'ustaw serwo %digitalPin na %servoValue',

    'set pin %pwmPin to value %n':
        'ustaw PWM pin %pwmPin na %n',

    'Connecting board at port\n':
        'Łączenie z płytką na porcie\n',

    'An Arduino board has been connected. Happy prototyping!':
        'Arduino zostało podłączone. Miłego prototypowania!',

    'Board was disconnected from port\n':
        'Płytka została odłączona od portu\n',

    'It seems that someone pulled the cable!':
        'Wygląda na to że ktoś odłączył kabel!',

    'Error connecting the board.':
        'Błąd w trakcie podłączania do płytki.',

    'There is already a board connected to this sprite':
        'Jest już płytka podłączona do tego duszka',

    'Could not connect an Arduino\nNo boards found':
        'Nie udało się połączyć z Arduino\nNie znaleziono płytki',

    'Could not talk to Arduino in port\n':
        'Brak komunikacji z Arduino na porcie\n',

    'Check if firmata is loaded.':
        'Sprawdź, czy Firmata jest wgrana.',

    'An error was detected on the board\n\n':
        'Wykryto błąd na płytce\n\n',

    'Board is not connected':
        'Płytka nie jest podłączona',

    'select a port':
        'wybierz port',

    'Network port':
        'Port sieciowy',

    'Enter hostname or ip address:':
        'Wpisz nazwę hosta lub adres ip:',

    'Connecting to network port:\n':
        'Łączenie z portem sieciowym:\n',

    'This may take a few seconds...':
        'To może potrwać kilka sekund...',

    'Network serial ports':
        'Sieciowe porty szeregowe'
};

// Add attributes to original SnapTranslator.dict.pl
for (var attrname in s4aTempDict) { SnapTranslator.dict.pl[attrname] = s4aTempDict[attrname]; }
