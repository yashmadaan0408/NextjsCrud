import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { validateSignup } from "@/lib/validation";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errors = validateSignup(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    await connectDb();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email is already registered." },
        { status: 409 },
      );
    }

    const user = await User.create({
      name: body.name.trim(),
      email,
      passwordHash: hashPassword(body.password),
    });
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
