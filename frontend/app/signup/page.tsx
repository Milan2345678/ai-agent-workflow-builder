"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDemoState, setDemoState } from "@/lib/demo-state";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const state = getDemoState();

    if (state.users.some((user) => user.email === email)) {
      setError("A user with this email already exists.");
      return;
    }

    const user = {
      id: `user-${Math.random().toString(36).slice(2, 10)}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    const organizationId = `org-${Math.random().toString(36).slice(2, 10)}`;
    const membership = {
      id: `${organizationId}-member`,
      organizationId,
      userId: user.id,
      role: "member" as const,
      createdAt: new Date().toISOString(),
    };

    const organizations = [
      ...state.organizations,
      {
        id: organizationId,
        name: `${name.split(" ")[0] ?? "Workspace"}'s Org`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const updatedState = {
      ...state,
      users: [...state.users, user],
      organizations,
      memberships: [...state.memberships, membership],
      session: { currentUserId: user.id, activeOrganizationId: organizationId },
    };

    setDemoState(updatedState);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/30">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Create account
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Join the workflow builder
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Sign up to create a new organization and start building workflows.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Full name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              required
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Create account
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cyan-400">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
