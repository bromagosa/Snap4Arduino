/*
Firmata is a generic protocol for communicating with microcontrollers
from software on a host computer. It is intended to work with
any host computer software package.

To download a host software package, please click on the following link
to open the list of Firmata client libraries in your default browser.

https://github.com/firmata/arduino#firmata-client-libraries

Copyright (C) 2006-2008 Hans-Christoph Steiner.  All rights reserved.
Copyright (C) 2010-2011 Paul Stoffregen.  All rights reserved.
Copyright (C) 2009 Shigeru Kobayashi.  All rights reserved.
Copyright (C) 2009-2016 Jeff Hoefs.  All rights reserved.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

See file LICENSE.txt for further informations on licensing terms.

Last updated August 17th, 2017

Creative Science Foundation Creative Robotix Educational Platform Modifications.

Last updated May 15th, 2018 

Compile Notes:

Additional libraies required for compile

http://playground.arduino.cc/Code/NewPing

https://github.com/wayoda/LedControl

New Ping may conflict with the Tone function.  Edit the NewPing.h file 
and set the TIMMER_ENABLED setting to 'false'.  The header file can
be found under the 'Arduino/libraries/NewPing' folder.

*/

#include <Servo.h>
#include <Wire.h>
#include <Firmata.h>
#include <NewPing.h>	
#include <LedControl.h>

#define I2C_WRITE                   B00000000
#define I2C_READ                    B00001000
#define I2C_READ_CONTINUOUSLY       B00010000
#define I2C_STOP_READING            B00011000
#define I2C_READ_WRITE_MODE_MASK    B00011000
#define I2C_10BIT_ADDRESS_MODE_MASK B00100000
#define I2C_END_TX_MASK             B01000000
#define I2C_STOP_TX                 1
#define I2C_RESTART_TX              0
#define I2C_MAX_QUERIES             8
#define I2C_REGISTER_NOT_SPECIFIED  -1

// the minimum interval for sampling analog input
#define MINIMUM_SAMPLING_INTERVAL   1

// definitions for creative robotix educational platform

// CRE SYSEX Commands
#define CRE_ULTRASOUND				0x08
#define CRE_SAY						0x09
#define CRE_LED_DISPLAY				0x0A
#define CRE_SWING_ARMS				0x0B
#define CRE_LOOK_AROUND				0x0C

// CRE configuration
#define CRE_DEFAULT_CONFIGURATION_INPUTS 0x000400 // each bit: 1 = pin in INPUT, 0 = anything else

#define IS_PIN_DIGITAL_INPUT(p)        ((CRE_DEFAULT_CONFIGURATION_INPUTS >> p) & 0x01 )

// Arms, head and mouth pin assignments

#define PIN_LEFT_ARM_SERVO		4
#define PIN_RIGHT_ARM_SERVO		5
#define PIN_HEAD_SERVO			6
#define PIN_MOUTH_RED			14
#define PIN_MOUTH_GREEN			15

// Behaviour limits for arms and head

#define ARM_SWING_MAX_DEGREES	50
#define HEAD_SWING_MAX_DEGREES	50

// MAX72XX LED 8x8 display

#define MAX72XX_HEIGHT			8
#define MAX72XX_WIDTH			8
#define MAX72XX_DIN				9
#define MAX72XX_CS				8
#define MAX72XX_CLK				7

// Ultrasound Sensor

#define HCSR04_TRIGGER			11
#define HCSR04_ECHO				10
#define HCSR04_MAX_DISTANCE		60 // Sensor returns a range between 1 to HCR04_MAX_DISTANCE, and 0 otherwise
#define HCSR04_CLEAR			0

// Speaker

#define SPEAKER					13

#define TEXT_TO_SAY_BUFFER_LEN	60

// Bluetooth

#define BLUETOOTH_RX_EN			12

// Local 8x8 display data

const static uint32_t LED_DISPLAY_IMAGES[][2] PROGMEM = {
	0x3c420018, 0xe7a5a5e7,			// smile
	0x007e0018, 0xe7a5a5e7,			// neutral
	0x423c0018, 0xe7a5a5e7,			// frown
	0x0c0c000c, 0x1830331e,			// question mark
	0x00005735, 0x35570000,			// OK
	0x00040a11, 0x20408000,			// tick
	0x00422418, 0x18244200,			// cross
	0x7e3c1805, 0x03070507,			// rock
	0x1f3e7cf9, 0xf1070507,			// paper
	0xd8f82027, 0x54570107,			// sissors
	0x00000000, 0x00000000			// blank
};

const uint8_t LED_DISPLAY_IMAGES_LEN = sizeof(LED_DISPLAY_IMAGES) / sizeof(uint32_t);

const static uint32_t LED_DISPLAY_DIGITS[][2] PROGMEM = {
	0x0000e0a0, 0xa0a0e000,			// 0
	0x00008080, 0x80808000,			// 1
	0x0000e020, 0xe080e000,			// 2	
	0x0000e080, 0xe080e000,			// 3
	0x00008080, 0xe0a0a000,			// 4
	0x0000e080, 0xe020e000,			// 5
	0x0000e0a0, 0xe020e000,			// 6
	0x00008080, 0x8080e000,			// 7
	0x0000e0a0, 0xe0a0e000,			// 8
	0x00008080, 0xe0a0e000			// 9
};

const int LED_DIGITS_LEN = sizeof(LED_DISPLAY_DIGITS) / sizeof(uint32_t);

