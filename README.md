[![Snap4Arduino Logo](http://snap4arduino.rocks/img/logo.png)](http://snap4arduino.rocks)

Snap4Arduino binds Snap! and Arduino together and is available in several flavors:

* A desktop application for GNU/Linux, MacOSX and MS Windows.
* A Chrome App for Chromebooks and any other device that can run the Chromium browser or Google Chrome.
* A web application that makes use of a special Chrome extension.
* A command line interpreter for embedded GNU/Linux machines.
* A websockets-powered version for Linino boards.
* A mobile app for Android. :boom: **EXPERIMENTAL!** BARELY USABLE! :boom:

Please check out our official website for further info:

[snap4arduino.rocks](http://snap4arduino.rocks)

Downloads
=========

You can get the latest pre-built versions for all platforms at:

[snap4arduino.rocks/#download](http://snap4arduino.rocks/#download)

Documentation
=============

The [Wiki](https://github.com/bromagosa/Snap4Arduino/wiki) holds a bunch of tutorials on different topics. You can also find a [collection of examples in the official website](http://snap4arduino.rocks#demos).

To learn more about [Snap<i>!</i>](http://snap.berkeley.edu), take a look at [its official manual](http://snap.berkeley.edu/SnapManual.pdf) and its [additional annex chapters](http://snap.berkeley.edu/#activate).

There are also a few example projects [here](https://github.com/bromagosa/Snap4Arduino/tree/master/examples). To load one of them into Snap4Arduino:

1. Click on the project name: ![Project name.xml](http://i.imgur.com/ps3efFS.png)
2. Click on the _Raw_ button: ![Raw](http://i.imgur.com/oZ75Xhj.png)
3. Right click on the text and select `Save As` (or just press `Control+S`) to save the file into your computer.
4. Drag and drop the file you've just downloaded into Snap4Arduino

Acknowledgements
================

Of course, this project wouldn't exist without:

* [Snap!](http://snap.berkeley.edu)
* [Arduino](http://arduino.org)
* [nwjs.io](http://nwjs.io)

To build installers for Microsoft Windows OSes, we are making use of [Inno Setup](http://www.jrsoftware.org/isinfo.php), ran headless under [Wine](http://winehq.org).

The mobile version is powered by [Cordova](https://cordova.apache.org/).

Developers, read this
=====================
Before trying to build Snap4Arduino, make sure you have `node`, `npm`, `sed`, `git`, `wget`, `zip` and `unzip` installed in your system.

This project is built by a single shell script that takes care of everything, but it takes for granted you have first prepared your local setup.

If you haven't, please first run the ``prepare`` script with the ``--all`` parameter:

    ./prepare --all

The command line parameters for the ``prepare`` script are:

    Usage: ./prepare [options]

        --snap              Pulls the latest Snap! version.
        --nwjs              Pulls the latest nwjs.io stable version.
        --desktop           Pulls all NodeJS modules needed for desktop versions.
        --chromeos          Pulls all NodeJS modules needed for the ChromeOS app.
        --chromium          Pulls all NodeJS modules needed for the web extension.
        --cli               Pulls all NodeJS modules needed for command-line version.
        --all               Does all of the above.
        --inno              Attempts to install Inno Setup under Wine, required to
                            build an installer for the Microsoft Windows versions.

Once your local setup is ready, you can use the ``build`` script as follows:

    Usage: ./build [OPTIONS]

        --platform=TARGET   Selects a platform. Accepts both generic platform names
                            (all, mobile, desktop, desktop/gnu) and specific names
                            (desktop/gnu/64). See --help=platform for details.

        --run               Builds and runs Snap4Arduino for the specified architecture.
                            Only for desktop GNU/Linux and Android.

        --makeinstaller     Attempts to create an installer for the Microsoft Windows
                            versions. Needs Inno Setup, check prepare script for info.

        --rerun             Runs the last built version of Snap4Arduino, if it exists.
                            Only for desktop GNU/Linux.

        --keeptmp           Do not remove the temporary build directory afterwards.

        --pack              Compresses the resulting files into a properly named
                            package.

        --deploy=URL        Tries to deploy the built version(s) to a server.
                            Implicitly runs --pack.

                            --username=USERNAME Specifies a username for the deploy
                                                server.
                            --password=PASSWD   Specifies a password for that user.


To find out which platforms are supported by the build script, just run ``./build --help=platform``.

    Usage: ./build --platform=TARGET [--run] [--deploy=URL --username=USERNAME [--dir=PATH]]

    Available platforms are:
    embedded/cli
    desktop/win/32
    desktop/win/64
    desktop/osx/32
    desktop/osx/64
    desktop/gnu/32
    desktop/gnu/64
    desktop/chromeos
    web/chromium
    mobile/android

    Generic names are also accepted, such as:
    desktop
    desktop/gnu
    mobile
    this
    all

## Embedded Command Line Version

See the [wiki](https://github.com/bromagosa/Snap4Arduino/wiki) section on installing and using the [command line version](https://github.com/bromagosa/Snap4Arduino/wiki/Autonomy-via-CLI).

### Third party NodeJS packages:
* [node-canvas](https://github.com/Automattic/node-canvas) _(only with ``--canvas`` flag active)_
* [firmata](https://github.com/jgautier/firmata) _(if you need Snap4Arduino compatibility)_

## Old Repository

This repository contains only source files. The old, huge (2Gb+!) repository that contained all binaries can still be found for archaeologic purposes at: https://github.com/edutec/Snap4Arduino-old-huge

## History

Snap4Arduino was started in 2013 as a side project in the [Edutec](http://edutec.citilab.eu) research group from [Citilab](http://citilab.eu) (Cornellà, Barcelona), but was soon turned into a full fledged project when it began to gain user base and became clear that it had potential. Since then, it has been used in primary schools, high schools, universities, code clubs, artistic installations and individuals from all around the world. It has received localization contributions for 13 different languages, and projects such as Phiro (India), SmartBlock (Turkey), First Makers (Chile) or ROKIT Brick (South Korea) have based their software solutions in modified versions of Snap4Arduino. From June 2016 until August 2017 it was supported and developed at Arduino.org. Nowadays it is being independently developed by Bernat Romagosa, Joan Guillén and several contributors.
