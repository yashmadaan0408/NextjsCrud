import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

let cached = globalThis._mongooseCached;

if (!cached) {
  cached = globalThis._mongooseCached = { conn: null, promise: null };
}

export async function connectDb() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "nextjscrud",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
