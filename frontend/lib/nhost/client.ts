export interface NhostConfig {
  subdomain: string;
  region: string;
  graphqlUrl: string;
}

export const getNhostConfig = (): NhostConfig => ({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN ?? "demo-subdomain",
  region: process.env.NEXT_PUBLIC_NHOST_REGION ?? "eu-central-1",
  graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL ?? "https://graphql.nhost.run/v1",
});

export const getNhostGraphQlUrl = () => getNhostConfig().graphqlUrl;

export const hasNhostConfig = () => Boolean(process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL);
