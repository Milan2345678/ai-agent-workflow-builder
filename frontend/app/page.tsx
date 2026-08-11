import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-black/20">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
        AI Agent Workflow Builder
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
        Create, run, and monitor multi-step AI workflows in one place.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-400">
        Design organization-scoped workflows, add LLM, HTTP, condition, and
        approval steps, and run them with a clear execution timeline.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/login"
          className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Open app
        </Link>
        <Link
          href="/workflows"
          className="rounded-full border border-slate-700 px-6 py-3 font-medium text-slate-200 transition hover:bg-slate-800"
        >
          Browse workflows
        </Link>
      </div>
    </main>
  );
}
