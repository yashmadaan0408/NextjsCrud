import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { validateSignin } from "@/lib/validation";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validateSignin(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    await connectDb();

    const user = await User.findOne({ email }).lean();
    if (!user || user.passwordHash !== hashPassword(body.password)) {
      return NextResponse.json(
        { ok: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      user: { name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
