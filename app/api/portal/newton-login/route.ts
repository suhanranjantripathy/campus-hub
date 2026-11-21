import { NextResponse } from "next/server";
import { loginNewtonSchool } from "@/scripts/login_and_sync_newton.mjs";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Newton School email and password are required" },
        { status: 400 }
      );
    }

    const result = await loginNewtonSchool({ email, password, headless: true });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to authenticate with Newton School portal" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Successfully authenticated with Newton School portal!",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Portal automation failed" },
      { status: 500 }
    );
  }
}