const static uint32_t LED_DISPLAY_CHARACTERS[][2] PROGMEM = {
	0x00000000, 0x00000000,
	0x18001818, 0x3c3c1800,
	0x00000000, 0x286c6c00,
	0x6c6cfe6c, 0xfe6c6c00,
	0x103c4038, 0x04781000,
	0x60660c18, 0x30660600,
	0xfc66a614, 0x3c663c00,
	0x00000000, 0x00040400,
	0x60301818, 0x18306000,
	0x060c1818, 0x180c0600,
	0x006c38fe, 0x386c0000,
	0x0010107c, 0x10100000,
	0x00000000, 0x60303000,
	0x0000003c, 0x00000000,
	0x06060000, 0x00000000,
	0x00060c18, 0x30600000,
	0x3c66666e, 0x76663c00,
	0x7e181818, 0x1c181800,
	0x7e060c30, 0x60663c00,
	0x3c666038, 0x60663c00,
	0x30307e32, 0x34383000,
	0x3c666060, 0x3e067e00,
	0x3c66663e, 0x06663c00,
	0x18181830, 0x30667e00,
	0x3c66663c, 0x66663c00,
	0x3c66607c, 0x66663c00,
	0x00181800, 0x18180000,
	0x0c181800, 0x18180000,
	0x6030180c, 0x18306000,
	0x00003c00, 0x3c000000,
	0x060c1830, 0x180c0600,
	0x18001838, 0x60663c00,
	0x003c421a, 0x3a221c00,
	0x6666667e, 0x66663c00,			// A
	0x3e66663e, 0x66663e00,			// B
	0x3c660606, 0x06663c00,			// C
	0x3e666666, 0x66663e00,			// D
	0x7e06063e, 0x06067e00,			// E
	0x0606063e, 0x06067e00,			// F
	0x3c667606, 0x06663c00,			// G
	0x6666667e, 0x66666600,			// H
	0x3c181818, 0x18183c00,			// ...
	0x1c363630, 0x30307800,
	0x66361e0e, 0x1e366600,
	0x7e060606, 0x06060600,
	0xc6c6c6d6, 0xfeeec600,
	0xc6c6e6f6, 0xdecec600,
	0x3c666666, 0x66663c00,
	0x06063e66, 0x66663e00,
	0x603c7666, 0x66663c00,
	0x66361e3e, 0x66663e00,
	0x3c66603c, 0x06663c00,
	0x18181818, 0x185a7e00,
	0x7c666666, 0x66666600,			// ...
	0x183c6666, 0x66666600,			// V
	0xc6eefed6, 0xc6c6c600,			// W
	0xc6c66c38, 0x6cc6c600,			// X
	0x1818183c, 0x66666600,			// Y
	0x7e060c18, 0x30607e00,			// Z
	0x78181818, 0x18187800,			// [
	0x00603018, 0x0c060000,			// '\'
	0x1e181818, 0x18181e00,			// ]
	0x00000082, 0x44281000,			// ^
	0x7e000000, 0x00000000,			// _
	0x0000000c, 0x18181800,			// `
	0x7c667c60, 0x3c000000,			// a
	0x3e66663e, 0x06060600,			// b
	0x3c660666, 0x3c000000,			// c
	0x7c66667c, 0x60606000,			// ...
	0x3c067e66, 0x3c000000,
	0x0c0c3e0c, 0x0c6c3800,
	0x3c607c66, 0x667c0000,
	0x6666663e, 0x06060600,
	0x3c181818, 0x00180000,
	0x1c363630, 0x30003000,
	0x66361e36, 0x66060600,
	0x18181818, 0x18181800,
	0xd6d6feee, 0xc6000000,
	0x6666667e, 0x3e000000,
	0x3c666666, 0x3c000000,
	0x06063e66, 0x663e0000,
	0xf0b03c36, 0x363c0000,
	0x06066666, 0x3e000000,
	0x3e403c02, 0x7c000000,
	0x1818187e, 0x18180000,
	0x7c666666, 0x66000000,			// ...
	0x183c6666, 0x00000000,			// v
	0x7cd6d6d6, 0xc6000000,			// w
	0x663c183c, 0x66000000,			// x
	0x3c607c66, 0x66000000,			// y
	0x3c0c1830, 0x3c000000,			// z
	0x7018180c, 0x18187000,
	0x0e181830, 0x18180e00,
	0x00080808, 0x08080000,
	0x00000036, 0x5c000000,
	0x00000000, 0x00000000			// del
};

const int LED_DISPLAY_CHARACTERS_LEN = sizeof(LED_DISPLAY_CHARACTERS) / sizeof(uint32_t);

#define GETSCROLLROW(c, b)				((byte)((c >> (8*b)) & 0xFF))
#define GETDISPLAYROW(c, b)				((byte)((c >> (8*(7-b)) & 0xFF)))

#define LED_DISPLAY_SMILE				0
#define LED_DISPLAY_NEUTRAL				1
#define LED_DISPLAY_FROWN				2	
#define LED_DISPLAY_QUESTION			3
#define LED_DISPLAY_OK					4
#define LED_DISPLAY_TICK				5	
#define LED_DISPLAY_CROSS				6	
#define LED_DISPLAY_ROCK				7
#define LED_DISPLAY_PAPER				8
#define LED_DISPLAY_SISSORS				9	
#define LED_DISPLAY_BLANK				10 

#define LED_SET_IMAGE					1
#define LED_SET_SCROLL_TEXT				2
#define LED_SET_NUMBER					3
#define LED_SET_ROW_DATA				4
#define LED_SET_SET_PIXEL				5
#define LED_SET_CLEAR					6

#define TEXT_TO_SCROLL_BUFFER_LEN		60

/*==============================================================================
* GLOBAL VARIABLES
*============================================================================*/

#ifdef FIRMATA_SERIAL_FEATURE
SerialFirmata serialFeature;
#endif

/* analog inputs */
int analogInputsToReport = 0; // bitwise array to store pin reporting

									/* digital input ports */
byte reportPINs[TOTAL_PORTS];       // 1 = report this port, 0 = silence
byte previousPINs[TOTAL_PORTS];     // previous 8 bits sent

									/* pins configuration */
byte portConfigInputs[TOTAL_PORTS]; // each bit: 1 = pin in INPUT, 0 = anything else

									/* timer variables */
unsigned long currentMillis;        // store the current value from millis()
unsigned long previousMillis;       // for comparison with currentMillis
unsigned int samplingInterval = 19; // how often to run the main loop (in ms) was 19

									/* i2c data */
struct i2c_device_info {
	byte addr;
	int reg;
	byte bytes;
	byte stopTX;
};

/* for i2c read continuous more */
i2c_device_info query[I2C_MAX_QUERIES];

byte i2cRxData[64];
boolean isI2CEnabled = false;
signed char queryIndex = -1;
// default delay time between i2c read request and Wire.requestFrom()
unsigned int i2cReadDelayTime = 0;

Servo servos[MAX_SERVOS];
byte servoPinMap[TOTAL_PINS];
byte detachedServos[MAX_SERVOS];
byte detachedServoCount = 0;
byte servoCount = 0;

boolean isResetting = false;

// Forward declare a few functions to avoid compiler errors with older versions
// of the Arduino IDE.
void setPinModeCallback(byte, int);
void reportAnalogCallback(byte analogPin, int value);
void sysexCallback(byte, byte, byte*);

/* utility functions */
void wireWrite(byte data)
{
#if ARDUINO >= 100
	Wire.write((byte)data);
#else
	Wire.send(data);
#endif
}

byte wireRead(void)
{
#if ARDUINO >= 100
	return Wire.read();
#else
	return Wire.receive();
#endif
}

// Globals for creative robotix educational platform

LedControl ledDisplay = LedControl(MAX72XX_DIN, MAX72XX_CLK, MAX72XX_CS, 0);

NewPing sonar(HCSR04_TRIGGER, HCSR04_ECHO, HCSR04_MAX_DISTANCE); // NewPing setup of pins and maximum distance.

boolean isArmsSwing = false;		
boolean isHeadSwing = false;			
boolean isTextToScroll = false;	 
boolean isTextToSay = false;

uint8_t armSwingSpeed = 0, headSwingSpeed = 0;

uint8_t textToScrollLen = 0;
byte textToScrollBuffer[TEXT_TO_SCROLL_BUFFER_LEN];

