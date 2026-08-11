"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getDemoState, setDemoState } from "@/lib/demo-state";
import { resumeWorkflowRun } from "@/lib/workflow-engine";
import type { WorkflowRun } from "@/types/workflow";

export default function RunDetailPage() {
  const params = useParams<{ id: string; runId: string }>();
  const [, setRefreshKey] = useState(0);
  const state = getDemoState();
  const run =
    state.workflowRuns.find((entry) => entry.id === params.runId) ?? null;
  const steps = useMemo(() => {
    if (!run) {
      return [];
    }
    const workflow = state.workflows.find(
      (entry) => entry.id === run.workflowId,
    );
    return workflow?.steps ?? [];
  }, [run, state.workflows]);

  const stepStatuses = useMemo(() => {
    return steps.map((step) => {
      const stepRun = run?.stepRuns.find(
        (entry) => entry.workflowStepId === step.id,
      );
      return {
        step,
        status: stepRun?.status ?? "pending",
      };
    });
  }, [run, steps]);

  const handleResume = () => {
    if (!run) {
      return;
    }

    const currentState = getDemoState();
    const nextRuns: WorkflowRun[] = currentState.workflowRuns.map((entry) => {
      if (entry.id !== run.id) {
        return entry;
      }

      return resumeWorkflowRun(entry);
    });

    setDemoState({ ...currentState, workflowRuns: nextRuns });
    setRefreshKey((value) => value + 1);
  };

  if (!run) {
    return <div className="text-slate-300">Loading execution view...</div>;
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
          Execution view
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Workflow run {run.id}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Live step state updates surface here as the workflow executes.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="text-sm text-slate-400">Run status</div>
        <div className="mt-2 text-2xl font-semibold text-white">
          {run.status.toUpperCase()}
        </div>
        <div className="mt-3 text-sm text-slate-400">
          {run.approvalDecision?.approved
            ? `Approved by ${run.approvalDecision.approvedBy ?? "system"}`
            : "Awaiting approval before the workflow can continue."}
        </div>
        {run.status === "paused" ? (
          <button
            onClick={handleResume}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
          >
            Approve and resume
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="text-sm font-semibold text-white">Timeline</div>
        <div className="mt-3 space-y-2">
          {(run.timeline ?? []).map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
            >
              <div>{entry.message}</div>
              <div className="mt-1 text-xs text-slate-500">
                {entry.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="text-sm font-semibold text-white">Actions</div>
        <div className="mt-3 space-y-2">
          {(run.actions ?? []).map((action) => (
            <div
              key={action.id}
              className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300"
            >
              <div>{action.message}</div>
              <div className="mt-1 text-xs text-slate-500">
                {action.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {stepStatuses.map((entry) => (
          <div
            key={entry.step.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
          >
            <div>
              <div className="font-medium">{entry.step.name}</div>
              <div className="text-sm text-slate-400">
                {entry.step.type.toUpperCase()}
              </div>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-sm ${entry.status === "completed" ? "bg-emerald-500/15 text-emerald-300" : entry.status === "running" ? "bg-cyan-500/15 text-cyan-300" : entry.status === "paused" ? "bg-amber-500/15 text-amber-300" : "bg-slate-800 text-slate-300"}`}
            >
              {entry.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
