import {
  createInitialWorkflowRun,
  resumeWorkflowRun,
} from "@/lib/workflow-engine";
import {
  canCreateRun,
  getDemoState,
  getOrganizationUsage,
  setDemoState,
} from "@/lib/demo-state";
import { executeGraphQL } from "./graphql-client";
import { getBackendConfig, hasBackendCredentials } from "./nhost";
import type { Workflow, WorkflowRun } from "@/types/workflow";

export interface WorkflowServiceResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

const buildWorkflowMutation = (
  name: string,
  description: string,
  organizationId: string,
) => `
  mutation CreateWorkflow($name: String!, $description: String!, $organizationId: uuid!) {
    insert_workflows_one(object: { name: $name, description: $description, organization_id: $organizationId, status: "active" }) {
      id
      name
      description
      organization_id
      status
      created_at
    }
  }
`;

const buildTriggerMutation = (
  workflowId: string,
  input: Record<string, unknown>,
) => `
  mutation TriggerWorkflowRun($workflowId: uuid!, $input: jsonb!) {
    triggerWorkflowRun(workflowId: $workflowId, input: $input) {
      runId
      status
    }
  }
`;

export const listWorkflows = async (organizationId: string) => {
  const config = getBackendConfig();
  if (
    hasBackendCredentials() &&
    config.graphqlUrl !== "https://hasura.example.com/v1/graphql"
  ) {
    const response = await executeGraphQL({
      query: `
        query ListWorkflows($organizationId: uuid!) {
          workflows(where: { organization_id: { _eq: $organizationId } }) {
            id
            name
            description
            status
            organization_id
            created_at
            updated_at
          }
        }
      `,
      variables: { organizationId },
    });

    return { ok: true, data: response.data?.workflows ?? [] };
  }

  const state = getDemoState();
  return {
    ok: true,
    data: state.workflows.filter(
      (workflow) => workflow.organizationId === organizationId,
    ),
  };
};

export const createWorkflow = async (input: {
  name: string;
  description: string;
  organizationId: string;
  createdBy: string;
}) => {
  const config = getBackendConfig();
  if (
    hasBackendCredentials() &&
    config.graphqlUrl !== "https://hasura.example.com/v1/graphql"
  ) {
    const response = await executeGraphQL({
      query: buildWorkflowMutation(
        input.name,
        input.description,
        input.organizationId,
      ),
      variables: {
        name: input.name,
        description: input.description,
        organizationId: input.organizationId,
      },
    });

    return { ok: true, data: response.data?.insert_workflows_one };
  }

  const state = getDemoState();
  const workflow: Workflow = {
    id: `workflow-${Math.random().toString(36).slice(2, 10)}`,
    organizationId: input.organizationId,
    name: input.name,
    description: input.description,
    status: "active",
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    steps: [],
    triggers: [
      {
        id: `trigger-${Math.random().toString(36).slice(2, 10)}`,
        type: "manual",
        configuration: {},
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  setDemoState({ ...state, workflows: [workflow, ...state.workflows] });
  return { ok: true, data: workflow };
};

export const triggerWorkflowRun = async (input: {
  workflowId: string;
  organizationId: string;
  actorId: string;
  payload?: Record<string, unknown>;
  source: "manual" | "webhook";
}) => {
  const state = getDemoState();
  const workflow = state.workflows.find(
    (entry) => entry.id === input.workflowId,
  );
  if (!workflow) {
    return { ok: false, error: "Workflow not found" };
  }

  if (!canCreateRun(state, input.organizationId, workflow.steps.length)) {
    const usage = getOrganizationUsage(state, input.organizationId);
    return {
      ok: false,
      error: `Quota exceeded: ${usage.workflowRuns}/${100} workflow runs and ${usage.stepRuns}/${1000} step runs`,
    };
  }

  const config = getBackendConfig();
  if (
    hasBackendCredentials() &&
    config.graphqlUrl !== "https://hasura.example.com/v1/graphql"
  ) {
    const response = await executeGraphQL({
      query: buildTriggerMutation(input.workflowId, input.payload ?? {}),
      variables: {
        workflowId: input.workflowId,
        input: input.payload ?? {},
      },
    });

    return { ok: true, data: response.data?.triggerWorkflowRun };
  }

  const run = createInitialWorkflowRun({
    workflow,
    organizationId: input.organizationId,
    actorId: input.actorId,
    source: input.source,
  });

  const updatedState = {
    ...state,
    workflowRuns: [
      {
        ...run,
        input: { source: input.source, payload: input.payload ?? {} },
      },
      ...state.workflowRuns,
    ],
  };

  setDemoState(updatedState);
  return { ok: true, data: { runId: run.id, status: run.status } };
};

export const approveWorkflowRun = async (input: {
  runId: string;
  organizationId: string;
}) => {
  const state = getDemoState();
  const run = state.workflowRuns.find((entry) => entry.id === input.runId);
  if (!run || run.organizationId !== input.organizationId) {
    return { ok: false, error: "Workflow run not found" };
  }

  const resumedRun = resumeWorkflowRun(run);
  setDemoState({
    ...state,
    workflowRuns: state.workflowRuns.map((entry) =>
      entry.id === input.runId ? resumedRun : entry,
    ),
  });

  return {
    ok: true,
    data: { runId: resumedRun.id, status: resumedRun.status },
  };
};

export const getWorkflowRuns = async (workflowId: string) => {
  const state = getDemoState();
  return {
    ok: true,
    data: state.workflowRuns.filter((run) => run.workflowId === workflowId),
  };
};

export const enforceQuota = (organizationId: string) => {
  const state = getDemoState();
  if (!canCreateRun(state, organizationId, 0)) {
    const usage = getOrganizationUsage(state, organizationId);
    throw new Error(
      `Quota exceeded: ${usage.workflowRuns}/${100} workflow runs and ${usage.stepRuns}/${1000} step runs`,
    );
  }
};