unsigned long scrollInterval = 200;
unsigned long armSwingInterval = 25;
unsigned long headSwingInterval = 50;

uint8_t textToSayLen = 0;
byte textToSayBuffer[TEXT_TO_SAY_BUFFER_LEN];

/*==============================================================================
* FUNCTIONS (CREATIVE ROBOTIX PLATFORM)
*============================================================================*/

void initCreativeRobotixPlatform() {
	uint64_t character;

	// Configure A0 and A1 as digital outputs 

	setPinModeCallback(14, OUTPUT);
	setPinModeCallback(15, OUTPUT);

	// Initialise the MAX72XX display 

	ledDisplay.shutdown(0, false);		// The MAX72XX is in power-saving mode on startup
	ledDisplay.setIntensity(0, 7);		// Set the brightness to (7), maximum value (15)
	ledDisplay.clearDisplay(0);			// and clear the display

	// LED Display to neutral
	character = pgm_read_dword(&(LED_DISPLAY_IMAGES[LED_DISPLAY_NEUTRAL][0])); // High
	character = (character << 32) | pgm_read_dword(&(LED_DISPLAY_IMAGES[LED_DISPLAY_NEUTRAL][1])); // Low
	setLEDisplay(character);

	// Say hello, I'm active
	sayDirect("Hello World!");

	// If transistor in place, this will turn on the Blutooth serial RX, disabling USB Serial RX

	BluetoothRX(true);

	// LED display to smile
	character = pgm_read_dword(&(LED_DISPLAY_IMAGES[LED_DISPLAY_SMILE][0])); // High
	character = (character << 32) | pgm_read_dword(&(LED_DISPLAY_IMAGES[LED_DISPLAY_SMILE][1])); // Low
	setLEDisplay(character);
}

void setLEDisplay(const uint64_t character)
{
	for (uint8_t row = 0; row < 8; row++)
	{
		ledDisplay.setRow(0, row, GETDISPLAYROW(character, row));
	}
}

void updateTextToSay() {
	/* timer variables */
	static uint8_t character = 0;
	static boolean toneActive = false;
	static unsigned long l_currentMillis;	// store the current value from millis()
	static unsigned long l_previousMillis;	// for comparison with currentMillis
	static unsigned long toneDuration;		// store current tone duration

	l_currentMillis = millis();

	if (character >= textToSayLen) { // All done, reset
		isTextToSay = false;
		character = 0;
		textToSayLen = 0;
	}
	else { // Still have a character to say, have we finished the tone?
		if (!toneActive) { // If no active tone, play the next one
			toneDuration = textToSayBuffer[character] / 2;
			tone(SPEAKER, (128 - textToSayBuffer[character]) * 100, toneDuration); // convert character to suitable frequency, currently arbitary, update?
			toneActive = true;
			l_previousMillis = l_currentMillis;
		}
		else { // update timmer and tone
			if ((l_currentMillis - l_previousMillis) > toneDuration) { // tone duration reached
				noTone(SPEAKER);
				toneActive = false;
				character++; // next character
			}
		}
	}
}

void updateTextToScroll() {
	static uint8_t character = 0, character_previous = 1, character_scroll = 0, cindex;
	static unsigned long l_currentMillis;	// store the current value from millis()
	static unsigned long l_previousMillis;	// for comparison with currentMillis
	static uint64_t current_character = 0, screen = 0, column_update;

	l_currentMillis = millis();

	if ((l_currentMillis - l_previousMillis) > scrollInterval) {
		// update screen buffer 

		if (character_scroll >= MAX72XX_WIDTH) {  // time to shift in next character? 
			character = (character + 1) % textToScrollLen;
			character_scroll = 0;
		}

		if (character != character_previous) {  // shift in next character on character change
			character_previous = character;
			cindex = textToScrollBuffer[character] - ' ';  // characters start from 0x20 or ASCII ' ' 
			current_character = pgm_read_dword(&(LED_DISPLAY_CHARACTERS[cindex][0])); // High
			current_character = (current_character << 32) | pgm_read_dword(&(LED_DISPLAY_CHARACTERS[cindex][1])); // Low
		}

		screen = shiftScreenLeft(screen);  // shift screen left one column, update to selected column shifts and or direction 
		column_update = (current_character & (0x0101010101010101 << character_scroll)) << ((MAX72XX_WIDTH - 1) - character_scroll); // character_scroll selects next column to shift in on the right
		screen = screen | column_update; // update the screen with the column 

		// update screen

		setLEDisplay(screen);

		// update variables
		character_scroll++;
		l_previousMillis = l_currentMillis;

		// TODO: Multi screen scroll 
	}
}

uint64_t shiftScreenLeft(uint64_t screen) {
	uint64_t new_screen = 0;

	for (int8_t row = MAX72XX_WIDTH - 1; row >= 0; row--) {
		new_screen = (new_screen << 8) | ((GETSCROLLROW(screen, row) >> 1) & 0xFF);  // columns are labeled left to right from 1 to 7, hence sifts are opposit in sense, may physically invert the screen to fix?
	}

	return (new_screen);
}

void updateArmsSwing() {
	static uint8_t angle = 90;
	static int8_t direction = 1;
	static unsigned long l_currentMillis;	// store the current value from millis()
	static unsigned long l_previousMillis;	// for comparison with currentMilli()

	l_currentMillis = millis();

	if (!servos[servoPinMap[PIN_RIGHT_ARM_SERVO]].attached()) setPinModeCallback(PIN_RIGHT_ARM_SERVO, PIN_MODE_SERVO);
	if (!servos[servoPinMap[PIN_LEFT_ARM_SERVO]].attached()) setPinModeCallback(PIN_LEFT_ARM_SERVO, PIN_MODE_SERVO);

	if ((l_currentMillis - l_previousMillis) > armSwingInterval) {

		if (angle < (90 - ARM_SWING_MAX_DEGREES) || angle > (90 + ARM_SWING_MAX_DEGREES)) direction = direction * -1; // change direction

		angle = angle + (armSwingSpeed * direction);

		analogWriteCallback(PIN_RIGHT_ARM_SERVO, angle);
		analogWriteCallback(PIN_LEFT_ARM_SERVO, angle);

		// update variables
		l_previousMillis = l_currentMillis;
	}
}

void stopArmsSwing() {
	setPinModeCallback(PIN_RIGHT_ARM_SERVO, PIN_MODE_OUTPUT);
	setPinModeCallback(PIN_LEFT_ARM_SERVO, PIN_MODE_OUTPUT);
}

