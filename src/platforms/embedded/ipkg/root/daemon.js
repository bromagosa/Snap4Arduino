var fs = require('fs'),
    cp = require('child_process'),
    logMode = process.argv.indexOf('--log') > -1,
    print = logMode ?
        function (str) { fs.appendFileSync('/var/log/snap4arduino', str + '\n'); } :
        function () {};

// Unless instructed to run in foreground, we fork ourselves and behave like a daemon

if (process.argv.indexOf('--fg') === -1) {
    console.log('starting daemon...');
    require('daemon')();
    console.log('daemon started');
} else {
    console.log('running in foreground');
    print = function (str) { console.log(str) };
}

// Let's first check whether there's an autorunnable Snap! project

if (fs.existsSync('/root/autorun.xml')) {
    console.log('Found autorunnable Snap4Arduino project, attempting to run it');
    var proc = cp.exec('snap4arduino --linino /root/autorun.xml');
    proc.stdout.on('data', print);
    proc.stderr.on('data', print);
    proc.on('close', function (code) { print('Snap4Arduino process stopped with exit code ' + code); });
}

// If passed the --ws argument, we start the websockets listener... listener?

if (process.argv.indexOf('--ws') > -1) {
    var wsStart;
    wsStart = function () {
        cp.execFile(
                'ps',
                function (err, stdout, stderr) {
                    if (stdout.indexOf('ws.js') === -1) {
                        console.log('Websockets listener not running');
                        var proc = cp.execFile('node', ['/usr/share/snap4arduino/ws.js']);
                        proc.stdout.on('data', print);
                        proc.stderr.on('data', print);
                        proc.on('close', function (code) { 
                            print('WebSockets listener stopped with exit code ' + code);
                            print('Will restart at next check');
                        });
                    } 
                });
    };

    setInterval(wsStart, 2500);
}
