"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IntegrationSwitch } from "@/components/IntegrationSwitch";
import { integrationErrorText } from "@/lib/integration-errors";

/**
 * Desconectar uma integração: chama o revoke real (BFF → serviço de auth),
 * que apaga a credencial do vault da loja. Sem isso a rota de revoke existia
 * mas nenhuma tela chegava nela.
 *
 * O gatilho é a chave ligada (a conexão confirmada pelo vault). Tocar nela só
 * abre a confirmação num diálogo nativo; a chave continua ligada até o revoke
 * dar certo e a página reler o vault. Fechar o diálogo devolve o foco à chave.
 */
export default function DisconnectButton({
  provider,
  providerName,
}: {
  provider: string;
  providerName: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [aberto, setAberto] = useState(false);
  const [trabalhando, setTrabalhando] = useState(false);
  const [erro, setErro] = useState("");
  const dialogId = useId();
  const tituloId = useId();
  const textoId = useId();

  function abrir() {
    setErro("");
    setAberto(true);
    dialogRef.current?.showModal();
  }

  function fechar() {
    if (trabalhando) return;
    dialogRef.current?.close();
  }

  async function desconectar() {
    setTrabalhando(true);
    setErro("");
    try {
      const res = await fetch(`/api/oauth/${provider}/revoke`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; detail?: string };
      if (res.ok && data.ok) {
        dialogRef.current?.close();
        // O status vem do vault: reconsulta a página depois de revogar.
        router.refresh();
      } else {
        setErro(integrationErrorText(data.detail));
      }
    } catch {
      setErro("Não foi possível falar com a mila agora. Tente novamente.");
    } finally {
      setTrabalhando(false);
    }
  }

  return (
    <span className="integration-switch-wrap">
      <IntegrationSwitch
        checked
        label={`Desconectar ${providerName}`}
        busy={trabalhando}
        disabled={trabalhando}
        controls={aberto ? dialogId : undefined}
        onClick={abrir}
      />
      <dialog
        ref={dialogRef}
        id={dialogId}
        className="disconnect-dialog"
        aria-labelledby={tituloId}
        aria-describedby={textoId}
        onClose={() => setAberto(false)}
        onCancel={(e) => {
          if (trabalhando) e.preventDefault();
        }}
        onClick={(e) => {
          // Toque fora do cartão (no fundo do diálogo) fecha, como Cancelar.
          if (e.target === e.currentTarget) fechar();
        }}
      >
        {aberto ? (
          <div className="disconnect-dialog-card">
            <h2 id={tituloId} className="disconnect-dialog-title">
              Desconectar {providerName}?
            </h2>
            <div id={textoId} className="disconnect-dialog-text">
              <p>A mila deixa de usar {providerName} nesta loja. Para voltar, ligue a chave de novo e autorize outra vez.</p>
              {provider === "meta" ? (
                <p>
                  Os itens já publicados continuam no seu catálogo da Meta. Depois de desconectar, a remoção é feita
                  por você no Gerenciador de Comércio.
                </p>
              ) : null}
            </div>
            {erro ? (
              <p className="disconnect-error" role="alert">
                {erro}
              </p>
            ) : null}
            <div className="disconnect-dialog-actions">
              <button type="button" className="ledger-button" onClick={fechar} disabled={trabalhando} autoFocus>
                Cancelar
              </button>
              <button type="button" className="ledger-button disconnect-yes" onClick={desconectar} disabled={trabalhando}>
                {trabalhando ? "Desconectando…" : "Desconectar"}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </span>
  );
}