void updateHeadSwing() {
	static uint8_t angle = 90;
	static int8_t direction = 1;
	static unsigned long l_currentMillis;	// store the current value from millis()
	static unsigned long l_previousMillis;	// for comparison with currentMilli()

	l_currentMillis = millis();

	if (!servos[servoPinMap[PIN_HEAD_SERVO]].attached()) setPinModeCallback(PIN_HEAD_SERVO, PIN_MODE_SERVO);
	
	if ((l_currentMillis - l_previousMillis) > headSwingInterval) {

		angle = angle + (headSwingSpeed * direction);

		if (angle < (90 - HEAD_SWING_MAX_DEGREES) || angle > (90 + HEAD_SWING_MAX_DEGREES)) direction = direction * -1; // change direction

		analogWriteCallback(PIN_HEAD_SERVO, angle);

		// update variables
		l_previousMillis = l_currentMillis;
	}
}

void stopHeadSwing() {
	setPinModeCallback(PIN_HEAD_SERVO, PIN_MODE_OUTPUT);
}

void sayDirect(String text) { 
	// Say text string, uses delay, private use only
	uint8_t state = 5;
	for (uint8_t i = 0; i < text.length(); i++) {
		tone(SPEAKER, (128 - text[i]) * 100, text[i] / 2);
		delay(text[i] / 2);
		noTone(SPEAKER);
	}
}

void BluetoothRX(bool active) {
	// Controls the Bluetooth serial receive, when active USB receive is turned off.

	setPinValueCallback(BLUETOOTH_RX_EN, active);
}

/*==============================================================================
* FUNCTIONS
*============================================================================*/

void attachServo(byte pin, int minPulse, int maxPulse)
{
	if (servoCount < MAX_SERVOS) {
		// reuse indexes of detached servos until all have been reallocated
		if (detachedServoCount > 0) {
			servoPinMap[pin] = detachedServos[detachedServoCount - 1];
			if (detachedServoCount > 0) detachedServoCount--;
		}
		else {
			servoPinMap[pin] = servoCount;
			servoCount++;
		}
		if (minPulse > 0 && maxPulse > 0) {
			servos[servoPinMap[pin]].attach(PIN_TO_DIGITAL(pin), minPulse, maxPulse);
		}
		else {
			servos[servoPinMap[pin]].attach(PIN_TO_DIGITAL(pin));
		}
	}
	else {
		Firmata.sendString("Max servos attached");
	}
}

void detachServo(byte pin)
{
	servos[servoPinMap[pin]].detach();
	// if we're detaching the last servo, decrement the count
	// otherwise store the index of the detached servo
	if (servoPinMap[pin] == servoCount && servoCount > 0) {
		servoCount--;
	}
	else if (servoCount > 0) {
		// keep track of detached servos because we want to reuse their indexes
		// before incrementing the count of attached servos
		detachedServoCount++;
		detachedServos[detachedServoCount - 1] = servoPinMap[pin];
	}

	servoPinMap[pin] = 255;
}

void enableI2CPins()
{
	byte i;
	// is there a faster way to do this? would probaby require importing
	// Arduino.h to get SCL and SDA pins
	for (i = 0; i < TOTAL_PINS; i++) {
		if (IS_PIN_I2C(i)) {
			// mark pins as i2c so they are ignore in non i2c data requests
			setPinModeCallback(i, PIN_MODE_I2C);
		}
	}

	isI2CEnabled = true;

	Wire.begin();
}

/* disable the i2c pins so they can be used for other functions */
void disableI2CPins() {
	isI2CEnabled = false;
	// disable read continuous mode for all devices
	queryIndex = -1;
}

void readAndReportData(byte address, int theRegister, byte numBytes, byte stopTX) {
	// allow I2C requests that don't require a register read
	// for example, some devices using an interrupt pin to signify new data available
	// do not always require the register read so upon interrupt you call Wire.requestFrom()
	if (theRegister != I2C_REGISTER_NOT_SPECIFIED) {
		Wire.beginTransmission(address);
		wireWrite((byte)theRegister);
		Wire.endTransmission(stopTX); // default = true
									  // do not set a value of 0
		if (i2cReadDelayTime > 0) {
			// delay is necessary for some devices such as WiiNunchuck
			delayMicroseconds(i2cReadDelayTime);
		}
	}
	else {
		theRegister = 0;  // fill the register with a dummy value
	}

	Wire.requestFrom(address, numBytes);  // all bytes are returned in requestFrom

										  // check to be sure correct number of bytes were returned by slave
	if (numBytes < Wire.available()) {
		Firmata.sendString("I2C: Too many bytes received");
	}
	else if (numBytes > Wire.available()) {
		Firmata.sendString("I2C: Too few bytes received");
	}

	i2cRxData[0] = address;
	i2cRxData[1] = theRegister;

	for (int i = 0; i < numBytes && Wire.available(); i++) {
		i2cRxData[2 + i] = wireRead();
	}

	// send slave address, register and received bytes
	Firmata.sendSysex(SYSEX_I2C_REPLY, numBytes + 2, i2cRxData);
}

void outputPort(byte portNumber, byte portValue, byte forceSend)
{
	// pins not configured as INPUT are cleared to zeros
	portValue = portValue & portConfigInputs[portNumber];
	// only send if the value is different than previously sent
	if (forceSend || previousPINs[portNumber] != portValue) {
		Firmata.sendDigitalPort(portNumber, portValue);
		previousPINs[portNumber] = portValue;
	}
}

/* -----------------------------------------------------------------------------
* check all the active digital inputs for change of state, then add any events
* to the Serial output queue using Serial.print() */
void checkDigitalInputs(void)
{
	/* Using non-looping code allows constants to be given to readPort().
	* The compiler will apply substantial optimizations if the inputs
	* to readPort() are compile-time constants. */
	if (TOTAL_PORTS > 0 && reportPINs[0]) outputPort(0, readPort(0, portConfigInputs[0]), false);
	if (TOTAL_PORTS > 1 && reportPINs[1]) outputPort(1, readPort(1, portConfigInputs[1]), false);
	if (TOTAL_PORTS > 2 && reportPINs[2]) outputPort(2, readPort(2, portConfigInputs[2]), false);
	if (TOTAL_PORTS > 3 && reportPINs[3]) outputPort(3, readPort(3, portConfigInputs[3]), false);
	if (TOTAL_PORTS > 4 && reportPINs[4]) outputPort(4, readPort(4, portConfigInputs[4]), false);
	if (TOTAL_PORTS > 5 && reportPINs[5]) outputPort(5, readPort(5, portConfigInputs[5]), false);
	if (TOTAL_PORTS > 6 && reportPINs[6]) outputPort(6, readPort(6, portConfigInputs[6]), false);
	if (TOTAL_PORTS > 7 && reportPINs[7]) outputPort(7, readPort(7, portConfigInputs[7]), false);
	if (TOTAL_PORTS > 8 && reportPINs[8]) outputPort(8, readPort(8, portConfigInputs[8]), false);
	if (TOTAL_PORTS > 9 && reportPINs[9]) outputPort(9, readPort(9, portConfigInputs[9]), false);
	if (TOTAL_PORTS > 10 && reportPINs[10]) outputPort(10, readPort(10, portConfigInputs[10]), false);
	if (TOTAL_PORTS > 11 && reportPINs[11]) outputPort(11, readPort(11, portConfigInputs[11]), false);
	if (TOTAL_PORTS > 12 && reportPINs[12]) outputPort(12, readPort(12, portConfigInputs[12]), false);
	if (TOTAL_PORTS > 13 && reportPINs[13]) outputPort(13, readPort(13, portConfigInputs[13]), false);
	if (TOTAL_PORTS > 14 && reportPINs[14]) outputPort(14, readPort(14, portConfigInputs[14]), false);
	if (TOTAL_PORTS > 15 && reportPINs[15]) outputPort(15, readPort(15, portConfigInputs[15]), false);
}

