# CHANGELOG

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
