// Telnet to Serial with mDNS and web configuration
//
// MIT Public License
// http://www.opensource.org/licenses/MIT
//
// Copyright (C) 2015 Ove Risberg
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <WiFiClient.h>
#include <EEPROM.h>
#include <WebSocketsServer.h>
#include <Hash.h>

// TCP server at port 80 will respond to HTTP requests
ESP8266WebServer server(80);

WebSocketsServer webSocket = WebSocketsServer(81);

WiFiServer telnet(23);
WiFiClient telnetClient;

const int baudRates[] = {300, 1200, 2400, 9600, 57600, 115200};

String localSSID      = "";
String Password       = "";
String localEnabled   = "";
String apSSID         = "";
String apEnabled      = "yes";
int    baudRate       = 115200;
String mDNS           = "esp8266";
boolean websocket_connected = false;

void setup(void)
{
  // Read EEPROM
  EEPROM.begin(512);
  read_EEPROM();
  
  // Read GPIO 2 (low = config mode, high = normal mode)
  // Special workaround:
  // You can not use gpio0 or gpio2 as inputs during startup but if you make gpio0 an output
  // and set it to zero when your program starts and place the button or jumper between
  // gpio0 and gpio2 then you can read the gpio2 pin.
  int config = 0;
  
  pinMode(0, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  digitalWrite(0, 0);
  config = digitalRead(2) ^ 1;
  pinMode(0, INPUT);

  // Set apSSID to something if it is empty
  if (apSSID == "")
    apSSID = "eps8266_" + WiFi.softAPmacAddress();
  
  // Initial setup serial port
  Serial.begin(baudRate);
  
  // Connect to WiFi network (AP should alwaus be enabled in config mode)
  if (localEnabled == "yes" && (apEnabled == "yes" || config)) {
    WiFi.mode(WIFI_AP_STA);
  } else if (localEnabled == "yes") {
    WiFi.mode(WIFI_STA);
  } else {
    WiFi.mode(WIFI_AP);
    apEnabled = "yes";
  }
    
  if (apEnabled == "yes" || config)
    WiFi.softAP(apSSID.c_str());
  if (localEnabled == "yes")
    WiFi.begin(localSSID.c_str(), Password.c_str());

  // Wait for connection (max 30 seconds)
  // mDNS will not work unless the IP address is known
  int i = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    i++;
    if (i > 60) break;
  }

  // Set up mDNS responder:
  // - first argument is the domain name, in this example
  //   the fully-qualified domain name is "esp8266.local"
  // - second argument is the IP address to advertise
  //   we send our IP address on the WiFi network
  MDNS.begin(mDNS.c_str());
  
  // Start Telnet server
  telnet.begin();
  telnet.setNoDelay(true);

  // Start TCP (HTTP) server
  server.on("/", handleRoot);
  server.on("/save", handleSave);
  server.onNotFound(handleNotFound);
  server.begin();

  // Start webSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Add services to MDNS-SD
  MDNS.addService("http", "tcp", 80);
  MDNS.addService("ws", "tcp", 81);
  MDNS.addService("telnet", "tcp", 23);
}

void loop(void)
{
  uint8_t i;
  // Check if there are any new clients
  if (telnet.hasClient()){
    //find free/disconnected spot
    if ((!telnetClient || !telnetClient.connected()) && websocket_connected == false){
      if(telnetClient) telnetClient.stop();
      telnetClient = telnet.available();
    }
    
    //no free/disconnected spot so reject
    WiFiClient serverClient = telnet.available();
    serverClient.stop();
  }
  
  // Check telnet clients for data
  
  if (telnetClient && telnetClient.connected()){
    if(telnetClient.available()){
      // Get data from the telnet client and push it to the UART
      while(telnetClient.available()) Serial.write(telnetClient.read());
    }
  }
  
  // Check UART for data
  if(Serial.available()){
    size_t len = Serial.available();
    uint8_t sbuf[len];
    Serial.readBytes(sbuf, len);
    // Push UART data to telnet client
    if (telnetClient && telnetClient.connected()){
      telnetClient.write(sbuf, len);
    }
//    if (webSocket && webSocket.clientIsConnected(0)){
    if (websocket_connected == true) {
      webSocket.sendBIN(0, sbuf, len);
    }
//      sbuf[len] = 0;
//      webSocket.sendTXT(0, sbuf);
//    }
  }

  webSocket.loop();
  server.handleClient();
}

