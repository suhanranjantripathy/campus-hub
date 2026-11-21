import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { StudyTask } from "@/models/StudyTask";
import { SyllabusTopic } from "@/models/SyllabusTopic";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const tasks = await StudyTask.find({ userId: authUser.userId })
      .populate("subjectId", "name code color")
      .populate("topicId", "topicName unitTitle pyqFrequency")
      .sort({ completed: 1, priorityScore: -1 });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch study tasks" },
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

    const { action, subjectId, title, estimatedMinutes, dueDate } = await req.json();
    await connectDB();

    // AUTO-GENERATE HIGH-YIELD STUDY PLAN FROM SYLLABUS + PYQ FREQUENCIES
    if (action === "auto_generate") {
      const unmasteredTopics = await SyllabusTopic.find({
        userId: authUser.userId,
        status: { $in: ["not_started", "in_progress"] },
      }).sort({ pyqFrequency: -1, weightagePercent: -1 });

      if (unmasteredTopics.length === 0) {
        return NextResponse.json({
          message: "All topics are already marked mastered! Add more topics or reset status.",
          createdCount: 0,
        });
      }

      const generatedTasks = [];
      for (const topic of unmasteredTopics.slice(0, 5)) {
        // Check if task already exists for this topic
        const existing = await StudyTask.findOne({
          userId: authUser.userId,
          topicId: topic._id,
          completed: false,
        });

        if (!existing) {
          const score = Math.round(topic.weightagePercent * 0.4 + topic.pyqFrequency * 6);
          const task = await StudyTask.create({
            userId: authUser.userId,
            subjectId: topic.subjectId,
            topicId: topic._id,
            title: `Solve PYQs & Master: ${topic.topicName} (${topic.pyqFrequency}x in exams)`,
            priorityScore: score,
            priorityLevel: score >= 60 ? "critical" : score >= 35 ? "high" : "medium",
            estimatedMinutes: 45,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            completed: false,
          });
          generatedTasks.push(task);
        }
      }

      return NextResponse.json({
        message: `Generated ${generatedTasks.length} high-yield study sessions`,
        tasks: generatedTasks,
      });
    }

    // Manual task creation
    if (!title || !subjectId) {
      return NextResponse.json(
        { error: "Title and Subject are required" },
        { status: 400 }
      );
    }

    const task = await StudyTask.create({
      userId: authUser.userId,
      subjectId,
      title,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priorityScore: 50,
      priorityLevel: "medium",
      completed: false,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create study task" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, completed } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    await connectDB();
    const task = await StudyTask.findOneAndUpdate(
      { _id: taskId, userId: authUser.userId },
      {
        $set: {
          completed: Boolean(completed),
          completedAt: completed ? new Date() : null,
        },
      },
      { new: true }
    )
      .populate("subjectId", "name code color")
      .populate("topicId", "topicName unitTitle pyqFrequency");

    return NextResponse.json({ task });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update task" },
      { status: 500 }
    );
  }
}
