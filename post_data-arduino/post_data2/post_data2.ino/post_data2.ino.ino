/*
  post data to server and read response body ,parsing json data 
 */
#include <ArduinoHttpClient.h>
#include "ESP8266WiFi.h"
#include <ArduinoJson.h>


///////please enter your sensitive data in the Secret tab/arduino_secrets.h
/////// Wifi Settings ///////
char ssid[] = "CHEAW";//type your ssid
char pass[] = "0978579421";//type your password
String n = "Sensor-2"; 
//String jsonStr = "{\"name\":\"Sensor-1\",\"temp\":\"25.0\"}";// 定義JSON字串


char serverAddress[] = "192.168.0.3";  // server address
int port = 3000;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);
int status = WL_IDLE_STATUS;
String response,jsonStr;
int statusCode = 0;
StaticJsonBuffer<300> jsonBuffer;
const char* sensorId;
const char* responseData;
//post data to server , initial connect
void advertisement(String postData) {
  
  Serial.println("making POST request");
  String contentType = "application/json";

  client.post("/sensors/insert", contentType, postData);

  // read the status code and body of the response
  statusCode = client.responseStatusCode();
  response = client.responseBody();
  
  //parsing response to Json
  JsonObject& data = jsonBuffer.parseObject(response);
  responseData = data["message"];
  sensorId = data["sensorId"];
  
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
  Serial.println(sensorId);
}

void setup() {
  Serial.begin(115200);

  // Inside the brackets, 200 is the size of the pool in bytes.
  // Don't forget to change this value to match your JSON document.
  
  JsonObject& roots = jsonBuffer.createObject();
  //root.set<String>("name", "sensor1");
  //root.set<int>("temp", 30);
  roots["name"] = "sensor1";
  roots["temp"] = 30;
  roots.printTo(jsonStr);
  
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
  // advertisement to the server
  advertisement(jsonStr);
}

void loop() {
  while(!sensorId)
  {
    advertisement(jsonStr);
  }
  delay(5000);
  Serial.println("nothing happens");
}
