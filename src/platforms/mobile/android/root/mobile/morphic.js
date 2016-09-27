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

HandMorph.prototype.originalProcessTouchStart = HandMorph.prototype.processTouchStart;
HandMorph.prototype.processTouchStart = function (event) {
    if (event.touches.length === 2) {
        this.pinchDistance = 0;
    } else if (event.touches.length === 3) {
        this.translateStartPoint = (new Point(event.touches[0].pageX, event.touches[0].pageY)).subtract(this.translation);
    }
    this.originalProcessTouchStart(event);
};

HandMorph.prototype.originalProcessTouchMove = HandMorph.prototype.processTouchMove;
HandMorph.prototype.processTouchMove = function (event) {
    if (event.touches.length === 2) {
        var distance =
            Math.sqrt(
                    Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) +
                    Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));
        if (distance > this.pinchDistance) {
            this.zoom = Math.min(this.zoom + distance * 0.0001 , 3);
        } else {
            this.zoom = Math.max(this.zoom - distance * 0.0001, 1);
        }
        worldElement.style.transform = 'scale(' + this.zoom + ') translate(' + this.translateStyle + ')';
        this.pinchDistance = distance;
    } else if (event.touches.length === 3) {
        this.translation = (new Point(event.touches[0].pageX, event.touches[0].pageY)).subtract(this.translateStartPoint);
        this.translateStyle = this.translation.x + 'px, ' + this.translation.y + 'px';
        worldElement.style.transform = 'scale(' + this.zoom + ') translate(' + this.translateStyle + ')';
    }
    this.originalProcessTouchMove(event);
};

