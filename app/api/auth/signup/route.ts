import { NextResponse } from "next/server";
import { auraStore } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    const existing = auraStore.findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 });
    }

    const newUser = auraStore.createUser(name, email, role || "ACCOUNT_OWNER");

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Signup failed" }, { status: 500 });
  }
}
