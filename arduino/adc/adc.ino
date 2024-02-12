#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include "DFRobot_MAX17043.h"
Adafruit_ADS1115 ads; /* Use this for the 16-bit version */
DFRobot_MAX17043 gauge;
void setup(void) {
  Serial.begin(2400);
  ads.begin();
  ads.setGain(GAIN_TWO);  // 2x gain  +/- 2.048V  1 bit = 0.0625mV
  while (gauge.begin() != 0) {
    Serial.println("error");
    delay(2000);
  }
}
float v = 0;
void loop(void) {
  int16_t adc0;  // we read from the ADC, we have a sixteen bit integer as a result

  v = 0;
  for (int i = 0; i < 10; i++) {
    v += (ads.readADC_SingleEnded(0) * 0.00625) - 0.3;
    delay(50);
  }
  v /= 10;
  Serial.print(gauge.readPercentage());
  Serial.print(",");
  Serial.println(v, 1);

}
