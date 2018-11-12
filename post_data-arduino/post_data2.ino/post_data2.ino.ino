/*
  post data to server and read response body ,parsing json data 
 */
#include <ArduinoHttpClient.h>
#include "ESP8266WiFi.h"
#include <ArduinoJson.h>
#include <DHT.h>;
#include "pins_arduino.h"

//DHT Constants
#define DHTPIN 12     // what pin we're connected to (D6)
#define DHTTYPE DHT22   // DHT 22  (AM2302)
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino
float temp; //Stores temperature value
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
/////// Wifi Settings ///////
char ssid[] = "CHEAW";//type your ssid
char pass[] = "0978579421";//type your password
String n = "sensor1";
//String jsonStr = "{\"name\":\"Sensor-1\",\"temp\":\"25.0\"}";// 定義JSON字串

char serverAddress[] = "192.168.0.3";  // server address
int port = 3000;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);
int status = WL_IDLE_STATUS;
String response;
int statusCode = 0;

unsigned long current_time;
unsigned long timer = 180000;//3 min
unsigned long start_time = 0;

const char* sensorId;
String SID;
const char* responseData;
//post data to server , initial connect
void advertisement(float temp) {
  
  Serial.println("making POST request(advertisement)");
  String contentType = "application/json";
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& roots = jsonBuffer.createObject();
  
  roots["name"] = n;
  roots["temp"] = temp;
  roots["type"] = "temperature";
  //temp = (int)dht.readTemperature();
  
  
  
  String jsonStr;
  roots.printTo(jsonStr);
  Serial.print("Temp : ");
  Serial.println(temp);
  Serial.println(jsonStr);
  client.post("/sensors/insert", contentType, jsonStr);

  // read the status code and body of the response
  statusCode = client.responseStatusCode();
  response = client.responseBody();
  
  //parsing response to Json
  JsonObject& data = jsonBuffer.parseObject(response);
  responseData = data["message"];
  //long time = root[String("time")];

  SID = data["sensorId"].as<String>();
  
  // Test if parsing succeeds.
  if (!data.success()) {
    Serial.println("parseObject() failed");
    return;
  }

  Serial.print("Status code: ");
  Serial.println(statusCode);
  Serial.print("Message: ");
  Serial.println(responseData);
  Serial.print("Sid: ");
  Serial.println(SID);
}
void notification(float temp,String sensorId)
{
  Serial.println("notification");
  String contentType = "application/json";
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& roots = jsonBuffer.createObject();
  
  roots["sensorId"] = sensorId;
  //temp = (int)dht.readTemperature();
  roots["temp"] = temp;
  String jsonStr;
  roots.printTo(jsonStr);
  Serial.print("Temp : ");
  Serial.println(temp);
  Serial.println(jsonStr);
  client.patch("/sensors/update", contentType, jsonStr);
  // read the status code and body of the response
  statusCode = client.responseStatusCode();
  response = client.responseBody();
  
  //parsing response to Json
  JsonObject& data = jsonBuffer.parseObject(response);
  responseData = data["message"];
  //sensorId = data["sensorId"];
  
  // Test if parsing succeeds.
  if (!data.success()) {
    Serial.println("parseObject() failed");
    return;
  }

  Serial.print("Status code: ");
  Serial.println(statusCode);
  Serial.print("Message: ");
  Serial.println(responseData); 
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  // Inside the brackets, 200 is the size of the pool in bytes.
  // Don't forget to change this value to match your JSON document.
  
  //current_time = millis();
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
   
  WiFi.begin(ssid, pass);
   
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  // you're connected now, so print out the data
  Serial.println("You're connected to the network");
  //temp = (int)dht.readTemperature();
  temp = dht.readTemperature();
  // advertisement to the server
  while(SID == NULL)
  {
    advertisement(temp);
  }
}

void loop() {
  current_time = millis();
  if(temp != dht.readTemperature())
  {
    temp = dht.readTemperature();
    notification(temp,SID);
    start_time = current_time;
    delay(5000);
  }
  else if(current_time - start_time > timer)
  {
    temp = dht.readTemperature();
    notification(temp,SID);
    start_time = current_time;   
  }
//  
//  delay(5000);
  //Serial.println("nothing happens");
}
