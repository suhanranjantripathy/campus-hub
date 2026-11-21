import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudyTask extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  title: string;
  priorityScore: number; // e.g. Calculated from PYQ freq + weightage
  priorityLevel: "critical" | "high" | "medium" | "low";
  dueDate?: Date;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: Date;
  examDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudyTaskSchema = new Schema<IStudyTask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "SyllabusTopic" },
    title: { type: String, required: true, trim: true },
    priorityScore: { type: Number, default: 50 },
    priorityLevel: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    dueDate: { type: Date },
    estimatedMinutes: { type: Number, default: 45 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    examDate: { type: Date },
  },
  { timestamps: true }
);

export const StudyTask: Model<IStudyTask> =
  mongoose.models.StudyTask || mongoose.model<IStudyTask>("StudyTask", StudyTaskSchema);
