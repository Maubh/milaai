"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearOnboarding,
  getTelefone,
  getVerifiedWaLink,
  isVerified as isVerifiedPhone,
} from "@/lib/onboarding";
import "./workspace.css";

const LINKS = [
  { href: "/workspace", label: "Visão geral" },
  { href: "/workspace/precificacao", label: "Precificação" },
  { href: "/workspace/conteudo", label: "Conteúdo" },
  { href: "/workspace/integracoes", label: "Integrações" },
];

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [telefone, setTelefone] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getTelefone();
    if (!t || !isVerifiedPhone()) {
      router.replace("/login");
      return;
    }
    setTelefone(t);
    setWaLink(getVerifiedWaLink());
    setReady(true);
  }, [router]);

  function sair() {
    clearOnboarding();
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="wrap work-wrap">
        <p>Carregando…</p>
      </div>
    );
  }

  return (
    <div className="work-shell">
      <aside className="work-side" aria-label="Navegação do workspace">
        <p className="brand">
          mila<span className="brand-dot">.ai</span>
        </p>
        <p className="work-hello">
          WhatsApp <strong className="num">{telefone}</strong>
          <span>Sua área · piloto</span>
        </p>
        <nav>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={active ? "active" : ""}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="work-side-foot">
          {waLink ? (
            <a
              href={waLink}
              className="btn btn-plum btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
          ) : null}
          <button type="button" className="btn btn-ghost btn-sm" onClick={sair}>
            Sair
          </button>
          <Link href="/" className="work-back">
            ← Voltar à landing
          </Link>
        </div>
      </aside>
      <div className="work-main">{children}</div>
    </div>
  );
}
