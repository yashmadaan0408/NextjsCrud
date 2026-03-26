import mongoose from "mongoose";

const dashboardUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

export const DashboardUser =
  mongoose.models.DashboardUser || mongoose.model("DashboardUser", dashboardUserSchema);
