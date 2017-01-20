#!/bin/sh
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
cp -R * /usr/share/snap-interpreter

echo "Creating snap.js symlink"

rm /usr/bin/snap.js
ln -s /usr/share/snap-interpreter/snap.js /usr/bin/snap.js

if [ ! `command -v snap.js` ]; then
    (>&2 echo "Symlink creation failed, installation may not have succeeded");
    exit 1;
fi

echo "Installation done!"
snap.js --help