void handleRoot() {
  String s = "";
  IPAddress ip = WiFi.localIP();
  String localIP = String(ip[0]) + '.' + String(ip[1]) + '.' + String(ip[2]) + '.' + String(ip[3]);
  ip = WiFi.softAPIP();
  String apIP = String(ip[0]) + '.' + String(ip[1]) + '.' + String(ip[2]) + '.' + String(ip[3]);
  String localMAC = WiFi.macAddress();
  String apMAC = WiFi.softAPmacAddress();

  // Read GPIO 2 (low = config mode, high = normal mode)
  // Special workaround:
  // You can not use gpio0 or gpio2 as inputs during startup but if you make gpio0 an output
  // and set it to zero when your program starts and place the button or jumper between
  // gpio0 and gpio2 then you can read the gpio2 pin.
  int config = 0;
  
  pinMode(0, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  digitalWrite(0, 0);
  config = digitalRead(2) ^ 1;
  pinMode(0, INPUT);
  
  if (config) {
    s += "<html>";
    s += "<form action=\"save\" method=\"POST\">";
    s += "<table border=\"0\">";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">Local WiFi Configuration:</th></tr>";
    s += "<tr><td>SSID:</td><td><input type=\"text\" name=\"localSSID\" value=\"" + localSSID + "\"></td></tr>";
    s += "<tr><td>Password:</td><td><input type=\"password\" name=\"Password\" value=\"" + Password + "\"></td></tr>";
    s += "<tr><td>IP Address:</td><td>" + localIP + "</td></tr>";
    s += "<tr><td>MAC Address:</td><td>" + localMAC + "</td></tr>";
    s += "<tr><td>Enabled:</td><td><input type=\"radio\" name=\"localEnabled\" value=\"yes\"";
    s += (localEnabled == "yes")?" checked":"";
    s += "/>Yes<input type=\"radio\" name=\"localEnabled\" value=\"no\"";
    s += (localEnabled == "yes")?"":" checked";
    s += "/>No</td></tr>";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">Access Point WiFi Configuration:</th></tr>";
    s += "<tr><td>SSID:</td><td><input type=\"text\" name=\"apSSID\" value=\"" + apSSID + "\"></td></tr>";
    s += "<tr><td>IP Address:</td><td>" + apIP + "</td></tr>";
    s += "<tr><td>MAC Address:</td><td>" + apMAC + "</td></tr>";
    s += "<tr><td>Enabled:</td><td><input type=\"radio\" name=\"apEnabled\" value=\"yes\"";
    s += (apEnabled == "yes")?" checked":"";
    s += "/>Yes<input type=\"radio\" name=\"apEnabled\" value=\"no\"";
    s += (apEnabled == "yes")?"":" checked";
    s += "/>No</td></tr>";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">Serial Port Configuration:</th></tr>";
    s += "<tr><td>Baud Rate:</td><td><select name=\"baudRate\">";
    for (uint8_t i=0; i < sizeof(baudRates)/4; i++) {
      if (baudRate == baudRates[i])
        s += "<option selected>";
      else
        s += "<option>";
      s += String(baudRates[i]) + "</option>";
    }
    s += "</select></td></tr>";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">mDNS / Avahi / Bonjour:</th></tr>";
    s += "<tr><td>Name:</td><td><input type=\"text\" name=\"mDNS\" value=\"" + mDNS + "\"></td></tr>";
    s += "</table>";
    s += "<br>";
    s += "<input type=\"submit\" value=\"Save and Reboot\">";
    s += "</form>";
    s += "</html>";
  } else {
    s += "<html>";
    s += "<form action=\"save\" method=\"POST\">";
    s += "<table border=\"0\">";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">Local WiFi Configuration:</th></tr>";
    s += "<tr><td>SSID:</td><td>" + localSSID + "</td></tr>";
    s += "<tr><td>Password:</td><td>**********</td></tr>";
    s += "<tr><td>IP Address:</td><td>" + localIP + "</td></tr>";
    s += "<tr><td>MAC Address:</td><td>" + localMAC + "</td></tr>";
    s += "<tr><td>Enabled:</td><td>";
    s += (localEnabled == "yes")?"Yes":"No";
    s += "</td></tr>";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">Access Point WiFi Configuration:</th></tr>";
    s += "<tr><td>SSID:</td><td>" + apSSID + "</td></tr>";
    s += "<tr><td>IP Address:</td><td>" + apIP + "</td></tr>";
    s += "<tr><td>MAC Address:</td><td>" + apMAC + "</td></tr>";
    s += "<tr><td>Enabled:</td><td>";
    s += (apEnabled == "yes")?"Yes":"No";
    s += "</td></tr>";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">Serial Port Configuration:</th></tr>";
    s += "<tr><td>Baud Rate:</td><td><select name=\"baudRate\">";
    for (uint8_t i=0; i < sizeof(baudRates)/4; i++) {
      if (baudRate == baudRates[i])
        s += "<option selected>";
      else
        s += "<option>";
      s += String(baudRates[i]) + "</option>";
    }
    s += "</select></td></tr>";
    s += "<tr bgcolor=\"#1E90FF\"><th colspan=\"2\">mDNS / Avahi / Bonjour:</th></tr>";
    s += "<tr><td>Name:</td><td>" + mDNS + "</td></tr>";
    s += "</table>";
    s += "<br>";
    s += "<input type=\"submit\" value=\"Save\">";
    s += "</form>";
    s += "</html>";
  }
  server.send(200, "text/html", s);
}

void handleNotFound(){
  String s = "File Not Found\n\n";
  s += "URI: ";
  s += server.uri();
  s += "\nMethod: ";
  s += (server.method() == HTTP_GET)?"GET":"POST";
  s += "\nArguments: ";
  s += server.args();
  s += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    s += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", s);
}

void handleSave() {
  // Read GPIO 2 (low = config mode, high = normal mode)
  // Special workaround:
  // You can not use gpio0 or gpio2 as inputs during startup but if you make gpio0 an output
  // and set it to zero when your program starts and place the button or jumper between
  // gpio0 and gpio2 then you can read the gpio2 pin.
  int config = 0;
  
  pinMode(0, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  digitalWrite(0, 0);
  config = digitalRead(2) ^ 1;
  pinMode(0, INPUT);

  String timeout;
  if (config) {
    for (uint8_t i=0; i<server.args(); i++){
      if (server.argName(i) == "localSSID") {
        localSSID = server.arg(i);
        urlDecode(localSSID);
      } else if (server.argName(i) == "Password") {
        Password = server.arg(i);
        urlDecode(Password);
      } else if (server.argName(i) == "localEnabled") {
        localEnabled = server.arg(i);
        urlDecode(localEnabled);
      } else if (server.argName(i) == "apSSID") {
        apSSID = server.arg(i);
        urlDecode(apSSID);
      } else if (server.argName(i) == "apEnabled") {
        apEnabled = server.arg(i);
        urlDecode(apEnabled);
      } else if (server.argName(i) == "baudRate") {
        if (server.arg(i).toInt() != 0) {
          baudRate = server.arg(i).toInt();
        }
      } else if (server.argName(i) == "mDNS") {
        mDNS = server.arg(i);
        urlDecode(mDNS);
      }
    }
    int address = 0;
    address = write_EEPROM(address, "localSSID=" + localSSID + "\n");
    address = write_EEPROM(address, "Password=" + Password + "\n");
    address = write_EEPROM(address, "localEnabled=" + localEnabled + "\n");
    address = write_EEPROM(address, "apSSID=" + apSSID + "\n");
    address = write_EEPROM(address, "apEnabled=" + apEnabled + "\n");
    address = write_EEPROM(address, "baudRate=" + String(baudRate) + "\n");
    address = write_EEPROM(address, "mDNS=" + mDNS + "\n");
    EEPROM.write(address, 0);
    EEPROM.commit();
    // Write to EEPROM
    timeout = "10";
  } else {
    for (uint8_t i=0; i<server.args(); i++){
      if (server.argName(i) == "baudRate") {
        if (server.arg(i).toInt() != 0) {
          baudRate = server.arg(i).toInt();
          Serial.begin(baudRate);
        }
      }
    }
    timeout = "2";
  }

  String s =  "<html>";
  s += "<head>";
  s += "<meta http-equiv=\"refresh\" content=\"" + timeout + ";url=/\" />";
  s += "</head>";
  s += "<body>";
  s += "<h1>Redirecting in " + timeout + " seconds...</h1>";
  s += "</body>";
  s += "</html>";
  server.send(200, "text/html", s);
  if (config) ESP.reset();
}

int write_EEPROM(int address, const String &s){
    for(int i=0; i < s.length(); i++) {
       EEPROM.write(address++, s.charAt(i));
    }
    return address;
}

void read_EEPROM() {
  int address = 0;
  String key = "";
  String value = "";
  byte c;
  while(1) {
    // Key
    key = "";
    while(1) {
      c = EEPROM.read(address);
      if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        key += (char) c;
        address++;
      } else {
        break;
      }
      if (address >= 512) break;
    }
    
    // Equal sign
    if (c != '=') break;
    address++;
    if (address >= 512) break;
    
    // Value
    value = "";
    while(1) {
      c = EEPROM.read(address);
      if (c == '\n') break;
      value += (char) c;
      address++;
      if (address >= 512) break;
    }
    address++;
    if (address >= 512) break;

    // Update configuration
    if (key == "localSSID") {
      localSSID = value;
    } else if (key == "Password") {
      Password = value;
    } else if (key == "localEnabled") {
      localEnabled = value;
    } else if (key == "apSSID") {
      apSSID = value;
    } else if (key == "apEnabled") {
      apEnabled = value;
    } else if (key == "baudRate") {
      baudRate = value.toInt();
    } else if (key == "mDNS") {
      mDNS = value;
    }
  }
}

void urlDecode(String &url) {
  url.replace("%20", " ");
  url.replace("+", " ");
  url.replace("%21", "!");
  url.replace("%22", "\"");
  url.replace("%23", "#");
  url.replace("%24", "$");
  url.replace("%25", "%");
  url.replace("%26", "&");
  url.replace("%27", "\'");
  url.replace("%28", "(");
  url.replace("%29", ")");
  url.replace("%30", "*");
  url.replace("%31", "+");
  url.replace("%2C", ",");
  url.replace("%2E", ".");
  url.replace("%2F", "/");
  url.replace("%2C", ",");
  url.replace("%3A", ":");
  url.replace("%3A", ";");
  url.replace("%3C", "<");
  url.replace("%3D", "=");
  url.replace("%3E", ">");
  url.replace("%3F", "?");
  url.replace("%40", "@");
  url.replace("%5B", "[");
  url.replace("%5C", "\\");
  url.replace("%5D", "]");
  url.replace("%5E", "^");
  url.replace("%5F", "-");
  url.replace("%60", "`");
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {

    switch(type) {
        case WStype_DISCONNECTED:
//            Serial.printf("[%u] Disconnected!\n", num);
            websocket_connected = false;
            break;
        case WStype_CONNECTED: //{
//            IPAddress ip = webSocket.remoteIP(num);
//            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
//
//            // send message to client
//            webSocket.sendTXT(num, "Connected");
        //}
            // We want only one websocket ot one telnet client
            if (num != 0 || (telnetClient && telnetClient.connected())) {
              webSocket.disconnect(num);
            } else {
              websocket_connected = true;
            }
            break;
        case WStype_TEXT:
            //Serial.printf("%s", payload);
            Serial.write(payload, lenght);
            break;

        case WStype_BIN:
            Serial.write(payload, lenght);
//            Serial.printf("[%u] get binary lenght: %u\n", num, lenght);
//            hexdump(payload, lenght);
//
//            // send message to client
//            webSocket.sendBIN(num, payload, lenght);
            break;
    }

}
