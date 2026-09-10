import { NextRequest, NextResponse } from "next/server";
import { createRpSignature, WORLD_ACTION } from "@agentpass/world-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Backend RP signature for IDKit — never expose WORLD_RP_SIGNING_KEY. */
export async function POST(req: NextRequest) {
  try {
    let action = WORLD_ACTION;
    try {
      const body = await req.json();
      if (typeof body?.action === "string" && body.action) action = body.action;
    } catch {
      // empty body ok
    }
    const payload = createRpSignature(action);
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create RP signature";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
