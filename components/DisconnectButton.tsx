"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { IntegrationSwitch } from "@/components/IntegrationSwitch";
import { integrationErrorText } from "@/lib/integration-errors";

/**
 * Desconectar uma integração: chama o revoke real (BFF → serviço de auth),
 * que apaga a credencial do vault da loja. Sem isso a rota de revoke existia
 * mas nenhuma tela chegava nela.
 *
 * O gatilho é a chave ligada (a conexão confirmada pelo vault). Tocar nela só
 * abre a confirmação; a chave continua ligada até o revoke dar certo e a
 * página reler o vault.
 */
export default function DisconnectButton({
  provider,
  providerName,
}: {
  provider: string;
  providerName: string;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [trabalhando, setTrabalhando] = useState(false);
  const [erro, setErro] = useState("");
  const confirmId = useId();

  async function desconectar() {
    setTrabalhando(true);
    setErro("");
    try {
      const res = await fetch(`/api/oauth/${provider}/revoke`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; detail?: string };
      if (res.ok && data.ok) {
        setConfirmando(false);
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

  const chave = (
    <IntegrationSwitch
      checked
      label={`Desconectar ${providerName}`}
      busy={trabalhando}
      disabled={trabalhando}
      expanded={confirmando}
      controls={confirmando ? confirmId : undefined}
      onClick={() => {
        setErro("");
        setConfirmando(!confirmando);
      }}
    />
  );

  if (!confirmando) return <span className="integration-switch-wrap">{chave}</span>;

  return (
    <span className="integration-switch-wrap">
    {chave}
    <span id={confirmId} className="disconnect-confirm" role="group" aria-label={`Confirmar desconexão de ${providerName}`}>
      <span className="disconnect-question">Desconectar {providerName} desta loja?</span>
      <button type="button" className="ledger-button disconnect-yes" onClick={desconectar} disabled={trabalhando}>
        {trabalhando ? "Desconectando…" : "Sim, desconectar"}
      </button>
      <button
        type="button"
        className="ledger-button ledger-button-quiet"
        onClick={() => setConfirmando(false)}
        disabled={trabalhando}
      >
        Cancelar
      </button>
      {erro ? (
        <span className="disconnect-error" role="alert">
          {erro}
        </span>
      ) : null}
    </span>
    </span>
  );
}
