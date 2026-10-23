"use client";

import { formatTrialEnd, formatTrialEndShort, isShownCurrentPlan, readPlanStatus } from "@/lib/plan-status";
import { TextBone } from "@/components/WorkspaceSkeleton";
import "./plano.css";

export interface SessionData {
  ok: boolean;
  logged: boolean;
  tenant: string | null;
  phone: string | null;
  plan: string;
  billing: string;
  role: string;
  trial_ends_at: string | null;
  store_name: string | null;
}

const PLANS = [
  {
    id: "essencial" as const,
    name: "Plano Essencial",
    blurb: "Preço com margem, Raio-X e legendas para o Instagram.",
    price: "39",
    features: [
      "Preço a partir da foto e do custo da peça",
      "Raio-X de margem, taxas e impostos",
      "Radar de concorrentes no Google Shopping",
      "Legendas para Reels, posts e carrosséis",
      "Leitura de notas de compra (XML e PDF)",
    ],
  },
  {
    id: "pro" as const,
    name: "Plano Pro",
    blurb: "Estoque, ERP e fechamento no WhatsApp.",
    price: "69",
    features: [
      "Tudo do Essencial, e ainda:",
      "Nuvemshop, Jueri e Olist; planilha pronta para a Phibo",
      "Notion e Google Planilhas",
      "Balanço no WhatsApp no dia 15 e último dia do mês",
      "Aviso de carência de fornecedor",
    ],
  },
];

export interface OrderResult {
  ok: boolean;
  checkoutUrl?: string;
  orderRef?: string;
  msg?: string;
}

interface Props {
  session: SessionData | null;
  loading: boolean;
  failed: boolean;
  orderingPlan?: string | null;
  orderResult?: OrderResult | null;
  onRetry?: () => void;
  onOrder?: (plan: "essencial" | "pro") => void;
}

/**
 * Meu plano como a lojista vê, em qualquer estado da leitura. A página e o
 * esqueleto da rota usam este mesmo markup: os planos são fixos e aparecem
 * inteiros; só o que vem da sessão vira bloco, dentro do próprio elemento.
 */
