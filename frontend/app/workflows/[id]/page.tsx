"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  canCreateRun,
  getDemoState,
  getOrganizationUsage,
  setDemoState,
} from "@/lib/demo-state";
import type { Workflow, WorkflowRun, WorkflowStep } from "@/types/workflow";
import { createInitialWorkflowRun } from "@/lib/workflow-engine";

const stepTypes = ["llm", "http", "condition", "approval"] as const;

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const state = getDemoState();
  const workflow = useMemo(() => {
    const activeWorkflow =
      state.workflows.find((entry) => entry.id === params.id) ?? null;
    return activeWorkflow;
  }, [params.id, state.workflows]);

  const runs = useMemo(() => {
    if (!workflow) {
      return [] as WorkflowRun[];
    }
    return state.workflowRuns.filter((run) => run.workflowId === workflow.id);
  }, [workflow, state.workflowRuns]);

  if (!workflow) {
    router.replace("/workflows");
    return null;
  }

  const updateWorkflow = (updater: (current: Workflow) => Workflow) => {
    const currentState = getDemoState();
    const nextWorkflow = updater(workflow!);
    const updatedWorkflows = currentState.workflows.map((entry) =>
      entry.id === nextWorkflow.id ? nextWorkflow : entry,
    );
    const updatedState = { ...currentState, workflows: updatedWorkflows };
    setDemoState(updatedState);
    setRefreshKey((value) => value + 1);
  };

  const addStep = () => {
    const defaultStep: WorkflowStep = {
      id: `step-${Math.random().toString(36).slice(2, 10)}`,
      name: `New ${stepTypes[0]}`,
      type: stepTypes[0],
      position: (workflow?.steps.length ?? 0) + 1,
      configuration: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateWorkflow((current) => ({
      ...current,
      steps: [...current.steps, defaultStep],
    }));
  };

  const removeStep = (stepId: string) => {
    updateWorkflow((current) => ({
      ...current,
      steps: current.steps
        .filter((step) => step.id !== stepId)
        .map((step, index) => ({ ...step, position: index + 1 })),
    }));
  };

  const moveStep = (from: number, to: number) => {
    updateWorkflow((current) => {
      const ordered = [...current.steps].sort(
        (left, right) => left.position - right.position,
      );
      const [moved] = ordered.splice(from, 1);
      ordered.splice(to, 0, moved);
      return {
        ...current,
        steps: ordered.map((step, index) => ({ ...step, position: index + 1 })),
      };
    });
  };

  const updateStep = (
    stepId: string,
    key: keyof WorkflowStep,
    value: string | number | Record<string, unknown>,
  ) => {
    updateWorkflow((current) => ({
      ...current,
      steps: current.steps.map((step) =>
        step.id === stepId
          ? { ...step, [key]: value, updatedAt: new Date().toISOString() }
          : step,
      ),
    }));
  };

  const toggleTrigger = () => {
    updateWorkflow((current) => ({
      ...current,
      triggers: current.triggers.map((trigger) => ({
        ...trigger,
        enabled: !trigger.enabled,
        updatedAt: new Date().toISOString(),
      })),
    }));
  };

  const runWorkflow = () => {
    const state = getDemoState();
    const organizationId = workflow!.organizationId;
    const estimatedStepCount = workflow!.steps.length;

    if (!canCreateRun(state, organizationId, estimatedStepCount)) {
      const usage = getOrganizationUsage(state, organizationId);
      setErrorMessage(
        `Quota reached for this organization. Current usage is ${usage.workflowRuns} workflow runs and ${usage.stepRuns} step runs.`,
      );
      return;
    }

    const run = createInitialWorkflowRun({
      workflow: workflow!,
      organizationId,
      actorId: state.session.currentUserId ?? "user-demo",
      source: "manual",
    });

    const updated = {
      ...state,
      workflowRuns: [run, ...state.workflowRuns],
    };
    setErrorMessage(null);
    setDemoState(updated);
    setRefreshKey((value) => value + 1);
    router.push(`/workflows/${workflow!.id}/runs/${run.id}`);
  };

  const updateWorkflowDetails = (
    field: "name" | "description",
    value: string,
  ) => {
    updateWorkflow((current) => ({
      ...current,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const saveWorkflow = () => {
    updateWorkflow((current) => ({
      ...current,
      name: workflow.name,
      description: workflow.description,
      updatedAt: new Date().toISOString(),
    }));
  };

  const workflowSteps = [...(workflow?.steps ?? [])].sort(
    (left, right) => left.position - right.position,
  );

  if (!workflow) {
    return <div className="text-slate-300">Loading workflow...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              Workflow editor
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{workflow.name}</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addStep}
              className="rounded-lg border border-cyan-500 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/10"
            >
              + Add step
            </button>
            <button
              onClick={saveWorkflow}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Save workflow
            </button>
            <button
              onClick={runWorkflow}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
            >
              Run workflow
            </button>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-amber-400">{errorMessage}</p>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300">Workflow name</span>
              <input
                value={workflow.name}
                onChange={(event) =>
                  updateWorkflowDetails("name", event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300">Description</span>
              <textarea
                value={workflow.description}
                onChange={(event) =>
                  updateWorkflowDetails("description", event.target.value)
                }
                className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Trigger configuration</h2>
              <button
                onClick={toggleTrigger}
                className={`rounded-full px-3 py-1 text-sm ${workflow.triggers?.[0]?.enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-300"}`}
              >
                {workflow.triggers?.[0]?.enabled
                  ? "Webhook enabled"
                  : "Webhook disabled"}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Manual runs are always available. Toggle webhook mode to expose a
              trigger endpoint for automation.
            </p>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              <div className="font-medium">Webhook</div>
              <div className="mt-2 break-all text-slate-400">
                /api/webhooks/{workflow.triggers?.[0]?.id ?? "trigger-id"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Steps</h2>
          <div className="text-sm text-slate-400">
            Reorder with the arrow controls.
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{step.name}</div>
                  <div className="text-sm text-slate-400">
                    {step.type.toUpperCase()} · Position {step.position}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={index === 0}
                    onClick={() => moveStep(index - 1, index)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    disabled={index === workflowSteps.length - 1}
                    onClick={() => moveStep(index, index + 1)}
                    className="rounded-lg border border-slate-700 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="rounded-lg border border-rose-500/40 px-3 py-1 text-sm text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <label className="block text-sm">
                  <span className="mb-2 block text-slate-300">Step name</span>
                  <input
                    value={step.name}
                    onChange={(event) =>
                      updateStep(step.id, "name", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-2 block text-slate-300">Type</span>
                  <select
                    value={step.type}
                    onChange={(event) =>
                      updateStep(step.id, "type", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    {stepTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                <div className="font-medium">Configuration</div>
                <pre className="mt-2 whitespace-pre-wrap text-slate-400">
                  {JSON.stringify(step.configuration, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold">Recent runs</h2>
        <div className="mt-5 space-y-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
            >
              <div>
                <div className="font-medium">{run.status.toUpperCase()}</div>
                <div className="text-sm text-slate-400">
                  {new Date(run.startedAt).toLocaleString()}
                </div>
              </div>
              <a
                href={`/workflows/${workflow.id}/runs/${run.id}`}
                className="text-sm font-medium text-cyan-400"
              >
                Open run
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
