-- Production-ready PostgreSQL schema for the workflow builder
-- This SQL is intended for Hasura/Nhost-backed deployments.

create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('draft','active')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  name text not null,
  type text not null check (type in ('llm','http','condition','approval')),
  position integer not null,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, position)
);

create table if not exists workflow_triggers (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  type text not null check (type in ('manual','webhook')),
  configuration jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','running','paused','completed','failed','cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error jsonb,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists step_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_run_id uuid not null references workflow_runs(id) on delete cascade,
  workflow_step_id uuid not null references workflow_steps(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','running','paused','completed','failed','skipped')),
  input jsonb,
  output jsonb,
  error jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  attempt_count integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_workflows_organization_id on workflows (organization_id);
create index if not exists idx_workflow_steps_workflow_id on workflow_steps (workflow_id);
create index if not exists idx_workflow_triggers_workflow_id on workflow_triggers (workflow_id);
create index if not exists idx_workflow_runs_workflow_id on workflow_runs (workflow_id);
create index if not exists idx_workflow_runs_organization_id on workflow_runs (organization_id);
create index if not exists idx_workflow_runs_status on workflow_runs (status);
create index if not exists idx_step_runs_workflow_run_id on step_runs (workflow_run_id);
create index if not exists idx_step_runs_workflow_step_id on step_runs (workflow_step_id);
create index if not exists idx_step_runs_status on step_runs (status);
create index if not exists idx_workflow_runs_created_at on workflow_runs (created_at);

create or replace view organization_usage as
select
  o.id as organization_id,
  count(distinct wr.id) as workflow_runs,
  count(distinct sr.id) as step_runs
from organizations o
left join workflow_runs wr on wr.organization_id = o.id
left join step_runs sr on sr.workflow_run_id = wr.id
group by o.id;
