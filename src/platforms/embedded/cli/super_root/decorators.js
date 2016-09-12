SpriteMorph.prototype.oldBubble = SpriteMorph.prototype.bubble;
SpriteMorph.prototype.bubble = function(data, isThought, isQuestion) {
    console.log(this.name + ' ' + (isThought ? 'thinks: ' : (isQuestion ? 'asks: ' : 'says: ')) + data.toString());
    this.oldBubble(data, isThought, isQuestion);
};

WorldMorph.prototype.fillPage = function() { };

Process.prototype.isCatchingErrors = false;

function showMessage(title, contents) {
    console.log(title + '\n' + title.replace(/./g, '=') + '\n' + contents + '\n' + title.replace(/./g, '=') + '\n\n');
};

DialogBoxMorph.prototype.inform = function(title, textString, world, pic) {
    showMessage(title, textString);
};

if (!snapMode) {
    SpriteMorph.prototype.oldInit = SpriteMorph.prototype.init;
    SpriteMorph.prototype.init = function(globals) {
        var myself = this;
        this.oldInit(globals);
        this.arduino.showMessage = function(message) {
            showMessage(myself.name, message);
        };
    };
}

// This is impossible to decorate...
SnapSerializer.prototype.rawLoadProjectModel = function (xmlNode) {
    // private
    var myself = this,
        project = {sprites: {}},
        model,
        nameID;

    this.project = project;

    model = {project: xmlNode };
    if (+xmlNode.attributes.version > this.version) {
        throw 'Project uses newer version of Serializer';
    }

    /* Project Info */

    this.objects = {};
    project.name = model.project.attributes.name;
    if (!project.name) {
        nameID = 1;
        while (
            Object.prototype.hasOwnProperty.call(
                localStorage,
                '-snap-project-Untitled ' + nameID
            )
        ) {
            nameID += 1;
        }
        project.name = 'Untitled ' + nameID;
    }
    model.notes = model.project.childNamed('notes');
    if (model.notes) {
        project.notes = model.notes.contents;
    }
    model.globalVariables = model.project.childNamed('variables');
    project.globalVariables = new VariableFrame();

    /* Stage */

    model.stage = model.project.require('stage');
    StageMorph.prototype.frameRate = 0;
    project.stage = new StageMorph(project.globalVariables);
    if (Object.prototype.hasOwnProperty.call(
            model.stage.attributes,
            'id'
        )) {
        this.objects[model.stage.attributes.id] = project.stage;
    }
    if (model.stage.attributes.name) {
        project.stage.name = model.stage.attributes.name;
    }
    if (model.stage.attributes.scheduled === 'true') {
        project.stage.fps = 30;
        StageMorph.prototype.frameRate = 30;
    }
    model.pentrails = model.stage.childNamed('pentrails');
    if (model.pentrails) {
        project.pentrails = new Image();
        project.pentrails.onload = function () {
            if (!project.stage.trailsCanvas) {
                project.stage.trailsCanvas = new Canvas(project.stage.width(), project.stage.height());
            }
            var context = project.stage.trailsCanvas.getContext('2d');
            context.drawImage(project.pentrails, 0, 0);
            project.stage.changed();
        };
        project.pentrails.src = model.pentrails.contents;
    }
    project.stage.setTempo(model.stage.attributes.tempo);
    StageMorph.prototype.dimensions = new Point(480, 360);
    if (model.stage.attributes.width) {
        StageMorph.prototype.dimensions.x =
            Math.max(+model.stage.attributes.width, 480);
    }
    if (model.stage.attributes.height) {
        StageMorph.prototype.dimensions.y =
            Math.max(+model.stage.attributes.height, 180);
    }
    project.stage.setExtent(StageMorph.prototype.dimensions);
    SpriteMorph.prototype.useFlatLineEnds =
        model.stage.attributes.lines === 'flat';
    project.stage.isThreadSafe =
        model.stage.attributes.threadsafe === 'true';
    StageMorph.prototype.enableCodeMapping =
        model.stage.attributes.codify === 'true';
    StageMorph.prototype.enableInheritance =
        model.stage.attributes.inheritance === 'true';

    model.hiddenPrimitives = model.project.childNamed('hidden');
    if (model.hiddenPrimitives) {
        model.hiddenPrimitives.contents.split(' ').forEach(
            function (sel) {
                if (sel) {
                    StageMorph.prototype.hiddenPrimitives[sel] = true;
                }
            }
        );
    }

    model.codeHeaders = model.project.childNamed('headers');
    if (model.codeHeaders) {
        model.codeHeaders.children.forEach(function (xml) {
            StageMorph.prototype.codeHeaders[xml.tag] = xml.contents;
        });
    }

    model.codeMappings = model.project.childNamed('code');
    if (model.codeMappings) {
        model.codeMappings.children.forEach(function (xml) {
            StageMorph.prototype.codeMappings[xml.tag] = xml.contents;
        });
    }

    model.globalBlocks = model.project.childNamed('blocks');
    if (model.globalBlocks) {
        this.loadCustomBlocks(project.stage, model.globalBlocks, true);
        this.populateCustomBlocks(
            project.stage,
            model.globalBlocks,
            true
        );
    }
    this.loadObject(project.stage, model.stage);

    /* Sprites */

    model.sprites = model.stage.require('sprites');
    project.sprites[project.stage.name] = project.stage;

    model.sprites.childrenNamed('sprite').forEach(function (model) {
        myself.loadValue(model);
    });

    // restore inheritance and nesting associations
    myself.project.stage.children.forEach(function (sprite) {
        var exemplar, anchor;
        if (sprite.inheritanceInfo) { // only sprites can inherit
            exemplar = myself.project.sprites[
                sprite.inheritanceInfo.exemplar
            ];
            if (exemplar) {
                sprite.setExemplar(exemplar);
            }
        }
        if (sprite.nestingInfo) { // only sprites may have nesting info
            anchor = myself.project.sprites[sprite.nestingInfo.anchor];
            if (anchor) {
                anchor.attachPart(sprite);
            }
            sprite.rotatesWithAnchor = (sprite.nestingInfo.synch === 'true');
        }
    });
    myself.project.stage.children.forEach(function (sprite) {
        delete sprite.inheritanceInfo;
        if (sprite.nestingInfo) { // only sprites may have nesting info
            sprite.nestingScale = +(sprite.nestingInfo.scale || sprite.scale);
            delete sprite.nestingInfo;
        }
    });

    /* Global Variables */

    if (model.globalVariables) {
        this.loadVariables(
            project.globalVariables,
            model.globalVariables
        );
    }

    this.objects = {};

    /* Watchers */

    model.sprites.childrenNamed('watcher').forEach(function (model) {
        var watcher, color, target, hidden, extX, extY;

        color = myself.loadColor(model.attributes.color);
        target = Object.prototype.hasOwnProperty.call(
            model.attributes,
            'scope'
        ) ? project.sprites[model.attributes.scope] : null;

        // determine whether the watcher is hidden, slightly
        // complicated to retain backward compatibility
        // with former tag format: hidden="hidden"
        // now it's: hidden="true"
        hidden = Object.prototype.hasOwnProperty.call(
            model.attributes,
            'hidden'
        ) && (model.attributes.hidden !== 'false');

        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'var'
            )) {
            watcher = new WatcherMorph(
                model.attributes['var'],
                color,
                isNil(target) ? project.globalVariables
                    : target.variables,
                model.attributes['var'],
                hidden
            );
        } else {
            watcher = new WatcherMorph(
                localize(myself.watcherLabels[model.attributes.s]),
                color,
                target,
                model.attributes.s,
                hidden
            );
        }
        watcher.setStyle(model.attributes.style || 'normal');
        if (watcher.style === 'slider') {
            watcher.setSliderMin(model.attributes.min || '1', true);
            watcher.setSliderMax(model.attributes.max || '100', true);
        }
        watcher.setPosition(
            project.stage.topLeft().add(new Point(
                +model.attributes.x || 0,
                +model.attributes.y || 0
            ))
        );
        project.stage.add(watcher);
        watcher.onNextStep = function () {this.currentValue = null; };

        // set watcher's contentsMorph's extent if it is showing a list and
        // its monitor dimensions are given
        if (watcher.currentValue instanceof List) {
            extX = model.attributes.extX;
            if (extX) {
                watcher.cellMorph.contentsMorph.setWidth(+extX);
            }
            extY = model.attributes.extY;
            if (extY) {
                watcher.cellMorph.contentsMorph.setHeight(+extY);
            }
            // adjust my contentsMorph's handle position
            watcher.cellMorph.contentsMorph.handle.drawNew();
        }
    });
    this.objects = {};
    return project;
};

