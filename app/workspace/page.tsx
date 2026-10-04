"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";

interface SessionHint {
  display_name: string | null;
  store_name: string | null;
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
  const ledeLoja = who.store_name ? `Loja ${who.store_name}. ` : "";

  return (
    <div className="work-wrap">
      <h1 className="work-title">{titulo}</h1>
      <p className="work-lede">
        {ledeLoja}
        A mila responde no WhatsApp: preço, legenda, peça. Daqui você liga as
        ferramentas e vê o plano.
      </p>

      {waLink ? (
        <section className="card work-card" aria-label="Abrir conversa no WhatsApp">
          <h2>Conversar no WhatsApp</h2>
          <p className="work-card-copy">No celular a conversa já abre com Oi, mila.</p>
          <div className="work-actions">
            <a
              href={waLink}
              className="btn btn-plum"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
          </div>
          <p className="work-more">
            <Link href="/workspace/integracoes">Integrações</Link>
            <Link href="/workspace/plano">Meu plano</Link>
          </p>
          <div className="handoff-qr">
            <LocalQr
              className="qr-concept"
              value={waLink}
              size={160}
              alt="QR Code para abrir a conversa com a mila. no WhatsApp"
            />
            <p className="hint">No computador, aponte a câmera para o QR.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
