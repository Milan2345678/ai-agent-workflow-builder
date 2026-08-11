# Hasura backend artifacts

This directory contains Hasura metadata and action definitions for the workflow builder backend.

## Files

- metadata.yaml: Hasura metadata for the required tables and actions
- metadata.json: JSON version of the same metadata for compatibility with some tooling

## Next steps

1. Apply the SQL schema in docs/database-schema.sql to PostgreSQL.
2. Connect Hasura to the PostgreSQL instance.
3. Apply the metadata from metadata.yaml.
4. Configure authentication and permissions in Hasura using the organization_members role mapping.
