import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Subject } from "@/models/Subject";
import { Timetable } from "@/models/Timetable";
import { SyllabusTopic } from "@/models/SyllabusTopic";
import { StudyTask } from "@/models/StudyTask";
import { AttendanceLog } from "@/models/AttendanceLog";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST() {
  try {
    await connectDB();

    const demoEmail = "demo@campushub.in";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const passwordHash = await hashPassword("demo1234");
      user = await User.create({
        name: "Arjun Sharma",
        email: demoEmail,
        passwordHash,
        college: "Delhi Technological University (DTU)",
        branch: "Computer Engineering",
        year: 2,
        semester: 3,
        targetAttendance: 75,
      });
    }

    const userId = user._id;

    // Clear existing demo subjects and recreate clean dataset
    await Subject.deleteMany({ userId });
    await AttendanceLog.deleteMany({ userId });
    await Timetable.deleteMany({ userId });
    await SyllabusTopic.deleteMany({ userId });
    await StudyTask.deleteMany({ userId });

    const subjectsData = [
      {
        name: "Data Structures & Algorithms",
        code: "CS-201",
        facultyName: "Dr. A. Verma",
        targetAttendance: 75,
        totalClasses: 36,
        attendedClasses: 31, // 86.1% (Safe)
        color: "#2563eb",
        credits: 4,
      },
      {
        name: "Operating Systems",
        code: "CS-202",
        facultyName: "Prof. S. Sengupta",
        targetAttendance: 75,
        totalClasses: 32,
        attendedClasses: 23, // 71.9% (Danger zone!)
        color: "#dc2626",
        credits: 4,
      },
      {
        name: "Database Management Systems",
        code: "CS-203",
        facultyName: "Dr. Neha Kapoor",
        targetAttendance: 75,
        totalClasses: 30,
        attendedClasses: 24, // 80.0% (Warning/Safe)
        color: "#16a34a",
        credits: 4,
      },
      {
        name: "Discrete Mathematics",
        code: "MA-201",
        facultyName: "Prof. R. K. Mittal",
        targetAttendance: 75,
        totalClasses: 28,
        attendedClasses: 20, // 71.4% (Danger zone!)
        color: "#d97706",
        credits: 3,
      },
      {
        name: "Object Oriented Programming (Java/C++)",
        code: "CS-204",
        facultyName: "Er. Vivek Joshi",
        targetAttendance: 75,
        totalClasses: 24,
        attendedClasses: 22, // 91.6% (Very safe)
        color: "#7c3aed",
        credits: 3,
      },
    ];

    const createdSubjects = await Subject.insertMany(
      subjectsData.map((s) => ({ ...s, userId }))
    );

    const subMap: Record<string, any> = {};
    createdSubjects.forEach((s) => {
      subMap[s.code] = s._id;
    });

    // Populate Timetable
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
    const timetableEntries = [
      {
        dayOfWeek: "Monday",
        slots: [
          { startTime: "09:00", endTime: "10:00", subjectId: subMap["CS-201"], room: "LT-101", type: "lecture" },
          { startTime: "10:00", endTime: "11:00", subjectId: subMap["CS-202"], room: "LT-102", type: "lecture" },
          { startTime: "11:15", endTime: "13:15", subjectId: subMap["CS-203"], room: "Lab-3", type: "lab" },
          { startTime: "14:00", endTime: "15:00", subjectId: subMap["MA-201"], room: "LT-104", type: "lecture" },
        ],
      },
      {
        dayOfWeek: "Tuesday",
        slots: [
          { startTime: "09:00", endTime: "10:00", subjectId: subMap["CS-203"], room: "LT-103", type: "lecture" },
          { startTime: "10:00", endTime: "11:00", subjectId: subMap["CS-204"], room: "LT-101", type: "lecture" },
          { startTime: "11:15", endTime: "12:15", subjectId: subMap["CS-201"], room: "LT-102", type: "lecture" },
          { startTime: "14:00", endTime: "16:00", subjectId: subMap["CS-201"], room: "Lab-1", type: "lab" },
        ],
      },
      {
        dayOfWeek: "Wednesday",
        slots: [
          { startTime: "09:00", endTime: "10:00", subjectId: subMap["CS-202"], room: "LT-101", type: "lecture" },
          { startTime: "10:00", endTime: "11:00", subjectId: subMap["MA-201"], room: "LT-104", type: "tutorial" },
          { startTime: "11:15", endTime: "12:15", subjectId: subMap["CS-203"], room: "LT-102", type: "lecture" },
          { startTime: "13:00", endTime: "14:00", subjectId: subMap["CS-204"], room: "LT-101", type: "lecture" },
        ],
      },
      {
        dayOfWeek: "Thursday",
        slots: [
          { startTime: "09:00", endTime: "11:00", subjectId: subMap["CS-204"], room: "Lab-2", type: "lab" },
          { startTime: "11:15", endTime: "12:15", subjectId: subMap["CS-202"], room: "LT-102", type: "lecture" },
          { startTime: "14:00", endTime: "15:00", subjectId: subMap["MA-201"], room: "LT-104", type: "lecture" },
        ],
      },
      {
        dayOfWeek: "Friday",
        slots: [
          { startTime: "09:00", endTime: "10:00", subjectId: subMap["CS-201"], room: "LT-101", type: "lecture" },
          { startTime: "10:00", endTime: "11:00", subjectId: subMap["CS-203"], room: "LT-102", type: "lecture" },
          { startTime: "11:15", endTime: "12:15", subjectId: subMap["CS-202"], room: "LT-101", type: "lecture" },
        ],
      },
    ];

    for (const entry of timetableEntries) {
      await Timetable.create({ userId, ...entry });
    }

    // Populate Syllabus Topics with PYQ Frequency (SyllabusOS engine data)
    const syllabusData = [
      {
        subjectId: subMap["CS-202"], // OS
        unitNumber: 2,
        unitTitle: "Process Synchronization & Concurrency",
        topicName: "Deadlock Detection, Prevention & Banker's Algorithm",
        weightagePercent: 18,
        pyqFrequency: 9, // Appeared 9 times in last 5 years
        status: "in_progress",
      },
      {
        subjectId: subMap["CS-202"], // OS
        unitNumber: 3,
        unitTitle: "Memory Management",
        topicName: "Virtual Memory, Paging, Page Replacement (LRU/FIFO)",
        weightagePercent: 20,
        pyqFrequency: 8,
        status: "not_started",
      },
      {
        subjectId: subMap["CS-201"], // DSA
        unitNumber: 3,
        unitTitle: "Trees & Graphs",
        topicName: "AVL Trees & Red-Black Tree Rotations",
        weightagePercent: 16,
        pyqFrequency: 7,
        status: "not_started",
      },
      {
        subjectId: subMap["CS-203"], // DBMS
        unitNumber: 2,
        unitTitle: "Relational Design",
        topicName: "Normalization (1NF, 2NF, 3NF, BCNF) & Functional Dependencies",
        weightagePercent: 22,
        pyqFrequency: 11, // Super high frequency!
        status: "in_progress",
      },
      {
        subjectId: subMap["MA-201"], // Math
        unitNumber: 1,
        unitTitle: "Set Theory & Relations",
        topicName: "Recurrence Relations & Generating Functions",
        weightagePercent: 15,
        pyqFrequency: 6,
        status: "not_started",
      },
    ];

    const createdTopics = await SyllabusTopic.insertMany(
      syllabusData.map((st) => ({ ...st, userId }))
    );

    // Populate Prioritized Study Tasks
    const studyTasksData = [
      {
        subjectId: subMap["CS-203"],
        topicId: createdTopics[3]._id,
        title: "Solve BCNF & 3NF decomposition PYQs (2019-2023)",
        priorityScore: 92,
        priorityLevel: "critical",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedMinutes: 60,
        completed: false,
      },
      {
        subjectId: subMap["CS-202"],
        topicId: createdTopics[0]._id,
        title: "Practice Banker's Algorithm numericals & resource request safety",
        priorityScore: 88,
        priorityLevel: "critical",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedMinutes: 45,
        completed: false,
      },
      {
        subjectId: subMap["CS-202"],
        topicId: createdTopics[1]._id,
        title: "Virtual memory & page fault calculation exercises",
        priorityScore: 78,
        priorityLevel: "high",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedMinutes: 50,
        completed: false,
      },
    ];

    await StudyTask.insertMany(studyTasksData.map((st) => ({ ...st, userId })));

    // Create session token for the demo user
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Demo student data loaded successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        branch: user.branch,
      },
    });

    response.cookies.set("campus_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}
