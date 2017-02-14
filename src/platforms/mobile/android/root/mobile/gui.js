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

PaletteHandleMorph.prototype.mouseDownLeft = function (pos) {
    var world = this.world(),
        offset = this.right() - pos.x,
        ide = this.target.parentThatIsA(IDE_Morph);

    if (!this.target) {
        return null;
    }
    this.step = function () {
        var newPos = world.hand.bounds.origin.x + offset;
        if (!world.hand.mouseButton) {
            if (newPos < 100) {
                newPos = 2;
            } else if (newPos < 200) {
                newPos = 200;
            }
            this.step = null;
        }
        ide.paletteWidth = Math.min(
            newPos,
            ide.stageHandle.left() - ide.spriteBar.tabBar.width()
            );
        ide.setExtent(world.extent());
    };
};
