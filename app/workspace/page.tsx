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
  const ledeLoja = who.store_name
    ? `Esta é a área da ${who.store_name}. `
    : "";

  return (
    <div className="work-wrap">
      <p className="tag">Área logada · piloto</p>
      <h1 className="work-title">{titulo}</h1>
      <p className="work-lede">
        {ledeLoja}
        Precificação, legendas e o dia a dia da loja acontecem no WhatsApp com a mila.
        Aqui você só conecta as ferramentas e acompanha o plano.
      </p>

      {waLink ? (
        <section className="card work-card" aria-label="Abrir conversa no WhatsApp" style={{ marginBottom: "1.4rem" }}>
          <h2>Falar com a mila.</h2>
          <p style={{ fontSize: "0.93rem", color: "rgba(39,35,38,0.72)" }}>
            Abra a conversa no celular. A mensagem já vem pronta: “Oi, mila.”
          </p>
          <div className="work-actions" style={{ marginTop: "0.85rem" }}>
            <a
              href={waLink}
              className="btn btn-plum"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
            <Link href="/workspace/integracoes" className="btn btn-ghost btn-sm">
              Ver integrações
            </Link>
            <Link href="/workspace/plano" className="btn btn-ghost btn-sm">
              Meu plano
            </Link>
          </div>
          <div className="handoff-qr" style={{ marginTop: "1rem" }}>
            <LocalQr
              className="qr-concept"
              value={waLink}
              size={160}
              alt="QR Code para abrir a conversa com a mila. no WhatsApp"
            />
            <p className="hint" style={{ margin: 0, fontSize: "0.82rem", color: "rgba(39,35,38,0.68)" }}>
              No computador: escaneie com o celular
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
