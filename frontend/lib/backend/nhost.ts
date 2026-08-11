export interface BackendConfig {
  graphqlUrl: string;
  authUrl: string;
  storageUrl: string;
  adminSecret?: string;
}

export const getBackendConfig = (): BackendConfig => ({
  graphqlUrl:
    process.env.NHOST_GRAPHQL_URL ??
    process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL ??
    "https://hasura.example.com/v1/graphql",
  authUrl: process.env.NHOST_AUTH_URL ?? "https://auth.example.com",
  storageUrl: process.env.NHOST_STORAGE_URL ?? "https://storage.example.com",
  adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
});

export const hasBackendCredentials = () =>
  Boolean(
    process.env.NHOST_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL ||
    process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  );
