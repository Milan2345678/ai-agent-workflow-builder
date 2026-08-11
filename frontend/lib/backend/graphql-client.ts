import { getBackendConfig } from "./nhost";

export interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export const executeGraphQL = async ({
  query,
  variables,
  headers,
}: GraphQLRequestOptions) => {
  const { graphqlUrl } = getBackendConfig();

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  return response.json();
};
