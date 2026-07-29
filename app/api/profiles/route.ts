import { NextResponse } from "next/server";
import { TrustedContact } from "@/app/types";

const INITIAL_CONTACTS: TrustedContact[] = [
  {
    id: "contact-1",
    name: "Sarah Vance",
    relationship: "Family / Sister",
    phone: "+1 (555) 019-2834",
    email: "sarah@example.com",
    contactMethod: "Demo Alert",
    isPrimary: true,
  },
  {
    id: "contact-2",
    name: "Elena Rostova",
    relationship: "Friend / Roommate",
    phone: "+1 (555) 948-1120",
    email: "elena@example.com",
    contactMethod: "Demo Alert",
    isPrimary: false,
  },
];

export async function GET() {
  return NextResponse.json({ success: true, contacts: INITIAL_CONTACTS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, contact: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
