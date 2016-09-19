#!/bin/sh
echo "Donwloading Snap4Arduino sources..."
wget https://github.com/edutec/Snap4Arduino/archive/master.zip

if [ ! -f master.zip ]; then
    (>&2 echo "Could not fetch Snap4Arduino sources, aborting installation");
    exit 1;
fi

echo "Unpacking Snap4Arduino sources..."
unzip master.zip

if [ ! -f Snap4Arduino-master ]; then
    (>&2 echo "Could not unpack Snap4Arduino sources, aborting installation");
    exit 1;
fi

echo "Installing Snap! interpreter at /usr/share/snap-interpreter"

mv Snap4Arduino-master/snap* .
rm -rf Snap4Arduino-master
mkdir /usr/share/snap-interpreter
cp -r * /usr/share/snap-interpreter

echo "Creating snap.js symlink"

ln -s /usr/share/snap-interpreter/snap.js /usr/bin/snap.js

if [ ! `command -v snap.js` ]; then
    (>&2 echo "Symlink creation failed, installation may not have succeeded");
    exit 1;
fi

echo "Installation done!"
snap.js --help
