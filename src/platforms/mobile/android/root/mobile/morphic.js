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

WorldMorph.prototype.initVirtualKeyboard = function () {
    var myself = this;

    if (this.virtualKeyboard) {
        document.body.removeChild(this.virtualKeyboard);
        this.virtualKeyboard = null;
    }
    if (!MorphicPreferences.isTouchDevice
            || !MorphicPreferences.useVirtualKeyboard) {
        return;
    }
    this.virtualKeyboard = document.createElement("input");
    this.virtualKeyboard.type = "text";
    this.virtualKeyboard.style.color = "black";
    this.virtualKeyboard.style.backgroundColor = "lightgray";
    this.virtualKeyboard.style.border = "1px solid black";
    this.virtualKeyboard.style.outline = "none";
    this.virtualKeyboard.style.position = "fixed";
    this.virtualKeyboard.style.top = "0px";
    this.virtualKeyboard.style.left = "0px";
    this.virtualKeyboard.style.width = "100%";
    this.virtualKeyboard.style.height = "50px";
    this.virtualKeyboard.style.fontSize = "30px";
    this.virtualKeyboard.style.textAlign = "center";
    this.virtualKeyboard.autocapitalize = "none"; // iOS specific
    document.body.appendChild(this.virtualKeyboard);

};

WorldMorph.prototype.originalEdit = WorldMorph.prototype.edit;
WorldMorph.prototype.edit = function (aStringOrTextMorph) {
    this.originalEdit(aStringOrTextMorph);
    this.virtualKeyboard.style.top = '0';
    this.virtualKeyboard.style.left = '0';
    this.virtualKeyboard.value = aStringOrTextMorph.text;
    this.virtualKeyboard.focus();
    this.virtualKeyboard.select();
    this.cursor.destroy();
    this.editedMorph = aStringOrTextMorph;
    aStringOrTextMorph.selectAll();
};

WorldMorph.prototype.stopEditing = function () {
    if (this.cursor) {
        this.cursor.target.clearSelection();
        this.cursor.destroy();
        this.cursor = null;
    }
    this.keyboardReceiver = null;
    if (this.virtualKeyboard) {
        this.editedMorph.text = this.virtualKeyboard.value;
        this.editedMorph.fullChanged();
        this.editedMorph.drawNew();
        this.virtualKeyboard.blur();
        document.body.removeChild(this.virtualKeyboard);
        this.virtualKeyboard = null;
    }
    this.worldCanvas.focus();
};

CursorMorph.prototype.initializeClipboardHandler = nop;

WorldMorph.prototype.originalSlide = WorldMorph.prototype.slide;
WorldMorph.prototype.slide = function(aStringOrTextMorph) {
    if (!aStringOrTextMorph.parentThatIsA(InputSlotMorph)) { return; };
    this.originalSlide(aStringOrTextMorph);
};

MorphicPreferences = touchScreenSettings;
