s4aTempDict = {

/*
    Special characters: (see <http://0xcc.net/jsescape/>)

    À      \u00C0
    à      \u00E0
    É      \u00C9
    è      \u00E8
    é      \u00E9
    ê      \u00EA
    ç      \u00E7
    ï      \u00EF
    ô      \u00F4
    ù      \u00F9
    °      \u00B0
    '      \u0027
    «      \u00AB
    »      \u00BB
    ↔      \u2194
    ↕      \u2195
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

    'language_name':
        'Türkçe', // the name as it should appear in the language menu (Dil menüsünde görünmesi gereken isim)
    'language_translator':
        ' www.3drobolab.com', // your name for the Translators tab (Çevirenlerin isimleri)
    'translator_e-mail':
        'yildizhuseyin@gmail.com, mustafaipekbayrak@gmail.com', // optional (Mail adresleri)
    'last_changed':
        '2018-1-05', // this, too, will appear in the Translators tab (Son güncelleme tarihi)

    */

    // arduino:

    'digital input':
        'Sayısal Giriş',

    'digital output':
        'Sayısal Çıkış',

    'PWM':
        'PWM',

    'servo':
        'Servo',

    'clockwise':
        'Saat Yönü',

    'clockwise (1500-1000)':
        'Saat Yönü (1500-1000)',

    'counter-clockwise':
        'Saat Yönünün Tersi',

    'counter-clockwise (1500-2000)':
        'Saat Yönünün Tersi (1500-2000)',

    'stopped':
        'Durduruldu',

    'stopped (1500)':
        'Durduruldu (1500)',

    'angle (0-180)':
        'Açı (0-180)',

    'connect to Arduino':
        'Arduino ya bağlan',

    'disconnect Arduino':
        'Arduino Bağlantısını Kes',

    'Connect Arduino':
        'Seri Porta Bağlan',

    'Disconnect Arduino':
        'Bağlantıyı Kes',

    'analog reading %analogPin':
        'Analog pin oku A %analogPin',

    'digital reading %digitalPin':
        'Sayısal pin oku D %digitalPin',

    'connect arduino at %s':
        'Ardunio ya bağlan port: %s',

    'disconnect arduino':
        'Ardunio bağlantısını kes',

    'setup digital pin %digitalPin as %pinMode':
        'Sayısal pin D %digitalPin durumunu %pinMode yap',

    'set digital pin %digitalPin to %b':
        'Sayısal pin D %digitalPin değerini %b yap',

    'set servo %digitalPin to %servoValue':
        'Servo pin D %digitalPin değerini %servoValue yap',

    'set pin %pwmPin to value %n':
        'Sayısal pin D %pwmPin değerini %n yap',

    'Connecting board at port\n':
        'Arduino kartına bağlanıyor port\n ',

    'An Arduino board has been connected. Happy prototyping!':
        'Arduino kartına bağlanıldı. İyi eğlenceler!',

    'Board was disconnected from port\n':
        'Port bağlantısı kesildi port\n',

    'It seems that someone pulled the cable!':
        'HATA! Bağlantı kablosunu kontrol edin!',

    'Error connecting the board.':
        'HATA! Arduino ya bağlanırken hata oluştu.',

    'There is already a board connected to this sprite':
        'Bu karakter zaten bir Arduino ya bağlı.',

    'Could not connect an Arduino\nNo boards found':
        'Aruino ya bağlanılamadı\nKart bulunamadı.',

    'Could not talk to Arduino in port\n':
        'Arduino ile iletişim kurulamadı port\n',

    'Check if firmata is loaded.':
        'Frimata nın yüklü oldup olmadığını kontrol edin.',

    'An error was detected on the board\n\n':
        'HATA! Arduino kartı üzerinde hata bulundu.\n\n',

    'Board is not connected':
        'Arduino kartı bağlı değil.'

};

for (var attrname in s4aTempDict) { SnapTranslator.dict.tr[attrname] = s4aTempDict[attrname]; }
