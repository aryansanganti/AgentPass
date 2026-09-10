import { NextRequest, NextResponse } from "next/server";
import { getSession, isHumanBacked } from "@agentpass/world-verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Look up an existing World verify session (cookie / header / query). */
export async function GET(req: NextRequest) {
  const sessionId =
    req.headers.get("x-world-session") ||
    req.nextUrl.searchParams.get("sessionId") ||
    "";

  const credential = getSession(sessionId);
  if (!credential || !isHumanBacked(credential)) {
    return NextResponse.json(
      { ok: false, verified: false, credential: null },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    verified: true,
    credential,
    sessionId: credential.sessionId,
  });
}
