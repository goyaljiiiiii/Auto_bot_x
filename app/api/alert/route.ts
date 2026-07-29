import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user, reason, timestamp } = await req.json();

    console.log(`[EMERGENCY SOS ALERT]: User ${user} - Reason: ${reason} at ${timestamp}`);
    
    // In production, send Telegram Bot notification, Twilio SMS, or Webhook
    return NextResponse.json({
      success: true,
      message: `Emergency notification dispatched for ${user}`,
      alert: { user, reason, timestamp, status: "DISPATCHED" },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to log alert" }, { status: 500 });
  }
}