// -----------------------------------------------------------------------------
/* sets the pin mode to the correct state and sets the relevant bits in the
* two bit-arrays that track Digital I/O and PWM status
*/
void setPinModeCallback(byte pin, int mode)
{
	if (Firmata.getPinMode(pin) == PIN_MODE_IGNORE)
		return;

	if (Firmata.getPinMode(pin) == PIN_MODE_I2C && isI2CEnabled && mode != PIN_MODE_I2C) {
		// disable i2c so pins can be used for other functions
		// the following if statements should reconfigure the pins properly
		disableI2CPins();
	}
	if (IS_PIN_DIGITAL(pin) && mode != PIN_MODE_SERVO) {
		if (servoPinMap[pin] < MAX_SERVOS && servos[servoPinMap[pin]].attached()) {
			detachServo(pin);
		}
	}
	if (IS_PIN_ANALOG(pin)) {
		reportAnalogCallback(PIN_TO_ANALOG(pin), mode == PIN_MODE_ANALOG ? 1 : 0); // turn on/off reporting
	}
	if (IS_PIN_DIGITAL(pin)) {
		if (mode == INPUT || mode == PIN_MODE_PULLUP) {
			portConfigInputs[pin / 8] |= (1 << (pin & 7));
		}
		else {
			portConfigInputs[pin / 8] &= ~(1 << (pin & 7));
		}
	}
	Firmata.setPinState(pin, 0);
	switch (mode) {
	case PIN_MODE_ANALOG:
		if (IS_PIN_ANALOG(pin)) {
			if (IS_PIN_DIGITAL(pin)) {
				pinMode(PIN_TO_DIGITAL(pin), INPUT);    // disable output driver
#if ARDUINO <= 100
														// deprecated since Arduino 1.0.1 - TODO: drop support in Firmata 2.6
				digitalWrite(PIN_TO_DIGITAL(pin), LOW); // disable internal pull-ups
#endif
			}
			Firmata.setPinMode(pin, PIN_MODE_ANALOG);
		}
		break;
	case INPUT:
		if (IS_PIN_DIGITAL(pin)) {
			pinMode(PIN_TO_DIGITAL(pin), INPUT);    // disable output driver
#if ARDUINO <= 100
													// deprecated since Arduino 1.0.1 - TODO: drop support in Firmata 2.6
			digitalWrite(PIN_TO_DIGITAL(pin), LOW); // disable internal pull-ups
#endif
			Firmata.setPinMode(pin, INPUT);
		}
		break;
	case PIN_MODE_PULLUP:
		if (IS_PIN_DIGITAL(pin)) {
			pinMode(PIN_TO_DIGITAL(pin), INPUT_PULLUP);
			Firmata.setPinMode(pin, PIN_MODE_PULLUP);
			Firmata.setPinState(pin, 1);
		}
		break;
	case OUTPUT:
		if (IS_PIN_DIGITAL(pin)) {
			if (Firmata.getPinMode(pin) == PIN_MODE_PWM) {
				// Disable PWM if pin mode was previously set to PWM.
				digitalWrite(PIN_TO_DIGITAL(pin), LOW);
			}
			pinMode(PIN_TO_DIGITAL(pin), OUTPUT);
			Firmata.setPinMode(pin, OUTPUT);
		}
		break;
	case PIN_MODE_PWM:
		if (IS_PIN_PWM(pin)) {
			pinMode(PIN_TO_PWM(pin), OUTPUT);
			analogWrite(PIN_TO_PWM(pin), 0);
			Firmata.setPinMode(pin, PIN_MODE_PWM);
		}
		break;
	case PIN_MODE_SERVO:
		if (IS_PIN_DIGITAL(pin)) {
			Firmata.setPinMode(pin, PIN_MODE_SERVO);
			if (servoPinMap[pin] == 255 || !servos[servoPinMap[pin]].attached()) {
				// pass -1 for min and max pulse values to use default values set
				// by Servo library
				attachServo(pin, -1, -1);
			}
		}
		break;
	case PIN_MODE_I2C:
		if (IS_PIN_I2C(pin)) {
			// mark the pin as i2c
			// the user must call I2C_CONFIG to enable I2C for a device
			Firmata.setPinMode(pin, PIN_MODE_I2C);
		}
		break;
	case PIN_MODE_SERIAL:
#ifdef FIRMATA_SERIAL_FEATURE
		serialFeature.handlePinMode(pin, PIN_MODE_SERIAL);
#endif
		break;
	default:
		Firmata.sendString("Unknown pin mode"); // TODO: put error msgs in EEPROM
	}
	// TODO: save status to EEPROM here, if changed
}

/*
* Sets the value of an individual pin. Useful if you want to set a pin value but
* are not tracking the digital port state.
* Can only be used on pins configured as OUTPUT.
* Cannot be used to enable pull-ups on Digital INPUT pins.
*/
void setPinValueCallback(byte pin, int value)
{
	if (pin < TOTAL_PINS && IS_PIN_DIGITAL(pin)) {
		if (Firmata.getPinMode(pin) == OUTPUT) {
			Firmata.setPinState(pin, value);
			digitalWrite(PIN_TO_DIGITAL(pin), value);
		}
	}
}

void analogWriteCallback(byte pin, int value)
{
	if (pin < TOTAL_PINS) {
		switch (Firmata.getPinMode(pin)) {
		case PIN_MODE_SERVO:
			if (IS_PIN_DIGITAL(pin))
				servos[servoPinMap[pin]].write(value);
			Firmata.setPinState(pin, value);
			break;
		case PIN_MODE_PWM:
			if (IS_PIN_PWM(pin))
				analogWrite(PIN_TO_PWM(pin), value);
			Firmata.setPinState(pin, value);
			break;
		}
	}
}

