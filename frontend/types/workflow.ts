export type StepType = "llm" | "http" | "condition" | "approval";
export type TriggerType = "manual" | "webhook";
export type WorkflowStatus = "draft" | "active";
export type RunStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";
export type StepRunStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "skipped";

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  position: number;
  configuration: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  configuration: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
}

export interface ApprovalDecision {
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
}

export interface WorkflowAction {
  id: string;
  workflowRunId: string;
  workflowStepId: string;
  type: "llm" | "http" | "condition" | "approval";
  status: "pending" | "completed" | "failed";
  message: string;
  createdAt: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  organizationId: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: Record<string, unknown>;
  createdBy: string;
  approvalDecision?: ApprovalDecision;
  timeline?: Array<{
    id: string;
    message: string;
    timestamp: string;
  }>;
  actions?: WorkflowAction[];
  stepRuns: StepRun[];
}

export interface StepRun {
  id: string;
  workflowRunId: string;
  workflowStepId: string;
  status: StepRunStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  attemptCount: number;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

export interface DemoSession {
  currentUserId: string | null;
  activeOrganizationId: string | null;
}

export interface DemoState {
  users: UserProfile[];
  organizations: Organization[];
  memberships: Membership[];
  workflows: Workflow[];
  workflowRuns: WorkflowRun[];
  session: DemoSession;
}
