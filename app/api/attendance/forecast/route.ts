import { NextResponse } from "next/server";
import { calculateAttendanceMetrics } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { attended, total, targetPercent, simulatedBunks, simulatedAttends } =
      await req.json();

    const currentMetrics = calculateAttendanceMetrics(
      Number(attended),
      Number(total),
      Number(targetPercent || 75)
    );

    // Scenario A: If I bunk the next N classes
    const bunks = Number(simulatedBunks || 0);
    const afterBunkAttended = Number(attended);
    const afterBunkTotal = Number(total) + bunks;
    const afterBunkPercent =
      afterBunkTotal === 0
        ? 100
        : Math.round((afterBunkAttended / afterBunkTotal) * 100 * 10) / 10;

    // Scenario B: If I attend the next N classes
    const attends = Number(simulatedAttends || 0);
    const afterAttendAttended = Number(attended) + attends;
    const afterAttendTotal = Number(total) + attends;
    const afterAttendPercent =
      afterAttendTotal === 0
        ? 100
        : Math.round((afterAttendAttended / afterAttendTotal) * 100 * 10) / 10;

    return NextResponse.json({
      current: currentMetrics,
      simulation: {
        afterBunk: {
          bunkClasses: bunks,
          resultPercent: afterBunkPercent,
          isSafe: afterBunkPercent >= (targetPercent || 75),
        },
        afterAttend: {
          attendClasses: attends,
          resultPercent: afterAttendPercent,
          isSafe: afterAttendPercent >= (targetPercent || 75),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to compute forecast" },
      { status: 500 }
    );
  }
}
