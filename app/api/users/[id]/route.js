import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { DashboardUser } from "@/lib/models/DashboardUser";

function validateUserData(data) {
  const errors = {};
  const name = data.name?.trim() || "";
  const email = data.email?.trim() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) errors.name = "Name is required.";
  if (name && name.length < 2) errors.name = "Name should be at least 2 characters.";
  if (!email) errors.email = "Email is required.";
  if (email && !emailRegex.test(email)) errors.email = "Enter a valid email address.";
  return errors;
}

export async function GET(_, { params }) {
  try {
    await connectDb();
    const { id } = await params;
    const item = await DashboardUser.findById(id, { name: 1, email: 1, createdAt: 1 }).lean();
    if (!item) {
      return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to load user." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await request.json();
    const errors = validateUserData(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const emailOwner = await DashboardUser.findOne({ email }).lean();
    if (emailOwner && String(emailOwner._id) !== id) {
      return NextResponse.json(
        { ok: false, message: "Email already exists." },
        { status: 409 },
      );
    }

    const item = await DashboardUser.findByIdAndUpdate(
      id,
      { name: body.name.trim(), email },
      { new: true, runValidators: true, projection: { name: 1, email: 1, createdAt: 1 } },
    ).lean();
    if (!item) {
      return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to update user." }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDb();
    const { id } = await params;
    const deleted = await DashboardUser.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ ok: false, message: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete user." }, { status: 500 });
  }
}
