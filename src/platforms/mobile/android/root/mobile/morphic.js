WorldMorph.prototype.Arduino.firmata = firmata;

WorldMorph.prototype.Arduino.getSerialPorts = function (callback) {
    var myself = this,
    portList = [];

    bluetoothSerial.list(function (devices) {
        devices.forEach(function (device) { 
            if (!myself.isPortLocked(device.address)) {
                portList[device.name] = device.address;
            }
        });
        callback(portList);
    },
    function () {
        myself.alert('Could not get device list.');
    });
};

// Reverting some changes
WorldMorph.prototype.init = WorldMorph.prototype.originalInit;

// Pinch-zoom and pan implementation
HandMorph.prototype.originalInit = HandMorph.prototype.init;
HandMorph.prototype.init = function (aWorld) {
    this.originalInit(aWorld);
    this.zoom = Number(document.body.style.zoom || 1);
    this.translation = new Point(0, 0);
    this.translateStyle = '0px, 0px';
};

HandMorph.prototype.processTouchStart = function (event) {
    var myself = this;

    MorphicPreferences.isTouchDevice = true;
    clearInterval(this.touchHoldTimeout);
    
    if (event.touches.length === 1) {
        this.touchHoldTimeout = setInterval( // simulate mouseRightClick
            function () {
                myself.processMouseDown({button: 2});
                myself.processMouseUp({button: 2});
                event.preventDefault();
                clearInterval(myself.touchHoldTimeout);
            },
            400
        );
        this.processMouseMove(event.touches[0]); // update my position
        this.processMouseDown({button: 0});
        event.preventDefault();
    } else if (event.touches.length === 2) {
        this.pinchDistance = 0;
    } else if (event.touches.length === 3) {
        this.translateStartPoint = (new Point(event.touches[0].pageX, event.touches[0].pageY)).subtract(this.translation);
    }
};

HandMorph.prototype.processTouchMove = function (event) {
    MorphicPreferences.isTouchDevice = true;

    if (event.touches.length === 1) {
        this.processMouseMove(event.touches[0]);
        clearInterval(this.touchHoldTimeout);
    } else if (event.touches.length === 2) {
        var distance =
            Math.sqrt(
                    Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) +
                    Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));
        if (distance > this.pinchDistance) {
            this.zoom = Math.min(this.zoom + distance * 0.0001 , 3);
        } else {
            this.zoom = Math.max(this.zoom - distance * 0.0001, 1);
        }
        this.pinchDistance = distance;
        worldElement.style.transform = 'scale(' + this.zoom + ');
    } else if (event.touches.length === 3) {
        this.translation = (new Point(event.touches[0].pageX, event.touches[0].pageY)).subtract(this.translateStartPoint);
        worldElement.style.left = this.translation.x + 'px';
        worldElement.style.top = this.translation.y + 'px';
    }
};

// Need to factor zoom in here:
function getDocumentPositionOf(aDOMelement) {
    // answer the absolute coordinates of a DOM element in the document
    var pos, offsetParent;
    if (aDOMelement === null) {
        return {x: 0, y: 0};
    }
    pos = {x: aDOMelement.offsetLeft, y: aDOMelement.offsetTop};
    offsetParent = aDOMelement.offsetParent;
    while (offsetParent !== null) {
        pos.x += offsetParent.offsetLeft;
        pos.y += offsetParent.offsetTop;
        if (offsetParent !== document.body &&
                offsetParent !== document.documentElement) {
            pos.x -= offsetParent.scrollLeft;
            pos.y -= offsetParent.scrollTop;
        }
        offsetParent = offsetParent.offsetParent;
    }
    return pos;
}

