#!/bin/sh
rm master.zip 2> /dev/null
wget https://github.com/jmoenig/Snap--Build-Your-Own-Blocks/archive/master.zip
unzip master.zip
rm master.zip 
cp -rf Snap--Build-Your-Own-Blocks-master/* snap/
rm -r Snap--Build-Your-Own-Blocks-master
