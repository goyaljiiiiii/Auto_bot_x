import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";

export async function GET() {
  const user = getCurrentSessionUser();
  return NextResponse.json({ success: true, user });
}
