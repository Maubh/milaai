"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SYSTEM_VERSION } from "@/lib/releases";

const LAST_SEEN_KEY = "mila:last-seen-release:v1";
const RELEASES_PATH = "/workspace/novidades";

export default function ReleaseLink({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(false);
  const active = pathname === RELEASES_PATH;

  useEffect(() => {
    const latestVersion = SYSTEM_VERSION;
    try {
      if (active) {
        localStorage.setItem(LAST_SEEN_KEY, latestVersion);
        setUnread(false);
      } else {
        setUnread(localStorage.getItem(LAST_SEEN_KEY) !== latestVersion);
      }
    } catch {
      // Reading release notes remains available when browser storage is blocked.
      setUnread(false);
    }
  }, [active]);

  return <Link href={RELEASES_PATH} className={`workspace-nav-item workspace-release-link${active ? " is-active" : ""}`} aria-label={`Atualizações, versão ${SYSTEM_VERSION}${unread ? ", atualização não lida" : ""}`} aria-current={active ? "page" : undefined} title={`Atualizações · v${SYSTEM_VERSION}`} onClick={onNavigate}>
    <span className="workspace-release-icon">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8m-8 4h8m-8 4h4" /></svg>
      {unread ? <span className="workspace-release-dot" aria-hidden="true" /> : null}
    </span>
    <span className="workspace-release-label">Atualizações</span>
    <span className="workspace-release-version">v{SYSTEM_VERSION}</span>
  </Link>;
}
