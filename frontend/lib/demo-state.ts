import type {
  DemoState,
  Membership,
  Organization,
  UserProfile,
  Workflow,
} from "@/types/workflow";

const STORAGE_KEY = "workflow-builder-demo-state";

export const DEFAULT_QUOTAS = {
  workflowRuns: 100,
  stepRuns: 1000,
};

const createId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `demo-${Math.random().toString(36).slice(2, 10)}`;
};

const seedOrganizations = (): Organization[] => [
  {
    id: "org-acme",
    name: "Acme Labs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "org-northwind",
    name: "Northwind AI",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedUsers = (): UserProfile[] => [
  {
    id: "user-a",
    name: "Ava Chen",
    email: "ava@example.com",
    password: "password123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-b",
    name: "Ben Ortiz",
    email: "ben@example.com",
    password: "password123",
    createdAt: new Date().toISOString(),
  },
];

const seedMemberships = (
  users: UserProfile[],
  organizations: Organization[],
): Membership[] => [
  {
    id: createId(),
    organizationId: organizations[0].id,
    userId: users[0].id,
    role: "owner",
    createdAt: new Date().toISOString(),
  },
  {
    id: createId(),
    organizationId: organizations[1].id,
    userId: users[1].id,
    role: "owner",
    createdAt: new Date().toISOString(),
  },
];

const createSampleWorkflow = (
  organizationId: string,
  createdBy: string,
): Workflow => ({
  id: createId(),
  organizationId,
  name: "Onboarding Review",
  description:
    "Route new customer onboarding tasks through an LLM summarizer and approval gate.",
  status: "active",
  createdBy,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: [
    {
      id: createId(),
      name: "Summarize intake",
      type: "llm",
      position: 1,
      configuration: {
        provider: "openai",
        model: "gpt-4.1-mini",
        prompt: "Summarize the onboarding request and call out blockers.",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: createId(),
      name: "Check approval",
      type: "approval",
      position: 2,
      configuration: {
        approver: "ops-team",
        prompt: "Review the generated summary before proceeding.",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  triggers: [
    {
      id: createId(),
      type: "manual",
      configuration: {},
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
});

export const getDefaultState = (): DemoState => {
  const organizations = seedOrganizations();
  const users = seedUsers();
  const memberships = seedMemberships(users, organizations);
  const workflowOwner = users[0].id;
  return {
    users,
    organizations,
    memberships,
    workflows: [createSampleWorkflow(organizations[0].id, workflowOwner)],
    workflowRuns: [],
    session: {
      currentUserId: users[0].id,
      activeOrganizationId: organizations[0].id,
    },
  };
};

export const getDemoState = (): DemoState => {
  if (typeof window === "undefined") {
    return getDefaultState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const state = getDefaultState();
    setDemoState(state);
    return state;
  }

  try {
    const parsed = JSON.parse(raw) as DemoState;
    return {
      ...getDefaultState(),
      ...parsed,
      session: parsed.session ?? getDefaultState().session,
      organizations: parsed.organizations ?? getDefaultState().organizations,
      users: parsed.users ?? getDefaultState().users,
      memberships: parsed.memberships ?? getDefaultState().memberships,
      workflows: parsed.workflows ?? [],
      workflowRuns: parsed.workflowRuns ?? [],
    };
  } catch {
    const state = getDefaultState();
    setDemoState(state);
    return state;
  }
};

export const setDemoState = (state: DemoState) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getCurrentMembership = (
  state: DemoState,
  userId: string | null,
  organizationId: string | null,
) => {
  if (!userId || !organizationId) {
    return null;
  }

  return (
    state.memberships.find(
      (membership) =>
        membership.userId === userId &&
        membership.organizationId === organizationId,
    ) ?? null
  );
};

export const getOrganizationUsage = (
  state: DemoState,
  organizationId: string,
) => {
  const runs = state.workflowRuns.filter(
    (run) => run.organizationId === organizationId,
  );

  return {
    workflowRuns: runs.length,
    stepRuns: runs.reduce((sum, run) => sum + run.stepRuns.length, 0),
  };
};

export const canCreateRun = (
  state: DemoState,
  organizationId: string,
  estimatedStepCount: number,
) => {
  const usage = getOrganizationUsage(state, organizationId);

  return (
    usage.workflowRuns + 1 <= DEFAULT_QUOTAS.workflowRuns &&
    usage.stepRuns + estimatedStepCount <= DEFAULT_QUOTAS.stepRuns
  );
};

export const resetDemoState = () => {
  const state = getDefaultState();
  setDemoState(state);
  return state;
};
