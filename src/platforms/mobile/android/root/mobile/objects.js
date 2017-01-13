StageMorph.prototype.mouseDoubleClick = function () {
    var ide = this.parentThatIsA(IDE_Morph);

    if (ide.stageRatio > 1) {
        ide.toggleStageSize(true, 1);
    } else {
        ide.toggleStageSize(true, 2);
    }
};
