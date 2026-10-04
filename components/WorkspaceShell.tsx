"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import {
  clearOnboarding,
  defaultWaLink,
  getTelefone,
  getVerifiedWaLink,
} from "@/lib/onboarding";
import "./workspace-mobile.css";

const LINKS = [
  { href: "/workspace", label: "Visão geral" },
  { href: "/workspace/integracoes", label: "Integrações" },
  { href: "/workspace/plano", label: "Meu plano" },
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
  const drawerId = useId();
  const [telefone, setTelefone] = useState("");
  const [waLink, setWaLink] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hello, setHello] = useState<{ name: string | null; store: string | null }>({
    name: null,
    store: null,
  });

  useEffect(() => {
    // Depois da montagem: o servidor não tem esses valores, então preencher no
    // efeito evita divergência de hidratação.
    setTelefone(getTelefone());
    // Já estamos autenticadas (o servidor conferiu o cookie), então o CTA
    // existe mesmo sem nada no storage — ex.: abriu em outro navegador.
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
    fetch("/api/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setHello({
          name: typeof data.display_name === "string" ? data.display_name : null,
          store: typeof data.store_name === "string" ? data.store_name : null,
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
    <div className={`work-shell${menuOpen ? " is-menu-open" : ""}`}>
      <aside className="work-side" aria-label="Navegação do workspace">
        <div className="work-bar">
          <p className="brand work-bar-brand" aria-label="mila.">
            <BrandLogo height={24} alt="" />
          </p>
          <button
            type="button"
            className="work-burger"
            aria-expanded={menuOpen}
            aria-controls={drawerId}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true" className={menuOpen ? "is-open" : ""}>
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
        <div id={drawerId} className={`work-drawer${menuOpen ? " is-open" : ""}`}>
          <p className="brand work-drawer-brand" aria-label="mila.">
            <BrandLogo height={26} alt="" />
          </p>
          <p className="work-hello">
            {hello.name ? (
              <strong>{hello.name}</strong>
            ) : telefone ? (
              <>
                WhatsApp <strong className="num">{telefone}</strong>
              </>
            ) : (
              <>Sua conta</>
            )}
            <span>{hello.store ? hello.store : "Sua área"}</span>
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
          </div>
        </div>
      </aside>
      <div className="work-main">{children}</div>
    </div>
  );
}