void digitalWriteCallback(byte port, int value)
{
	byte pin, lastPin, pinValue, mask = 1, pinWriteMask = 0;

	if (port < TOTAL_PORTS) {
		// create a mask of the pins on this port that are writable.
		lastPin = port * 8 + 8;
		if (lastPin > TOTAL_PINS) lastPin = TOTAL_PINS;
		for (pin = port * 8; pin < lastPin; pin++) {
			// do not disturb non-digital pins (eg, Rx & Tx)
			if (IS_PIN_DIGITAL(pin)) {
				// do not touch pins in PWM, ANALOG, SERVO or other modes
				if (Firmata.getPinMode(pin) == OUTPUT || Firmata.getPinMode(pin) == INPUT) {
					pinValue = ((byte)value & mask) ? 1 : 0;
					if (Firmata.getPinMode(pin) == OUTPUT) {
						pinWriteMask |= mask;
					}
					else if (Firmata.getPinMode(pin) == INPUT && pinValue == 1 && Firmata.getPinState(pin) != 1) {
						// only handle INPUT here for backwards compatibility
#if ARDUINO > 100
						pinMode(pin, INPUT_PULLUP);
#else
						// only write to the INPUT pin to enable pullups if Arduino v1.0.0 or earlier
						pinWriteMask |= mask;
#endif
					}
					Firmata.setPinState(pin, pinValue);
				}
			}
			mask = mask << 1;
		}
		writePort(port, (byte)value, pinWriteMask);
	}
}


// -----------------------------------------------------------------------------
/* sets bits in a bit array (int) to toggle the reporting of the analogIns
*/
//void FirmataClass::setAnalogPinReporting(byte pin, byte state) {
//}
void reportAnalogCallback(byte analogPin, int value)
{
	if (analogPin < TOTAL_ANALOG_PINS) {
		if (value == 0) {
			analogInputsToReport = analogInputsToReport & ~(1 << analogPin);
		}
		else {
			analogInputsToReport = analogInputsToReport | (1 << analogPin);
			// prevent during system reset or all analog pin values will be reported
			// which may report noise for unconnected analog pins
			if (!isResetting) {
				// Send pin value immediately. This is helpful when connected via
				// ethernet, wi-fi or bluetooth so pin states can be known upon
				// reconnecting.
				Firmata.sendAnalog(analogPin, analogRead(analogPin));
			}
		}
	}
	// TODO: save status to EEPROM here, if changed
}

void reportDigitalCallback(byte port, int value)
{
	if (port < TOTAL_PORTS) {
		reportPINs[port] = (byte)value;
		// Send port value immediately. This is helpful when connected via
		// ethernet, wi-fi or bluetooth so pin states can be known upon
		// reconnecting.
		if (value) outputPort(port, readPort(port, portConfigInputs[port]), true);
	}
	// do not disable analog reporting on these 8 pins, to allow some
	// pins used for digital, others analog.  Instead, allow both types
	// of reporting to be enabled, but check if the pin is configured
	// as analog when sampling the analog inputs.  Likewise, while
	// scanning digital pins, portConfigInputs will mask off values from any
	// pins configured as analog
}

/*==============================================================================
* SYSEX-BASED commands
*============================================================================*/

