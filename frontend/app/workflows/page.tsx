"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getCurrentMembership,
  getDemoState,
  setDemoState,
} from "@/lib/demo-state";
import type { Workflow } from "@/types/workflow";

const getWorkflowList = () => {
  const state = getDemoState();
  return state.workflows.filter(
    (workflow) =>
      workflow.organizationId === state.session.activeOrganizationId,
  );
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(() =>
    getWorkflowList(),
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const state = getDemoState();
  const currentMembership = useMemo(() => {
    return getCurrentMembership(
      state,
      state.session.currentUserId,
      state.session.activeOrganizationId,
    );
  }, [state]);
  const canManageWorkflows =
    currentMembership?.role === "owner" || currentMembership?.role === "admin";

  const handleCreate = () => {
    if (!canManageWorkflows) {
      return;
    }
    if (!name.trim()) {
      return;
    }

    const state = getDemoState();
    const workflow: Workflow = {
      id: `workflow-${Math.random().toString(36).slice(2, 10)}`,
      organizationId: state.session.activeOrganizationId ?? "org-demo",
      name,
      description,
      status: "active",
      createdBy: state.session.currentUserId ?? "user-demo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      triggers: [
        {
          id: `trigger-${Math.random().toString(36).slice(2, 10)}`,
          type: "manual",
          configuration: {},
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const updated = {
      ...state,
      workflows: [workflow, ...state.workflows],
    };
    setDemoState(updated);
    setWorkflows((current) => [workflow, ...current]);
    setName("");
    setDescription("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h1 className="text-2xl font-semibold">Create workflow</h1>
        <p className="mt-2 text-sm text-slate-400">
          Define a workflow name and description before opening the builder.
        </p>

        <div className="mt-6 space-y-4">
          {!canManageWorkflows ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
              You have read-only access in this organization. Ask an owner or admin to create workflows.
            </div>
          ) : null}
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Workflow name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!canManageWorkflows}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!canManageWorkflows}
              className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <button
            onClick={handleCreate}
            disabled={!canManageWorkflows}
            className="rounded-lg bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            Create workflow
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold">Existing workflows</h2>
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
                Edit
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
