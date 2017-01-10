#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

if [ -z "`grep "disable-gpu" Snap4Arduino.app/Contents/Resources/app.nw/package.json`" ]; then
    sed 's/^{$/{   "chromium-args": "--disable-gpu",/' Snap4Arduino.app/Contents/Resources/app.nw/package.json > package.json
    mv package.json Snap4Arduino.app/Contents/Resources/app.nw/package.json
fi
