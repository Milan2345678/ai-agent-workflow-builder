"use client";

import Link from "next/link";
import { getDemoState } from "@/lib/demo-state";

export default function DashboardPage() {
  const state = getDemoState();
  const organization =
    state.organizations.find(
      (entry) => entry.id === state.session.activeOrganizationId,
    ) ?? null;
  const workflows = state.workflows.filter(
    (workflow) =>
      workflow.organizationId === state.session.activeOrganizationId,
  );
  const runs = state.workflowRuns.filter(
    (run) => run.organizationId === state.session.activeOrganizationId,
  );

  const usage = {
    workflowRuns: runs.length,
    steps: runs.reduce((sum, run) => sum + run.stepRuns.length, 0),
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
          Overview
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Welcome to {organization?.name ?? "your org"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Create workflows, add steps, run them, and monitor live execution from
          one place.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent workflows</h2>
            <Link
              href="/workflows"
              className="text-sm font-medium text-cyan-400"
            >
              Open builder
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {workflows.map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workflows/${workflow.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              >
                <div>
                  <div className="font-medium">{workflow.name}</div>
                  <div className="text-sm text-slate-400">
                    {workflow.description}
                  </div>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                  {workflow.steps.length} steps
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold">Usage</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-slate-400">Workflow runs</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {usage.workflowRuns} / 100
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-slate-400">Step runs</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {usage.steps} / 1000
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
