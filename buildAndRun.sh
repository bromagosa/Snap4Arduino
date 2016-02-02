#!/bin/sh
cd snap
cp -R ~/nw/node_modules .
zip -r app.nw *
mv app.nw /tmp
rm -R node_modules
cd ..
./run.sh
