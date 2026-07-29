import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const user = auraStore.findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, error: "User account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
