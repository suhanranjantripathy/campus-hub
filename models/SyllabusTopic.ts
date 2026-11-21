import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISyllabusTopic extends Document {
  userId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  unitNumber: number;
  unitTitle: string;
  topicName: string;
  weightagePercent: number; // Estimated mark share in exams (e.g. 15%)
  pyqFrequency: number;     // Number of times asked in past 5 years papers
  status: "not_started" | "in_progress" | "mastered";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusTopicSchema = new Schema<ISyllabusTopic>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    unitNumber: { type: Number, required: true, default: 1 },
    unitTitle: { type: String, default: "Unit 1" },
    topicName: { type: String, required: true, trim: true },
    weightagePercent: { type: Number, default: 10 },
    pyqFrequency: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "mastered"],
      default: "not_started",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SyllabusTopic: Model<ISyllabusTopic> =
  mongoose.models.SyllabusTopic ||
  mongoose.model<ISyllabusTopic>("SyllabusTopic", SyllabusTopicSchema);
