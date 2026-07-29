// AURA Relational Data Store (Local & Production Storage Abstraction)

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "ACCOUNT_OWNER" | "TRUSTED_MEMBER";
  avatarUrl?: string;
  emergencyNotes?: string;
  createdAt: string;
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
  relationship: string; // e.g. "Parent", "Friend", "Roommate", "Partner"
  contactEmail: string;
  status: "INVITED" | "ACTIVE";
  permissions: ContactPermission;
}

export interface RoutineItem {
  id: string;
  userId: string;
  label: string; // e.g. "Leave Home"
  time: string; // "07:30 AM"
  locationLabel: string; // "College"
  daysOfWeek: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri"]
  isShared: boolean;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  type: "LEAVING_HOME" | "ARRIVED_COLLEGE" | "ON_MY_WAY" | "SAFE_ARRIVAL" | "CUSTOM";
  label: string;
  timestamp: string;
  locationUrl?: string;
  isShared: boolean;
}

export interface GuardianSessionRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: "NORMAL" | "GUARDIAN_ACTIVE" | "SAFETY_MODE" | "SOS_ACTIVE";
}

export interface SafetyEvent {
  id: string;
  userId: string;
  timestamp: string;
  eventType: 
    | "GUARDIAN_STARTED" 
    | "GUARDIAN_ENDED" 
    | "CHECK_IN" 
    | "LOCATION_SHARED" 
    | "PERSON_DETECTED" 
    | "SOS_GESTURE_DETECTED" 
    | "SOS_ACTIVATED" 
    | "CONTACT_ALERT_CREATED" 
    | "CONTACT_ALERT_ACKNOWLEDGED" 
    | "AURA_COMPANION_CONNECTED";
  source: "Web App" | "Computer Vision" | "Gemini AI" | "IoT Companion";
  locationUrl?: string;
  summary: string;
  visibility: "PRIVATE" | "TRUSTED_CIRCLE";
}

export interface IncidentRecord {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  triggerType: "Hands-Free SOS Gesture" | "Voice Panic Trigger" | "Manual SOS Button";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";
  locationUrl?: string;
  geminiSummary: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  events: SafetyEvent[];
}

// Initial In-Memory & Local Session Seed Data
class AuraStore {
  private users: UserRecord[] = [
    {
      id: "usr-owner-1",
      name: "Nandini Goyal",
      email: "nandini@example.com",
      role: "ACCOUNT_OWNER",
      emergencyNotes: "Blood Group A+. Allergies: None.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-contact-1",
      name: "Mom (Sarah)",
      email: "mom@example.com",
      role: "TRUSTED_MEMBER",
      createdAt: new Date().toISOString(),
    },
  ];

  private relationships: TrustedRelationship[] = [
    {
      id: "rel-1",
      ownerId: "usr-owner-1",
      contactId: "usr-contact-1",
      contactName: "Mom (Sarah)",
      relationship: "Parent",
      contactEmail: "mom@example.com",
      status: "ACTIVE",
      permissions: {
        canSeeSOS: true,
        canSeeCheckIns: true,
        canSeeLocation: true,
        canSeeGuardianSessions: true,
        canSeeIncidents: true,
        canSeeCamera: false, // Privacy first: camera not shared by default
      },
    },
  ];

  private checkIns: CheckInRecord[] = [
    {
      id: "chk-1",
      userId: "usr-owner-1",
      userName: "Nandini Goyal",
      type: "ARRIVED_COLLEGE",
      label: "Arrived at College Campus",
      timestamp: "8:15 AM",
      locationUrl: "https://maps.google.com/?q=28.6139,77.2090",
      isShared: true,
    },
  ];

  private routines: RoutineItem[] = [
    {
      id: "rtn-1",
      userId: "usr-owner-1",
      label: "Morning Commute to College",
      time: "07:30 AM",
      locationLabel: "College Campus",
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      isShared: true,
    },
  ];

  private safetyEvents: SafetyEvent[] = [
    {
      id: "evt-1",
      userId: "usr-owner-1",
      timestamp: "8:15 AM",
      eventType: "CHECK_IN",
      source: "Web App",
      summary: "Voluntary check-in: Arrived at College Campus",
      visibility: "TRUSTED_CIRCLE",
    },
  ];

  private incidents: IncidentRecord[] = [];

  // Store Methods
  getUsers() { return this.users; }
  getOwner() { return this.users.find(u => u.role === "ACCOUNT_OWNER") || this.users[0]; }
  
  getRelationships(ownerId: string) {
    return this.relationships.filter(r => r.ownerId === ownerId);
  }

  addRelationship(rel: TrustedRelationship) {
    this.relationships.push(rel);
    return rel;
  }

  updatePermissions(relId: string, permissions: ContactPermission) {
    const rel = this.relationships.find(r => r.id === relId);
    if (rel) {
      rel.permissions = { ...permissions };
    }
    return rel;
  }

  getCheckIns() { return this.checkIns; }
  
  addCheckIn(checkIn: CheckInRecord) {
    this.checkIns.unshift(checkIn);
    this.addSafetyEvent({
      id: `evt-${Date.now()}`,
      userId: checkIn.userId,
      timestamp: checkIn.timestamp,
      eventType: "CHECK_IN",
      source: "Web App",
      locationUrl: checkIn.locationUrl,
      summary: `Voluntary check-in: ${checkIn.label}`,
      visibility: checkIn.isShared ? "TRUSTED_CIRCLE" : "PRIVATE",
    });
    return checkIn;
  }

  getRoutines() { return this.routines; }
  
  addRoutine(routine: RoutineItem) {
    this.routines.push(routine);
    return routine;
  }

  getSafetyEvents() { return this.safetyEvents; }
  
  addSafetyEvent(event: SafetyEvent) {
    this.safetyEvents.unshift(event);
    return event;
  }

  getIncidents() { return this.incidents; }

  createIncident(incident: IncidentRecord) {
    this.incidents.unshift(incident);
    this.addSafetyEvent({
      id: `evt-sos-${Date.now()}`,
      userId: incident.userId,
      timestamp: incident.startTime,
      eventType: "SOS_ACTIVATED",
      source: "Computer Vision",
      locationUrl: incident.locationUrl,
      summary: incident.geminiSummary,
      visibility: "TRUSTED_CIRCLE",
    });
    return incident;
  }

  acknowledgeIncident(incidentId: string, ackByName: string) {
    const inc = this.incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = "ACKNOWLEDGED";
      inc.acknowledgedBy = ackByName;
      inc.acknowledgedAt = new Date().toLocaleTimeString();

      this.addSafetyEvent({
        id: `evt-ack-${Date.now()}`,
        userId: inc.userId,
        timestamp: inc.acknowledgedAt,
        eventType: "CONTACT_ALERT_ACKNOWLEDGED",
        source: "Gemini AI",
        summary: `SOS Alert acknowledged by trusted contact ${ackByName}.`,
        visibility: "TRUSTED_CIRCLE",
      });
    }
    return inc;
  }
}

export const auraStore = new AuraStore();
