import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const { name, email, googleId, role, avatarUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Google email is required" }, { status: 400 });
    }

    let user = auraStore.findUserByEmail(email);

    if (!user) {
      user = auraStore.createUser(
        name || email.split("@")[0],
        email,
        role || "ACCOUNT_OWNER"
      );
      if (avatarUrl) user.avatarUrl = avatarUrl;
    }

    return NextResponse.json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        safetyCode: user.safetyCode,
        avatarUrl: user.avatarUrl || avatarUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Google auth error" }, { status: 500 });
  }
}
