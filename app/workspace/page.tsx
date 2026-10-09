"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";
import "./overview.css";

interface SessionHint {
  display_name: string | null;
  store_name: string | null;
}

function OverviewIcon({ name }: { name: "chat" | "integrations" | "plan" | "arrow" }) {
  const paths = {
    chat: <><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-4.5a9 9 0 1 1 16.6-5Z" /><path d="M8 11h8m-8 4h5" /></>,
    integrations: <path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4" />,
    plan: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };
  return <svg className={name === "arrow" ? "overview-action-arrow" : undefined} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function WorkspaceHome() {
  const [waLink, setWaLink] = useState<string | null>(null);
  const [who, setWho] = useState<SessionHint>({ display_name: null, store_name: null });

  useEffect(() => {
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
    fetch("/api/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setWho({
          display_name: typeof data.display_name === "string" ? data.display_name : null,
          store_name: typeof data.store_name === "string" ? data.store_name : null,
        });
      })
      .catch(() => undefined);
  }, []);

  const titulo = who.display_name ? `Olá, ${who.display_name}` : "Olá";

  return (
    <div className="overview">
      <header className="overview-welcome">
        <h1>{titulo}</h1>
        {who.store_name ? <p className="overview-store">{who.store_name}</p> : null}
      </header>

      <section className="overview-conversation" aria-labelledby="overview-conversation-title">
        <div className="overview-conversation-copy">
          <div className="overview-channel"><OverviewIcon name="chat" />No WhatsApp</div>
          <h2 id="overview-conversation-title">Conversar com a mila</h2>
          <p className="overview-conversation-description">
            Preço, legenda ou ajuda com uma peça. A mila responde no WhatsApp.
          </p>
          {waLink ? (
            <a href={waLink} className="overview-chat-action" target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp <OverviewIcon name="arrow" />
            </a>
          ) : (
            <button className="overview-chat-action" type="button" disabled>Abrir WhatsApp <OverviewIcon name="arrow" /></button>
          )}
          <p className="overview-action-hint">A conversa já abre com “Oi, mila”.</p>
        </div>
        <figure className="overview-qr">
          <LocalQr className="overview-qr-code" value={waLink ?? ""} size={160} alt="QR code para conversar com a mila no WhatsApp" />
          <figcaption>
            <strong>Abra no celular</strong>
            <p>Aponte a câmera para o QR code.</p>
          </figcaption>
        </figure>
      </section>

      <section className="overview-management" aria-labelledby="overview-management-title">
        <h2 id="overview-management-title">Ferramentas e plano</h2>
        <div className="overview-destinations">
          <Link href="/workspace/integracoes" className="overview-destination">
            <OverviewIcon name="integrations" />
            <div><strong>Integrações</strong><p>Conecte as ferramentas que sua loja já usa.</p></div>
            <OverviewIcon name="arrow" />
          </Link>
          <Link href="/workspace/plano" className="overview-destination">
            <OverviewIcon name="plan" />
            <div><strong>Meu plano</strong><p>Veja seu plano e os recursos incluídos.</p></div>
            <OverviewIcon name="arrow" />
          </Link>
        </div>
      </section>
    </div>
  );
}
