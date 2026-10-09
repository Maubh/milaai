"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import ReleaseLink from "@/components/ReleaseLink";
import {
  clearOnboarding,
  defaultWaLink,
  getTelefone,
  getVerifiedWaLink,
} from "@/lib/onboarding";
import "./workspace-shell.css";

const LINKS = [
  { href: "/workspace", label: "Visão geral", icon: "overview" as const },
  { href: "/workspace/integracoes", label: "Integrações", icon: "integrations" as const },
  { href: "/workspace/plano", label: "Meu plano", icon: "plan" as const },
];


type WorkspaceIconName = "overview" | "integrations" | "plan" | "chat" | "logout" | "panel" | "menu" | "close" | "arrow" | "chevron";
function WorkspaceIcon({ name }: { name: WorkspaceIconName }) {
  const paths: Record<WorkspaceIconName, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    integrations: <><path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4" /></>,
    plan: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    chat: <><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.5a9 9 0 1 1 16.6-5Z" /><path d="M8 11h8m-8 4h5" /></>,
    logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m5-13 5 5-5 5m-5-5h11" /></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
  };
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function WorkspaceAccount({ name, store, initials, loggingOut, onLogout, collapsed, mobile = false, visible = true }: { name: string; store: string; initials: string; loggingOut: boolean; onLogout: () => void; collapsed: boolean; mobile?: boolean; visible?: boolean }) {
  const [open, setOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const logoutAction = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);
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
  return <div ref={account} className="workspace-account" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    {mobile || open ? <div id={menuId} className={`workspace-account-menu${mobile ? " workspace-account-menu-inline" : ""}`} data-open={open} inert={!open} aria-hidden={!open}>
      <div className="workspace-account-menu-content">
        <button ref={logoutAction} type="button" className="workspace-nav-item workspace-logout" onClick={onLogout} disabled={loggingOut}>
          <WorkspaceIcon name="logout" /><span>{loggingOut ? "Saindo…" : "Sair da conta"}</span>
        </button>
      </div>
    </div> : null}
    <button ref={trigger} type="button" className="workspace-profile" title={collapsed ? undefined : `${name} · ${store}`} data-tooltip={collapsed ? "Opções da conta" : undefined} aria-label={`Opções da conta de ${name}`} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>
      <span className="workspace-avatar" aria-hidden="true">{initials}</span>
      <span className="workspace-profile-copy"><strong>{name}</strong><span>{store}</span></span>
      <span className="workspace-account-chevron"><WorkspaceIcon name="chevron" /></span>
    </button>
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
  const pathname = usePathname();
  const router = useRouter();
  const drawerId = useId();
  const mobileDrawer = useRef<HTMLDialogElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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
    const dialog = mobileDrawer.current;
    if (!dialog) return;
    if (!menuOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
      const activeLink = dialog.querySelector<HTMLAnchorElement>(".workspace-nav a[aria-current='page']") ?? dialog.querySelector<HTMLAnchorElement>(".workspace-nav a");
      activeLink?.focus({ preventScroll: true });
    }
    const previousOverflow = document.body.style.overflowY;
    const previousRootOverflow = document.documentElement.style.overflowY;
    document.body.style.overflowY = "clip";
    document.documentElement.style.overflowY = "clip";
    return () => {
      document.body.style.overflowY = previousOverflow;
      document.documentElement.style.overflowY = previousRootOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeMobileMenu = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeMobileMenu);
    return () => desktop.removeEventListener("change", closeMobileMenu);
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

  const activePage = pathname === "/workspace/novidades" ? "Atualizações" : LINKS.find((link) => pathname === link.href || (link.href !== "/workspace" && pathname.startsWith(`${link.href}/`)))?.label ?? "Sua loja";
  const accountName = hello.name || (telefone ? `WhatsApp ${telefone}` : "Sua conta");
  const storeName = hello.store || "Sua loja";
  const initials = accountName.replace(/\([^)]*\)/g, "").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  function containMobileFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"))
      .filter((control) => !control.closest("[inert]") && control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    const destination = event.shiftKey && document.activeElement === first ? last
      : !event.shiftKey && document.activeElement === last ? first : null;
    if (!destination) return;
    event.preventDefault();
    destination.focus({ preventScroll: true });
  }

  function sidebarContent(includeBrand = true) {
    return <>
      {includeBrand ? <Link href="/workspace" className="workspace-brand" data-tooltip={collapsed ? "Visão geral" : undefined} aria-label="mila. — visão geral" onClick={() => setMenuOpen(false)}>
        <img className="workspace-symbol" src="/brand/vectors/symbol-mineral.svg" alt="" width="32" height="22" />
        <BrandLogo className="workspace-wordmark" height={28} alt="" />
      </Link> : null}
      <nav className="workspace-nav" aria-label="Sua loja">
        {LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/workspace" && pathname.startsWith(`${link.href}/`));
          return <Link key={link.href} href={link.href} className={`workspace-nav-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} aria-label={link.label} data-tooltip={collapsed ? link.label : undefined} onClick={() => setMenuOpen(false)}>
            <WorkspaceIcon name={link.icon} />
            <span className="workspace-nav-label">{link.label}</span>
            {active ? <span className="workspace-active-dot" aria-hidden="true" /> : null}
          </Link>;
        })}
      </nav>
      <div className="workspace-side-bottom">
        {waLink ? <a href={waLink} className="workspace-nav-item workspace-whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Abrir WhatsApp" data-tooltip={collapsed ? "Abrir WhatsApp" : undefined}>
          <WorkspaceIcon name="chat" />
          <span className="workspace-nav-label">Abrir WhatsApp</span>
          <span className="workspace-external"><WorkspaceIcon name="arrow" /></span>
        </a> : null}
        <WorkspaceAccount name={accountName} store={storeName} initials={initials} loggingOut={loggingOut} onLogout={sair} collapsed={includeBrand && collapsed} mobile={!includeBrand} visible={includeBrand || menuOpen} />
      </div>
    </>;
  }

  return (
    <div className={`work-shell workspace-shell${collapsed ? " is-sidebar-collapsed" : ""}`}>
      <aside className="workspace-sidebar" aria-label="Navegação do workspace">
        {sidebarContent()}
      </aside>
      <div className="workspace-content" inert={menuOpen}>
        <header className="workspace-toolbar">
          <button type="button" className="workspace-icon-button workspace-desktop-toggle" onClick={() => setCollapsed((previous) => !previous)} aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"} aria-expanded={!collapsed}>
            <WorkspaceIcon name="panel" />
          </button>
          <button type="button" className="workspace-icon-button workspace-mobile-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls={drawerId}>
            <WorkspaceIcon name="menu" />
          </button>
          <Link href="/workspace" className="workspace-mobile-brand" aria-label="mila. — visão geral"><BrandLogo className="workspace-wordmark" height={24} alt="" /></Link>
          <div className="workspace-breadcrumb"><span>Sua loja</span><span aria-hidden="true">/</span><strong>{activePage}</strong></div>
          <ReleaseLink onNavigate={() => setMenuOpen(false)} />
        </header>
        <div className="work-main workspace-main">{children}</div>
      </div>
      <dialog ref={mobileDrawer} id={drawerId} className="workspace-mobile-drawer" aria-label="Menu da sua loja" onKeyDown={containMobileFocus} onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)}>
        <div className="workspace-drawer-header">
          <button type="button" className="workspace-icon-button workspace-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><WorkspaceIcon name="close" /></button>
          <Link href="/workspace" className="workspace-mobile-brand" aria-label="mila. — visão geral" onClick={() => setMenuOpen(false)}><BrandLogo className="workspace-wordmark" height={24} alt="" /></Link>
        </div>
        {sidebarContent(false)}
      </dialog>
    </div>
  );
}
