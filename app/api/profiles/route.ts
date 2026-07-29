import { NextResponse } from "next/server";
import { UserProfile } from "@/app/types";

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: "profile-1",
    name: "Alex Vance",
    condition: "Parkinson's / Tremors",
    gestureSensitivity: "low", // tremor filtering enabled
    adaptiveMode: "head_pose",
    emergencyContact: "+1 (555) 019-2834",
    medicalNotes: "User has resting tremors in right hand. Enabled tremor-smoothing & head pose gesture controls.",
    gestures: [
      { gesture: "HEAD_TILT_RIGHT", actionName: "Toggle Main Light", targetCommand: "LED1_TOGGLE" },
      { gesture: "HEAD_NOD", actionName: "Toggle Fan / Appliance 2", targetCommand: "LED2_TOGGLE" },
      { gesture: "OPEN_PALM_HOLD", actionName: "Trigger SOS Emergency", targetCommand: "ALERT_SOS" },
    ],
  },
  {
    id: "profile-2",
    name: "Sarah Chen",
    condition: "Mobility Impaired",
    gestureSensitivity: "medium",
    adaptiveMode: "hands",
    emergencyContact: "+1 (555) 948-1120",
    medicalNotes: "Wheelchair assistance profile. Active servo auto-tracking camera locked to head height.",
    gestures: [
      { gesture: "THUMBS_UP", actionName: "Turn On Smart Light", targetCommand: "LED1_ON" },
      { gesture: "POINT_INDEX", actionName: "Pan Camera Left", targetCommand: "SERVO_LEFT" },
      { gesture: "TWO_FINGERS", actionName: "Pan Camera Right", targetCommand: "SERVO_RIGHT" },
    ],
  },
  {
    id: "profile-3",
    name: "Dr. Maya Lin",
    condition: "Standard / Assistive",
    gestureSensitivity: "high",
    adaptiveMode: "hands",
    emergencyContact: "+1 (555) 302-8841",
    medicalNotes: "Standard full gesture mapping active for IoT and media control.",
    gestures: [
      { gesture: "PINCH", actionName: "Toggle Light 1", targetCommand: "LED1_TOGGLE" },
      { gesture: "OPEN_PALM", actionName: "Toggle Light 2", targetCommand: "LED2_TOGGLE" },
      { gesture: "SWIPE_RIGHT", actionName: "Servo Track Target", targetCommand: "SERVO_TRACK" },
    ],
  },
];

export async function GET() {
  return NextResponse.json({ success: true, profiles: INITIAL_PROFILES });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Return updated profiles
    return NextResponse.json({ success: true, profile: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
