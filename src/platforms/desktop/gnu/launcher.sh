#!/usr/bin/env sh
BIN=run
DESKTOP=Snap4Arduino.desktop
mv "$DESKTOP" "$DESKTOP".bck
sed -e "s,Icon=.*,Icon=$PWD/icons/128x128x32.png,g" "$DESKTOP".bck > "$DESKTOP"
rm "$DESKTOP".bck
chmod +x "$DESKTOP"

./"$BIN"
