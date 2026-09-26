"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "@/app/site.css";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
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
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open ]);

  return (
    <header className="site-header site-header-minimal">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand brand-small" aria-label="mila.ai — início">
          mila<span className="brand-dot" aria-hidden="true">.ai</span>
        </Link>
        <nav className="site-header-nav" aria-label="Navegação principal">
          <Link href="#planos" className="site-header-link">
            Planos
          </Link>
          <Link href="#faq" className="site-header-link">
            Dúvidas
          </Link>
          <Link href="/login" className="site-header-btn">
            Começar
          </Link>
        </nav>
        <button
          ref={buttonRef}
          type="button"
          className="site-header-toggle"
          aria-expanded={open}
          aria-controls="site-header-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className={open ? "is-open" : ""}>
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
      <div ref={panelRef} className="site-header-menuwrap" hidden={!open}>
        <nav id="site-header-menu" className="site-header-menu" aria-label="Menu móvel">
          <Link href="#planos" className="site-header-menu-link" onClick={() => setOpen(false)}>
            Planos
          </Link>
          <Link href="#faq" className="site-header-menu-link" onClick={() => setOpen(false)}>
            Dúvidas
          </Link>
          <Link href="/login" className="site-header-menu-btn" onClick={() => setOpen(false)}>
            Começar
          </Link>
        </nav>
      </div>
    </header>
  );
}
