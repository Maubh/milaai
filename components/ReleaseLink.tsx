"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import ReleaseTimeline from "@/components/ReleaseTimeline";
import "./release-updates.css";

const LAST_SEEN_KEY = "mila:last-seen-release:v1";
const RELEASES_PATH = "/workspace/novidades";

export default function ReleaseLink({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const titleId = useId();
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

  useEffect(() => { dialog.current?.close(); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function showUpdates() {
    onNavigate();
    dialog.current?.showModal();
    setOpen(true);
    setUnread(false);
    try { localStorage.setItem(LAST_SEEN_KEY, SYSTEM_VERSION); } catch { /* Storage opcional. */ }
  }

  return <>
  <button ref={trigger} type="button" className={`workspace-nav-item workspace-release-link${active ? " is-active" : ""}`} aria-label={`Atualizações, versão ${SYSTEM_VERSION}${unread ? ", atualização não lida" : ""}`} aria-haspopup="dialog" aria-controls={dialogId} aria-expanded={open} title={`Atualizações · v${SYSTEM_VERSION}`} onClick={showUpdates}>
    <span className="workspace-release-icon">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8m-8 4h8m-8 4h4" /></svg>
      {unread ? <span className="workspace-release-dot" aria-hidden="true" /> : null}
    </span>
    <span className="workspace-release-label">Atualizações</span>
    <span className="workspace-release-version">v{SYSTEM_VERSION}</span>
  </button>
  <dialog ref={dialog} id={dialogId} className="release-updates-dialog" aria-labelledby={titleId}
    onClose={() => { setOpen(false); trigger.current?.focus(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
    }}>
    <header className="release-updates-header">
      <div><h1 id={titleId}>Atualizações</h1><p>O que há de novo na Mila.</p></div>
      <button className="release-updates-close" type="button" onClick={() => dialog.current?.close()} aria-label="Fechar atualizações" autoFocus>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
      </button>
    </header>
    <div className="release-updates-content"><ReleaseTimeline releases={RELEASES.slice(0, 3)} compact /></div>
    <footer className="release-updates-footer">
      <Link href={RELEASES_PATH} onClick={() => dialog.current?.close()}>Ver todas as atualizações <span aria-hidden="true">↗</span></Link>
    </footer>
  </dialog>
  </>;
}
