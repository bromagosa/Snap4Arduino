BlockMorph.prototype.originalJustDropped = BlockMorph.prototype.justDropped;
BlockMorph.prototype.justDropped = function () {
    ide = world.children[0]; // ouch (>_<)'
    this.originalJustDropped();
    ide.shrinkStage();
    ide.hideGarbageBin();
};

BlockMorph.prototype.originalPrepareToBeGrabbed = BlockMorph.prototype.prepareToBeGrabbed;
BlockMorph.prototype.prepareToBeGrabbed = function (hand) {
    ide = world.children[0]; // ouch (>_<)'
    this.originalPrepareToBeGrabbed(hand);
    ide.showGarbageBin();
};
