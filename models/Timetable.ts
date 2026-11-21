import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISlot {
  _id?: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  subjectId: mongoose.Types.ObjectId;
  room?: string;
  type: "lecture" | "lab" | "tutorial";
}

export interface ITimetable extends Document {
  userId: mongoose.Types.ObjectId;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  slots: ISlot[];
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  room: { type: String, default: "" },
  type: { type: String, enum: ["lecture", "lab", "tutorial"], default: "lecture" },
});

const TimetableSchema = new Schema<ITimetable>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    slots: [SlotSchema],
  },
  { timestamps: true }
);

TimetableSchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

export const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);
