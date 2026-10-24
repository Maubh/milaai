"use client";

import { useEffect, useState } from "react";
import { integrationErrorText } from "@/lib/integration-errors";

interface IntegrationsNoticeProps {
  okParam?: string | null;
  okConectado?: boolean;
  okPendente?: boolean;
  providerName?: string | null;
  erroParam?: string | null;
  erroMensagem?: string | null;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>;
}

/**
 * Banner de notificação pós-OAuth / ações da página de integrações.
 *
 * Limpa os parâmetros ?ok= e ?erro= da barra de navegação no primeiro render
 * via window.history.replaceState para que recarregamentos de página (F5)
 * não reexibam o banner indefinidamente. Permite também fechar no botão '×'.
 */
export default function IntegrationsNotice({
  okParam,
  okConectado,
  okPendente,
  providerName,
  erroParam,
  erroMensagem,
}: IntegrationsNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has("ok")) {
        url.searchParams.delete("ok");
        changed = true;
      }
      if (url.searchParams.has("erro")) {
        url.searchParams.delete("erro");
        changed = true;
      }
      if (changed) {
        const clean = url.pathname + (url.search ? url.search : "") + url.hash;
        window.history.replaceState({}, "", clean);
      }
    }
  }, []);

  if (dismissed) {
    return null;
  }

  const name = providerName || okParam || "Provedor";

  if (okConectado) {
    return (
      <div className="ledger-notice integrations-notice" data-tone="positive" role="status">
        <div className="integrations-notice-content">
          <strong>{name}</strong> conectado a esta loja.
        </div>
        <button
          type="button"
          className="integrations-notice-close"
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  if (okPendente) {
    return (
      <div className="ledger-notice integrations-notice" role="status">
        <div className="integrations-notice-content">
          O {name} voltou, mas a chave ainda não aparece nesta loja. Conecte de novo ou fale com a mila.
        </div>
        <button
          type="button"
          className="integrations-notice-close"
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  if (erroParam) {
    const texto = erroMensagem || integrationErrorText(erroParam);
    return (
      <div className="ledger-notice integrations-notice" data-tone="error" role="alert">
        <div className="integrations-notice-content">{texto}</div>
        <button
          type="button"
          className="integrations-notice-close"
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  return null;
}
