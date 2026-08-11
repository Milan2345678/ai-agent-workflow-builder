import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    ok: true,
    message:
      "Hasura subscription endpoint placeholder. Configure a real subscription backend to stream step status.",
  });
}
