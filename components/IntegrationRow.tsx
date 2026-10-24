import type { ReactNode } from "react";
import { Bone, TextBone } from "./WorkspaceSkeleton";
import "./integration-row.css";

export type IntegrationTone = "positive" | "neutral" | "pro" | "error";

interface Props {
  /** Marca da ferramenta (logo). */
  mark: ReactNode;
  name: ReactNode;
  detail: ReactNode;
  description: ReactNode;
  /** Consentimento / uso dos dados, abaixo da descrição. */
  details?: ReactNode;
  /** Nível exigido (ex.: Pro). Vazio mantém o lugar para alinhar as colunas. */
  tier?: string | null;
  /** Estado da conexão como o vault informa. Vazio quando o nível já diz tudo (ex.: bloqueado no plano). */
  status?: { label: string; tone: IntegrationTone } | null;
  actions: ReactNode;
  /** Área própria abaixo da linha (ex.: catálogo da Meta). */
  expansion?: ReactNode;
  state: string;
  /** Âncora estável da linha (ex.: destino dos próximos passos da visão geral). */
  anchor?: string;
}

/**
 * Lista que define as colunas do catálogo. As linhas herdam por subgrid:
 * estado e ações ficam no mesmo eixo em todas, por construção.
 */
export function IntegrationList({ children }: { children: ReactNode }) {
  return <div className="integration-list-frame"><ul className="integration-list">{children}</ul></div>;
}

/**
 * Uma linha do catálogo de integrações, com as mesmas posições para toda
 * ferramenta. Só apresentação: quem decide estado, plano e ação é a página.
 */
export default function IntegrationRow({ mark, name, detail, description, details, tier, status, actions, expansion, state, anchor }: Props) {
  return (
    <li id={anchor} className="integration-item" data-state={state}>
      <div className="integration-item-mark">{mark}</div>
      <div className="integration-item-copy">
        <h3>{name} <span className="integration-item-detail">{detail}</span></h3>
        <p className="integration-item-description">{description}</p>
        {details}
      </div>
      <div className="integration-item-tier">{tier ? <span className="integration-tier">{tier}</span> : null}</div>
      <div className="integration-item-status">{status ? <span className="ledger-state" data-tone={status.tone}>{status.label}</span> : null}</div>
      <div className="integration-item-actions">{actions}</div>
      {expansion ? <div className="integration-item-expansion">{expansion}</div> : null}
    </li>
  );
}

/**
 * Lugar de uma linha enquanto o vault não respondeu: as mesmas colunas, sem
 * nome nem estado. Não diz qual ferramenta está conectada nem se a Meta entra.
 */
export function IntegrationRowPending() {
  return (
    <IntegrationRow
      state="loading"
      mark={<Bone size="logo" />}
      name={<TextBone w="9ch" />}
      detail={<TextBone w="14ch" />}
      description={<><TextBone /><TextBone w="45%" /></>}
      status={null}
      actions={<Bone size="button" />}
    />
  );
}