export default function PlanView({ session, loading, failed, orderingPlan = null, orderResult = null, onRetry, onOrder }: Props) {
  const status = session ? readPlanStatus(session) : null;
  const trialEnd = status?.trialEnd ?? null;
  const trialShort = trialEnd ? formatTrialEndShort(trialEnd) : null;
  const isPaid = status?.kind === "paid";
  const lede = !status
    ? "O plano da sua conta e os planos disponíveis."
    : status.kind === "trial"
      ? "O plano que está valendo hoje. Quando o teste acabar, você escolhe se continua."
      : status.kind === "trial_ended"
        ? "Seu teste acabou. Escolha um plano para continuar."
        : status.kind === "paid"
          ? "O plano que está valendo hoje e a situação da assinatura."
          : "O plano que está valendo hoje na sua conta.";

  function action(planId: "essencial" | "pro") {
    // Lendo a sessão: o botão ocupa o lugar dele, sem dizer nada ainda.
    if (loading) return <button className="ledger-button plan-action" disabled aria-hidden="true" tabIndex={-1}><TextBone w="16ch" /></button>;
    if (!status) return null;
    const isCurrent = isShownCurrentPlan(status, planId);
    if (isCurrent) {
      return <button className="ledger-button plan-action" disabled>
        {status.kind === "trial" ? (trialShort ? `Seu plano · até ${trialShort}` : "Seu plano durante o teste") : "Seu plano agora"}
      </button>;
    }
    if (status.hiringLocked) {
      const label = status.kind === "founder"
        ? "Sem cobrança na sua conta"
        : status.informedPlan
          ? `No ${status.informedPlan === "pro" ? "Pro" : "Essencial"} ${trialShort ? `até ${trialShort}` : "durante o teste"}`
          : trialShort ? `Disponível depois de ${trialShort}` : "Disponível quando o teste acabar";
      return <button className="ledger-button plan-action" disabled>{label}</button>;
    }
    const other = planId === "pro" ? "Pro" : "Essencial";
    return <button
      className={`ledger-button plan-action${planId === "pro" ? " ledger-button-primary" : ""}`}
      onClick={() => onOrder?.(planId)}
      disabled={orderingPlan !== null}
    >
      {orderingPlan === planId ? "Processando…" : isPaid && status.informedPlan !== null && status.informedPlan !== planId ? `Mudar para ${other}` : `Contratar ${other}`}
    </button>;
  }

  return (
    <div className="ledger-page workspace-plan-page">
      <header className="ledger-page-head">
        <div>
          <h1 className="ledger-title">Meu plano</h1>
          <p className="ledger-lede">{loading ? <><TextBone /><TextBone w="35%" /></> : lede}</p>
        </div>
      </header>

      <div className="desk-stack">
      <section className="ledger-section desk-panel plan-sheet" aria-labelledby="plan-sheet-title" aria-busy={loading}>
        <div className="ledger-section-head">
          <h2 id="plan-sheet-title">Sua conta</h2>
        </div>
        {loading ? (
          <><p className="sr-only" role="status">Carregando seu plano…</p><dl className="ledger-rows">
            <div className="ledger-row plan-row">
              <dt className="ledger-row-label">Plano</dt>
              <dd className="ledger-row-value plan-current"><TextBone w="13ch" /></dd>
            </div>
            <div className="ledger-row plan-row">
              <dt className="ledger-row-label">Situação</dt>
              <dd className="ledger-row-value"><TextBone w="20ch" /><small><TextBone /><TextBone w="30%" /></small></dd>
            </div>
            <div className="ledger-row plan-row">
              <dt className="ledger-row-label">Loja</dt>
              <dd className="ledger-row-value"><TextBone w="16ch" /></dd>
            </div>
          </dl></>
        ) : failed || !status || !session ? (
          <div className="ledger-notice" data-tone="error" role="alert">
            <span>Não deu para ler seu plano agora. Nada mudou na sua conta.</span>
            <button type="button" className="ledger-button" onClick={onRetry}>Tentar de novo</button>
          </div>
        ) : (
          <dl className="ledger-rows">
            <div className="ledger-row plan-row">
              <dt className="ledger-row-label">Plano</dt>
              <dd className="ledger-row-value plan-current">{status.title}</dd>
            </div>
            {status.situation ? <div className="ledger-row plan-row">
              <dt className="ledger-row-label">Situação</dt>
              <dd className="ledger-row-value">
                <span className="ledger-state" data-tone={status.kind === "trial_ended" ? "error" : "positive"}>{status.situation}</span>
                {status.kind === "trial" ? <small>{trialEnd ? <>Até <strong>{formatTrialEnd(trialEnd)}</strong>. Os botões de contratar aparecem aqui quando o teste acabar.</> : "Data de fim não informada. Os botões de contratar aparecem aqui quando o teste acabar."}</small> : null}
                {status.kind === "trial_ended" ? <small>{trialEnd ? `Encerrado em ${formatTrialEnd(trialEnd)}. ` : ""}Peças e cálculos continuam guardados. Escolha Essencial ou Pro abaixo. Depois do pagamento, o WhatsApp e este painel voltam na hora.</small> : null}
                {status.kind === "paid" ? <small>Dá para mudar de plano quando quiser.</small> : null}
              </dd>
            </div> : null}
            {session.phone ? <div className="ledger-row plan-row">
              <dt className="ledger-row-label">WhatsApp</dt>
              <dd className="ledger-row-value plan-number">{session.phone}</dd>
            </div> : null}
            {session.store_name ? <div className="ledger-row plan-row">
              <dt className="ledger-row-label">Loja</dt>
              <dd className="ledger-row-value">{session.store_name}</dd>
            </div> : null}
          </dl>
        )}
      </section>

      {orderResult && (
        <p className="ledger-notice" data-tone={orderResult.ok ? "positive" : "error"} role="status">
          {orderResult.msg}
          {orderResult.orderRef ? ` Pedido ${orderResult.orderRef}.` : ""}
        </p>
      )}

      <section className="ledger-section desk-panel" aria-labelledby="plan-compare-title">
        <div className="ledger-section-head">
          <h2 id="plan-compare-title">Planos</h2>
          <p>Valores por mês.</p>
        </div>
        <div className="plan-compare">
          {PLANS.map((plan) => {
            const isCurrent = !!status && isShownCurrentPlan(status, plan.id);
            return <article className="plan-column" key={plan.id} data-current={isCurrent} aria-labelledby={`plan-${plan.id}`}>
              <div className="plan-column-head">
                <h3 id={`plan-${plan.id}`}>{plan.name}</h3>
                {isCurrent ? <span className="ledger-state" data-tone="positive">Seu plano</span> : null}
              </div>
              <p className="plan-blurb">{plan.blurb}</p>
              <p className="plan-price">R$&nbsp;{plan.price} <span>/mês</span></p>
              <ul className="plan-features">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className="plan-column-action">{action(plan.id)}</div>
            </article>;
          })}
        </div>
        <p className="plan-pay-note">Pagamento no Asaas, Pix ou cartão. Quando cair, o plano entra na hora no WhatsApp e aqui.</p>
      </section>
      </div>
    </div>
  );
}
