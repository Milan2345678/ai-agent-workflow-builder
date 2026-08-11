import { NextRequest, NextResponse } from "next/server";
import {
  parseUserContext,
  assertOrganizationAccess,
} from "@/lib/backend/access-control";
import { approveWorkflowRun } from "@/lib/backend/workflow-service";

export async function POST(request: NextRequest) {
  try {
    const context = parseUserContext(request);
    const { organizationId } = assertOrganizationAccess({
      ...context,
      requiredRole: "member",
    });

    const body = await request.json();
    const runId = body?.runId;
    const stepId = body?.stepId;

    if (!runId || !stepId) {
      return NextResponse.json(
        { error: "runId and stepId are required" },
        { status: 400 },
      );
    }

    const result = await approveWorkflowRun({ runId, organizationId });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 },
    );
  }
}
