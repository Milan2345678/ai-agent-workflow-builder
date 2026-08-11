import type {
  RunStatus,
  StepRun,
  Workflow,
  WorkflowAction,
  WorkflowRun,
} from "@/types/workflow";

export interface CreateRunInput {
  workflow: Workflow;
  organizationId: string;
  actorId: string;
  source: "manual" | "webhook";
}

export interface SubscriptionPayload {
  runId: string;
  status: RunStatus;
  stepStatuses: Array<{
    workflowStepId: string;
    status: StepRun["status"];
  }>;
}

export const createInitialWorkflowRun = ({
  workflow,
  organizationId,
  actorId,
  source,
}: CreateRunInput): WorkflowRun => {
  const hasApproval = workflow.steps.some((step) => step.type === "approval");
  const runId = `run-${Math.random().toString(36).slice(2, 10)}`;

  const actions: WorkflowAction[] = workflow.steps.map((step) => ({
    id: `action-${Math.random().toString(36).slice(2, 10)}`,
    workflowRunId: runId,
    workflowStepId: step.id,
    type: step.type,
    status: step.type === "approval" ? "pending" : "completed",
    message: `${step.name} ${step.type === "approval" ? "awaiting approval" : "completed"}.`,
    createdAt: new Date().toISOString(),
  }));

  const stepRuns: StepRun[] = workflow.steps.map((step, index) => {
    let status: StepRun["status"] = "pending";

    if (index === 0) {
      status = "running";
    } else if (step.type === "approval") {
      status = "paused";
    }

    return {
      id: `step-run-${Math.random().toString(36).slice(2, 10)}`,
      workflowRunId: runId,
      workflowStepId: step.id,
      status,
      input: { stepId: step.id },
      startedAt: new Date().toISOString(),
      attemptCount: 1,
    };
  });

  return {
    id: runId,
    workflowId: workflow.id,
    organizationId,
    status: hasApproval ? "paused" : "running",
    startedAt: new Date().toISOString(),
    input: { source },
    createdBy: actorId,
    approvalDecision: hasApproval ? { approved: false } : undefined,
    timeline: [
      {
        id: `timeline-${Math.random().toString(36).slice(2, 10)}`,
        message: `Run created from ${source}.`,
        timestamp: new Date().toISOString(),
      },
    ],
    actions,
    stepRuns,
  };
};

export const resumeWorkflowRun = (run: WorkflowRun): WorkflowRun => ({
  ...run,
  status: "completed",
  completedAt: new Date().toISOString(),
  approvalDecision: {
    approved: true,
    approvedBy: run.createdBy,
    approvedAt: new Date().toISOString(),
    note: "Approved from the workflow execution view.",
  },
  timeline: [
    ...(run.timeline ?? []),
    {
      id: `timeline-${Math.random().toString(36).slice(2, 10)}`,
      message: "Approval granted and workflow resumed.",
      timestamp: new Date().toISOString(),
    },
  ],
  actions: (run.actions ?? []).map((action) => {
    if (action.type === "approval") {
      return {
        ...action,
        status: "completed",
        message: `${action.message} Approval completed.`,
      };
    }

    return action;
  }),
  stepRuns: run.stepRuns.map((stepRun) => {
    if (stepRun.status === "paused") {
      return {
        ...stepRun,
        status: "completed",
        completedAt: new Date().toISOString(),
      };
    }

    return stepRun;
  }),
});

export const buildSubscriptionPayload = (
  run: WorkflowRun,
): SubscriptionPayload => ({
  runId: run.id,
  status: run.status,
  stepStatuses: run.stepRuns.map((stepRun) => ({
    workflowStepId: stepRun.workflowStepId,
    status: stepRun.status,
  })),
});
