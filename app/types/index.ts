export type GuardianSafetyState = "NORMAL" | "MONITORING" | "SOS_ACTIVATED";

export type SerialConnectionState = "Disconnected" | "Connecting" | "Connected";

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  contactMethod: "SMS" | "WhatsApp" | "Email" | "Demo Alert";
  isPrimary: boolean;
}

export interface IncidentEvent {
  id: string;
  date: string;
  time: string;
  triggerType: "Hands-Free SOS Gesture" | "Voice Panic Trigger" | "Manual Alert Button";
  status: "Alert Triggered" | "Demo Dispatch Logged" | "Cancelled";
  summary: string;
  locationUrl?: string;
}

export interface TelemetryState {
  fps: number;
  guardianActive: boolean;
  safetyState: GuardianSafetyState;
  cameraActive: boolean;
  gestureDetectionActive: boolean;
  detectedGesture: string | null;
  voiceMonitoringActive: boolean;
  serialState: SerialConnectionState;
  serialPortName: string | null;
  servoAngle: number;
  emergencyLightActive: boolean;
  buzzerActive: boolean;
  latitude: number | null;
  longitude: number | null;
}
