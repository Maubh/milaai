"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/site.css";
import "@/app/site-v2.css";

/**
 * Menu das páginas internas (termos, privacidade, login...): a pílula da home, no tom claro,
 * sem os atalhos das seções da home. Marca, volta ao site e, fora do login, o botão Começar.
 */
export default function SiteHeader() {
  const isAuth = usePathname()?.startsWith("/login");

  return (
    <header className="sh">
      <Link href="/" className="sh-mark" aria-label="mila. — início">
        <img src="/brand/vectors/wordmark-mineral.svg" alt="" width="88" height="32" />
      </Link>
      <div className="sh-right">
        <Link href="/" className="sh-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5m6 6-6-6 6-6" />
          </svg>
          Voltar ao site
        </Link>
        {!isAuth && (
          <Link href="/login" className="sh-cta">
            Começar
          </Link>
        )}
      </div>
    </header>
  );
}
