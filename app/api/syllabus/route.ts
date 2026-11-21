import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SyllabusTopic } from "@/models/SyllabusTopic";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    await connectDB();
    const query: any = { userId: authUser.userId };
    if (subjectId) {
      query.subjectId = subjectId;
    }

    const topics = await SyllabusTopic.find(query)
      .populate("subjectId", "name code color")
      .sort({ pyqFrequency: -1, weightagePercent: -1 });

    // Calculate priority index = (weightage * 0.4) + (pyqFrequency * 6)
    const topicsWithScore = topics.map((t) => {
      const score = Math.round(t.weightagePercent * 0.4 + t.pyqFrequency * 6);
      return {
        ...t.toObject(),
        priorityScore: score,
        priorityLevel:
          score >= 60 ? "critical" : score >= 35 ? "high" : score >= 20 ? "medium" : "low",
      };
    });

    return NextResponse.json({ topics: topicsWithScore });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch syllabus topics" },
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

    const {
      subjectId,
      unitNumber,
      unitTitle,
      topicName,
      weightagePercent,
      pyqFrequency,
      status,
      notes,
    } = await req.json();

    if (!subjectId || !topicName) {
      return NextResponse.json(
        { error: "Subject and Topic Name are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const topic = await SyllabusTopic.create({
      userId: authUser.userId,
      subjectId,
      unitNumber: Number(unitNumber) || 1,
      unitTitle: unitTitle || `Unit ${unitNumber || 1}`,
      topicName,
      weightagePercent: Number(weightagePercent) || 10,
      pyqFrequency: Number(pyqFrequency) || 1,
      status: status || "not_started",
      notes: notes || "",
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create topic" },
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

    const { topicId, status, notes } = await req.json();
    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
    }

    await connectDB();
    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const topic = await SyllabusTopic.findOneAndUpdate(
      { _id: topicId, userId: authUser.userId },
      { $set: updateData },
      { new: true }
    ).populate("subjectId", "name code color");

    return NextResponse.json({ topic });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update topic" },
      { status: 500 }
    );
  }
}
