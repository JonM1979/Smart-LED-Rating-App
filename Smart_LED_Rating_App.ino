/*
  Code is based off this project: https://RandomNerdTutorials.com/esp32-data-logging-firebase-realtime-database/
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  The code has been modified to read data from a INA219 sensor and send the data using an ESP32 to a web app 
  
*/

#define ENABLE_USER_AUTH
#define ENABLE_DATABASE

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include "time.h"
#include "ers_model_data.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/core/api/error_reporter.h"
#include "tensorflow/lite/schema/schema_generated.h"

#define TENSOR_ARENA_SIZE 8 * 1024
uint8_t tensor_arena[TENSOR_ARENA_SIZE];

// Network and Firebase credentials
#define WIFI_SSID "REPLACE_WITH_YOUR_SSID"
#define WIFI_PASSWORD "REPLACE_WITH_YOUR_PASSWORD"

#define Web_API_KEY "REPLACE_WITH_YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "REPLACE_WITH_YOUR_FIREBASE_URL"
#define USER_EMAIL "REPLACE_WITH_YOUR_FIREBASE_PROJECT_EMAIL"
#define USER_PASS "REPLACE_WITH_YOUR_FIREBASE_PROJECT_PASSWORD"

// User Functions
void processData(AsyncResult &aResult);

// User auth
UserAuth user_auth(Web_API_KEY, USER_EMAIL, USER_PASS);

// Firebase components
FirebaseApp app;
WiFiClientSecure ssl_client;
using AsyncClient = AsyncClientClass;
AsyncClient aClient(ssl_client);
RealtimeDatabase Database;

// INA219 sensor
Adafruit_INA219 ina219; // I2C
float current_mA;
float voltage_V;
float power_mW;

// TinyML ERS score
float ERS;

// TFLite Variables
// Normalization values
// Mean values
const float voltage_mean = 10.37090532f;
const float current_mean = 368.61586379f;
const float power_mean   = 3936.48006645f;

// Scale values (standard deviation)
const float voltage_scale = 1.35691288f;
const float current_scale = 260.340179f;
const float power_scale   = 2790.77766f;

// Timer variables
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // 10 seconds in miliseconds

// Variable to save USER UID
String uid;

// string of main database path
String databasePath;
// database child nodes 
String currentPath = "/current";
String voltagePath = "/voltage";
String powerPath = "/power";
String timePath = "/timestamp";
String ersPath = "/ERS";

// parent path to be updated in every loop 
String parentPath;

int timestamp;

const char* ntpServer = "pool.ntp.org";

// JSON objects
object_t jsonData, obj1, obj2, obj3, obj4, obj5;
JsonWriter writer;

// Initialize INA219
void initINA219() {
  if (!ina219.begin()) {
    Serial.println("Could not find INA219 sensor. Check wiring!");
    while (1);
  }
}

// Initialize WiFi
void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(" connected");
}

// Get current epoch time
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return(0);
  }
  time(&now);
  return now;
}

void setup(){
  Serial.begin(115200);
  
  initINA219();
  initWiFi();
  configTime(0, 0, ntpServer);

  ssl_client.setInsecure();
  ssl_client.setConnectionTimeout(1000);
  ssl_client.setHandshakeTimeout(5);

  initializeApp(aClient, app, getAuth(user_auth), processData, "🔐 authTask");
  app.getApp<RealtimeDatabase>(Database);
  Database.url(DATABASE_URL);
}

void loop(){
  // maintain authentication and async tasks
  app.loop();

  // check if authentication is ready
  if (app.ready()) {

    // periodic data sending every 10 seconds 
    unsigned long currentTime = millis();
    if (currentTime - lastSendTime >= sendInterval) {
      // update the last send time
      lastSendTime = currentTime;

      uid = app.getUid().c_str();

      // update database path
      databasePath = "/UsersData/" + uid + "/readings";

      // get current timestamp
      timestamp = getTime();
      Serial.print("time: ");
      Serial.println(timestamp);
      
      parentPath = databasePath + "/" + String(timestamp);

      // Read sensor data
      current_mA = ina219.getCurrent_mA();
      voltage_V = ina219.getBusVoltage_V();
      power_mW = ina219.getPower_mW();

      // Normalize
      float voltage_norm = (voltage_V - voltage_mean) / voltage_scale;
      float current_norm = (current_mA - current_mean) / current_scale;
      float power_norm   = (power_mW   - power_mean)   / power_scale;

      // Run TFLite Model to get ERS value and constrain the value
      // range from 0 to 100
      ERS = runModel(voltage_norm, current_norm, power_norm);
      ERS = constrain(ERS, 0.0f, 100.0f);

      // serial print of what is being sent to Firebase
      Serial.printf("Current: %.2f mA, Voltage: %.2f V, Power: %.2f mW, ERS: %.2f\n", current_mA, voltage_V, power_mW, ERS);
      
      // Create JSON object
      writer.create(obj1, currentPath, current_mA);
      writer.create(obj2, voltagePath, voltage_V);
      writer.create(obj3, powerPath, power_mW);
      writer.create(obj4, timePath, timestamp);
      writer.create(obj5, ersPath, ERS);
      writer.join(jsonData, 5, obj1, obj2, obj3, obj4, obj5);

      Serial.printf("Sending ERS to Firebase: %.2f\n", ERS);
      //Firebase.printf("Full JSON payload: %s\n", writer.c_str());

      Database.set<object_t>(aClient, parentPath, jsonData, processData, "RTDB_Send_Data");
    }
  }
}

void processData(AsyncResult &aResult) {
  if (!aResult.isResult()) return;

  if (aResult.isEvent())
    Firebase.printf("Event task: %s, msg: %s, code: %d\n", aResult.uid().c_str(), aResult.eventLog().message().c_str(), aResult.eventLog().code());

  if (aResult.isDebug())
    Firebase.printf("Debug task: %s, msg: %s\n", aResult.uid().c_str(), aResult.debug().c_str());

  if (aResult.isError())
    Firebase.printf("Error task: %s, msg: %s, code: %d\n", aResult.uid().c_str(), aResult.error().message().c_str(), aResult.error().code());

  if (aResult.available())
    Firebase.printf("task: %s, payload: %s\n", aResult.uid().c_str(), aResult.c_str());
}

// -----------------------------
// TensorFlow Lite Inference
// -----------------------------
float runModel(float voltage, float current, float power) {
  tflite::ErrorReporter* error_reporter = nullptr;

  const tflite::Model* model = tflite::GetModel(ers_model_tflite);
  if (model->version() != TFLITE_SCHEMA_VERSION) {
    error_reporter->Report("Model schema mismatch!");
    return -1.0;
  }

  static tflite::MicroMutableOpResolver<3> resolver; // or whatever number of ops you need
  resolver.AddFullyConnected();
  resolver.AddRelu();

  static tflite::MicroInterpreter interpreter(model, resolver, tensor_arena, TENSOR_ARENA_SIZE);
  interpreter.AllocateTensors();

  TfLiteTensor* input = interpreter.input(0);
  input->data.f[0] = voltage;
  input->data.f[1] = current;
  input->data.f[2] = power;

  if (interpreter.Invoke() != kTfLiteOk) {
    error_reporter->Report("Invoke failed.");
    return -1.0;
  }

  TfLiteTensor* output = interpreter.output(0);

  return output->data.f[0];  // This is the ERS
}
