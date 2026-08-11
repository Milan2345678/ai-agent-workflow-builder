import { NextRequest, NextResponse } from "next/server";
import {
  canCreateRun,
  getDemoState,
  getOrganizationUsage,
  setDemoState,
} from "@/lib/demo-state";
import { createInitialWorkflowRun } from "@/lib/workflow-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ triggerId: string }> },
) {
  const { triggerId } = await params;
  const state = getDemoState();
  const workflow = state.workflows.find((entry) =>
    entry.triggers.some((trigger) => trigger.id === triggerId),
  );

  if (!workflow) {
    return NextResponse.json(
      { error: "Workflow trigger not found." },
      { status: 404 },
    );
  }

  if (!canCreateRun(state, workflow.organizationId, workflow.steps.length)) {
    const usage = getOrganizationUsage(state, workflow.organizationId);
    return NextResponse.json(
      {
        error: "Quota exceeded for this organization.",
        usage,
        limits: { workflowRuns: 100, stepRuns: 1000 },
      },
      { status: 429 },
    );
  }

  const trigger = workflow.triggers.find((entry) => entry.id === triggerId);
  if (!trigger || !trigger.enabled) {
    return NextResponse.json(
      { error: "Trigger is disabled." },
      { status: 400 },
    );
  }

  const payload = await request.json().catch(() => ({}));
  const run = createInitialWorkflowRun({
    workflow,
    organizationId: workflow.organizationId,
    actorId: "webhook",
    source: "webhook",
  });

  const runWithPayload = {
    ...run,
    input: {
      source: "webhook",
      payload,
    },
  };

  const updatedState = {
    ...state,
    workflowRuns: [runWithPayload, ...state.workflowRuns],
  };
  setDemoState(updatedState);

  return NextResponse.json({
    ok: true,
    workflowId: workflow.id,
    runId: runWithPayload.id,
  });
}
