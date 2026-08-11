import type { Workflow, WorkflowRun, WorkflowAction } from "@/types/workflow";

export interface ExecutorContext {
  workflow: Workflow;
  run: WorkflowRun;
  actorId: string;
}

export const createWorkflowAction = ({
  workflowRunId,
  workflowStepId,
  type,
  status,
  message,
}: {
  workflowRunId: string;
  workflowStepId: string;
  type: WorkflowAction["type"];
  status: WorkflowAction["status"];
  message: string;
}): WorkflowAction => ({
  id: `action-${Math.random().toString(36).slice(2, 10)}`,
  workflowRunId,
  workflowStepId,
  type,
  status,
  message,
  createdAt: new Date().toISOString(),
});

export const executeWorkflow = async () => {
  return {
    ok: true,
    status: "pending",
  };
};
