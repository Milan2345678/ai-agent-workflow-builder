import { NextRequest, NextResponse } from "next/server";
import {
  parseUserContext,
  assertOrganizationAccess,
} from "@/lib/backend/access-control";
import { triggerWorkflowRun } from "@/lib/backend/workflow-service";

export async function POST(request: NextRequest) {
  try {
    const context = parseUserContext(request);
    const { organizationId } = assertOrganizationAccess({
      ...context,
      requiredRole: "member",
    });

    const body = await request.json();
    const workflowId = body?.workflowId;
    const input = body?.input ?? {};

    if (!workflowId) {
      return NextResponse.json(
        { error: "workflowId is required" },
        { status: 400 },
      );
    }

    const result = await triggerWorkflowRun({
      workflowId,
      organizationId,
      actorId: context.userId ?? "system",
      payload: input as Record<string, unknown>,
      source: "webhook",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 },
    );
  }
}
