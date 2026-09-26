"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LocalQr from "@/components/LocalQr";
import { getTelefone, getVerifiedWaLink, isVerified } from "@/lib/onboarding";
import "../../(site)/login/auth.css";

export default function ConnectPage() {
  const [telefone, setTelefone] = useState("");
  const [verificado, setVerificado] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    setTelefone(getTelefone());
    const ok = isVerified();
    setVerificado(ok);
    setWaLink(ok ? getVerifiedWaLink() : null);
  }, []);

  const pronto = Boolean(telefone && verificado && waLink);

  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login/verify">← Voltar à verificação</Link>
      </p>
      <h1 className="auth-minimal-title">Abra o WhatsApp da mila.</h1>
      <p className="auth-minimal-lede">
        Escaneie o QR no computador ou toque no botão no celular. A mensagem já vem pronta:
        “Oi, mila.”
      </p>

      {!pronto ? (
        <p className="auth-prereq" role="note">
          {!telefone ? (
            <>
              Sem número ainda. <Link href="/login">Informe seu WhatsApp</Link> e confirme o código
              para continuar.
            </>
          ) : !verificado ? (
            <>
              Número {telefone} salvo, mas a verificação ainda não foi concluída.{" "}
              <Link href="/login/verify">Digite o código</Link>.
            </>
          ) : (
            <>Não foi possível montar o link do WhatsApp. Volte e confirme o código novamente.</>
          )}
        </p>
      ) : null}

      {pronto ? (
        <div className="connect-card">
          <LocalQr
            className="qr-concept"
            value={waLink!}
            size={220}
            alt="QR Code para abrir a conversa com a mila. no WhatsApp"
          />
          <p className="hint">Escaneie com a câmera do celular</p>
          <a
            href={waLink!}
            className="btn btn-plum auth-minimal-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir WhatsApp
          </a>
          <p className="hint" style={{ marginTop: "0.75rem" }}>
            Depois do “Oi, mila.”, ela responde com a boas-vindas.
          </p>
        </div>
      ) : (
        <div className="connect-card" aria-hidden="true">
          <div className="qr-concept" role="presentation">
            <span>QR</span>
            <small>bloqueado</small>
          </div>
          <p className="hint">Complete a verificação para liberar o WhatsApp</p>
          <button type="button" className="btn btn-plum auth-minimal-cta" disabled>
            Abrir WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
