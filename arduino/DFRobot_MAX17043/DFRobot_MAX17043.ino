#include "DFRobot_MAX17043.h"
#include "Wire.h"

#ifdef __AVR__
  #define ALR_PIN       2
#else
  #define ALR_PIN       D2
#endif

#define PRINT_INTERVAL        2000

DFRobot_MAX17043        gauge;
uint8_t       intFlag = 0;

void interruptCallBack()
{
  intFlag = 1;
}

void setup()
{
  Serial.begin(115200);
  while(!Serial);
  Serial.println();
  Serial.println();
  pinMode(ALR_PIN, INPUT_PULLUP);
  attachInterrupt(ALR_PIN, interruptCallBack, FALLING);  //default alert is 32%
  
  while(gauge.begin() != 0) {
    Serial.println("gauge begin faild!");
    delay(2000);
  }
  delay(2);
  Serial.println("gauge begin successful!");
  //gauge.setInterrupt(32);  //use this to modify alert threshold as 1% - 32% (integer)
}

void loop()
{
  static unsigned long lastMillis = 0;
  if((millis() - lastMillis) > PRINT_INTERVAL) {
    lastMillis = millis();
    Serial.println();

    Serial.print("voltage: ");
    Serial.print(gauge.readVoltage());
    Serial.println(" mV");

    Serial.print("precentage: ");
    Serial.print(gauge.readPercentage());
    Serial.println(" %");
  }

  
}
