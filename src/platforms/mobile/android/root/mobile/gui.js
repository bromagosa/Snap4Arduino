IDE_Morph.prototype.showGarbageBin = function () {
    if (!this.garbageBin) {
        ide.buildGarbageBin();
        ide.garbageBin.drawNew();
    }
    this.garbageBin.show();
    this.garbageBin.setRight(this.stage.left() - 20);
};

IDE_Morph.prototype.hideGarbageBin = function () {
    this.garbageBin.hide();
};

IDE_Morph.prototype.buildGarbageBin = function () {
    var myself = this;
    this.garbageBin = new Morph();
    this.garbageBin.setExtent(new Point(60, 75));
    this.garbageBin.setBottom(this.bottom() - 20);
    this.garbageBin.setRight(this.stage.left() - 20);
    this.garbageBin.isDraggable = false;
    this.garbageBin.acceptsDrops = false;
    this.garbageBin.color = new Color(125, 112, 85, 0.6);

    this.garbageBin.drawNew = function () {
        var w = this.width(),
            h = this.height();

        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d');

        context.fillStyle = this.color.toString();
        context.moveTo(0, 0);
        context.lineTo(w / 5, h);
        context.lineTo(w * 4 / 5, h);
        context.lineTo(w, 0);
        context.lineTo(0, 0);
        context.fill();

        context.strokeStyle = this.color.darker().toString();
        context.moveTo(0, 0);
        context.lineTo(w, 0);
        context.stroke();
        context.moveTo(w / 5, h);
        context.lineTo(w * 4 / 5, h);
        context.stroke();

        for (var i = 0; i < 6; i += 1) {
            context.moveTo(w / 5 * i, 0);
            context.lineTo(w / 5 + (3 * w / 25) * i, h);
            context.stroke();
        }
    };

    this.garbageBin.mouseEnterDragging = function () {
        var myself = this,
            hand = this.world().hand,
            origin = hand.grabOrigin.position;
        this.setColor(new Color(225, 212, 85, 0.6));

        hand.processTouchEnd = function (event) {
            var morph = this.children[0];
            MorphicPreferences.isTouchDevice = true;
            clearInterval(this.touchHoldTimeout);
            if (morph instanceof BlockMorph
                    && this.allMorphsAtPointer().indexOf(myself) > -1) {
                hand.setPosition(origin);
                hand.drop();
                morph.destroy();
            }
            this.processMouseUp({button: 0});
        };
    };

    this.garbageBin.mouseLeave = function () {
        this.setColor(new Color(125, 112, 85, 0.6));
    };

    this.add(this.garbageBin);
};

IDE_Morph.prototype.shrinkStage = function () {
    this.toggleStageSize(true);
};

IDE_Morph.prototype.shrinkPalette = function () {
    this.paletteWidth = 2;
    this.setExtent(world.extent());
};

IDE_Morph.prototype.growPalette = function () {
    this.paletteWidth = 200;
    this.setExtent(world.extent());
};

IDE_Morph.prototype.originalCreateStageHandle = IDE_Morph.prototype.createStageHandle;
IDE_Morph.prototype.createStageHandle = function () {
    this.originalCreateStageHandle();
    this.stageHandle = new Morph();
    this.stageHandle.fixLayout = nop;
    this.stageHandle.drawOn = nop;
};

PaletteHandleMorph.prototype.init = function (target) {
    var ide = target.parentThatIsA(IDE_Morph);
    ide.paletteWidth = 5;
    this.target = target || null;
    this.labelText = localize('Blocks');
    HandleMorph.uber.init.call(this);
    this.color = MorphicPreferences.isFlat ?
        new Color(255, 255, 255, 1) : new Color(55, 55, 55, 1);

    this.isDraggable = false;
    this.noticesTransparentClick = true;
    this.setExtent(new Point(18, 120));
};

PaletteHandleMorph.prototype.fixLayout = function () {
    if (!this.target) {return; }
    var ide = this.target.parentThatIsA(IDE_Morph);

    this.setCenter(ide.palette.center());
    this.setRight(this.target.right() + this.width());

    if (ide) {ide.add(this); } // come to front
};

PaletteHandleMorph.prototype.drawOnCanvas = function (
    aCanvas,
    color,
    shadowColor
) {
    var context = aCanvas.getContext('2d'),
        ide = this.target.parentThatIsA(IDE_Morph);
    this.drawBackground(context, color);
    this.drawLabel(context, color.inverted());
    this.drawOutline(context, ide.color);
};

PaletteHandleMorph.prototype.drawBackground = function (context, color) {
    var w = this.width(),
        h = this.height(),
        c = 5;

    context.fillStyle = color.toString();
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(0, h/3, w, h/6, w, h/3);
    context.lineTo(w, h*2/3);
    context.bezierCurveTo(w, h*5/6, 0, h*2/3, 0, h);

    context.closePath();
    context.fill();
};

PaletteHandleMorph.prototype.drawLabel = function (context, color) {
    context.save();
    context.rotate(Math.PI/2);
    context.font = '12px ' + MorphicPreferences.globalFontFamily;
    context.textAlign = 'center';
    context.fillStyle = color.toString();
    context.fillText(localize('Blocks'), this.height() / 2, -2);
    context.restore();
};

PaletteHandleMorph.prototype.drawOutline = function (context, color) {
    var outlineWidth = MorphicPreferences.isFlat ? 1 : 4,
        w = this.width() - outlineWidth + 1,
        h = this.height(),
        c = 5;

    context.strokeStyle = color.toString();
    context.beginPath();
    context.lineWidth = outlineWidth;
    context.moveTo(0, 0);
    context.bezierCurveTo(0, h/3, w, h/6, w, h/3);
    context.lineTo(w, h*2/3);
    context.bezierCurveTo(w, h*5/6, 0, h*2/3, 0, h);
    context.stroke();
};

PaletteHandleMorph.prototype.mouseClickLeft = function () {
    var world = this.world(),
        ide = this.target.parentThatIsA(IDE_Morph);

    if (!this.target) {
        return null;
    }

    if (ide.paletteWidth < 200) {
        ide.growPalette();
    } else {
        ide.shrinkPalette();
    }
};

PaletteHandleMorph.prototype.mouseDownLeft = PaletteHandleMorph.prototype.mouseClickLeft;
