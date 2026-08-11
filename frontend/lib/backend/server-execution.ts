import type {
  Workflow,
  WorkflowRun,
  WorkflowStep,
  WorkflowAction,
  StepRun,
} from "@/types/workflow";
import { createWorkflowAction } from "./workflow-executor";

export interface ExecutionResult {
  ok: boolean;
  runId: string;
  status: WorkflowRun["status"];
  actions: WorkflowAction[];
  stepRuns: StepRun[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const runWorkflowServerSide = async ({
  workflow,
  run,
  actorId,
}: {
  workflow: Workflow;
  run: WorkflowRun;
  actorId: string;
}): Promise<ExecutionResult> => {
  const actions: WorkflowAction[] = [];
  const stepRuns: StepRun[] = [];

  for (const step of workflow.steps) {
    const action = createWorkflowAction({
      workflowRunId: run.id,
      workflowStepId: step.id,
      type: step.type,
      status: "pending",
      message: `Executing ${step.name}`,
    });

    actions.push(action);

    if (step.type === "approval") {
      stepRuns.push({
        id: `step-run-${Math.random().toString(36).slice(2, 10)}`,
        workflowRunId: run.id,
        workflowStepId: step.id,
        status: "paused",
        input: { stepId: step.id },
        startedAt: new Date().toISOString(),
        attemptCount: 1,
      });
      continue;
    }

    const outcome = await executeStep(step, actorId);
    stepRuns.push({
      id: `step-run-${Math.random().toString(36).slice(2, 10)}`,
      workflowRunId: run.id,
      workflowStepId: step.id,
      status: outcome.ok ? "completed" : "failed",
      input: { stepId: step.id },
      output: outcome.output,
      error: outcome.error,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attemptCount: 1,
    });

    await delay(50);
  }

  return {
    ok: true,
    runId: run.id,
    status: "paused",
    actions,
    stepRuns,
  };
};

const executeStep = async (
  step: WorkflowStep,
  actorId: string,
): Promise<{
  ok: boolean;
  output?: Record<string, unknown>;
  error?: Record<string, unknown>;
}> => {
  switch (step.type) {
    case "llm": {
      const prompt = String(step.configuration.prompt ?? "");
      const provider = String(step.configuration.provider ?? "openai");
      return {
        ok: true,
        output: {
          actorId,
          provider,
          prompt,
          result: `LLM step executed for ${step.name}`,
        },
      };
    }
    case "http": {
      const url = String(step.configuration.url ?? "https://example.com");
      return {
        ok: true,
        output: {
          url,
          method: step.configuration.method ?? "GET",
          result: `HTTP step completed for ${step.name}`,
        },
      };
    }
    case "condition": {
      const expression = String(step.configuration.expression ?? "true");
      const result =
        expression.includes("true") || expression.includes("enabled");
      return {
        ok: true,
        output: {
          expression,
          result,
        },
      };
    }
    default: {
      return {
        ok: true,
        output: { result: `Handled ${step.type}` },
      };
    }
  }
};
