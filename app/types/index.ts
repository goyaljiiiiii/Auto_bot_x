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

export interface ContactPermission {
  canSeeSOS: boolean;
  canSeeCheckIns: boolean;
  canSeeLocation: boolean;
  canSeeGuardianSessions: boolean;
  canSeeIncidents: boolean;
  canSeeCamera: boolean;
}

export interface TrustedRelationship {
  id: string;
  ownerId: string;
  contactId: string;
  contactName: string;
  relationship: string;
  contactEmail: string;
  status: "INVITED" | "ACTIVE";
  permissions: ContactPermission;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  type: "LEAVING_HOME" | "ARRIVED_COLLEGE" | "ON_MY_WAY" | "SAFE_ARRIVAL" | "LEAVING_COLLEGE" | "CUSTOM";
  label: string;
  timestamp: string;
  locationUrl?: string;
  isShared: boolean;
}

export interface IncidentEvent {
  id: string;
  date: string;
  time: string;
  triggerType: "Hands-Free SOS Gesture" | "Voice Panic Trigger" | "Manual SOS Button";
  status: "Alert Triggered" | "Demo Dispatch Logged" | "Cancelled" | "ACKNOWLEDGED";
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
