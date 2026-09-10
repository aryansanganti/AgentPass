import { NextResponse } from "next/server";
import { getPublicWorldConfig } from "@agentpass/world-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public World ID config for the Verify UI (PRD 00 Step 2). */
export async function GET() {
  return NextResponse.json(getPublicWorldConfig());
}
