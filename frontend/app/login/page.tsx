"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getDemoState, setDemoState } from "@/lib/demo-state";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ava@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeUser = useMemo(() => {
    const state = getDemoState();
    return state.users.find((user) => user.email === email);
  }, [email]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const state = getDemoState();
    const user = state.users.find(
      (candidate) =>
        candidate.email === email && candidate.password === password,
    );

    if (!user) {
      setError("The supplied credentials are invalid.");
      setLoading(false);
      return;
    }

    setDemoState({
      ...state,
      session: {
        currentUserId: user.id,
        activeOrganizationId:
          state.memberships.find((membership) => membership.userId === user.id)
            ?.organizationId ?? null,
      },
    });

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            AI Agent Workflow Builder
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Sign in to your workspace
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Use a demo account to explore organization-scoped workflows.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-0"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-0"
              required
            />
          </label>

          {activeUser && (
            <p className="text-sm text-cyan-400">
              Demo user detected: {activeUser.name}
            </p>
          )}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-cyan-400">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
