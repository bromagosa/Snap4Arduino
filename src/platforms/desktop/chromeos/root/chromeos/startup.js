var world,
    ide;

// We rewrite some functions

BlockMorph.prototype.exportAsProcessing = function () {
    var ide = this.parentThatIsA(IDE_Morph);

    try {
        saveFile(
                ide.projectName ? ide.projectName.replace(/[^a-zA-Z]/g,'') : 'snap4arduino',
                this.world().Arduino.processProcessing(this.mappedCode()),
                '.ino',
                ide);
    } catch (error) {
        ide.inform('Error exporting to Arduino sketch!', error.message)
    }
};

// Big time kludge here!
IDE_Morph.prototype.getCostumesList = function (dirname) {
    var dir,
        libs = {
             Costumes: ['alonzo.png', 'bat2-a.png', 'boy1-walking.gif', 'cat2.gif', 'cat5.gif', 'dog2-a.png', 'dragon1-a.png', 'girl1-standing.gif', 'girl2-standing.gif', 'girl3-standing.gif', 'marissa-sitting.gif', 'bat1-a.png', 'bat2-b.png', 'boy2.gif', 'cat3.png', 'dog1-a.png', 'dog2-b.png', 'dragon1-b.png', 'girl1-walking.gif', 'girl3-basketball.gif', 'marissa-crouching.gif', 'unicorn1.png', 'bat1-b.png', 'boy1-standing.gif', 'boy3.gif', 'cat4.png', 'dog1-b.png', 'dog2-c.png', 'dragon2.gif', 'girl2-shouting.gif', 'girl3-running.gif', 'marissa.gif'],
             Sounds: ['Cat.mp3', 'Chord.wav', 'Dog1.wav', 'Dog2.wav', 'FingerSnap.wav', 'Kitten.wav', 'Laugh-female.wav', 'Laugh-male1.wav', 'Laugh-male2.wav', 'Laugh-male3.mp3', 'Meow.wav', 'Pop.wav'],
             Backgrounds: ['atom-playground.jpg', 'bedroom1.gif', 'bedroom2.gif', 'berkeley-mural.jpg', 'brick-wall1.jpg', 'brick-wall2.jpg', 'brick-wall-and-stairs.jpg', 'desert.gif', 'night-city-with-street.gif', 'party-room.jpg', 'pathway.jpg', 'xy-grid.gif']
        };

    return libs[dirname].sort(function (x, y) {
        return x < y ? -1 : 1;
    });
};

IDE_Morph.prototype.getURL = function (url) {
    var myself = this;
    this.response = null;

    this.asyncGetURL(url, function(response) {
        myself.response = response;
    });
};

IDE_Morph.prototype.asyncGetURL = function (url, callback) {
    var request = new XMLHttpRequest();

    try {
        request.open('GET', url, false);
        request.onload = function(event) {
            if (request.status === 200) {
                callback(request.responseText);
            } else {
                throw new Error('unable to retrieve ' + url);
            }
        }
        request.send();
    } catch (err) {
        myself.showMessage(err);
    }
};


// Actual startup

window.onload = function () {
    initInterval = setInterval(initLoop, 50);
};

function initLoop() {
    if (window.firmata) {

        Arduino.firmata = window.firmata;

        clearInterval(initInterval);

        world = new WorldMorph(document.getElementById('world'));

        ide = new IDE_Morph();
        ide.openIn(world);

        ide.inform = function(title, message, callback) { 
            var myself = this;
            if (!myself.informing) {
                var box = new DialogBoxMorph();
                myself.informing = true;
                box.ok = function() { 
                    myself.informing = false;
                    if (callback) { callback() };
                    this.accept();
                };
                box.inform(title, message, world)
            }
        };

        setInterval(loop, 1);
    }
};

function loop() {
    world.doOneCycle();
}
