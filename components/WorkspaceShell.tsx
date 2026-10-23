"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import BrandLogo from "@/components/BrandLogo";
import { RELEASES_PATH, useReleaseStatus } from "@/components/ReleaseLink";
import {
  clearOnboarding,
  defaultWaLink,
  getTelefone,
  getVerifiedWaLink,
} from "@/lib/onboarding";
import "./workspace-shell.css";

type DestinationIcon = "overview" | "integrations" | "plan" | "updates";
const LINKS: Array<{ href: string; label: string; icon: DestinationIcon }> = [
  { href: "/workspace", label: "Visão geral", icon: "overview" },
  { href: "/workspace/integracoes", label: "Integrações", icon: "integrations" },
  { href: "/workspace/plano", label: "Meu plano", icon: "plan" },
  { href: RELEASES_PATH, label: "Atualizações", icon: "updates" },
];

type WorkspaceIconName = DestinationIcon | "chat" | "logout" | "chevron";
function WorkspaceIcon({ name }: { name: WorkspaceIconName }) {
  const paths: Record<WorkspaceIconName, React.ReactNode> = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" /></>,
    integrations: <path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4" />,
    plan: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    updates: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8m-8 4h8m-8 4h4" /></>,
    chat: <><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.5a9 9 0 1 1 16.6-5Z" /><path d="M8 11h8m-8 4h5" /></>,
    logout: <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m5-13 5 5-5 5m-5-5h11" />,
    chevron: <path d="m8 10 4 4 4-4" />,
  };
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/workspace" && pathname.startsWith(`${href}/`));
}

/** Os quatro destinos. O mesmo componente desenha a cápsula do desktop e o dock do celular. */
function DeskNav({ variant }: { variant: "bar" | "dock" }) {
  const pathname = usePathname();
  const release = useReleaseStatus();
  return <nav className={`desk-nav desk-nav-${variant}`} aria-label="Sua loja">
    {LINKS.map((link) => {
      const active = isActive(pathname, link.href);
      const isRelease = link.href === RELEASES_PATH;
      return <Link key={link.href} href={link.href} className={`desk-nav-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} aria-label={isRelease ? release.label : undefined}>
        {active ? <motion.span layoutId={`desk-pill-${variant}`} className="desk-nav-pill" transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }} aria-hidden="true" /> : null}
        {variant === "dock" ? <span className="desk-nav-icon"><WorkspaceIcon name={link.icon} /></span> : null}
        <span className="desk-nav-label">{link.label}</span>
        {isRelease && variant === "bar" ? <span className="desk-nav-version">v{release.version}</span> : null}
        {/* O lugar do ponto é fixo: lido ou não, o item mede o mesmo e a pílula não se desloca. */}
        {isRelease ? <span className="desk-nav-dot" data-unread={release.unread} aria-hidden="true" /> : null}
      </Link>;
    })}
  </nav>;
}

function WorkspaceAccount({ name, store, initials, loggingOut, onLogout }: { name: string; store: string; initials: string; loggingOut: boolean; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const logoutAction = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    logoutAction.current?.focus({ preventScroll: true });
    function outside(event: PointerEvent) {
      if (!account.current?.contains(event.target as Node)) setOpen(false);
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

  return <div ref={account} className="desk-account" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <button ref={trigger} type="button" className="desk-avatar-button" title={`${name} · ${store}`} aria-label={`Opções da conta de ${name}`} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>
      <span className="desk-avatar" aria-hidden="true">{initials}</span>
      <span className="desk-account-chevron"><WorkspaceIcon name="chevron" /></span>
    </button>
    {open ? <div id={menuId} className="desk-account-menu">
      <div className="desk-account-who">
        <strong>{name}</strong>
        <span>{store}</span>
      </div>
      <button ref={logoutAction} type="button" className="desk-logout" onClick={onLogout} disabled={loggingOut}>
        <WorkspaceIcon name="logout" /><span>{loggingOut ? "Saindo…" : "Sair da conta"}</span>
      </button>
    </div> : null}
  </div>;
}

/**
 * Chrome do workspace (client).
 *
 * A porta já foi aberta no servidor pelo cookie — este componente só cuida do
 * que precisa de interatividade e de storage. Nada aqui autoriza nada: o
 * telefone é exibição, não prova de login.
 */
export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [waLink, setWaLink] = useState<string | null>(null);
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

  async function sair() {
    if (loggingOut) return;
    setLoggingOut(true);
    // A sessão é HttpOnly: limpar só o localStorage não a encerra.
    // Chamamos a rota BFF que revoga no auth server e expira o cookie.
    try {
      await fetch("/api/auth/logout", { method: "POST", keepalive: true });
    } finally {
      clearOnboarding();
      router.replace("/login");
    }
  }

  const accountName = hello.name || (telefone ? `WhatsApp ${telefone}` : "Sua conta");
  const storeName = hello.store || "Sua loja";
  const initials = accountName.replace(/\([^)]*\)/g, "").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <MotionConfig reducedMotion="user">
      <div className="desk-shell">
        <header className="desk-bar">
          <div className="desk-bar-row">
            <div className="desk-brand">
              <Link href="/workspace" className="desk-brand-link" aria-label="mila. — visão geral">
                <BrandLogo className="desk-wordmark" height={24} alt="" />
              </Link>
              <span className="desk-store" title={storeName}>{storeName}</span>
            </div>
            <DeskNav variant="bar" />
            <div className="desk-bar-actions">
              {/* Texto longo no desktop largo, curto no resto: o CSS mostra um dos dois. */}
              {waLink ? <a href={waLink} className="desk-chat" target="_blank" rel="noopener noreferrer">
                <WorkspaceIcon name="chat" />
                <span className="desk-chat-long">Conversar com a mila</span>
                <span className="desk-chat-short">WhatsApp</span>
              </a> : null}
              <WorkspaceAccount name={accountName} store={storeName} initials={initials} loggingOut={loggingOut} onLogout={sair} />
            </div>
          </div>
        </header>
        <div className="desk-main">{children}</div>
        <DeskNav variant="dock" />
      </div>
    </MotionConfig>
  );
}
