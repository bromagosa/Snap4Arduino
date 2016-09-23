// Let's tweak some files a bit (really dirty stuff!)

try {
    if (!fs.readFileSync('node_modules/canvas/lib/context2d.js', {encoding: 'utf-8'}).match('SNAP4ARDUINO')) {
        fs.appendFileSync('node_modules/canvas/lib/context2d.js','\n\n// ADDED BY SNAP4ARDUINO\n\nCanvasGradient.prototype.oldAddColorStop = CanvasGradient.prototype.addColorStop;\nCanvasGradient.prototype.addColorStop = function(where, color) {\n\tthis.oldAddColorStop(where, color.toString());\n};');
    }

    if (!fs.readFileSync('node_modules/canvas/lib/canvas.js', {encoding: 'utf-8'}).match('SNAP4ARDUINO')) {
        fs.appendFileSync('node_modules/canvas/lib/canvas.js','\n\n// ADDED BY SNAP4ARDUINO\n\nCanvas.prototype.addEventListener = function() {};\nCanvas.prototype.focus = function() {};');
    }
} catch (err) {
    
}

Canvas = include('canvas');
HTMLCanvasElement = Canvas;
Image = Canvas.Image;
canvas = new Canvas(200, 200);

CanvasRenderingContext2D = Canvas.Context2d;

// Oh, you miss your DOM, don't you?

document = {
    createElement: function(elementName) {
        if (elementName === 'canvas') {
            return new Canvas(200, 200);
        } else {
            console.error('I don\'t know how to make a ' + elementName);
        }
    },
    body: {
        addEventListener: function() {}
    }
};

window = {
    addEventListener: function() {}
};

location = {
    hash: ''
}

localStorage = null;
