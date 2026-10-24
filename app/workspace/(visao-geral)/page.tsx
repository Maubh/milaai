"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";
import type { ProviderLive } from "@/lib/integration-catalog";
import OverviewView, { type ProvidersState, type SessionState } from "./OverviewView";

export default function WorkspaceHome() {
  const [waLink, setWaLink] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [providers, setProviders] = useState<ProvidersState>({ status: "loading" });

  const load = useCallback(() => {
    setSession({ status: "loading" });
    setProviders({ status: "loading" });
    fetch("/api/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || data.ok !== true) {
          setSession({ status: "error" });
          return;
        }
        setSession({
          status: "ready",
          data: {
            display_name: typeof data.display_name === "string" ? data.display_name : null,
            store_name: typeof data.store_name === "string" ? data.store_name : null,
            plan: typeof data.plan === "string" ? data.plan : null,
            billing: typeof data.billing === "string" ? data.billing : null,
            role: typeof data.role === "string" ? data.role : null,
            trial_ends_at: typeof data.trial_ends_at === "string" ? data.trial_ends_at : null,
          },
        });
      })
      .catch(() => setSession({ status: "error" }));
    // Lista do vault, a mesma que a página de integrações lê no servidor.
    fetch("/api/oauth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.providers)) {
          setProviders({ status: "error" });
          return;
        }
        setProviders({ status: "ready", data: data.providers.filter((p: unknown): p is ProviderLive => !!p && typeof (p as ProviderLive).id === "string") });
      })
      .catch(() => setProviders({ status: "error" }));
  }, []);

  useEffect(() => {
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
    load();
  }, [load]);

  return <OverviewView session={session} providers={providers} waLink={waLink} onRetry={load} />;
}
