/*
 * Aura Sentinel Rover - Arduino IoT Security Bot Firmware
 * 
 * Hardware Setup:
 * - Servo Pin: Pin 9 (Camera Pan Motor)
 * - L298N Motor Driver Pins: 
 *   - Motor A (Left): IN1 = Pin 4, IN2 = Pin 2
 *   - Motor B (Right): IN3 = Pin 11, IN4 = Pin 12
 * - RGB Status LED: Red = Pin 3, Green = Pin 5, Blue = Pin 10
 * - Siren Buzzer: Pin 8
 * 
 * Serial Protocol (115200 Baud Rate):
 * - MOTOR:FORWARD  / MOTOR:BACK  / MOTOR:LEFT  / MOTOR:RIGHT  / MOTOR:STOP
 * - SERVO:<0-180>  (Pan Camera Angle)
 * - RGB:<r>,<g>,<b> (Status LED Color)
 * - BUZZER:1 / BUZZER:0 (Emergency Siren)
 */

#include <Servo.h>

#define SERVO_PIN 9
#define MOTOR_IN1 4
#define MOTOR_IN2 2
#define MOTOR_IN3 11
#define MOTOR_IN4 12
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

  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  pinMode(MOTOR_IN3, OUTPUT);
  pinMode(MOTOR_IN4, OUTPUT);
  
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  stopMotors();
  setRGB(0, 240, 255); // Cyan Guardian Active
  delay(500);
}

void setRGB(int r, int g, int b) {
  analogWrite(RGB_RED_PIN, r);
  analogWrite(RGB_GREEN_PIN, g);
  analogWrite(RGB_BLUE_PIN, b);
}

void stopMotors() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, LOW);
}

void moveForward() {
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);
}

void moveBack() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);
}

void turnLeft() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);
}

void turnRight() {
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "MOTOR:FORWARD") {
      moveForward();
      Serial.println("OK:MOTOR:FORWARD");
    }
    else if (command == "MOTOR:BACK") {
      moveBack();
      Serial.println("OK:MOTOR:BACK");
    }
    else if (command == "MOTOR:LEFT") {
      turnLeft();
      Serial.println("OK:MOTOR:LEFT");
    }
    else if (command == "MOTOR:RIGHT") {
      turnRight();
      Serial.println("OK:MOTOR:RIGHT");
    }
    else if (command == "MOTOR:STOP") {
      stopMotors();
      Serial.println("OK:MOTOR:STOP");
    }
    else if (command.startsWith("SERVO:")) {
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