void sysexCallback(byte command, byte argc, byte *argv)
{
	byte mode;
	byte stopTX;
	byte slaveAddress;
	byte data;
	int slaveRegister;
	unsigned int delayTime;
	
	switch (command) {
	case I2C_REQUEST:
		mode = argv[1] & I2C_READ_WRITE_MODE_MASK;
		if (argv[1] & I2C_10BIT_ADDRESS_MODE_MASK) {
			Firmata.sendString("10-bit addressing not supported");
			return;
		}
		else {
			slaveAddress = argv[0];
		}

		// need to invert the logic here since 0 will be default for client
		// libraries that have not updated to add support for restart tx
		if (argv[1] & I2C_END_TX_MASK) {
			stopTX = I2C_RESTART_TX;
		}
		else {
			stopTX = I2C_STOP_TX; // default
		}

		switch (mode) {
		case I2C_WRITE:
			Wire.beginTransmission(slaveAddress);
			for (byte i = 2; i < argc; i += 2) {
				data = argv[i] + (argv[i + 1] << 7);
				wireWrite(data);
			}
			Wire.endTransmission();
			delayMicroseconds(70);
			break;
		case I2C_READ:
			if (argc == 6) {
				// a slave register is specified
				slaveRegister = argv[2] + (argv[3] << 7);
				data = argv[4] + (argv[5] << 7);  // bytes to read
			}
			else {
				// a slave register is NOT specified
				slaveRegister = I2C_REGISTER_NOT_SPECIFIED;
				data = argv[2] + (argv[3] << 7);  // bytes to read
			}
			readAndReportData(slaveAddress, (int)slaveRegister, data, stopTX);
			break;
		case I2C_READ_CONTINUOUSLY:
			if ((queryIndex + 1) >= I2C_MAX_QUERIES) {
				// too many queries, just ignore
				Firmata.sendString("too many queries");
				break;
			}
			if (argc == 6) {
				// a slave register is specified
				slaveRegister = argv[2] + (argv[3] << 7);
				data = argv[4] + (argv[5] << 7);  // bytes to read
			}
			else {
				// a slave register is NOT specified
				slaveRegister = (int)I2C_REGISTER_NOT_SPECIFIED;
				data = argv[2] + (argv[3] << 7);  // bytes to read
			}
			queryIndex++;
			query[queryIndex].addr = slaveAddress;
			query[queryIndex].reg = slaveRegister;
			query[queryIndex].bytes = data;
			query[queryIndex].stopTX = stopTX;
			break;
		case I2C_STOP_READING:
			byte queryIndexToSkip;
			// if read continuous mode is enabled for only 1 i2c device, disable
			// read continuous reporting for that device
			if (queryIndex <= 0) {
				queryIndex = -1;
			}
			else {
				queryIndexToSkip = 0;
				// if read continuous mode is enabled for multiple devices,
				// determine which device to stop reading and remove it's data from
				// the array, shifiting other array data to fill the space
				for (byte i = 0; i < queryIndex + 1; i++) {
					if (query[i].addr == slaveAddress) {
						queryIndexToSkip = i;
						break;
					}
				}

				for (byte i = queryIndexToSkip; i < queryIndex + 1; i++) {
					if (i < I2C_MAX_QUERIES) {
						query[i].addr = query[i + 1].addr;
						query[i].reg = query[i + 1].reg;
						query[i].bytes = query[i + 1].bytes;
						query[i].stopTX = query[i + 1].stopTX;
					}
				}
				queryIndex--;
			}
			break;
		default:
			break;
		}
		break;
	case I2C_CONFIG:
		delayTime = (argv[0] + (argv[1] << 7));

		if (argc > 1 && delayTime > 0) {
			i2cReadDelayTime = delayTime;
		}

		if (!isI2CEnabled) {
			enableI2CPins();
		}

		break;
	case SERVO_CONFIG:
		if (argc > 4) {
			
			// these vars are here for clarity, they'll optimized away by the compiler
			byte pin = argv[0];
			int minPulse = argv[1] + (argv[2] << 7);
			int maxPulse = argv[3] + (argv[4] << 7);

			if (IS_PIN_DIGITAL(pin)) {
				if (servoPinMap[pin] < MAX_SERVOS && servos[servoPinMap[pin]].attached()) {
					detachServo(pin);
				}
				attachServo(pin, minPulse, maxPulse);
				setPinModeCallback(pin, PIN_MODE_SERVO);
			}
		}
		break;
	case SAMPLING_INTERVAL:
		if (argc > 1) {
			samplingInterval = argv[0] + (argv[1] << 7);
			if (samplingInterval < MINIMUM_SAMPLING_INTERVAL) {
				samplingInterval = MINIMUM_SAMPLING_INTERVAL;
			}
		}
		else {
			//Firmata.sendString("Not enough data");
		}
		break;
	case EXTENDED_ANALOG:
		if (argc > 1) {
			int val = argv[1];
			if (argc > 2) val |= (argv[2] << 7);
			if (argc > 3) val |= (argv[3] << 14);
			analogWriteCallback(argv[0], val);
		}
		break;
	case CAPABILITY_QUERY:
		Firmata.write(START_SYSEX);
		Firmata.write(CAPABILITY_RESPONSE);
		for (byte pin = 0; pin < TOTAL_PINS; pin++) {
			if (IS_PIN_DIGITAL(pin)) {
				Firmata.write((byte)INPUT);
				Firmata.write(1);
				Firmata.write((byte)PIN_MODE_PULLUP);
				Firmata.write(1);
				Firmata.write((byte)OUTPUT);
				Firmata.write(1);
				//////////////////////////////////////////////////
				//CRE2 version 1. Marking digital pins:  pin 3 = CRE && support SHIFT = version 1 
				if (pin == 3) {
					Firmata.write((byte)0x05); //this is SHIFT mode in Firmata defintition (https://github.com/firmata/protocol/blob/master/protocol.md)
					Firmata.write(1);
				}
				//////////////////////////////////////////////////
			}
			if (IS_PIN_ANALOG(pin)) {
				Firmata.write(PIN_MODE_ANALOG);
				Firmata.write(10); // 10 = 10-bit resolution
			}
			if (IS_PIN_PWM(pin)) {
				Firmata.write(PIN_MODE_PWM);
				Firmata.write(DEFAULT_PWM_RESOLUTION);
			}
			if (IS_PIN_DIGITAL(pin)) {
				Firmata.write(PIN_MODE_SERVO);
				Firmata.write(14);
			}
			if (IS_PIN_I2C(pin)) {
				Firmata.write(PIN_MODE_I2C);
				Firmata.write(1);  // TODO: could assign a number to map to SCL or SDA
			}
#ifdef FIRMATA_SERIAL_FEATURE
			serialFeature.handleCapability(pin);
#endif
			Firmata.write(127);
		}
		Firmata.write(END_SYSEX);
		break;
	case PIN_STATE_QUERY:
		if (argc > 0) {
			byte pin = argv[0];
			Firmata.write(START_SYSEX);
			Firmata.write(PIN_STATE_RESPONSE);
			Firmata.write(pin);
			if (pin < TOTAL_PINS) {
				Firmata.write(Firmata.getPinMode(pin));
				Firmata.write((byte)Firmata.getPinState(pin) & 0x7F);
				if (Firmata.getPinState(pin) & 0xFF80) Firmata.write((byte)(Firmata.getPinState(pin) >> 7) & 0x7F);
				if (Firmata.getPinState(pin) & 0xC000) Firmata.write((byte)(Firmata.getPinState(pin) >> 14) & 0x7F);
			}
			Firmata.write(END_SYSEX);
		}
		break;
	case ANALOG_MAPPING_QUERY:
		Firmata.write(START_SYSEX);
		Firmata.write(ANALOG_MAPPING_RESPONSE);
		for (byte pin = 0; pin < TOTAL_PINS; pin++) {
			Firmata.write(IS_PIN_ANALOG(pin) ? PIN_TO_ANALOG(pin) : 127);
		}
		Firmata.write(END_SYSEX);
		break;

	case SERIAL_MESSAGE:
#ifdef FIRMATA_SERIAL_FEATURE
		serialFeature.handleSysex(command, argc, argv);
#endif
		break;
	case CRE_ULTRASOUND:
		{ 
		// Ensure ultrasound pins have the correct sense
		setPinModeCallback(HCSR04_TRIGGER, OUTPUT);
		setPinModeCallback(HCSR04_ECHO, INPUT);

		uint8_t range = sonar.ping_cm(); // Take reading in cm
		// Write result
		Firmata.write(START_SYSEX);
		Firmata.write(STRING_DATA);
		Serial.println((byte)range);  // Can we use Firmata.write(ULTRASOUND); Firmata.write(range);?
		Firmata.write(END_SYSEX);
		}
		break;
	case CRE_SAY:
	{
		uint8_t i = 0;
		for (i; (i < argc) && (i < TEXT_TO_SAY_BUFFER_LEN); i++) { // Stay silent if text is longer than buffer
			textToSayBuffer[i] = argv[i];
		}
		textToSayLen = i;
		isTextToSay = true;
	}
		break;
	case CRE_LED_DISPLAY:
		mode = argv[0];
		switch (mode) {
		case LED_SET_IMAGE:
			if (argv[1] < LED_DISPLAY_IMAGES_LEN) { // Stay silent if argv value greater than display images
				uint64_t character;
				character = pgm_read_dword(&(LED_DISPLAY_IMAGES[argv[1]][0])); // High
				character = (character << 32) | pgm_read_dword(&(LED_DISPLAY_IMAGES[argv[1]][1])); // Low
				setLEDisplay(character);
			}
			break;
		case LED_SET_SCROLL_TEXT:
		{
			for (uint8_t i = 1; (i < argc) && (i < TEXT_TO_SCROLL_BUFFER_LEN); i++) { // Stay silent if text is longer than buffer
				textToScrollBuffer[i - 1] = argv[i];
			}
			textToScrollLen = argc - 1;
			isTextToScroll = true;
		}
			break;
		case LED_SET_NUMBER:
			// Construct a two digit number for display
			if (argv[1] < LED_DIGITS_LEN && argv[2] < LED_DIGITS_LEN) {
				uint64_t digit_tens, digit_units;
				digit_tens = pgm_read_dword(&(LED_DISPLAY_DIGITS[argv[1]][0])); // High
				digit_tens = (digit_tens << 32) | pgm_read_dword(&(LED_DISPLAY_DIGITS[argv[1]][1])); // Low
				digit_units = pgm_read_dword(&(LED_DISPLAY_DIGITS[argv[2]][0])); // High
				digit_units = (digit_units << 32) | pgm_read_dword(&(LED_DISPLAY_DIGITS[argv[2]][1])); // Low
				setLEDisplay((digit_tens >> 4) | digit_units);
			}
			break;
		case LED_SET_ROW_DATA:
		{
			if ((argc - 1) == MAX72XX_WIDTH) {
				uint64_t rowData = 0; 
				for (uint8_t i = 1; i < argc; i++) {
					rowData = (rowData << 8) | (argv[i] & 0xFF);
				}
				setLEDisplay(rowData);
			}
		}
			break;
		case LED_SET_SET_PIXEL:
			if (argv[1] < MAX72XX_WIDTH && argv[2] < MAX72XX_HEIGHT) {
				ledDisplay.setLed(0, argv[1], argv[2], argv[3]);
			}
			break;
		case LED_SET_CLEAR:
			isTextToScroll = false;
			setLEDisplay(0x0);
			break;
		}
		break;
	case CRE_SWING_ARMS:
		if (argc == 2) {
			if (argv[1] == true) {
				// Start
				armSwingSpeed = argv[0];
				isArmsSwing = true;
			}
			else {
				// Stop
				isArmsSwing = false;
				stopArmsSwing();
			}
		}
		break;
	case CRE_LOOK_AROUND:
		if (argc == 2) {
			if (argv[1] == true) {
				// Start
				headSwingSpeed = argv[0];
				isHeadSwing = true;
			}
			else {
				// Stop
				isHeadSwing = false;
				stopHeadSwing();
			}
		}
		break;
	}
}

