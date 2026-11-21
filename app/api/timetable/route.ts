import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Timetable } from "@/models/Timetable";
import { getAuthUser } from "@/lib/auth";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const timetable = await Timetable.find({ userId: authUser.userId })
      .populate("slots.subjectId", "name code color facultyName")
      .lean();

    // Sort by standard week days
    const sorted = DAYS.map((day) => {
      const entry = timetable.find((t) => t.dayOfWeek === day);
      return (
        entry || {
          dayOfWeek: day,
          slots: [],
        }
      );
    });

    return NextResponse.json({ timetable: sorted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dayOfWeek, slots } = await req.json();

    if (!dayOfWeek) {
      return NextResponse.json({ error: "dayOfWeek is required" }, { status: 400 });
    }

    await connectDB();

    const entry = await Timetable.findOneAndUpdate(
      { userId: authUser.userId, dayOfWeek },
      { $set: { slots: slots || [] } },
      { upsert: true, new: true }
    ).populate("slots.subjectId", "name code color facultyName");

    return NextResponse.json({ entry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update timetable" },
      { status: 500 }
    );
  }
}
