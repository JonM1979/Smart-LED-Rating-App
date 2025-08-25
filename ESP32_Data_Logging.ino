/*
  Code created by JonM1979 to log data from LEDs and save it in a .CSV file
*/

#include <Wire.h>
#include <Adafruit_INA219.h>
#include "time.h"
#include <WiFi.h>

// INA219 sensor
Adafruit_INA219 ina219;

float current_mA;
float voltage_V;
float power_mW;

// logging variables
const char* ledBrand = "Philips" // change brand name to LED being measured
const float ledRatedVoltage = 12.0; // change rated voltage to LED being measured

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // 10 seconds

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* ntpServer = "pool.ntp.org";

// Initialize INA219
void initINA219() {
  if (!ina219.begin()) {
    Serial.println("Could not find INA219 sensor. Check wiring!");
    while (1);
  }
}

// Get current epoch time
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return 0;
  }
  time(&now);
  return now;
}

void setup() {
  Serial.begin(115200);
  initINA219();
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("WiFi Connected");
  configTime(0, 0, ntpServer);

  Serial.println("timestamp,voltage,current,power, brand, rated_voltage"); // CSV header
}

void loop() {
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;

    // Read sensor data
    current_mA = ina219.getCurrent_mA();
    voltage_V = ina219.getBusVoltage_V();
    power_mW = ina219.getPower_mW();
    unsigned long timestamp = getTime();

    // Print in CSV format
    Serial.printf("%lu, %.2f, %.2f, %.2f, %s, %.2f\n", timestamp, voltage_V, current_mA, power_mW,
                    ledBrand, ledRatedVoltage);
  }
}
