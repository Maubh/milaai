"use client";

import { useState } from "react";
import Link from "next/link";
import "@/app/site.css";

const NAV = [
  { href: "/#raio-x", label: "Raio-X" },
  { href: "/#conversa", label: "Conversa" },
  { href: "/#rotina", label: "Rotina" },
  { href: "/#planos", label: "Planos" },
  { href: "/#faq", label: "Perguntas" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand" aria-label="socIA — início">
          soc<span className="brand-ia">IA</span>
        </Link>
        <nav className="site-nav" aria-label="Navegação principal">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="site-header-actions">
          <Link href="/login" className="btn btn-plum btn-sm">
            Explorar demonstração
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
            <span aria-hidden="true" className={open ? "bars open" : "bars"}>
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Menu móvel">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <Link href="/login" className="btn btn-plum" onClick={() => setOpen(false)}>
            Explorar demonstração
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
