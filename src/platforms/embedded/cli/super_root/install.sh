#!/bin/sh
rm -f master.zip

echo "Downloading Snap4Arduino sources..."
wget https://github.com/edutec/Snap4Arduino/archive/master.zip

if [ ! -f master.zip ]; then
    (>&2 echo "Could not fetch Snap4Arduino sources, aborting installation");
    exit 1;
fi

echo "Unpacking Snap4Arduino sources..."
rm -Rf Snap4Arduino-master
unzip master.zip
rm -f master.zip

if [ ! -d Snap4Arduino-master ]; then
    (>&2 echo "Could not unpack Snap4Arduino sources, aborting installation");
    exit 1;
fi

echo "Downloading Snap! sources..."
wget https://github.com/jmoenig/Snap--Build-Your-Own-Blocks/archive/master.zip

if [ ! -f master.zip ]; then
    (>&2 echo "Could not fetch Snap! sources, aborting installation");
    exit 1;
fi

echo "Unpacking Snap! sources..."
rm -Rf Snap--Build-Your-Own-Blocks-master
unzip master.zip
rm -f master.zip

if [ ! -d Snap--Build-Your-Own-Blocks-master ]; then
    (>&2 echo "Could not unpack Snap4Arduino sources, aborting installation");
    exit 1;
fi

rm -Rf snap
mv Snap--Build-Your-Own-Blocks-master snap

echo "Preparing Snap4Arduino sources..."

rm -f version

mv Snap4Arduino-master/src/s4a snap/
mv Snap4Arduino-master/src/version .

rm -rf Snap4Arduino-master

if find . | grep "Canvas.h"; then
    echo "Preparing node-canvas..."
    if ! grep SNAP4ARDUINO node_modules/canvas/lib/context2d.js; then
        echo '\n\n// ADDED BY SNAP4ARDUINO\n\nCanvasGradient.prototype.oldAddColorStop = CanvasGradient.prototype.addColorStop;\nCanvasGradient.prototype.addColorStop = function(where, color) {\n\tthis.oldAddColorStop(where, color.toString());\n};' >> node_modules/canvas/lib/context2d.js
    fi

    if ! grep SNAP4ARDUINO node_modules/canvas/lib/canvas.js; then
        echo '\n\n// ADDED BY SNAP4ARDUINO\n\nCanvas.prototype.addEventListener = function() {};\nCanvas.prototype.focus = function() {};' >> node_modules/canvas/lib/canvas.js
    fi
fi

echo "Installing Snap! interpreter at /usr/share/snap-interpreter"

rm -Rf /usr/share/snap-interpreter
mkdir /usr/share/snap-interpreter
cp -r * /usr/share/snap-interpreter

echo "Creating snap.js symlink"

rm /usr/bin/snap.js
ln -s /usr/share/snap-interpreter/snap.js /usr/bin/snap.js

if [ ! `command -v snap.js` ]; then
    (>&2 echo "Symlink creation failed, installation may not have succeeded");
    exit 1;
fi

echo "Installation done!"
snap.js --help