/*==============================================================================
* SETUP()
*============================================================================*/

void systemResetCallback()
{
	isResetting = true;

	// initialize a defalt state
	// TODO: option to load config from EEPROM instead of default

#ifdef FIRMATA_SERIAL_FEATURE
	serialFeature.reset();
#endif

	if (isI2CEnabled) {
		disableI2CPins();
	}

	for (byte i = 0; i < TOTAL_PORTS; i++) {
		reportPINs[i] = false;    // by default, reporting off
		portConfigInputs[i] = 0;  // until activated
		previousPINs[i] = 0;
	}
	
	for (byte i = 0; i < TOTAL_PINS; i++) {
		// pins with analog capability default to analog input
		// otherwise, pins default to digital output
		if (IS_PIN_ANALOG(i)) {
			// turns off pullup, configures everything
			setPinModeCallback(i, PIN_MODE_ANALOG);
		}
		else if (IS_PIN_DIGITAL(i)) {
			if (IS_PIN_DIGITAL_INPUT(i)) {
				// sets pin to input, configures portConfigInputs
				setPinModeCallback(i, INPUT);
			}
			else {
				// sets the output to 0, configures portConfigInputs
				setPinModeCallback(i, OUTPUT);
			}
		}

		servoPinMap[i] = 255;
	}
	// by default, do not report any analog inputs
	analogInputsToReport = 0;

	detachedServoCount = 0;
	servoCount = 0;

	/* send digital inputs to set the initial state on the host computer,
	* since once in the loop(), this firmware will only send on change */
	
	/*
	TODO: this can never execute, since no pins default to digital input
	but it will be needed when/if we support EEPROM stored config
	*/
	
	for (byte i=0; i < TOTAL_PORTS; i++) {
	outputPort(i, readPort(i, portConfigInputs[i]), true);
	}
	
	isResetting = false;
}

void setup()
{
	Firmata.setFirmwareVersion(FIRMATA_FIRMWARE_MAJOR_VERSION, FIRMATA_FIRMWARE_MINOR_VERSION);

	Firmata.attach(ANALOG_MESSAGE, analogWriteCallback);
	Firmata.attach(DIGITAL_MESSAGE, digitalWriteCallback);
	Firmata.attach(REPORT_ANALOG, reportAnalogCallback);
	Firmata.attach(REPORT_DIGITAL, reportDigitalCallback);
	Firmata.attach(SET_PIN_MODE, setPinModeCallback);
	Firmata.attach(SET_DIGITAL_PIN_VALUE, setPinValueCallback);
	Firmata.attach(START_SYSEX, sysexCallback);
	Firmata.attach(SYSTEM_RESET, systemResetCallback);

	// to use a port other than Serial, such as Serial1 on an Arduino Leonardo or Mega,
	// Call begin(baud) on the alternate serial port and pass it to Firmata to begin like this:
	// Serial1.begin(57600);
	// Firmata.begin(Serial1);
	// However do not do this if you are using SERIAL_MESSAGE

	Firmata.begin(57600);  // NOTE: change this back to 57600
	while (!Serial) {
		; // wait for serial port to connect. Needed for ATmega32u4-based boards and Arduino 101
	}
	
	systemResetCallback();  // reset to default config
	// Firmata.printFirmwareVersion();
	initCreativeRobotixPlatform(); // Initialise robot
}

//void staticReportVersionCallback(void * context) { if (context) { myFirmataPrintVersion(); } }

/*
void myFirmataPrintVersion(void)
{
static bool once = false;

if (!once) {
Firmata.printFirmwareVersion();
}
else {
Firmata.write(REPORT_VERSION);
Firmata.write(FIRMATA_PROTOCOL_MAJOR_VERSION);
Firmata.write(FIRMATA_PROTOCOL_MINOR_VERSION);
}
}
*/


/*==============================================================================
* LOOP()
*============================================================================*/
void loop()
{
	byte pin, analogPin;
	static bool sendFirmwareVersion = false;

	/* DIGITALREAD - as fast as possible, check for changes and output them to the
	* FTDI buffer using Serial.print()  */
	checkDigitalInputs();

	/* STREAMREAD - processing incoming messagse as soon as possible, while still
	* checking digital inputs.  */
	while (Firmata.available()) {
		if (!sendFirmwareVersion) { Firmata.printFirmwareVersion(); sendFirmwareVersion = true; } /* Addresses Bluetooth connection issue */
		Firmata.processInput();
	}

	// TODO - ensure that Stream buffer doesn't go over 60 bytes

	currentMillis = millis();
	if (currentMillis - previousMillis > samplingInterval) {
		previousMillis += samplingInterval;
		/* ANALOGREAD - do all analogReads() at the configured sampling interval */
		for (pin = 0; pin < TOTAL_PINS; pin++) {
			if (IS_PIN_ANALOG(pin) && Firmata.getPinMode(pin) == PIN_MODE_ANALOG) {
				analogPin = PIN_TO_ANALOG(pin);
				if (analogInputsToReport & (1 << analogPin)) {
					Firmata.sendAnalog(analogPin, analogRead(analogPin));
				}
			}
		}
		// report i2c data for all device with read continuous mode enabled
		if (queryIndex > -1) {
			for (byte i = 0; i < queryIndex + 1; i++) {
				readAndReportData(query[i].addr, query[i].reg, query[i].bytes, query[i].stopTX);
			}
		}

		// Do CRE updates ;

		if (isTextToSay) updateTextToSay();
		if (isTextToScroll) updateTextToScroll();
		if (isArmsSwing) updateArmsSwing();
		if (isHeadSwing) updateHeadSwing();
	}
	
#ifdef FIRMATA_SERIAL_FEATURE
	serialFeature.update();
#endif
}
