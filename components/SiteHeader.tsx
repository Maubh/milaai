"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/site.css";
import "@/app/site-v2.css";

/** As seções da home, as mesmas do menu dela. */
const SECOES = [
  { href: "/#rotina", label: "Rotina" },
  { href: "/#integracoes", label: "Integrações" },
  { href: "/#planos", label: "Planos" },
  { href: "/#duvidas", label: "Dúvidas" },
];

/** Menu das páginas internas: a pílula da home, no tom claro. No login, só a marca e a volta ao site. */
export default function SiteHeader() {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith("/login");
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header ref={navRef} className="sh" data-open={open}>
      <Link href="/" className="sh-mark" aria-label="mila. — início">
        <img src="/brand/vectors/wordmark-mineral.svg" alt="" width="88" height="32" />
      </Link>
      {isAuth ? (
        <Link href="/" className="sh-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5m6 6-6-6 6-6" />
          </svg>
          Voltar ao site
        </Link>
      ) : (
        <>
          <ul className="sh-links">
            {SECOES.map((s) => (
              <li key={s.href}>
                <Link href={s.href}>{s.label}</Link>
              </li>
            ))}
          </ul>
          <div className="sh-right">
            <Link href="/login" className="sh-cta">
              Começar
            </Link>
            <button
              ref={buttonRef}
              type="button"
              className="sh-toggle"
              aria-expanded={open}
              aria-controls="sh-drawer"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
            </button>
          </div>
          <nav id="sh-drawer" className="sh-drawer" aria-label="Seções">
            {SECOES.map((s) => (
              <Link key={s.href} href={s.href} onClick={() => setOpen(false)}>
                {s.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
