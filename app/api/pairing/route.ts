import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId required" }, { status: 400 });
    }

    const pending = auraStore.getPendingPairingRequests(userId);
    return NextResponse.json({ success: true, requests: pending });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, fromUser, safetyCode, requestId, accept } = body;

    if (action === "REQUEST_PAIRING") {
      if (!fromUser || !safetyCode) {
        return NextResponse.json(
          { success: false, error: "fromUser and safetyCode are required" },
          { status: 400 }
        );
      }

      const result = auraStore.createPairingRequest(fromUser, safetyCode);
      return NextResponse.json({
        success: true,
        message: `Pairing request sent to ${result.targetUser.name}!`,
        request: result.request,
      });
    }

    if (action === "RESPOND_PAIRING") {
      if (!requestId || typeof accept !== "boolean") {
        return NextResponse.json(
          { success: false, error: "requestId and accept boolean required" },
          { status: 400 }
        );
      }

      const updated = auraStore.respondToPairingRequest(requestId, accept);
      if (!updated) {
        return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: accept ? "Guardian pairing accepted!" : "Guardian request declined.",
        request: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to process pairing" }, { status: 500 });
  }
}
