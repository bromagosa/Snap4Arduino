![Snap4Arduino Logo](http://s4a.cat/snap/img/logo-top.png)

Snap4Arduino binds Snap! and Arduino together and is available in several flavors:

* A desktop application for GNU/Linux, MacOSX and MS Windows.
* A web application that makes use of a special Chrome extension.
* A command line interpreter for embedded GNU/Linux machines.
* A websockets-powered version for Linino boards.

Other versions in the horizon, and hopefully coming soon, are:
* A mobile app for Android

Please check out our official website for further info:

[snap4arduino.org](http://snap4arduino.org)

Acknowledgements
================

Of course, this project wouldn't exist without:

* [Snap!](http://snap.berkeley.edu)
* [Arduino](http://arduino.org)
* [nw.js](http://nwjs.io)


![Edutec Logo](http://edutec.citilab.eu/img/logo.gif)

![Citilab Logo](http://s4a.cat/img/citilab.png)

Developers, read this
=====================
This project is built by a single shell script that takes care of everything, but it takes for granted you have first prepared your local setup.

If you haven't, please first run the ``prepare`` script with the ``--all`` parameter:

    ./prepare --all

The command line parameters for the ``prepare`` script are:

    usage: ./prepare [options]

    --snap              Pulls the latest Snap! version.
    --nwjs              Pulls the latest nwjs.io stable version.
    --nwjs-sdk          Pulls the latest nwjs.io SDK stable version.
    --all               Does all of the above.

Once your local setup is ready, you can use the ``build`` script as follows:

    usage: ./build [options]

    --platform=TARGET   Selects a platform, accepts both generic platform names (
                        (all, mobile, desktop, desktop/gnu) and specific names
                        (desktop/gnu/64).

    --run               Builds and runs Snap4Arduino for the specified architecture.
                        Only for desktop Gnu/Linux.

    --rerun             Runs the last built version of Snap4Arduino, if it exists.
                        Only for desktop Gnu/Linux.

    --deploy=URL        Tries to deploy the build version(s) to a server.

                        --username=USRNAME  Specifies a username for the deploy
                                            server.
                        --dir=PATH          Specifies a path for deploying built
                                            files in the deploy server.
                                            If unspecified, the default /var/www
                                            directory will be used.

## Old Repository

This repository contains only source files. The old, huge (2Gb+!) repository that contained all binaries can still be found for archaeologic purposes at: https://github.com/edutec/Snap4Arduino-old-huge
