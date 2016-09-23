#!/usr/bin/node --harmony

// Yes, no "var"
// We need to keep it ugly if we want everybody to be able to access these

fs = require('fs');
project = null;
modules = {};
vm = require('vm');

// Let's parse all parameters

projectFileName = process.argv.filter(function (any) { return any.substr(-4) === '.xml'; });

if (projectFileName) {
    projectFileName = projectFileName[0];
}

serialPort = process.argv.filter(function (any) { return any.indexOf('dev') > -1; });

if (serialPort) {
    serialPort = serialPort[0];
}

snapMode = process.argv.indexOf('--plain-snap') > -1;
canvasMode = process.argv.indexOf('--canvas') > -1;
httpServerMode = process.argv.indexOf('--serve') > -1 || canvasMode;
lininoMode = !serialPort && process.argv.indexOf('--linino') > -1;

// Let's treat all parameters

if (process.argv.indexOf('--help') > -1) {
    printHelp();
    process.exit(0);
};

if (!projectFileName) {
    console.error('Please provide an xml Snap! project file to run');
    printHelp();
    process.exit(1);
}

if (!snapMode && !serialPort && !lininoMode) {
    console.error('Please either specify a path to your serial port or run the interpreter in Linino mode');
    printHelp();
    process.exit(1);
}

if (projectFileName) {
    project = fs.readFileSync(projectFileName, { encoding: 'utf-8' });
}

function printHelp() {
    console.log();
    console.log('Usage: snap.js yourProject.xml [--plain-snap] [--canvas] [--serve] [/path/to/serial]');
    console.log('Runs a Berkeley Snap! project or a Snap4Arduino one on the command line.\n');
    console.log('\t--plain-snap\n\t\tRuns a plain Snap! project with no Arduino capabilities.');
    console.log('\t--linino\n\t\tUses the LininoIO library for communication with the Arduino instead of Firmata.');
    console.log('\t\tMeant to be used in boards with embedded GNU/Linux inside (Tian, Yun, etc).');
    console.log('\t\tIf a serial port is specified, this setting will have no effect.');
    console.log('\t--canvas\n\t\tRenders the Stage in an HTTP-streamable canvas. Automatically adds «--serve».');
    console.log('\t--serve\n\t\tStarts a simple HTTP server at port 42001 with the following entry points:');
    console.log('\t\thttp://[IP]:42001/stage\n\t\t\tStreams the Stage in real time. Needs «--canvas».');
    console.log('\t\thttp://[IP]:42001/broadcast=[message]\n\t\t\tBroadcasts «message» to Snap! so it can be captured by «When I receive» hat blocks.');
    console.log('\t\thttp://[IP]:42001/send-messages\n\t\t\tLists all messages being used in the Snap! program.');
    console.log('\t\thttp://[IP]:42001/send-vars\n\t\t\tLists all variables being used in the Snap! program.');
    console.log('\t\thttp://[IP]:42001/vars-update=[variable]=[value]\n\t\t\tSets the Snap! variable «variable» to «value».');
    process.exit(0);
}

// A hackety "include" that just appends js files in context

include = function (moduleName) { return require(moduleName); };

var includeInThisContext = function (path, needsRequire) {
    // we can't "require" modules from within "appended" js files
    var code = fs.readFileSync(__dirname + '/' + path, {encoding: 'utf-8'});

    if (needsRequire) {
        code = code.replace(/require/g, 'include');
    }

    // The Retina display support changes break everything for us
    code = code.replace('enableRetinaSupport();', '');

    vm.runInThisContext(code, path);

}.bind(this);


// Let's load it all

if (!Object.assign) {
    require('es6-shim');
}

includeInThisContext(canvasMode ? 'canvas.js' : 'nodify.js', true);

includeInThisContext('snap/morphic.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/arduino.js', true);
    includeInThisContext('snap/s4a/morphic.js', true);
    WorldMorph.prototype.init = WorldMorph.prototype.originalInit;
}

includeInThisContext('snap/widgets.js');
includeInThisContext('snap/blocks.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/blocks.js');
}

includeInThisContext('snap/threads.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/threads.js');
}

includeInThisContext('snap/objects.js');

if (!snapMode) {
    includeInThisContext('snap/s4a/objects.js');
}

includeInThisContext('snap/gui.js');

if (httpServerMode) {
    includeInThisContext('snap/s4a/httpserver.js', true);
}

includeInThisContext('snap/lists.js');
includeInThisContext('snap/byob.js');
includeInThisContext('snap/tables.js');
includeInThisContext('snap/xml.js');
includeInThisContext('snap/store.js');

IDE_Morph.prototype.version = function() {
    var version = 'unknown';
    try {
        version = fs.readFileSync('/usr/share/snap-interpreter/version');
    } catch (err) {
        try {
            version = fs.readFileSync('version');
        } catch (err) {
            console.log('Could not determine Snap4Arduino version. Will default to "unknown".')
        }
    }
};

if (!snapMode) {
    includeInThisContext('snap/s4a/store.js');
}

includeInThisContext('snap/cloud.js');

// Some decorations and overrides

includeInThisContext('decorators.js');

// One World

Morph.prototype.world = function () {
    return world;
}

// Actual world and IDE construction

world = new WorldMorph(canvas);

if (!snapMode) {
    world.Arduino.keepAlive = true;
}

ide = new IDE_Morph();
ide.openIn(world);

if (httpServerMode) {
    ide.startServer();
}

ide.rawOpenProjectString(project);

if (lininoMode) {
    require('ideino-linino-lib/utils/proto.js');
    var linino = require('ideino-linino-lib');
    includeInThisContext('linino.js');
    var board = new linino.Board();
    ide.currentSprite.arduino.board = board;
    board.connect(function () {
        ide.currentSprite.arduino.board.pins = {};
        console.log('Board connected via LininoIO');
        startUp();
    });
} else if (!snapMode) {
    ide.currentSprite.arduino.connect(serialPort, startUp);
} else {
    startUp();
}

function startUp () {
    ide.runScripts();

    setInterval(loop, 1);

    function loop() {
        world.doOneCycle();
    }
}
