# AI Agent Workflow Builder

A production-oriented Next.js workflow builder for designing, running, and monitoring multi-step AI agent workflows.

## Submission status

The repository is structured as a complete, runnable frontend demo with a documented Nhost/Hasura/PostgreSQL production integration path.

**Demo mode works without external credentials** by using browser local storage. This makes the project easy for a reviewer to run immediately while keeping the production backend configuration documented separately.

## What you can demonstrate

- Login and signup flow in demo mode
- Organization-scoped dashboard
- Workflow list and workflow editor
- Add, remove, rename, and reorder workflow steps
- Supported step types: LLM, HTTP, Condition, Approval
- Manual workflow execution
- Approval/pause and resume flow
- Execution timeline and per-step status
- Webhook endpoint scaffold
- GraphQL/Hasura integration scaffold
- PostgreSQL schema and Hasura metadata

## Tech stack

- Next.js 16 + App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Nhost / Hasura / PostgreSQL integration path
- GraphQL
- Local-storage demo persistence for zero-setup evaluation

## Run locally

```bash
cd frontend
npm ci
npm run lint
npm run build
npm run dev
```

Then open `http://localhost:3000`.

### Demo account

- Email: `ava@example.com`
- Password: `password123`

A reviewer can also create a new demo account from `/signup`.

## Production backend

The repository includes the PostgreSQL schema, Hasura metadata, backend service layer, API routes, and Nhost configuration documentation under `frontend/docs` and `frontend/hasura`.

Before connecting a real Nhost project, configure the server environment variables documented in `frontend/docs/nhost-hasura-setup.md`. Never commit real API keys, Hasura admin secrets, or database credentials.

## Important implementation note

The browser demo is intentionally self-contained so the submission can be evaluated without a private cloud account. The Nhost/Hasura path is separated into backend service modules and can replace the demo persistence when production credentials and Hasura permissions are configured.

## Project structure

```text
frontend/
├── app/                 # Next.js pages and API routes
├── components/          # Shared UI
├── docs/                # Architecture, schema and backend setup docs
├── hasura/              # Hasura configuration and metadata
├── lib/
│   ├── backend/         # Production backend service layer
│   ├── nhost/           # Nhost client helpers
│   └── workflow-engine.ts
├── types/               # Shared TypeScript domain types
└── package.json
```

## Database

The production schema defines seven core tables:

1. organizations
2. organization_members
3. workflows
4. workflow_steps
5. workflow_triggers
6. workflow_runs
7. step_runs

See `frontend/docs/database-schema.sql` for the complete PostgreSQL schema.

## Security

Demo credentials and demo state are intentionally browser-only and must not be treated as production authentication. Production authentication and authorization should be enforced by Nhost/Hasura, with organization membership used for row-level access control and server-only secrets kept out of public environment variables.

## Evaluation checklist

- [x] Reproducible local setup
- [x] TypeScript project
- [x] Lint/build scripts
- [x] Demo authentication flow
- [x] Workflow CRUD/editing experience
- [x] Workflow execution and approval flow
- [x] Execution monitoring UI
- [x] PostgreSQL schema
- [x] Hasura metadata/actions scaffold
- [x] Production environment documentation
- [x] No secrets committed
