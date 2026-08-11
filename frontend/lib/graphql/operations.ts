export const WORKFLOWS_QUERY = `
  query GetWorkflows {
    workflows {
      id
      name
      description
      status
      organization_id
    }
  }
`;

export const CREATE_WORKFLOW_MUTATION = `
  mutation CreateWorkflow($name: String!, $description: String!, $organizationId: uuid!) {
    insert_workflows_one(object: { name: $name, description: $description, organization_id: $organizationId, status: "active" }) {
      id
    }
  }
`;

export const TRIGGER_WORKFLOW_RUN = `
  mutation TriggerWorkflowRun($workflowId: uuid!, $input: jsonb!) {
    triggerWorkflowRun(workflowId: $workflowId, input: $input) {
      runId
      status
    }
  }
`;

export const WORKFLOW_RUN_SUBSCRIPTION = `
  subscription WorkflowRunUpdated($runId: uuid!) {
    workflow_runs(where: { id: { _eq: $runId } }) {
      id
      status
      step_runs {
        workflow_step_id
        status
      }
    }
  }
`;
