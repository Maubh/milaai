"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTelefone, isVerified } from "@/lib/onboarding";
import "../../(site)/login/auth.css";

export default function ConnectPage() {
  const [telefone, setTelefone] = useState("");
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    setTelefone(getTelefone());
    setVerificado(isVerified());
  }, []);

  const faltaEtapa = !telefone || !verificado;

  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login/verify">← Voltar à verificação</Link>
      </p>
      <h1 className="auth-minimal-title">Conecte-se à prévia</h1>
      <p className="auth-minimal-lede">
        Na versão final, este seria o encontro com a <span className="mila-highlight">mila</span> no seu aplicativo de mensagens.
        Aqui o QR é conceitual. Ilustra a etapa, não é escaneável.
      </p>
      {faltaEtapa ? (
        <p className="auth-prereq" role="note">
          {!telefone ? (
            <>
              Sem número na prévia ainda. <Link href="/login">Informe seu número</Link> e confirme
              o código <Link href="/login/verify">123456</Link> para percorrer o fluxo completo.
            </>
          ) : (
            <>
              Número {telefone} na prévia, mas a verificação ainda não foi concluída.{" "}
              <Link href="/login/verify">Digite o código 123456</Link>.
            </>
          )}{" "}
          Abaixo, a etapa como ela é. Nada é enviado.
        </p>
      ) : null}
      <div className="connect-card">
        <div className="qr-concept" role="img" aria-label="QR conceitual, apenas ilustrativo, não escaneável">
          <span aria-hidden="true">QR</span>
          <small aria-hidden="true">conceitual</small>
        </div>
        <p className="hint">QR conceitual · não escaneável</p>
        <Link href="/conversa" className="btn btn-plum auth-minimal-cta">
          Abrir conversa simulada
        </Link>
      </div>
    </div>
  );
}
