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
        '디지털 입력',

    'digital output':
        '디지털 출력',

    'PWM':
        'PWM',

    'servo':
        '서보',

    'clockwise':
        '시계 방향',

    'clockwise (1500-1000)':
        '시계 방향 (1500-1000)',

    'counter-clockwise':
        '반시계 방향',

    'counter-clockwise (1500-2000)':
        '반시계 방향 (1500-2000)',

    'stopped':
        '정지',

    'stopped (1500)':
        '정지 (1500)',

    'disconnected':
        '연결 끊김',

    'angle (0-180)':
        '각도(0-180)',

    'connect to Arduino':
        '아두이노 연결',

    'disconnect Arduino':
        '아두이노 연결 끊기',

    'Connect Arduino':
        '아두이노 연결',

    'Disconnect Arduino':
        '아두이노 연결 끊기',

    'analog reading %analogPin':
        '아날로그 입력 %analogPin 번 핀',

    'digital reading %digitalPin':
        '디지털 입력 %digitalPin 번 핀',

    'connect arduino at %s':
        '%s 번 포트의 아두이노 연결하기',

    'disconnect arduino':
        '아두이노 연결 끊기',

    'arduino connected?':
        '아두이노 연결됨?',

    'setup digital pin %digitalPin as %pinMode':
        '디지털 핀 %digitalPin 을 %pinMode 로 설정하기',

    'set digital pin %digitalPin to %b':
        '디지털 핀 %digitalPin 을 %b 로 설정하기',

    'set servo %digitalPin to %servoValue':
        '서보 핀 %digitalPin 을 %servoValue 로 설정하기',

    'set pin %pwmPin to value %n':
        'PWM 핀 %pwmPin 을 %n 으로 설정하기',

    'Connecting board at port\n': 
        '다음 포트의 보드를 연결 중입니다:\n',

    'An Arduino board has been connected. Happy prototyping!':
        '아두이노 보드가 연결되었습니다!',

    'Board was disconnected from port\n':
        '다음 포트에서 보드 연결이 끊겼습니다.:\n',

    'It seems that someone pulled the cable!':
        '케이블이 뽑힌 것 같습니다.',

    'Error connecting the board.':
        '보드 연결에 오류가 발생했습니다.',

    'There is already a board connected to this sprite':
        '이 스프라이트에 이미 연결된 보드가 있습니다.',

    'Could not connect an Arduino\nNo boards found':
        '아두이노에 연결할 수 없습니다.\n아무 보드도 발견되지 않았습니다.',

    'Could not talk to Arduino in port\n':
        '다음 포트의 아두이노와 통신할 수 없습니다:\n',

    'Check if firmata is loaded.':
        'firmata가 로드되었는지 확인하십시오.',

    'An error was detected on the board\n\n':
        '보드에서 오류가 발견되었습니다.\n\n',

    'Board is not connected':
        '보드가 연결되지 않았습니다.',

    'New Arduino translatable project':
        '새로운 아두이노 변환 가능 프로젝트',

    'select a port':
        '포트를 선택하십시오.',

    'Network port':
        '네트워크 포트',

    'Enter hostname or ip address:':
        'hostname이나 ip 주소를 입력하십시오:',

    'Connecting to network port:\n':
        '다음 네트워크 포트에 연결 중입니다:\n',

    'This may take a few seconds...':
        '몇 초가 걸릴 수 있습니다...',

    'Network serial ports':
        '네트워크 시리얼 포트',

    'Open from URL...':
        'URL로부터 열기...',

    'Save, share and get URL...':
        '저장, 공유하고 URL 얻기...',

    'This project is now public at the following URL:':
        '이 프로젝트는 다음 URL로 접근할 수 있습니다:',

    'About Snap4Arduino...':
        'Snap4Arduino에 대해...',
   
    'Snap4Arduino website':
        'Snap4Arduino 웹사이트',
  
    'Snap4Arduino repository':
        'Snap4Arduino 레포지터리',
 
    'Start a Snap Jr. session':
        'Snap Jr. 세션 시작하기',

    'Start Snap4Arduino in an\nicon-based blocks mode\nfor the youngest programmers':
        '어린 프로그래머를 위해,\nSnap4Arduino를 아이콘 기반 블록 모드로 시작합니다.',

    'Loading Snap Jr.':
        'Snap Jr. 로드 중'
};

// Please change the LANG keyword in the lines below by your locale's two-digit code in lowercase,
// like en for English, ca for Catalan, zh for Mandarin or de for German.

// Add attributes to original SnapTranslator.dict.ko
for (var attrname in s4aTempDict) { SnapTranslator.dict.ko[attrname] = s4aTempDict[attrname]; }
