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

WorldMorph.prototype.initEventListeners = function () {
    var canvas = this.worldCanvas, myself = this;

    if (myself.useFillPage) {
        myself.fillPage();
    } else {
        this.changed();
    }

    canvas.addEventListener(
        "mousedown",
        function (event) {
            event.preventDefault();
            canvas.focus();
            myself.hand.processMouseDown(event);
        },
        false
    );

    canvas.addEventListener(
        "touchstart",
        function (event) {
            myself.hand.processTouchStart(event);
        },
        { passive: true }
    );

    canvas.addEventListener(
        "mouseup",
        function (event) {
            event.preventDefault();
            myself.hand.processMouseUp(event);
        },
        false
    );

    canvas.addEventListener(
        "dblclick",
        function (event) {
            event.preventDefault();
            myself.hand.processDoubleClick(event);
        },
        false
    );

    canvas.addEventListener(
        "touchend",
        function (event) {
            myself.hand.processTouchEnd(event);
        },
        { passive: true }
    );

    canvas.addEventListener(
        "mousemove",
        function (event) {
            myself.hand.processMouseMove(event);
        },
        { passive: true }
    );

    canvas.addEventListener(
        "touchmove",
        function (event) {
            myself.hand.processTouchMove(event);
        },
        { passive: true }
    );

    canvas.addEventListener(
        "contextmenu",
        function (event) {
            // suppress context menu for Mac-Firefox
            event.preventDefault();
        },
        false
    );

    canvas.addEventListener(
        "keydown",
        function (event) {
            // remember the keyCode in the world's currentKey property
            myself.currentKey = event.keyCode;
            if (myself.keyboardReceiver) {
                myself.keyboardReceiver.processKeyDown(event);
            }
            // supress backspace override
            if (event.keyCode === 8) {
                event.preventDefault();
            }
            // supress tab override and make sure tab gets
            // received by all browsers
            if (event.keyCode === 9) {
                if (myself.keyboardReceiver) {
                    myself.keyboardReceiver.processKeyPress(event);
                }
                event.preventDefault();
            }
            if ((event.ctrlKey && (!event.altKey) || event.metaKey) &&
                    (event.keyCode !== 86)) { // allow pasting-in
                event.preventDefault();
            }
        },
        false
    );

    canvas.addEventListener(
        "keyup",
        function (event) {
            // flush the world's currentKey property
            myself.currentKey = null;
            // dispatch to keyboard receiver
            if (myself.keyboardReceiver) {
                if (myself.keyboardReceiver.processKeyUp) {
                    myself.keyboardReceiver.processKeyUp(event);
                }
            }
            event.preventDefault();
        },
        false
    );

    canvas.addEventListener(
        "keypress",
        function (event) {
            if (myself.keyboardReceiver) {
                myself.keyboardReceiver.processKeyPress(event);
            }
            event.preventDefault();
        },
        false
    );

    canvas.addEventListener( // Safari, Chrome
        "mousewheel",
        function (event) {
            myself.hand.processMouseScroll(event);
            event.preventDefault();
        },
        false
    );
    canvas.addEventListener( // Firefox
        "DOMMouseScroll",
        function (event) {
            myself.hand.processMouseScroll(event);
            event.preventDefault();
        },
        false
    );

    document.body.addEventListener(
        "paste",
        function (event) {
            var txt = event.clipboardData.getData("Text");
            if (txt && myself.cursor) {
                myself.cursor.insert(txt);
            }
        },
        false
    );

    window.addEventListener(
        "dragover",
        function (event) {
            event.preventDefault();
        },
        false
    );
    window.addEventListener(
        "drop",
        function (event) {
            myself.hand.processDrop(event);
            event.preventDefault();
        },
        false
    );

    window.addEventListener(
        "resize",
        function () {
            if (myself.useFillPage) {
                myself.fillPage();
            }
        },
        false
    );

    window.onbeforeunload = function (evt) {
        var e = evt || window.event,
            msg = "Are you sure you want to leave?";
        // For IE and Firefox
        if (e) {
            e.returnValue = msg;
        }
        // For Safari / chrome
        return msg;
    };
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
                clearInterval(myself.touchHoldTimeout);
            },
            750
        );
        this.processMouseMove(this.transformTouch(event.touches[0])); // update my position
        this.processMouseDown({button: 0});
    } else if (event.touches.length === 2) {
        this.pinchDistance = 0;
    } else if (event.touches.length === 3) {
        this.translateStartPoint = (new Point(event.touches[0].pageX, event.touches[0].pageY)).subtract(this.translation);
    }
};

