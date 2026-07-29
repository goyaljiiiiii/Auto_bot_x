// AURA Relational Data Store (Persistent Storage Abstraction)

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: "ACCOUNT_OWNER" | "TRUSTED_MEMBER";
  safetyCode: string; // e.g. USR-98421
  phone?: string;
  avatarUrl?: string;
  emergencyNotes?: string;
  createdAt: string;
}

export interface PairingRequestRecord {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toSafetyCode: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  timestamp: string;
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

export interface RoutineItem {
  id: string;
  userId: string;
  label: string;
  time: string;
  locationLabel: string;
  daysOfWeek: string[];
  isShared: boolean;
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

export interface GuardianSessionRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: "INACTIVE" | "ACTIVE" | "ENDED";
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

class AuraStore {
  private users: UserRecord[] = [
    {
      id: "usr-nandini",
      name: "Nandini Goyal",
      email: "nandini@example.com",
      passwordHash: "password123",
      role: "ACCOUNT_OWNER",
      safetyCode: "USR-8F92A1",
      phone: "+91 98765 43210",
      emergencyNotes: "Blood Group A+. Allergies: None.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-mom",
      name: "Mom (Sarah)",
      email: "mom@example.com",
      passwordHash: "password123",
      role: "TRUSTED_MEMBER",
      safetyCode: "GRD-334102",
      phone: "+91 98123 45678",
      createdAt: new Date().toISOString(),
    },
  ];

  private pairingRequests: PairingRequestRecord[] = [];

  private routines: RoutineItem[] = [
    {
      id: "rt-1",
      userId: "usr-nandini",
      label: "Morning College Commute",
      time: "08:30 AM",
      locationLabel: "Campus Gate 2",
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      isShared: true,
    },
    {
      id: "rt-2",
      userId: "usr-nandini",
      label: "Evening Library Return",
      time: "06:00 PM",
      locationLabel: "Main Library",
      daysOfWeek: ["Mon", "Wed", "Fri"],
      isShared: true,
    },
  ];

  private relationships: TrustedRelationship[] = [
    {
      id: "rel-1",
      ownerId: "usr-nandini",
      contactId: "usr-mom",
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
        canSeeCamera: false,
      },
    },
  ];

  private activeSession: GuardianSessionRecord = {
    id: "sess-1",
    userId: "usr-nandini",
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "INACTIVE",
  };

  private checkIns: CheckInRecord[] = [
    {
      id: "chk-1",
      userId: "usr-nandini",
      userName: "Nandini Goyal",
      type: "ARRIVED_COLLEGE",
      label: "Arrived at College Campus",
      timestamp: "8:15 AM",
      locationUrl: "https://maps.google.com/?q=28.6139,77.2090",
      isShared: true,
    },
  ];

  private safetyEvents: SafetyEvent[] = [
    {
      id: "evt-1",
      userId: "usr-nandini",
      timestamp: "8:15 AM",
      eventType: "CHECK_IN",
      source: "Web App",
      summary: "Voluntary check-in: Arrived at College Campus",
      visibility: "TRUSTED_CIRCLE",
    },
  ];

  private incidents: IncidentRecord[] = [];

  // Authentication & Users
  getUsers() { return this.users; }
  
  findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  findUserBySafetyCode(code: string) {
    return this.users.find(u => u.safetyCode?.toUpperCase() === code.trim().toUpperCase());
  }

  createUser(name: string, email: string, role: "ACCOUNT_OWNER" | "TRUSTED_MEMBER") {
    const randomCode = `USR-${Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase()}`;
    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      safetyCode: randomCode,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Pairing Requests & Guardian Connect
  createPairingRequest(fromUser: { id: string; name: string; email: string }, safetyCode: string) {
    const targetUser = this.findUserBySafetyCode(safetyCode);
    if (!targetUser) {
      throw new Error(`No user found with Safety Code "${safetyCode}"`);
    }

    const newReq: PairingRequestRecord = {
      id: `pair-${Date.now()}`,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      fromUserEmail: fromUser.email,
      toUserId: targetUser.id,
      toSafetyCode: safetyCode.toUpperCase(),
      status: "PENDING",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.pairingRequests.unshift(newReq);
    return { request: newReq, targetUser };
  }

  getPendingPairingRequests(userId: string) {
    return this.pairingRequests.filter(r => r.toUserId === userId && r.status === "PENDING");
  }

  respondToPairingRequest(requestId: string, accept: boolean) {
    const req = this.pairingRequests.find(r => r.id === requestId);
    if (!req) return null;

    req.status = accept ? "ACCEPTED" : "REJECTED";

    if (accept) {
      // Create relationship between target user (owner) and requesting guardian
      const targetUser = this.findUserById(req.toUserId);
      const newRel: TrustedRelationship = {
        id: `rel-${Date.now()}`,
        ownerId: req.toUserId,
        contactId: req.fromUserId,
        contactName: req.fromUserName,
        relationship: "Guardian / Protector",
        contactEmail: req.fromUserEmail,
        status: "ACTIVE",
        permissions: {
          canSeeSOS: true,
          canSeeCheckIns: true,
          canSeeLocation: true,
          canSeeGuardianSessions: true,
          canSeeIncidents: true,
          canSeeCamera: true,
        },
      };
      this.relationships.push(newRel);

      this.addSafetyEvent({
        id: `evt-pair-${Date.now()}`,
        userId: req.toUserId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventType: "CONTACT_ALERT_CREATED",
        source: "Web App",
        summary: `Guardian relationship authorized for ${req.fromUserName} (${req.fromUserEmail}).`,
        visibility: "TRUSTED_CIRCLE",
      });
    }

    return req;
  }

  // Routines & Voice Mode Support
  getRoutines(userId?: string) {
    if (userId) return this.routines.filter(r => r.userId === userId);
    return this.routines;
  }

  addRoutine(routine: Omit<RoutineItem, "id">) {
    const newRoutine: RoutineItem = {
      ...routine,
      id: `rt-${Date.now()}`,
    };
    this.routines.unshift(newRoutine);
    return newRoutine;
  }

  deleteRoutine(id: string) {
    this.routines = this.routines.filter(r => r.id !== id);
  }

  // Trusted Relationships
  getRelationships(ownerId: string) {
    return this.relationships.filter(r => r.ownerId === ownerId);
  }

  addRelationship(rel: TrustedRelationship) {
    this.relationships.push(rel);
    return rel;
  }

  updatePermissions(relId: string, permissions: ContactPermission) {
    const rel = this.relationships.find(r => r.id === relId);
    if (rel) rel.permissions = { ...permissions };
    return rel;
  }

  // Guardian Session
  getGuardianSession(userId: string) {
    return this.activeSession;
  }

  updateGuardianSession(userId: string, active: boolean) {
    this.activeSession = {
      id: `sess-${Date.now()}`,
      userId,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: active ? "ACTIVE" : "INACTIVE",
    };

    this.addSafetyEvent({
      id: `evt-sess-${Date.now()}`,
      userId,
      timestamp: this.activeSession.startTime,
      eventType: active ? "GUARDIAN_STARTED" : "GUARDIAN_ENDED",
      source: "Web App",
      summary: active ? "Guardian Session activated." : "Guardian Session ended.",
      visibility: "TRUSTED_CIRCLE",
    });

    return this.activeSession;
  }

  // Check-ins
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

  // Safety Timeline
  getSafetyEvents() { return this.safetyEvents; }
  
  addSafetyEvent(event: SafetyEvent) {
    this.safetyEvents.unshift(event);
    return event;
  }

  // Incidents
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
      inc.acknowledgedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
