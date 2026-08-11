# AI Agent Workflow Builder

This project provides a Next.js-based workflow builder for organizations that need to create, order, run, and monitor multi-step workflows. It includes a dashboard, a workflow editor, a run detail view, and a webhook endpoint for external triggers.

## Project overview

The app is designed around organization-scoped workflows and execution traces. Users can create workflows, add step types such as LLM, HTTP, Condition, and Approval, save their changes, trigger runs, and inspect the execution state.

## Architecture

- Next.js App Router frontend
- Nhost/Hasura/GraphQL backend path for production integration
- PostgreSQL-backed schema for organizations, workflows, runs, and step runs
- Server-side actions for workflow execution and approvals

## Features

- Authentication pages for login and signup
- Organization-aware dashboard and workflow list
- Workflow builder with add/remove/reorder steps
- Manual and webhook trigger support
- Execution UI for tracking workflow and step status
- Usage summary for workflow and step runs

## Database

The production schema includes the following tables:

- organizations
- organization_members
- workflows
- workflow_steps
- workflow_triggers
- workflow_runs
- step_runs

## Security

The implementation keeps organization membership and access control at the core of the experience. In production, authentication and authorization should be enforced by Nhost and Hasura, and the frontend should never rely on a client-supplied organization ID for permissions.

## Workflow execution

Workflows execute sequentially by step position. The run view displays pending, running, paused, or completed states for each step. Approval steps pause execution until an approval action resumes the run.

## Local development

```bash
npm install
npm run dev
```

## Environment variables

Create a local copy of the example environment file and fill in the required values:

```bash
cp .env.example .env.local
```

## Deployment

The app is ready for deployment on Vercel or another Next.js-friendly platform. Configure the Nhost and Hasura environment variables for production before enabling the external backend path.

## Testing

The current demo implementation validates the core user experience locally. For production, test organization isolation and workflow execution with separate organizations and users to confirm that each user only sees their own workflows and runs.
