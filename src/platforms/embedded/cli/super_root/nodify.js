// I take care of overriding everything related to graphics, the DOM, the browser,
// HTML5 Canvases and whatnot.

localStorage = null;

function nop() { return null };

Object.originalDefineProperty = Object.defineProperty;
Object.defineProperty = function (obj, prop, descriptor) {
    if (obj.isBogus) {
        return;
    } else {
        this.originalDefineProperty(obj, prop, descriptor);
    }
};

var bogusObject = {
    data: [0,0,0,0],
    width: 0,
    height: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    addColorStop: nop,
    isBogus: true
}

function Canvas(width, height) {
    this.width = width;
    this.height = height;
    this.isFake = true;
    this.context = new FakeContext(width, height);
};

Canvas.prototype = bogusObject;

Canvas.prototype.getContext = function() {
    return this.context;
};

Canvas.prototype.addEventListener = nop;

function FakeContext(width, height) {
    this.width = width;
    this.height = height;
    this.isFake = true;
};

FakeContext.prototype = bogusObject;

document = {
    createElement: function(elementName) {
        if (elementName === 'canvas') {
            return new Canvas(10, 10);
        } else {
            console.error('I don\'t know how to make a ' + elementName);
        }
    },
    body: {
        addEventListener: nop
    }
};

var nullableFunctions = [
    'arc', 
    'beginPath', 
    'bezierCurveTo',
    'clearRect', 
    'clip',
    'closePath', 
    'drawImage',
    'fill', 
    'fillRect', 
    'fillText',
    'lineTo', 
    'moveTo', 
    'quadraticCurveTo',
    'restore',
    'save',
    'scale',
    'stroke',
    'toDataURL',
    'translate'
];

var bogusableFunctions = [
    'createLinearGradient',
    'createRadialGradient',
    'getImageData',
    'measureText'
];

nullableFunctions.forEach(function(each){
    FakeContext.prototype[each] = nop;
});

bogusableFunctions.forEach(function(each){
    FakeContext.prototype[each] = function() { return bogusObject };
})

function Image() {};

HTMLCanvasElement = Canvas;
CanvasRenderingContext2D = FakeContext;

canvas = new Canvas();

window = { addEventListener: nop };

location = { hash: '' };

function enableRetinaSupport () {}

