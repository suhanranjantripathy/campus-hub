import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Subject } from "@/models/Subject";
import { Timetable } from "@/models/Timetable";
import { SyllabusTopic } from "@/models/SyllabusTopic";
import { StudyTask } from "@/models/StudyTask";
import { User } from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { calculateAttendanceMetrics } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = authUser.userId;

    const [user, subjects, tasks, topics] = await Promise.all([
      User.findById(userId).select("-passwordHash"),
      Subject.find({ userId }),
      StudyTask.find({ userId, completed: false })
        .populate("subjectId", "name code color")
        .sort({ priorityScore: -1 })
        .limit(4),
      SyllabusTopic.find({ userId, status: { $ne: "mastered" } })
        .populate("subjectId", "name code color")
        .sort({ pyqFrequency: -1 })
        .limit(3),
    ]);

    // Current Day of Week
    const todayIndex = new Date().getDay();
    const todayDayName = DAYS[todayIndex];

    const todayTimetable = await Timetable.findOne({
      userId,
      dayOfWeek: todayDayName === "Sunday" ? "Monday" : todayDayName,
    }).populate("slots.subjectId", "name code color facultyName");

    // Compute Attendance metrics & alerts
    let totalClasses = 0;
    let attendedClasses = 0;
    const subjectsWithMetrics = subjects.map((sub) => {
      totalClasses += sub.totalClasses;
      attendedClasses += sub.attendedClasses;
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

    const overallPercent =
      totalClasses === 0 ? 100 : Math.round((attendedClasses / totalClasses) * 100 * 10) / 10;

    const atRiskSubjects = subjectsWithMetrics.filter((s) => !s.metrics.isSafe);
    const safeBufferSubjects = subjectsWithMetrics.filter(
      (s) => s.metrics.isSafe && s.metrics.safeBunks > 0
    );

    // Dynamic AI Smart Priority Feed
    const priorityFeed: Array<{
      id: string;
      type: "danger" | "warning" | "success" | "info";
      title: string;
      description: string;
      actionUrl: string;
    }> = [];

    // Alert 1: Attendance critical debarment risk
    if (atRiskSubjects.length > 0) {
      const worst = atRiskSubjects[0];
      priorityFeed.push({
        id: "feed-att-danger",
        type: "danger",
        title: `🚨 Debarment Warning: ${worst.name} (${worst.metrics.currentPercent}%)`,
        description: `You are below the ${worst.targetAttendance}% threshold. Attend the next ${worst.metrics.classesNeededToRecover} consecutive classes to avoid detention.`,
        actionUrl: "/attendance",
      });
    }

    // Alert 2: Today's schedule reminder
    const todaySlots = todayTimetable?.slots || [];
    if (todaySlots.length > 0) {
      const nextSlot = todaySlots[0];
      const slotSub = nextSlot.subjectId as any;
      priorityFeed.push({
        id: "feed-schedule-today",
        type: "info",
        title: `📅 Today's First Class: ${slotSub?.name || "Lecture"} at ${nextSlot.startTime}`,
        description: `Room: ${nextSlot.room || "LT-101"} • Type: ${nextSlot.type.toUpperCase()}`,
        actionUrl: "/timetable",
      });
    }

    // Alert 3: SyllabusOS High-Yield PYQ focus
    if (topics.length > 0) {
      const topTopic = topics[0];
      const topicSub = topTopic.subjectId as any;
      priorityFeed.push({
        id: "feed-pyq-high-yield",
        type: "warning",
        title: `🔥 High Exam Frequency: ${topTopic.topicName}`,
        description: `Appeared in ${topTopic.pyqFrequency} past university papers (${topicSub?.code || "Subject"}). Recommended 45-min practice today.`,
        actionUrl: "/syllabus",
      });
    }

    // Alert 4: Safe bunk buffer notification
    if (safeBufferSubjects.length > 0) {
      const topSafe = safeBufferSubjects[0];
      priorityFeed.push({
        id: "feed-safe-bunk",
        type: "success",
        title: `🛡️ Attendance Buffer: ${topSafe.name} (${topSafe.metrics.currentPercent}%)`,
        description: `You have ${topSafe.metrics.safeBunks} safe bunks available without falling below ${topSafe.targetAttendance}%.`,
        actionUrl: "/attendance",
      });
    }

    return NextResponse.json({
      user,
      todayDayName,
      stats: {
        overallPercent,
        totalClasses,
        attendedClasses,
        atRiskCount: atRiskSubjects.length,
        subjectsCount: subjects.length,
      },
      subjects: subjectsWithMetrics,
      todaySlots,
      tasks,
      priorityFeed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
