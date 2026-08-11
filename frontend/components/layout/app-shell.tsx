"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  getCurrentMembership,
  getDemoState,
  resetDemoState,
  setDemoState,
} from "@/lib/demo-state";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workflows", label: "Workflows" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const state = getDemoState();
  const activeUser =
    state.users.find(
      (candidate) => candidate.id === state.session.currentUserId,
    ) ?? null;
  const activeOrganizationId = state.session.activeOrganizationId;
  const organizations = state.organizations;

  const activeOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) ?? null,
    [activeOrganizationId, organizations],
  );
  const currentMembership = useMemo(() => {
    if (!activeUser || !activeOrganizationId) {
      return null;
    }

    return getCurrentMembership(state, activeUser.id, activeOrganizationId);
  }, [activeOrganizationId, activeUser, state]);
  const availableOrganizations = useMemo(() => {
    if (!activeUser) {
      return [];
    }

    return organizations.filter((organization) =>
      state.memberships.some(
        (membership) =>
          membership.organizationId === organization.id &&
          membership.userId === activeUser.id,
      ),
    );
  }, [activeUser, organizations, state.memberships]);

  const handleLogout = () => {
    const state = getDemoState();
    setDemoState({
      ...state,
      session: { currentUserId: null, activeOrganizationId: null },
    });
    router.push("/login");
  };

  const handleResetDemo = () => {
    const nextState = resetDemoState();
    setDemoState({
      ...nextState,
      session: {
        currentUserId: nextState.session.currentUserId,
        activeOrganizationId: nextState.session.activeOrganizationId,
      },
    });
    router.refresh();
  };

  const handleOrganizationChange = (organizationId: string) => {
    const nextState = getDemoState();
    setDemoState({
      ...nextState,
      session: {
        ...nextState.session,
        activeOrganizationId: organizationId,
      },
    });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              AI Agent Workflow Builder
            </p>
            <div className="mt-1 text-sm text-slate-400">
              {activeOrganization?.name ?? "No organization"}
            </div>
            {activeUser ? (
              <div className="text-xs text-slate-500">
                Signed in as {activeUser.email}
              </div>
            ) : null}
            {currentMembership ? (
              <div className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                Role: {currentMembership.role}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {availableOrganizations.length > 1 ? (
              <select
                value={activeOrganizationId ?? ""}
                onChange={(event) =>
                  handleOrganizationChange(event.target.value)
                }
                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200"
              >
                {availableOrganizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            ) : null}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${pathname === item.href ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleResetDemo}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Reset demo
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
