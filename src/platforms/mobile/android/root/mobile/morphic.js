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
        isTextMorph = aStringOrTextMorph instanceof TextMorph,
        inputElement = isTextMorph ? this.virtualTextKeyboard : this.virtualKeyboard;

    if (isTextMorph && !this.virtualTextKeyboard) {
        this.virtualTextKeyboard = document.createElement('textarea');
        inputElement = this.virtualTextKeyboard;
        setUp();
    } else if (!isTextMorph && !this.virtualKeyboard) {
        this.virtualKeyboard = document.createElement('input');
        inputElement = this.virtualKeyboard;
        setUp();
    }

    function setUp () {
        document.body.appendChild(inputElement);
        inputElement.style.color = 'black';
        inputElement.style.backgroundColor = 'lightgray';
        inputElement.style.border = '1px solid whitesmoke';
        inputElement.style.outline = 'none';
        inputElement.style.position = 'fixed';
        inputElement.style.width = '100%';
        inputElement.style.height = (isTextMorph ? '100%' : '50px');
        inputElement.style.fontSize = '30px';
        inputElement.style.textAlign = (isTextMorph ? 'left' : 'center');
        inputElement.autocapitalize = 'none'; // iOS specific
        inputElement.style.top = 0;
        inputElement.style.left = 0;
        inputElement.style.zIndex = 5;
    };

    if (!this.previewImg) {
        this.previewImg = document.createElement('img');
        this.previewImg.hidden = true;
        this.previewImg.style.position = 'fixed';
        this.previewImg.style.top = 0;
        this.previewImg.style.margin = '0 auto';
        this.previewImg.style.zIndex = 6;
        this.previewImg.style.left = '50%';
        this.previewImg.style.transform = 'translateX(-50%)';
        document.body.appendChild(this.previewImg);
    }

    if (!isTextMorph) {
        this.previewImg.src = aStringOrTextMorph.parent.fullImageClassic().toDataURL();
        this.previewImg.style.display = 'block';
    }

    inputElement.type = 
        aStringOrTextMorph.isPassword ? 
            'password' : 
                (aStringOrTextMorph.isNumeric ? 'number' : 'text');

    inputElement.value = aStringOrTextMorph.text;

    if (!this.okButton) {
        this.okButton = document.createElement('a');
        this.okButton.text = localize('Ok');
        this.okButton.style.color = 'dimgray';
        this.okButton.style.backgroundColor = 'gray';
        this.okButton.style.border = '1px solid whitesmoke';
        this.okButton.style.textAlign = 'center';
        this.okButton.style.position = 'fixed';
        this.okButton.style.zIndex = 10;
        this.okButton.style.left = 0;
        this.okButton.style.fontSize = '48px';
        this.okButton.style.width = '50%';
        this.okButton.onclick = function () { world.stopEditing(); };
        document.body.appendChild(this.okButton);
    }

    if (isTextMorph) {
        this.okButton.style.top = 'auto';
        this.okButton.style.bottom = 0;
        inputElement.style.paddingTop = 0;
    } else {
        inputElement.style.paddingTop = (aStringOrTextMorph.parent.height() + 8) + 'px';
        this.okButton.style.top = (aStringOrTextMorph.parent.height() + 58) + 'px';
        this.okButton.style.bottom = 'auto';
    }

    if (!this.cancelButton) {
        this.cancelButton = document.createElement('a');
        this.cancelButton.text = localize('Cancel');
        this.cancelButton.onclick = function () { world.stopEditing(true); };
        document.body.appendChild(this.cancelButton);
    }

    this.cancelButton.style = this.okButton.style.cssText;
    this.cancelButton.style.left = 'auto';
    this.cancelButton.style.right = 0;

    this.cursor.hide();
    aStringOrTextMorph.selectAll();
    this.editedMorph = aStringOrTextMorph;

    inputElement.hidden = false;
    this.okButton.hidden = false;
    this.cancelButton.hidden = false;

    inputElement.focus();
    inputElement.select();
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
    var inputElement; 
    if (this.cursor) {
        inputElement =
            this.cursor.target instanceof TextMorph ?
                this.virtualTextKeyboard :
                this.virtualKeyboard;
        this.cursor.target.clearSelection();
        this.cursor.destroy();
        this.cursor = null;
    }
    this.keyboardReceiver = null;
    if (inputElement) {
        if (!cancelChanges) {
            this.editedMorph.text = inputElement.value;
            this.editedMorph.drawNew();
            this.editedMorph.changed();
        }
        inputElement.blur();
        this.okButton.hidden = true;
        this.cancelButton.hidden = true;
        inputElement.hidden = true;
        this.previewImg.style.display = 'none';
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
        if (!this.grabPosition ||
                this.grabPosition.distanceTo(touchPosition) > MorphicPreferences.grabThreshold) {
            this.processMouseMove(touch);
            clearInterval(this.touchHoldTimeout);
        }
    }
};