HandMorph.prototype.processTouchMove = function (event) {
    MorphicPreferences.isTouchDevice = true;

    if (event.touches.length === 1) {
        this.processMouseMove(this.transformTouch(event.touches[0]));
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
        worldElement.style.transform = 'scale(' + this.zoom + ')';
        this.fitIntoView();

    } else if (event.touches.length === 3) {
        var x = event.touches[0].pageX - this.translateStartPoint.x,
            y = event.touches[0].pageY - this.translateStartPoint.y;

        this.applyTranslationStyle(x, y);
        this.fitIntoView(x, y);
    }
};

HandMorph.prototype.applyTranslationStyle = function (x, y) {
    worldElement.style.left = x + 'px';
    worldElement.style.top = y + 'px';
};

HandMorph.prototype.fitIntoView = function (x, y) {
    var cr = worldElement.getClientRects()[0],
        x = x || this.translation.x,
        y = y || this.translation.y;

    if (cr.left > 0) {
        x = (worldElement.width * (this.zoom - 1)) * 0.5;
        this.applyTranslationStyle(x, y);
    }
    if (cr.right < worldElement.width) {
        x = (worldElement.width * (this.zoom - 1)) * -0.5;
        this.applyTranslationStyle(x, y);
    }
    if (cr.top > 0) {
        y = (worldElement.height * (this.zoom - 1)) * 0.5;
        this.applyTranslationStyle(x, y);
    }
    if (cr.bottom < worldElement.height) {
        y = (worldElement.height * (this.zoom - 1)) * -0.5;
        this.applyTranslationStyle(x, y);
    }

    this.translation.x = x;
    this.translation.y = y;
};

HandMorph.prototype.transformTouch = function (touch) {
    var screenWidth = worldElement.width,
        screenHeight = worldElement.height,
        cr = worldElement.getClientRects()[0],
        x = (touch.pageX / this.zoom) - (cr.left / this.zoom),
        y = (touch.pageY / this.zoom) - (cr.top / this.zoom);

   return { pageX: x, pageY: y };
};

function getDocumentPositionOf (aDOMelement) {
    return { x: 0, y: 0 };
};

// Virtual Keyboard Input

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
    this.virtualKeyboard.style.color = "transparent";
    this.virtualKeyboard.style.backgroundColor = "transparent";
    this.virtualKeyboard.style.border = "none";
    this.virtualKeyboard.style.outline = "none";
    this.virtualKeyboard.style.position = "absolute";
    this.virtualKeyboard.style.top = "0px";
    this.virtualKeyboard.style.left = "0px";
    this.virtualKeyboard.style.width = "0px";
    this.virtualKeyboard.style.height = "0px";
    this.virtualKeyboard.autocapitalize = "none"; // iOS specific

    document.body.appendChild(this.virtualKeyboard);

    this.virtualKeyboard.addEventListener(
        "keydown",
        function (event) {
            // remember the keyCode in the world's currentKey property
            myself.currentKey = event.keyCode;
            if (myself.keyboardReceiver) {
                myself.keyboardReceiver.processKeyDown(event);
            }
            // supress backspace override
            if (event.keyCode === 8) {
                myself.cursor.slot --;
                event.preventDefault();
            }
            // supress tab override and make sure tab gets
            // received by all browsers
            if (event.keyCode === 9) {
                if (myself.keyboardReceiver) {
                    myself.keyboardReceiver.processKeyPress(event);
                }
                event.preventDefault();
            }
        },
        false
    );

    this.virtualKeyboard.addEventListener(
        "keyup",
        function (event) {
            // flush the world's currentKey property
            myself.currentKey = null;
            // dispatch to keyboard receiver
            if (myself.keyboardReceiver) {
                if (myself.keyboardReceiver.processKeyUp) {
                    myself.keyboardReceiver.processKeyUp(event);
                }
            }
            this.lastValue = this.value;
            event.preventDefault();
        },
        false
    );
};

CursorMorph.prototype.processKeyUp = function (event) {
    var world = this.world();

    world.currentKey = null;
    this.target.escalateEvent('reactToKeystroke', event);
    
    if (world.virtualKeyboard) {
        this.insert(world.virtualKeyboard.value.slice(-1));
        world.virtualKeyboard.value = '';
    }
};

WorldMorph.prototype.originalSlide = WorldMorph.prototype.slide;
WorldMorph.prototype.slide = function(aStringOrTextMorph) {
    if (!aStringOrTextMorph.parentThatIsA(InputSlotMorph)) { return };
    this.originalSlide(aStringOrTextMorph)
};

MorphicPreferences = touchScreenSettings;
