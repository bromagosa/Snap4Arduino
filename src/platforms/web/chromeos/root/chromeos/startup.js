var world,
    ide;

// We rewrite some functions

BlockMorph.prototype.transpileToC = function () {
    var ide = this.parentThatIsA(IDE_Morph);

    try {
        saveFile(
                ide.projectName ? ide.projectName.replace(/[^a-zA-Z]/g,'') : 'snap4arduino',
                this.world().Arduino.transpile(
                    this.mappedCode(),
                    this.parentThatIsA(ScriptsMorph).children.filter(
                        function (each) {
                            return each instanceof HatBlockMorph &&
                                each.selector == 'receiveMessage';
                        })),
                '.ino',
                ide);
    } catch (error) {
        ide.inform('Error exporting to Arduino sketch!', error.message)
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

        ide.getURL('version', function (version) {
            ide.versionName = version;
        });

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

function loop () {
    world.doOneCycle();
};

function Buffer (data) {
    return data;
};
