import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { DashboardUser } from "@/lib/models/DashboardUser";

export async function GET(request) {
  try {
    await connectDb();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.max(Number(searchParams.get("limit") || 5), 1);
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }],
        }
      : {};

    const [items, total] = await Promise.all([
      DashboardUser.find(filter, { name: 1, email: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DashboardUser.countDocuments(filter),
    ]);

    return NextResponse.json({
      ok: true,
      items,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      query: q,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to search users." },
      { status: 500 },
    );
  }
}
