import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Subject } from "@/models/Subject";
import { AttendanceLog } from "@/models/AttendanceLog";
import { getAuthUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();
    await connectDB();

    const subject = await Subject.findOneAndUpdate(
      { _id: params.id, userId: authUser.userId },
      { $set: updates },
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ subject });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update subject" },
      { status: 500 }
    );
  }
}

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
    const subject = await Subject.findOneAndDelete({
      _id: params.id,
      userId: authUser.userId,
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Clean up related attendance logs
    await AttendanceLog.deleteMany({ subjectId: params.id, userId: authUser.userId });

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete subject" },
      { status: 500 }
    );
  }
}
