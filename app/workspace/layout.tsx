"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearOnboarding, getTelefone, isVerified as isVerifiedPhone } from "@/lib/onboarding";
import "./workspace.css";

const LINKS = [
  { href: "/workspace", label: "Visão geral" },
  { href: "/workspace/precificacao", label: "Precificação" },
  { href: "/workspace/conteudo", label: "Conteúdo" },
  { href: "/workspace/integracoes", label: "Integrações" },
  { href: "/conversa", label: "Conversa" },
];

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [telefone, setTelefone] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getTelefone();
    if (!t || !isVerifiedPhone()) {
      router.replace("/login");
      return;
    }
    setTelefone(t);
    setReady(true);
  }, [router]);

  function sair() {
    clearOnboarding();
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="wrap work-wrap">
        <p>Carregando demonstração…</p>
      </div>
    );
  }

  return (
    <div className="work-shell">
      <aside className="work-side" aria-label="Navegação do workspace">
        <p className="brand">
          mila<span className="brand-dot">.</span>
        </p>
        <p className="work-hello">
          Número simulado <strong className="num">{telefone}</strong>
          <span>Workspace de apoio · simulação</span>
        </p>
        <nav>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="work-side-foot">
          <Link href="/conversa" className="btn btn-plum btn-sm">
            Continuar conversa simulada
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={sair}>
            Sair da simulação
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
