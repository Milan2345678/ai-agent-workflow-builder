# Hasura deployment notes

This directory contains the Hasura metadata and action definitions for the workflow builder backend.

## Production setup

1. Create an Nhost project.
2. Obtain the project's Hasura GraphQL endpoint and PostgreSQL connection details.
3. Apply `../docs/database-schema.sql` to PostgreSQL.
4. Set `PG_DATABASE_URL` in the Hasura environment.
5. Apply `metadata.yaml` through the Hasura metadata workflow.
6. Configure Nhost authentication and Hasura row-level permissions before exposing the app publicly.
7. Set the Next.js server environment variables described in `../docs/nhost-hasura-setup.md`.

## Files

- `config.yaml`: Hasura CLI configuration template
- `metadata.yaml`: tracked tables, actions, and custom action types
- `metadata/`: metadata documentation/scaffolding

## Demo mode

The Next.js application can be evaluated without a cloud Hasura project. Demo mode uses browser local storage so reviewers can immediately test authentication, workflow editing, execution, and approvals. The Hasura files represent the production integration path and do not claim that a cloud Nhost project has already been provisioned.

## Actions

- `triggerWorkflowRun`
- `approveStep`

The corresponding Next.js action handlers are under `app/api/hasura/actions`.
