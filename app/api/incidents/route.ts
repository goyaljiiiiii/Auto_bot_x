import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function GET() {
  const incidents = auraStore.getIncidents();
  const events = auraStore.getSafetyEvents();
  return NextResponse.json({ success: true, incidents, events });
}

export async function POST(req: Request) {
  try {
    const { action, incidentId, triggerType, locationUrl, geminiSummary, ackByName } = await req.json();

    if (action === "ACKNOWLEDGE" && incidentId) {
      const updated = auraStore.acknowledgeIncident(incidentId, ackByName || "Mom (Sarah)");
      return NextResponse.json({ success: true, incident: updated });
    }

    // Create New SOS Incident
    const owner = auraStore.getOwner();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newIncident = auraStore.createIncident({
      id: `sos-${Date.now()}`,
      userId: owner.id,
      userName: owner.name,
      startTime: timeStr,
      triggerType: triggerType || "Hands-Free SOS Gesture",
      status: "ACTIVE",
      locationUrl,
      geminiSummary: geminiSummary || "Hands-Free SOS gesture detected during active session. Incident requires attention.",
      events: [],
    });

    return NextResponse.json({ success: true, incident: newIncident });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process incident" }, { status: 400 });
  }
}
