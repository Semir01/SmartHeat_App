#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

//===================================================================//

const char* net = "net_2232";
const char* password = "102030102030";
//const char* net = "semir";
//const char* password = "semirjazvin";

//Firebase settings
#define API_KEY "AIzaSyDbp42OfCdd4opQnsOC0RLZIUuW8c95YvI"
#define DATABASE_URL "https://smartheat-951e2-default-rtdb.firebaseio.com/"
//Pin and senzor type
#define DHTPIN D2
#define DHTTYPE DHT22
//Ceating objects
DHT dhtSensor(DHTPIN, DHTTYPE);
const int relay1 = D1;

FirebaseData fbData;
FirebaseConfig config;
FirebaseAuth auth;

//===================================================================//

void setup() {
  Serial.begin(115200);
  
  //Conecting in WiFi
  WiFi.begin(net, password);
  Serial.print("Conecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.println("CONNECTED");
  Serial.print("IP adress: ");
  Serial.println(WiFi.localIP());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if(Firebase.signUp(&config,&auth,"","")){
    Serial.println("SignUp OK");
  }else{
    Serial.println("Error, SingUp false");
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config,&auth);
  Firebase.reconnectWiFi(true);

  //Starting DHT senzor
  dhtSensor.begin();

  //Define pin for relay
  pinMode(relay1, OUTPUT);
  //Relay is OFF
  digitalWrite(relay1, HIGH);
}

//===================================================================//

void ManualMode(){
  delay(1200);
  Firebase.RTDB.getInt(&fbData,"relay1/status");
  int status=fbData.intData();

  if(status == 1){
    digitalWrite(relay1,LOW);
    Serial.println("Relay is ON");
  } else if(status == 0){
    digitalWrite(relay1, HIGH);
    Serial.println("Relay is OFF");
  }else{
    Serial.print("Error while reading data from Firebase:");
    Serial.println(fbData.errorReason());
  }
}

//===================================================================//

void SensorDataToFirebase(){
  float temperature = dhtSensor.readTemperature();
  float humidity = dhtSensor.readHumidity();

  if(isnan(temperature) || isnan(humidity)){
    Serial.println("Failed to read data from DHT sensor");
    return;
  }

  if(Firebase.RTDB.setFloat(&fbData,"sensor/temperature",temperature)){
    Serial.print("Temperature sent:");
    Serial.println(temperature);
  }else{
    Serial.print("Failed to sent temperature");
    Serial.println(fbData.errorReason());
  }

  if(Firebase.RTDB.setFloat(&fbData,"sensor/humidity",humidity)){
    Serial.print("humidity sent:");
    Serial.println(humidity);
  }else{
    Serial.print("Failed to sent humidity");
    Serial.println(fbData.errorReason());
  }
}

//===================================================================//

void AutoMod(){
  Firebase.RTDB.getInt(&fbData,"autoMod/statusAutoMode");
  int statusAutoMod=fbData.intData();

  Firebase.RTDB.getInt(&fbData,"tempertureSettings/maxTemp");
  int maxTemp = fbData.intData();

  Firebase.RTDB.getInt(&fbData,"tempertureSettings/minTemp");
  int minTemp = fbData.intData();

  Firebase.RTDB.getInt(&fbData,"sensor/temperature");
  int CurrentTemp = fbData.intData();

  float histereza = 0.5;
  if(statusAutoMod == 1){
    if(CurrentTemp < minTemp - histereza){
      digitalWrite(relay1,LOW);
      if(Firebase.RTDB.setString(&fbData,"info/message","Heating is ON - Current temperature below minTemp")){
        Serial.println("Info message sent to Firebase");
      }else{
         Serial.println("Faild to sent message to Firebase");
      }
    }else if(CurrentTemp > maxTemp + histereza){
      digitalWrite(relay1,HIGH);
      if(Firebase.RTDB.setString(&fbData,"info/message","Heating is OFF - Current temperature above maxTemp")){
        Serial.println("Info message sent to Firebase");
      }else{
         Serial.println("Faild to sent message to Firebase");
      }
    }else{
      digitalWrite(relay1,HIGH);
      if(Firebase.RTDB.setString(&fbData,"info/message","Heating is OFF - Temperature within range. No action taken")){
        Serial.println("Info message sent to Firebase");
      }else{
         Serial.println("Faild to sent message to Firebase");
      }
    }
  }else {
    ManualMode();  
  }
}

//===================================================================//

void loop() {
  // Auto control for relay1
  AutoMod();
  // Sending data from DHT sensor on Firebase
  SensorDataToFirebase();
}
