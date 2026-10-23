import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // In production, this forwards to telemetry/PostHog/Metabase
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics Event]", body);
    }
    return NextResponse.json({ success: true, received: body.event });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
