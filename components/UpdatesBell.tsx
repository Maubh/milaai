"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { RELEASES_PATH, useReleaseStatus } from "@/components/ReleaseLink";
import { RELEASES } from "@/lib/releases";

const RECENT = RELEASES.slice(0, 3);
const releaseDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function BellIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></svg>;
}

/**
 * Atualizações no sino do topo. Mostra as versões publicadas, não notificações:
 * o ponto é a versão atual ainda não vista. Abrir o painel mostra o resumo real
 * dessa versão, então conta como visto, como visitar a página.
 *
 * Painel não modal: o foco fica no sino, Tab entra no painel (vem logo depois
 * no DOM), Esc fecha e devolve o foco ao sino, clique fora, troca de rota e
 * qualquer link do painel fecham (em /novidades o link só muda o hash).
 */
export default function UpdatesBell() {
  const release = useReleaseStatus();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const icon = useAnimationControls();
  const [open, setOpen] = useState(false);
  const [freshAtOpen, setFreshAtOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setFreshAtOpen(release.unread);
    release.markSeen();
    setOpen(true);
    if (!reduce) icon.start({ scale: [0.8, 1.07, 1], transition: { duration: 0.55, times: [0, 0.4, 1], ease: [0.16, 1, 0.3, 1] } });
  }

  return <div ref={wrap} className="desk-bell" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <button
      ref={trigger}
      type="button"
      className="desk-round"
      data-active={release.active || undefined}
      aria-label={release.label}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      onClick={toggle}
    >
      <motion.span className="desk-round-icon" animate={icon}><BellIcon /></motion.span>
      {release.unread ? <span className="desk-round-dot" aria-hidden="true" /> : null}
    </button>
    <AnimatePresence>
      {open ? <motion.div
        key="updates"
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        className="desk-pop"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
        transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 30, mass: 0.7 }}
      >
        <div className="desk-pop-head">
          <h2 id={titleId} className="desk-pop-title">Atualizações</h2>
          <span className="desk-pop-meta">Versão {release.version}</span>
        </div>
        <ul className="desk-pop-list">
          {RECENT.map((item, index) => {
            const fresh = index === 0 && freshAtOpen;
            return <li key={item.version}>
              <Link href={`${RELEASES_PATH}#release-${item.version}`} className="desk-pop-row" data-fresh={fresh || undefined} onClick={() => setOpen(false)}>
                <span className="desk-pop-row-meta">v{item.version} · {releaseDate.format(new Date(`${item.date}T12:00:00Z`))}{fresh ? <span className="desk-pop-new">Nova</span> : null}</span>
                <span className="desk-pop-row-title">{item.title}</span>
              </Link>
            </li>;
          })}
        </ul>
        <Link href={RELEASES_PATH} className="desk-pop-all" onClick={() => setOpen(false)}>Ver todas as atualizações</Link>
      </motion.div> : null}
    </AnimatePresence>
  </div>;
}
