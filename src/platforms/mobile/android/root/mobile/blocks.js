ScriptsMorph.prototype.mouseDoubleClick = function (pos) {
    var ide = this.parentThatIsA(IDE_Morph);
    if (ide.stageRatio >= 1) {
        ide.toggleStageSize(true, 0.25);
    } else {
        ide.toggleStageSize(true, 1);
    }
};

BlockMorph.prototype.mouseDoubleClick = nop;
