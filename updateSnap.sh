#!/bin/sh
rm snap.zip 2> /dev/null
wget http://snap.berkeley.edu/snapsource/snap.zip
unzip -o snap.zip -d snap/
rm snap.zip 
rm -R snap/__MACOSX/
