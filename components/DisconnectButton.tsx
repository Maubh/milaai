"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { integrationErrorText } from "@/lib/integration-errors";

/**
 * Desconectar uma integração: chama o revoke real (BFF → serviço de auth),
 * que apaga a credencial do vault da loja. Sem isso a rota de revoke existia
 * mas nenhuma tela chegava nela.
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

  if (!confirmando) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          setErro("");
          setConfirmando(true);
        }}
      >
        Desconectar
      </button>
    );
  }

  return (
    <span style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <span className="hint">Desconectar {providerName} desta loja?</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={desconectar} disabled={trabalhando}>
        {trabalhando ? "Desconectando…" : "Sim, desconectar"}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setConfirmando(false)}
        disabled={trabalhando}
      >
        Cancelar
      </button>
      {erro ? (
        <span className="hint" role="alert" style={{ color: "#b3261e" }}>
          {erro}
        </span>
      ) : null}
    </span>
  );
}