if (!snapMode) {
    Arduino.prototype.connect = function (port, callback) {
        var myself = this;

        this.showMessage(localize('Connecting board at port\n') + port);

        this.board = new world.Arduino.firmata.Board(port, function (err) { 
            if (!err) { 

                // Clear timeout to avoid problems if connection is closed before timeout is completed
                clearTimeout(myself.connectionTimeout); 

                // Start the keepAlive interval
                myself.keepAliveIntervalID = setInterval(function() { myself.keepAlive() }, 5000);

                myself.board.sp.on('disconnect', myself.disconnectHandler);
                myself.board.sp.on('close', myself.closeHandler);
                myself.board.sp.on('error', myself.errorHandler);

                world.Arduino.lockPort(port);
                myself.port = myself.board.sp.path;

                ide.inform(myself.owner.name, localize('An Arduino board has been connected. Happy prototyping!'));

                callback();
            } else {
                ide.inform(myself.owner.name, localize('Error connecting the board.') + ' ' + err, myself.closeHandler(true));
            }
            return;
        });

        // Set timeout to check if device does not speak firmata (in such case new Board callback was never called, but board object exists) 
        this.connectionTimeout = setTimeout(function () {
            // If !board.versionReceived, the board has not established a firmata connection
            if (myself.board && !myself.board.versionReceived) {
                var port = myself.board.sp.path;

                ide.inform(
                        myself.owner.name,
                        localize('Could not talk to Arduino in port\n')
                        + port + '\n\n' + localize('Check if firmata is loaded.')
                        );

                // silently closing the connection attempt
                myself.disconnect(true); 
            }
        }, 10000);
    };

}
