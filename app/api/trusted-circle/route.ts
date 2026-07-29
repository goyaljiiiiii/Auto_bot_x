import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function GET() {
  const owner = auraStore.getUsers()[0];
  const relationships = auraStore.getRelationships(owner.id);
  return NextResponse.json({ success: true, relationships });
}

export async function POST(req: Request) {
  try {
    const { action, contactName, relationship, contactEmail, permissions, relId } = await req.json();

    if (action === "UPDATE_PERMISSIONS" && relId && permissions) {
      const updated = auraStore.updatePermissions(relId, permissions);
      return NextResponse.json({ success: true, relationship: updated });
    }

    // Invite new trusted contact
    const owner = auraStore.getUsers()[0];
    const newRel = auraStore.addRelationship({
      id: `rel-${Date.now()}`,
      ownerId: owner.id,
      contactId: `usr-contact-${Date.now()}`,
      contactName: contactName || "Trusted Contact",
      relationship: relationship || "Friend",
      contactEmail: contactEmail || "contact@example.com",
      status: "ACTIVE",
      permissions: permissions || {
        canSeeSOS: true,
        canSeeCheckIns: true,
        canSeeLocation: true,
        canSeeGuardianSessions: true,
        canSeeIncidents: true,
        canSeeCamera: false,
      },
    });

    return NextResponse.json({ success: true, relationship: newRel });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update trusted circle" }, { status: 400 });
  }
}
