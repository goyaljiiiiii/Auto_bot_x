import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function GET() {
  const checkIns = auraStore.getCheckIns();
  return NextResponse.json({ success: true, checkIns });
}

export async function POST(req: Request) {
  try {
    const { type, label, locationUrl, isShared } = await req.json();
    const owner = auraStore.getUsers()[0];

    const record = auraStore.addCheckIn({
      id: `chk-${Date.now()}`,
      userId: owner.id,
      userName: owner.name,
      type: type || "CUSTOM",
      label: label || "Check-in",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      locationUrl,
      isShared: isShared ?? true,
    });

    return NextResponse.json({ success: true, checkIn: record });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid check-in request" }, { status: 400 });
  }
}
