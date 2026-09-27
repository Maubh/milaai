"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import {
  clearOnboarding,
  defaultWaLink,
  getTelefone,
  getVerifiedWaLink,
} from "@/lib/onboarding";

const LINKS = [
  { href: "/workspace", label: "Visão geral" },
  { href: "/workspace/precificacao", label: "Precificação" },
  { href: "/workspace/conteudo", label: "Conteúdo" },
  { href: "/workspace/integracoes", label: "Integrações" },
];

/**
 * Chrome do workspace (client).
 *
 * A porta já foi aberta no servidor pelo cookie — este componente só cuida do
 * que precisa de interatividade e de storage. Nada aqui autoriza nada: o
 * telefone é exibição, não prova de login.
 */
export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    // Depois da montagem: o servidor não tem esses valores, então preencher no
    // efeito evita divergência de hidratação.
    setTelefone(getTelefone());
    // Já estamos autenticadas (o servidor conferiu o cookie), então o CTA
    // existe mesmo sem nada no storage — ex.: abriu em outro navegador.
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
  }, []);

  async function sair() {
    // A sessão é HttpOnly: limpar só o localStorage não a encerra.
    // Chamamos a rota BFF que revoga no auth server e expira o cookie.
    try {
      await fetch("/api/auth/logout", { method: "POST", keepalive: true });
    } finally {
      clearOnboarding();
      router.replace("/login");
    }
  }

  return (
    <div className="work-shell">
      <aside className="work-side" aria-label="Navegação do workspace">
        <p className="brand" aria-label="mila.">
          <BrandLogo height={26} alt="" />
        </p>
        <p className="work-hello">
          {telefone ? (
            <>
              WhatsApp <strong className="num">{telefone}</strong>
            </>
          ) : (
            <>Sua conta</>
          )}
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
