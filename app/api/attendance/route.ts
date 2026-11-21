import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Subject } from "@/models/Subject";
import { AttendanceLog } from "@/models/AttendanceLog";
import { getAuthUser } from "@/lib/auth";
import { calculateAttendanceMetrics } from "@/lib/utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const logs = await AttendanceLog.find({ userId: authUser.userId })
      .populate("subjectId", "name code color")
      .sort({ date: -1, createdAt: -1 })
      .limit(30);

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch attendance logs" },
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

    const { subjectId, status, date, remarks } = await req.json();

    if (!subjectId || !status) {
      return NextResponse.json(
        { error: "Subject ID and status (present/absent/cancelled) are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: authUser.userId,
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Update attendance count based on status
    if (status === "present") {
      subject.totalClasses += 1;
      subject.attendedClasses += 1;
    } else if (status === "absent") {
      subject.totalClasses += 1;
    }
    // "cancelled" doesn't increment total or attended

    await subject.save();

    const log = await AttendanceLog.create({
      userId: authUser.userId,
      subjectId,
      status,
      date: date ? new Date(date) : new Date(),
      remarks: remarks || "",
    });

    const metrics = calculateAttendanceMetrics(
      subject.attendedClasses,
      subject.totalClasses,
      subject.targetAttendance
    );

    return NextResponse.json(
      {
        message: "Attendance recorded",
        log,
        subject: { ...subject.toObject(), metrics },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record attendance" },
      { status: 500 }
    );
  }
}
