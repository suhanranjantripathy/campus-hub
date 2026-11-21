import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  facultyName?: string;
  targetAttendance: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    facultyName: { type: String, default: "" },
    targetAttendance: { type: Number, default: 75 },
    totalClasses: { type: Number, default: 0 },
    attendedClasses: { type: Number, default: 0 },
    color: { type: String, default: "#3b82f6" },
    credits: { type: Number, default: 4 },
  },
  { timestamps: true }
);

export const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);
