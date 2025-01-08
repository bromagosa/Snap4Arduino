// Force disconnection of connected sprites before opening a new project
SnapSerializer.prototype.originalOpenProject = SnapSerializer.prototype.openProject;
SnapSerializer.prototype.openProject = function (project, ide) {
    // Disconnect each sprite before opening the new project
    var sprites = ide.sprites.asArray();
    sprites.forEach(function(sprite) {
        if (sprite.arduino && sprite.arduino.board) {
            sprite.arduino.disconnect(true);
        }
    });

    this.originalOpenProject(project, ide);
};

IDE_Morph.prototype.getURL('version', function (version) {
    SnapSerializer.prototype.app = 'Snap4Arduino ' + version + ', http://snap4arduino.rocks';
});

SnapSerializer.prototype.watcherLabels['reportAnalogReading'] = 'analog reading %analogPin';
SnapSerializer.prototype.watcherLabels['reportDigitalReading'] = 'digital reading %digitalPin';

WatcherMorph.prototype.originalToXML = WatcherMorph.prototype.toXML;
WatcherMorph.prototype.toXML = function (serializer) {
    var color = this.readoutColor,
        position = this.parent ?
                this.topLeft().subtract(this.parent.topLeft())
                : this.topLeft();

    if (this.getter === 'reportAnalogReading'
            || this.getter === 'reportDigitalReading') {
        console.log('got u');
        return serializer.format(
            '<watcher% % style="@"% x="@" y="@" color="@,@,@"%%/>',
            serializer.format(' scope="@"', this.target.name),
            serializer.format('s="@" p="@"', this.getter, this.pin),
            this.style,
            '',
            position.x,
            position.y,
            color.r,
            color.g,
            color.b,
            '',
            this.isVisible ? '' : ' hidden="true"'
        );
    } else {
        return this.originalToXML(serializer);
    }

};
