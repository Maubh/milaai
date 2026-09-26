"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTelefone, getWaLink, isVerified } from "@/lib/onboarding";
import "../../(site)/login/auth.css";

export default function ConnectPage() {
  const [telefone, setTelefone] = useState("");
  const [verificado, setVerificado] = useState(false);
  const [waLink, setWaLink] = useState("");

  useEffect(() => {
    setTelefone(getTelefone());
    setVerificado(isVerified());
    setWaLink(getWaLink());
  }, []);

  const faltaEtapa = !telefone || !verificado;
  const qrSrc = useMemo(() => {
    if (!waLink) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(waLink)}`;
  }, [waLink]);

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
      {faltaEtapa ? (
        <p className="auth-prereq" role="note">
          {!telefone ? (
            <>
              Sem número ainda. <Link href="/login">Informe seu WhatsApp</Link> e confirme o código
              para continuar.
            </>
          ) : (
            <>
              Número {telefone} salvo, mas a verificação ainda não foi concluída.{" "}
              <Link href="/login/verify">Digite o código</Link>.
            </>
          )}
        </p>
      ) : null}
      <div className="connect-card">
        {qrSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="qr-concept"
            src={qrSrc}
            width={220}
            height={220}
            alt="QR Code para abrir a conversa com a mila. no WhatsApp"
          />
        ) : (
          <div className="qr-concept" role="img" aria-label="QR indisponível">
            <span aria-hidden="true">QR</span>
          </div>
        )}
        <p className="hint">Escaneie com a câmera do celular</p>
        <a
          href={waLink || "#"}
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
    </div>
  );
}
