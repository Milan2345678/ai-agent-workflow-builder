export interface BackendUserContext {
  userId?: string;
  organizationId?: string;
  role?: "owner" | "admin" | "member";
  accessToken?: string;
}

export const parseUserContext = (request: Request): BackendUserContext => {
  const headers = request.headers;
  return {
    userId: headers.get("x-user-id") ?? undefined,
    organizationId: headers.get("x-organization-id") ?? undefined,
    role:
      (headers.get("x-user-role") as BackendUserContext["role"]) ?? undefined,
    accessToken: headers.get("authorization") ?? undefined,
  };
};

export const assertOrganizationAccess = ({
  userId,
  organizationId,
  role,
  requiredRole = "member",
}: BackendUserContext & { requiredRole?: "owner" | "admin" | "member" }) => {
  if (!userId || !organizationId) {
    throw new Error("Missing user or organization context.");
  }

  const roleRank = { member: 1, admin: 2, owner: 3 } as const;
  if (!role || roleRank[role] < roleRank[requiredRole]) {
    throw new Error(`Insufficient role for this operation: ${role ?? "none"}`);
  }

  return { userId, organizationId, role };
};
