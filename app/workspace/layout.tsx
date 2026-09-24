"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession, type DemoSession } from "@/lib/session";
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
  const [session, setSession] = useState<DemoSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router]);

  function sair() {
    clearSession();
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
          soc<span className="brand-ia">IA</span>
        </p>
        <p className="work-hello">
          Olá, <strong>{session?.nome}</strong>
          <span>Workspace de demonstração</span>
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
          <button type="button" className="btn btn-ghost btn-sm" onClick={sair}>
            Sair da demonstração
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
