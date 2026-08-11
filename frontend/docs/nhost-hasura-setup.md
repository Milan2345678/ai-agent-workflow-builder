# Nhost + Hasura backend setup

This repository now includes repository-level scaffolding for an Nhost-compatible backend stack.

## What is included

- Hasura config at [hasura/config.yaml](../hasura/config.yaml)
- Backend config helpers at [lib/backend/nhost.ts](../lib/backend/nhost.ts)
- GraphQL client wrapper at [lib/backend/graphql-client.ts](../lib/backend/graphql-client.ts)
- Workflow executor scaffold at [lib/backend/workflow-executor.ts](../lib/backend/workflow-executor.ts)

## Remaining manual setup

1. Create or connect an Nhost project.
2. Provision a Hasura instance and connect it to PostgreSQL.
3. Apply the SQL schema from [docs/database-schema.sql](database-schema.sql).
4. Track the seven tables in Hasura and configure permissions.
5. Create the Hasura actions for triggerWorkflowRun and approveStep.
6. Configure server-only environment variables for LLM providers and backend credentials.

## Required environment variables

- NHOST_GRAPHQL_URL
- NHOST_AUTH_URL
- NHOST_STORAGE_URL
- LLM_API_KEY

Do not expose server-only secrets through NEXT*PUBLIC*\* variables.
