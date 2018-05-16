# CHANGELOG

### 1.2.6

* Korean translation by @ljb7977
* Allow loading libraries using the command line --load parameter
* Allow to reconnect a board after a failed attempt
* Fixed note values in SnapJr library and mode
* Fixed cloud URL
* Updated to latest stable Snap! version

### 1.2.5

* Updated to Snap 4.1.2
* Background execution. Programs keep working when Snap4Arduino is minimized or out of focus.
* Snap Jr. mode. Thanks to @jogaye and @vcasado for the implementation, and to @jguille2 for a bunch of bug fixes.
* Some improvements on the HTTP server by @jguille2.
* Added a bunch of libraries to the library browser.
* Added a bunch of examples to the project browser.
* New Turkish translation. Thanks @yildizhuseyin!
* New < arduino connected ? > block.
* Code cleanup, especially regarding menu decorators.
* New save and share dialog, by @jguille2.
* Showing correct IPs and hostnames in the HTTP server menu, by @jguille2.
* Probably a bunch of other improvements by @jguille2 that I've forgotten, especially in the web and ChromeOS versions. Thanks for all the hard work!

### 1.2.4

* Updated URLs and info dialogs to match new domain, this includes the mechanism that checks for new versions. This solves the launch delay in some versions.
* Fixed HTTP issues for CLI version.
* Huge improvements in Chromium version, thanks to @jguille2.
* Transpiler now works in Chromium, thanks to @jguille2 again.
* File saving fixes for the transpiler. Guess thanks to whom ;)
* Fixed menus in web version.
* Fixed send-var HTTP API entry point.

### 1.2.3

* Experimental mobile version for Android tablets that uses serial over Blueetooth
* Added script that fixes GPU issue in old Mac computers (see [this wiki entry](https://github.com/bromagosa/Snap4Arduino/wiki/Troubleshooting#white-screen-in-macosx-on-startup))
* Automatic version discovery (with help from Joan Guillén), prompts user to download a new version if available
* Fixed Libraries menu in ChromeOS version
* Added Phiro library
* French translation (thanks @pierre-rouanet!)
* Fixed costume/background loader
* Added `--load` parameter for desktop versions (see [this wiki entry](https://github.com/bromagosa/Snap4Arduino/wiki/Launch-Parameters))
* Added `--lang` parameter for desktop versions (see [this wiki entry](https://github.com/bromagosa/Snap4Arduino/wiki/Launch-Parameters))
* Bahasa Indonesia translation (thanks @triyanwn!)
* Ability to export lists into CSV, XML, JSON or plain text
* Made servoWrite _actually_ atomic
* Analog/digital watchers are now saved in the project
* Converted all sounds to OGG so that they can be played by nwjs.io (MPEG codecs are proprietary)
* Included a bunch of pull requests to Snap! that haven't yet been merged but are necessary:
  * Webcam costume and background dialog support
  * Fix for variable rename-refactoring
  * Two fixes related to toggling design mode and project names, by Joan Guillén
  * Categorized costumes and sounds dialog, by @erichake
  * Fix for paint bucket bug
* Updated Firmata in desktop versions, by Joan Guillén

### 1.2.2

* Project listener and websockets command listener daemon for Linino version (Tian, Yun, Yun mini, Industrial 101)
* Fixed analog and digital watchers in Linino version
* Made servoWrite atomic
* Fixed LeapMotion library for desktop versions, contributed by @fzsigmond
* Added loading screen for desktop versions
* Traditional and simplified Chinese translations by Jeffrey (Ying-Chieh) Chao

### 1.2.1

* Fixed some broken ChromeOS file system operations
* Transpiler enhancements for servos, by Joan Guillén
* Added ability to load projects by URL
* Support for modified Firmatas in web version, by Joan Guillén
* WebSockets project listener for Linino version (Tian, Yun, Yun mini, Industrial 101)
* Added Galician language (thanks @tecnoloxia!)

### 1.2

_This release was made in collaboration with -and thanks to- Joan Guillén and Josep Ferrándiz from AULATEC (CESIRE)._

* Fixed an esoteric bug that randomly ignored some digital writes
* Same esoteric bug fixed for servos (thanks Joan Guillén!)
* Set window spawn position to the center of the screen
* Added Swedish translation (thanks Ove Risberg!)
* Fixed a bug that made duplicate sprites share the same board instance
* Added LICENSE file in releases
* Included icons in Gnu/Linux releases
* Added a .desktop launcher for Gnu/Linux GUIs
* Named installers with their platform and version names
* Changed color of icons and Arduino blocks
* Our file menu was a couple of releases behind Snap!'s, now it's up to date
* Added a bunch of examples to the repository
* Several transpiler improvements, mostly done by Joan Guillén, including:
  * `random` mapped to the same range as Snap!
  * Removed `join`, as it was not working
  * Added `wait until` and `do until`
  * Built specific functions for all Arduino functionalities that behave (almost) exactly like Snap4Arduino's
  * Fixed math block
  * Re-added ability to transpile custom blocks

This release was built by using a new compact builder that can handle all platforms, including desktop versions for 32 and 64 bits OS X, Windows and Gnu/Linux, a ChromeOS app, a command line version, a web-based version for Chrome/Chromium (plus its companion plugin), and an experimental (not yet published) Android version.

### 1.1.6-beta-RC3

* Better support for serial port over network (thanks Ove Risberg!)
* Network serial port settings are persistent across sessions
* Refactored Arduino functionalities into an independent object
* Fixed a bunch of transpilation bugs
* Enhanced transpilation to C, added support for broadcasts (only broadcast and wait, for now)
* We now hide empty categories when in transpilable mode
* New API endpoint for single-var readings
