import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendanceLog extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "cancelled";
  remarks?: string;
  createdAt: Date;
}

const AttendanceLogSchema = new Schema<IAttendanceLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "cancelled"], required: true },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index for quick lookups and avoiding duplicate markings on same date & subject
AttendanceLogSchema.index({ userId: 1, subjectId: 1, date: 1 });

export const AttendanceLog: Model<IAttendanceLog> =
  mongoose.models.AttendanceLog ||
  mongoose.model<IAttendanceLog>("AttendanceLog", AttendanceLogSchema);
