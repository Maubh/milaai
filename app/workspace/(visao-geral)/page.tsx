"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";
import OverviewView, { type SessionState } from "./OverviewView";

export default function WorkspaceHome() {
  const [waLink, setWaLink] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  const load = useCallback(() => {
    setSession({ status: "loading" });
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
            connected: Array.isArray(data.connected) ? data.connected.filter((id: unknown): id is string => typeof id === "string") : [],
          },
        });
      })
      .catch(() => setSession({ status: "error" }));
  }, []);

  useEffect(() => {
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
    load();
  }, [load]);

  return <OverviewView session={session} waLink={waLink} onRetry={load} />;
}
