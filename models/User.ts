import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  college: string;
  branch: string;
  year: number;
  semester: number;
  targetAttendance: number;
  role: "student" | "cr" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    college: { type: String, default: "Engineering Institute of Technology" },
    branch: { type: String, default: "Computer Science & Engineering" },
    year: { type: Number, default: 1 },
    semester: { type: Number, default: 1 },
    targetAttendance: { type: Number, default: 75 },
    role: { type: String, enum: ["student", "cr", "admin"], default: "student" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
