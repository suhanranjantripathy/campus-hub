import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SyllabusTopic } from "@/models/SyllabusTopic";
import { StudyTask } from "@/models/StudyTask";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await SyllabusTopic.findOneAndDelete({
      _id: params.id,
      userId: authUser.userId,
    });

    await StudyTask.deleteMany({ topicId: params.id, userId: authUser.userId });

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete topic" },
      { status: 500 }
    );
  }
}
