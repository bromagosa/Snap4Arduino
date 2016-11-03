[![Snap4Arduino Logo](http://snap4arduino.org/img/logo.png)](http://snap4arduino.org)

Snap4Arduino binds Snap! and Arduino together and is available in several flavors:

* A desktop application for GNU/Linux, MacOSX and MS Windows.
* A Chrome App for Chromebooks and any other device that can run the Chromium browser or Google Chrome.
* A web application that makes use of a special Chrome extension.
* A command line interpreter for embedded GNU/Linux machines.
* A websockets-powered version for Linino boards.
* A mobile app for Android. :boom: **EXPERIMENTAL!** BARELY USABLE! :boom:

Please check out our official website for further info:

[snap4arduino.org](http://snap4arduino.org)

Downloads
=========

You can get the latest pre-built versions for all platforms at:

[snap4arduino.org/#download](http://snap4arduino.org/#download)

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
    all

## Embedded Command Line Version

You need to satisfy a couple of dependencies. For starters, you are going to need NodeJS (**0.10.4x or higher**) and npm. Follow instructions from https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions.

If you need Snap4Arduino compatibility (which you do, if you are reading this):

```
$ npm install firmata
```

If you want to have full Canvas support to be able to stream your stage over HTTP:

```
$ npm install canvas 
```

If npm fails to install canvas, you may need to install its prerequisites. In Debian/Raspbian, this should suffice:

```
# apt-get install g++ build-essential libgif-dev libpango1.0-dev libjpeg-dev libcairo2-dev
```

For other systems, please refer to https://github.com/Automattic/node-canvas#installation

### System-wide installation

**You do not need to install Snap4Arduino, you can just run the command line interpreter by running** `./snap.js`

To install the snap-interpreter in your system, just run the ``install.sh`` script with root privileges.

```
# ./install.sh
```

You can now call ``snap.js`` from anywhere in your system to run any Snap! XML exported project.

### Usage

```
snap.js yourProject.xml [--plain-snap] [--canvas] [--serve] [/path/to/serial]
Runs a Berkeley Snap! project or a Snap4Arduino one on the command line.

        --plain-snap
                Runs a plain Snap! project with no Arduino capabilities.
        --linino
                Uses the LininoIO library for communication with the Arduino instead of Firmata.
                Meant to be used in boards with embedded GNU/Linux inside (Tian, Yun, etc).
                If a serial port is specified, this setting will have no effect.
        --canvas
                Renders the Stage in an HTTP-streamable canvas. Automatically adds «--serve».
        --serve
                Starts a simple HTTP server at port 42001 with the following entry points:
                http://[IP]:42001/stage
                        Streams the Stage in real time. Needs «--canvas».
                http://[IP]:42001/broadcast=[message]
                        Broadcasts «message» to Snap! so it can be captured by «When I receive» hat blocks.
                http://[IP]:42001/send-messages
                        Lists all messages being used in the Snap! program.
                http://[IP]:42001/send-vars
                        Lists all variables being used in the Snap! program.
                http://[IP]:42001/vars-update=[variable]=[value]
                        Sets the Snap! variable «variable» to «value».
```

On the terminal, you'll get outputs of *say*, *think* and *ask* blocks and all messages given by the UI. The contents of the stage can be seen via a tiny webserver accessible at http://[your-ip]:42001/stage. See [this section](http://snap4arduino.org/index.html#http) to read about the whole HTTP protocol.

### Third party NodeJS packages:
* [node-canvas](https://github.com/Automattic/node-canvas) _(only with ``--canvas`` flag active)_
* [firmata](https://github.com/jgautier/firmata) _(if you need Snap4Arduino compatibility)_

## Old Repository

This repository contains only source files. The old, huge (2Gb+!) repository that contained all binaries can still be found for archaeologic purposes at: https://github.com/edutec/Snap4Arduino-old-huge

## History

Snap4Arduino was started in 2013 as a side project in the [Edutec](http://edutec.citilab.eu) research group from [Citilab](http://citilab.eu) (Cornellà, Barcelona), but was soon turned into a full fledged project when it began to gain user base and became clear that it had potential. Since then, it has been used in primary schools, high schools, universities, code clubs, artistic installations and individuals from all around the world. It has received localization contributions for 13 different languages, and projects such as Phiro (India), SmartBlock (Turkey), First Makers (Chile) or ROKIT Brick (South Korea) have based their software solutions in modified versions of Snap4Arduino. Since June 2016, it is being developed at Arduino.org.

![Arduino logo](http://www.arduino.org/images/arduino_official_Logo.png) ![Citilab Logo](http://s4a.cat/img/citilab.png) ![Edutec Logo](http://edutec.citilab.eu/img/edutec-tiny.gif) ![](http://edutec.citilab.eu/img/edutec-text-tiny.png)
