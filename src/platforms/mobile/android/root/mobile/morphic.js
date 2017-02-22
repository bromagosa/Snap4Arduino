MorphicPreferences.menuFontSize = 14;
MorphicPreferences.bubbleHelpFontSize = 12;
MorphicPreferences.prompterFontSize = 14;
MorphicPreferences.handleSize = 20;
MorphicPreferences.scrollBarSize = 18;
MorphicPreferences.grabThreshold = 10;

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

WorldMorph.prototype.initVirtualKeyboard = function (aStringOrTextMorph) {
    var myself = this,
        isTextMorph = aStringOrTextMorph instanceof TextMorph;

    if (this.virtualKeyboard) {
        document.body.removeChild(this.okButton);
        document.body.removeChild(this.cancelButton);
        document.body.removeChild(this.virtualKeyboard);
        this.okButton = null;
        this.cancelButton = null;
        this.virtualKeyboard = null;
    } 

    this.virtualKeyboard = document.createElement(isTextMorph ? 'textarea' : 'input');
    this.virtualKeyboard.type = 
        aStringOrTextMorph.isPassword ? 
            'password' : 
                (aStringOrTextMorph.isNumeric ? 'number' : 'text');
    this.virtualKeyboard.style.color = 'black';
    this.virtualKeyboard.style.backgroundColor = 'lightgray';
    this.virtualKeyboard.style.border = '1px solid whitesmoke';
    this.virtualKeyboard.style.outline = 'none';
    this.virtualKeyboard.style.position = 'fixed';
    this.virtualKeyboard.style.width = '100%';
    this.virtualKeyboard.style.height = (isTextMorph ? '100%' : '50px');
    this.virtualKeyboard.style.fontSize = '30px';
    this.virtualKeyboard.style.textAlign = (isTextMorph ? 'left' : 'center');
    this.virtualKeyboard.autocapitalize = 'none'; // iOS specific
    this.virtualKeyboard.style.top = '0';
    this.virtualKeyboard.style.left = '0';
    this.virtualKeyboard.style.zIndex = '5';
    this.virtualKeyboard.value = aStringOrTextMorph.text;

    this.okButton = document.createElement('a');
    this.okButton.text = localize('Ok');
    this.okButton.style.color = 'dimgray';
    this.okButton.style.backgroundColor = 'gray';
    this.okButton.style.border = '1px solid whitesmoke';
    this.okButton.style.textAlign = 'center';
    this.okButton.style.position = 'fixed';
    this.okButton.style.zIndex = '10';
    if (isTextMorph) {
        this.okButton.style.bottom = '0';
    } else {
        this.okButton.style.top = '50px';
    }
    this.okButton.style.left = 0;
    this.okButton.style.fontSize = '48px';
    this.okButton.style.width = '50%';
    this.okButton.onclick = function () { world.stopEditing(); };

    this.cancelButton = document.createElement('a');
    this.cancelButton.text = localize('Cancel');
    this.cancelButton.style = this.okButton.style.cssText;
    this.cancelButton.style.left = 'auto';
    this.cancelButton.style.right = 0;
    this.cancelButton.onclick = function () { world.stopEditing(true); };

    this.cursor.hide();
    aStringOrTextMorph.selectAll();
    this.editedMorph = aStringOrTextMorph;

    document.body.appendChild(this.virtualKeyboard);
    document.body.appendChild(this.okButton);
    document.body.appendChild(this.cancelButton);

    this.virtualKeyboard.focus();
    this.virtualKeyboard.select();
};

WorldMorph.prototype.edit = function (aStringOrTextMorph) {
    var pos = getDocumentPositionOf(this.worldCanvas);

    if (!aStringOrTextMorph.isEditable) {
        return null;
    }
    if (this.cursor) {
        this.cursor.destroy();
    }
    
    this.cursor = new CursorMorph(aStringOrTextMorph);
    aStringOrTextMorph.parent.add(this.cursor);
    this.keyboardReceiver = this.cursor;
    
    this.initVirtualKeyboard(aStringOrTextMorph);

    if (MorphicPreferences.useSliderForInput) {
        if (!aStringOrTextMorph.parentThatIsA(MenuMorph)) {
            this.slide(aStringOrTextMorph);
        }
    }

    if (this.lastEditedText !== aStringOrTextMorph) {
        aStringOrTextMorph.escalateEvent('freshTextEdit', aStringOrTextMorph);
    }
    this.lastEditedText = aStringOrTextMorph;
};

WorldMorph.prototype.stopEditing = function (cancelChanges) {
    if (this.cursor) {
        this.cursor.target.clearSelection();
        this.cursor.destroy();
        this.cursor = null;
    }
    this.keyboardReceiver = null;
    if (this.virtualKeyboard) {
        if (!cancelChanges) {
            this.editedMorph.text = this.virtualKeyboard.value;
            this.editedMorph.drawNew();
            this.editedMorph.changed();
        }
        this.virtualKeyboard.blur();
        document.body.removeChild(this.okButton);
        document.body.removeChild(this.cancelButton);
        document.body.removeChild(this.virtualKeyboard);
        this.okButton = null;
        this.cancelButton = null;
        this.virtualKeyboard = null;
    }
    this.worldCanvas.focus();
};

TextMorph.prototype.originalDrawNew = TextMorph.prototype.drawNew;
TextMorph.prototype.drawNew = function () {
    // Just... don't ask
    this.originalDrawNew();
    if (this.parent instanceof FrameMorph) {
        this.parent.setHeight(this.height() + 6);
    }
};

CursorMorph.prototype.initializeClipboardHandler = nop;

// Remove sliders for text inputs
WorldMorph.prototype.originalSlide = WorldMorph.prototype.slide;
WorldMorph.prototype.slide = function (aStringOrTextMorph) {
    if (!aStringOrTextMorph.parentThatIsA(InputSlotMorph)) { return; }
    this.originalSlide(aStringOrTextMorph);
};

// Only process touch move events if we're moving out of our grab threshold
HandMorph.prototype.processTouchMove = function (event) {
    MorphicPreferences.isTouchDevice = true;
    if (event.touches.length === 1) {
        var touch = event.touches[0],
            touchPosition = new Point(touch.pageX, touch.pageY);
        if (this.grabPosition.distanceTo(touchPosition) > MorphicPreferences.grabThreshold) {
            this.processMouseMove(touch);
            clearInterval(this.touchHoldTimeout);
        }
    }
};
