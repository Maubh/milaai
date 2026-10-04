"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";

export default function WorkspaceHome() {
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
  }, []);

  return (
    <div className="work-wrap">
      <p className="tag">Área logada · piloto</p>
      <h1 className="work-title">Olá</h1>
      <p className="work-lede">
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
