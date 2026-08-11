import { NextRequest, NextResponse } from "next/server";
import { getDemoState } from "@/lib/demo-state";
import {
  createWorkflow,
  listWorkflows,
  triggerWorkflowRun,
} from "@/lib/backend/workflow-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const query = String(body?.query ?? "");

  if (query.includes("mutation CreateWorkflow")) {
    const state = getDemoState();
    const name = String(body?.variables?.name ?? "");
    const description = String(body?.variables?.description ?? "");
    const organizationId = String(
      body?.variables?.organizationId ??
        state.session.activeOrganizationId ??
        "",
    );

    const result = await createWorkflow({
      name,
      description,
      organizationId,
      createdBy: state.session.currentUserId ?? "user-demo",
    });

    return NextResponse.json({ data: { insert_workflows_one: result.data } });
  }

  if (query.includes("mutation TriggerWorkflowRun")) {
    const workflowId = String(body?.variables?.workflowId ?? "");
    const result = await triggerWorkflowRun({
      workflowId,
      organizationId: String(body?.variables?.organizationId ?? ""),
      actorId: String(body?.variables?.actorId ?? "webhook"),
      payload: body?.variables?.input as Record<string, unknown> | undefined,
      source: "webhook",
    });

    return NextResponse.json({ data: { triggerWorkflowRun: result.data } });
  }

  if (query.includes("subscription WorkflowRunUpdated")) {
    return NextResponse.json({ data: { workflow_runs: [] } });
  }

  const organizationId = String(
    body?.variables?.organizationId ??
      getDemoState().session.activeOrganizationId ??
      "",
  );
  const workflows = await listWorkflows(organizationId);
  return NextResponse.json({ data: { workflows: workflows.data } });
}
