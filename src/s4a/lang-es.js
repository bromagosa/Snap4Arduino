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
        'salida digital',

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
        '¿arduino connectado?',

    'analog reading %analogPin':
        'lectura analógica %analogPin',

    'digital reading %digitalPin':
        'lectura digital %digitalPin',

    'connect arduino at %s':
        'conectar arduino al puerto %s',

    'disconnect arduino':
        'desconectar arduino',

    'setup digital pin %digitalPin as %pinMode':
        'configurar pin %digitalPin como %pinMode',

    'set digital pin %digitalPin to %b':
        'fijar pin digital %digitalPin en %b',

    'set servo %digitalPin to %servoValue':
        'fijar servo %digitalPin en %servoValue',

    'set pin %pwmPin to value %n':
        'fijar pin %pwmPin al valor %n',

    'Connecting board at port\n': 
        'Conectando tarjeta en la puerta\n',

    'An Arduino board has been connected. Happy prototyping!':
        'Se conectó exitosamente una tarjeta Arduino.\n¡Feliz prototipeo!',

    'Board was disconnected from port\n':
        'Se deconectó la tarjeta de la puerta\n',

    'It seems that someone pulled the cable!':
        '¡Parece que alguien desconectó el cable!',

    'Error connecting the board.':
        'Error al conectar la tarjeta',

    'There is already a board connected to this sprite':
        'Ya existe una tarjeta conectada a este objeto',

    'Could not connect an Arduino\nNo boards found':
        'No se pudo conectar un Arduino\nNo se encontró ninguna tarjeta',

    'Could not talk to Arduino in port\n':
        'No se pudo comunicar con Arduino en la puerta\n',

    'Check if firmata is loaded.':
        'Revise si tiene cargado el firmware Firmata.',

    'An error was detected on the board\n\n':
        'Se detectó un error en la tarjeta\n\n',

    'Board is not connected':
        'La tarjeta no está conectada',

    'New Arduino translatable project':
        'Nuevo proyecto traducible a Arduino', 

    'select a port':
        'seleccione una puerta',

    'Network port':
        'Puerta de red',

    'Enter hostname or ip address:':
        'Introduzca el nombre del host o su dirección IP',

    'Connecting to network port:\n':
        'Conectando a puerta de red:\n',

    'This may take a few seconds...':
        'Esto puede tardar unos segundos...',

    'Network serial ports':
        'Puertas serie sobre red',

    'Open from URL...':
        'Abre desde una URL...',

    'Save, share and get URL...':
        'Guarda, comparte y muestra la URL...',

    'This project is now public at the following URL:':
        'Este proyecto es público, accessible desde la URL:',

    'About Snap4Arduino...':
        'Sobre Snap4Arduino...',

    'Snap4Arduino website':
        'Web de Snap4Arduino',

    'Snap4Arduino repository':
        'Repositorio de Snap4Arduino',

    'Start a Snap Jr. session':
        'Inicia una sesión de Snap Junior',

    'HTTP server':
        'Servidor HTTP',

    'uncheck to stop\nHTTP server':
        'desmarcar para detener\nel servidor HTTP',

    'check to start\nHTTP server, allowing\nremote control\nof Snap4Arduino':
        'marcar para iniciar\nel servidor HTTP, habilitando\nel control remoto\nde Snap4Arduino',

    'Public stage':
        'Escenario público',

    'uncheck to prevent the stage\nfrom being viewed\nfrom the HTTP server':
        'desmarcar para evitar que el escenario\nse visualice desde el servidor HTTP',

    'check to allow the stage\nto be viewed\nfrom the HTTP server':
        'marcar para permitir que el escenario\nse visualice desde el servidor HTTP',

//Libraries
    'Libraries below this point are specific to Snap4Arduino.':
        'Las siguientes bibliotecas son específicas de Snap4Arduino.',
    'Scale between ranges':
        'Escala entre intervalos',
    'Scale a value from a range to another. Useful to map sensor values into stage coordinates, or to map sensors into actuators.':
        'Escala un valor de un intervalo a otro. Útil para mapear valores de sensores a las coordenadas del escenario o para pasar directamente valores de sensores a actuadores.',
    'SnapJunior Blocks':
        'Bloques del Snap Junior',
    'Icon-based blocks for the youngest programmers.':
        'Bloques con iconos para los programadores y programadoras más jóvenes.',
    'SnapJuniorPlus Blocks':
        'Más bloques para el Snap Junior',
    'Extra blocks for SnapJunior.':
        'Bloques para añadir funcionalidades al Snap Junior',

    'I2C':
        'I2C',
    'Send and receive data from I2C-enabled sensors and actuators.':
        'Envía y recibe datos por el protocolo I2C de sensores y actuadores.',
    'Adding extra features to StandardFirmata: tone, pulseIn, pulseOut, ping, nunchuck and dht11 blocks. It requires SA5Firmata_tone firmware.':
        'Añade funcionalidades al StandardFirmata: tone, pulseIn, pulseOut, ping, nunchuck i dht11. Necesita que el dispositivo tenga el firmware SA5Firmata_tone.',
    'SA5Firmata with IR features at the expense of simplifying the tone function. It requires SA5Firmata_ir firmware.':
        'SA5Firmata con funcionalidades IR, limitando las funcionalidades del tone. Necesita que el dispositivo tinga el firmware SA5Firmata_IR.',

    'Blocks for the TdRSTEAM shield v1. Use StandardFirmata or SA5Firmata_tone firmware to add buzzer features.':
        'Bloques para la TdRSTEAM v1. Utiliza el StandardFirmata o el SA5Firmata_tone para añadir las funcionalidades del zumbador (tone).',
    'Blocks for the TdRSTEAM shield v2, Use StandardFirmata or SA5Firmata_tone firmware to add buzzer features.':
        'Bloques para la TdRSTEAM v2. Utiliza el StandardFirmata o el SA5Firmata_tone para añadir las funcionalidades del zumbador (tone).',
    'Imagina Shield':
        'Placa Imagina',
    'Blocks for the Imagina shield. Use StandardFirmata, SA5Firmata_tone to add buzzer features or SA5Firmata_IR for buzzer and IR features.':
        'Bloques para la placa Imagina. Utiliza el StandardFirmata, el S5AFirmata_tone para añadir las funcionalidades del zumbador (tone) o el SA5Firmata_IR para tener zumbador (simplificado) y funcionalidades IR.',
    'Echidna Boards':
        'Placas Echidna',
    'Blocks for the Echidna boards. Use StandarFirmata or SA5Firmata_tone to add more buzzer features.':
        'Bloques para las placas Echidna. Utiliza el StandardFirmata o el SA5Firmata_tone para añadir las funcionalidades del zumbador (tone).',
    'Blocks for the NodeMCU board using StandardFirmata. It has also blocks for a motor shield.':
        'Bloques para la placa NodeMCU utilitzando el StandardFirmata. También incorpora bloques para la placa de motores.'
};

// Add attributes to original SnapTranslator.dict.es
for (var attrname in s4aTempDict) { SnapTranslator.dict.es[attrname] = s4aTempDict[attrname]; }
