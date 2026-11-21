import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Subject } from "@/models/Subject";
import { getAuthUser } from "@/lib/auth";
import { calculateAttendanceMetrics } from "@/lib/utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const subjects = await Subject.find({ userId: authUser.userId }).sort({ updatedAt: -1 });

    const subjectsWithMetrics = subjects.map((sub) => {
      const metrics = calculateAttendanceMetrics(
        sub.attendedClasses,
        sub.totalClasses,
        sub.targetAttendance
      );
      return {
        ...sub.toObject(),
        metrics,
      };
    });

    return NextResponse.json({ subjects: subjectsWithMetrics });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch subjects" },
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

    const { name, code, facultyName, targetAttendance, totalClasses, attendedClasses, color, credits } =
      await req.json();

    if (!name || !code) {
      return NextResponse.json({ error: "Subject name and code are required" }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.create({
      userId: authUser.userId,
      name,
      code: code.toUpperCase(),
      facultyName: facultyName || "",
      targetAttendance: targetAttendance ? Number(targetAttendance) : 75,
      totalClasses: totalClasses ? Number(totalClasses) : 0,
      attendedClasses: attendedClasses ? Number(attendedClasses) : 0,
      color: color || "#2563eb",
      credits: credits ? Number(credits) : 3,
    });

    const metrics = calculateAttendanceMetrics(
      subject.attendedClasses,
      subject.totalClasses,
      subject.targetAttendance
    );

    return NextResponse.json({ subject: { ...subject.toObject(), metrics } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create subject" },
      { status: 500 }
    );
  }
}
