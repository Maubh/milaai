"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Chave liga/desliga de uma integração. Só mostra "ligada" quando o vault
 * confirma a conexão (`checked` vem de `connected === true`); a chave nunca
 * muda sozinha por otimismo. Inspiração visual: switches de uiverse.io
 * (Jay-9527/weak-dingo-78, njesenberger/friendly-otter-40), implementação própria.
 */
export function IntegrationSwitch({ checked, label, disabled, busy, expanded, controls, onClick }: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  busy?: boolean;
  expanded?: boolean;
  controls?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy || undefined}
      aria-expanded={expanded}
      aria-controls={controls}
      className="integration-switch"
      data-busy={busy || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="integration-switch-track" aria-hidden="true"><span className="integration-switch-thumb" /></span>
    </button>
  );
}

/**
 * Ligar: abre o fluxo real de autorização ou chave (`/integrations/<id>`).
 * A chave fica desligada até o vault confirmar, só sinalizando a espera.
 */
export function ConnectSwitch({ provider, providerName }: { provider: string; providerName: string }) {
  const router = useRouter();
  const [abrindo, setAbrindo] = useState(false);
  return (
    <span className="integration-switch-wrap">
      <IntegrationSwitch
        checked={false}
        label={`Conectar ${providerName}`}
        busy={abrindo}
        disabled={abrindo}
        onClick={() => {
          setAbrindo(true);
          router.push(`/integrations/${provider}`);
        }}
      />
      <span className="integration-switch-note" aria-live="polite">{abrindo ? "Abrindo a conexão…" : null}</span>
    </span>
  );
}
