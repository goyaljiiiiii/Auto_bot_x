export type MedicalCondition = 
  | "Parkinson's / Tremors"
  | "Mobility Impaired"
  | "Speech Impaired"
  | "Standard / Assistive";

export interface GestureMapping {
  gesture: string; // e.g. "OPEN_PALM", "PINCH", "POINT_INDEX", "THUMBS_UP", "HEAD_NOD", "HEAD_TILT"
  actionName: string; // e.g. "Toggle Light 1", "Trigger SOS", "Camera Track", "Next Track"
  targetCommand: string; // e.g. "LED1_TOGGLE", "SERVO_RESET", "ALERT_SOS"
}

export interface UserProfile {
  id: string;
  name: string;
  condition: MedicalCondition;
  gestureSensitivity: "low" | "medium" | "high"; // low sensitivity for tremor smoothing
  adaptiveMode: "hands" | "head_pose" | "voice_first";
  emergencyContact: string;
  medicalNotes: string;
  gestures: GestureMapping[];
}

export interface TelemetryState {
  fps: number;
  faceDetected: boolean;
  faceName: string;
  activeProfile: UserProfile;
  activeGesture: string | null;
  gestureConfidence: number;
  servoAngle: number;
  autoTracking: boolean;
  ledStatus: { r: number; g: number; b: number };
  appliance1: boolean;
  appliance2: boolean;
  fallDetected: boolean;
  voiceListening: boolean;
  serialConnected: boolean;
  serialPortName: string | null;
}

export interface EmergencyAlert {
  active: boolean;
  timestamp: string;
  reason: string;
  user: string;
}
