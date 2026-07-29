/*
 * OmniSight Care AI - Arduino IoT Controller Firmware
 * 
 * Hardware Setup:
 * - Servo Pin: Pin 9 (Camera Pan Motor)
 * - LED 1 (Appliance 1): Pin 6
 * - LED 2 (Appliance 2): Pin 7
 * - RGB Status LED: Red = Pin 3, Green = Pin 5, Blue = Pin 10 (PWM Pins)
 * - Buzzer: Pin 8 (Active/Passive Buzzer)
 * 
 * Serial Protocol (Baud Rate: 115200):
 * - SERVO:<0-180>       (Sets pan servo angle)
 * - RGB:<r>,<g>,<b>     (Sets status RGB LED color, e.g. RGB:0,240,255)
 * - LED1:1 / LED1:0     (Turn appliance LED 1 ON/OFF)
 * - LED2:1 / LED2:0     (Turn appliance LED 2 ON/OFF)
 * - BUZZER:1 / BUZZER:0 (Trigger emergency alarm sound)
 */

#include <Servo.h>

#define SERVO_PIN 9
#define LED1_PIN 6
#define LED2_PIN 7
#define RGB_RED_PIN 3
#define RGB_GREEN_PIN 5
#define RGB_BLUE_PIN 10
#define BUZZER_PIN 8

Servo cameraServo;
int currentAngle = 90;

void setup() {
  Serial.begin(115200);
  
  cameraServo.attach(SERVO_PIN);
  cameraServo.write(currentAngle);

  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  
  // Power-on status animation (Cyan pulse)
  setRGB(0, 240, 255);
  delay(500);
  setRGB(0, 0, 0);
}

void setRGB(int r, int g, int b) {
  analogWrite(RGB_RED_PIN, r);
  analogWrite(RGB_GREEN_PIN, g);
  analogWrite(RGB_BLUE_PIN, b);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command.startsWith("SERVO:")) {
      int targetAngle = command.substring(6).toInt();
      targetAngle = constrain(targetAngle, 0, 180);
      cameraServo.write(targetAngle);
      currentAngle = targetAngle;
      Serial.println("OK:SERVO:" + String(targetAngle));
    }
    else if (command.startsWith("RGB:")) {
      int firstComma = command.indexOf(',');
      int secondComma = command.indexOf(',', firstComma + 1);
      if (firstComma != -1 && secondComma != -1) {
        int r = command.substring(4, firstComma).toInt();
        int g = command.substring(firstComma + 1, secondComma).toInt();
        int b = command.substring(secondComma + 1).toInt();
        setRGB(r, g, b);
        Serial.println("OK:RGB");
      }
    }
    else if (command == "LED1:1") {
      digitalWrite(LED1_PIN, HIGH);
      Serial.println("OK:LED1:1");
    }
    else if (command == "LED1:0") {
      digitalWrite(LED1_PIN, LOW);
      Serial.println("OK:LED1:0");
    }
    else if (command == "LED2:1") {
      digitalWrite(LED2_PIN, HIGH);
      Serial.println("OK:LED2:1");
    }
    else if (command == "LED2:0") {
      digitalWrite(LED2_PIN, LOW);
      Serial.println("OK:LED2:0");
    }
    else if (command == "BUZZER:1") {
      tone(BUZZER_PIN, 1000, 500);
      Serial.println("OK:BUZZER:1");
    }
    else if (command == "BUZZER:0") {
      noTone(BUZZER_PIN);
      Serial.println("OK:BUZZER:0");
    }
  }
}
