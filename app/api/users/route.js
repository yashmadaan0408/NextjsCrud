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

export async function GET(request) {
  try {
    await connectDb();
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.max(Number(searchParams.get("limit") || 5), 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      DashboardUser.find({}, { name: 1, email: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DashboardUser.countDocuments(),
    ]);

    return NextResponse.json({
      ok: true,
      items,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to load users." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();
    const errors = validateUserData(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, message: "Validation failed.", errors },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const exists = await DashboardUser.findOne({ email }).lean();
    if (exists) {
      return NextResponse.json(
        { ok: false, message: "Email already exists." },
        { status: 409 },
      );
    }

    const created = await DashboardUser.create({ name: body.name.trim(), email });
    return NextResponse.json({
      ok: true,
      item: { _id: created._id, name: created.name, email: created.email, createdAt: created.createdAt },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to create user." },
      { status: 500 },
    );
  }
}
