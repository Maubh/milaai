"use client";

import { useState } from "react";
import { formatTrialLastDay, isShownCurrentPlan, readPlanStatus } from "@/lib/plan-status";
import { TextBone } from "@/components/WorkspaceSkeleton";
import { PLANO_PDF } from "@/lib/google-workspace";
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
  fatura_aberta_url?: string | null;
  pausa_em?: string | null;
  acesso_pausado?: boolean;
}

// Listas de recursos da produção (main), sem promessa a mais nem a menos.
const PLANS = [
  {
    id: "essencial" as const,
    name: "Plano Essencial",
    blurb: "Preço com margem, Raio-X e descrição de peças.",
    price: "39",
    features: [
      "Preço a partir da foto e do custo da peça",
      "Raio-X da margem, com a taxa da maquininha e a embalagem",
      "Custo da peça comprada no bruto: peso, milésimos de banho e perdas",
      "Radar de preços dos concorrentes no Google Shopping",
      "Descrições prontas para a loja virtual",
      "Legenda de Instagram para cada peça",
      "Leitura de notas de compra (XML e PDF)",
      "Caderno de fornecedores no WhatsApp, no Notion ou no Google Planilhas",
      PLANO_PDF,
      "1 vitrine web ativa por vez, com fotos reais",
    ],
  },
  {
    id: "pro" as const,
    name: "Plano Pro",
    blurb: "Estoque, ERP e fechamento no WhatsApp.",
    price: "69",
    features: [
      "Tudo do Essencial, e ainda:",
      "Nuvemshop (produtos e pedidos), Jueri e Olist; planilha pronta para a Phibo",
      "Vitrines web ilimitadas",
      "Carrosséis, roteiros de Reels e planejamento semanal para o Instagram",
      "Leitura do nicho e dos concorrentes no Instagram (4 análises por mês)",
      "Pesquisa de fornecedores pelo site, catálogo ou Instagram",
      "Balanço no WhatsApp no dia 15 e no último dia do mês",
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
  /** Nome e CPF/CNPJ de quem paga: o Asaas exige na cobrança. */
  onOrder?: (plan: "essencial" | "pro", pagador: { nome: string; documento: string }) => void;
}

/**
 * Meu plano como a lojista vê, em qualquer estado da leitura. A página e o
 * esqueleto da rota usam este mesmo markup: os planos são fixos e aparecem
 * inteiros; só o que vem da sessão vira bloco, dentro do próprio elemento.
 */
export default function PlanView({ session, loading, failed, orderingPlan = null, orderResult = null, onRetry, onOrder }: Props) {
  const status = session ? readPlanStatus(session) : null;
  const trialEnd = status?.trialEnd ?? null;
  const ultimoDia = trialEnd ? formatTrialLastDay(trialEnd) : null;
  const fatura = status?.fatura ?? null;
  const [contratando, setContratando] = useState<"essencial" | "pro" | null>(null);
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const lede = !status
    ? "O plano da sua conta e os planos disponíveis."
    : status.kind === "trial"
      ? "O plano que está valendo hoje. Quando o teste acabar, você escolhe se continua."
      : status.kind === "trial_ended"
        ? "Seu teste acabou. Escolha um plano para continuar."
        : status.kind === "late"
          ? "A fatura do seu plano está em aberto."
          : status.kind === "canceled"
            ? "Sua assinatura não está ativa. Escolha um plano para voltar."
            : status.kind === "paid"
              ? "O plano que está valendo hoje e a situação da assinatura."
              : "O plano que está valendo hoje na sua conta.";

  function action(planId: "essencial" | "pro") {
    // Lendo a sessão: o botão ocupa o lugar dele, sem dizer nada ainda.
    if (loading) return <button className="ledger-button plan-action" disabled aria-hidden="true" tabIndex={-1}><TextBone w="16ch" /></button>;
    if (!status) return null;
    const other = planId === "pro" ? "Pro" : "Essencial";
    if (isShownCurrentPlan(status, planId)) return <button className="ledger-button plan-action" disabled>Seu plano agora</button>;
    if (status.hiringLocked) return <button className="ledger-button plan-action" disabled>Sem cobrança</button>;
    if (status.kind === "paid" || status.kind === "late") return <button className="ledger-button plan-action" disabled>Troca de plano em breve</button>;
    // Durante o teste já dá para contratar: o pagamento confirmado vira `pago`.
    return <button
      className={`ledger-button plan-action${planId === "pro" ? " ledger-button-primary" : ""}`}
      onClick={() => setContratando(planId)}
      disabled={orderingPlan !== null}
      aria-expanded={contratando === planId}
    >
      Contratar {other}
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
                <span className="ledger-state" data-tone={status.kind === "trial_ended" || status.kind === "late" || status.kind === "canceled" ? "error" : "positive"}>{status.situation}</span>
                {status.kind === "trial" ? <small>Você está no período de teste do Pro, sem cobrança{ultimoDia ? <>, até <strong>{ultimoDia}</strong></> : null}. Jueri, Olist, alerta de carência e balanço no WhatsApp já valem. Se quiser, já pode contratar abaixo: a primeira cobrança vence no dia da contratação e o WhatsApp segue sem pausa quando o teste acabar.</small> : null}
                {status.kind === "trial_ended" ? <small>O período de teste acabou{ultimoDia ? ` em ${ultimoDia}` : ""}. Peças e cálculos continuam guardados. Escolha Essencial ou Pro abaixo. Depois do pagamento, o WhatsApp e este painel voltam na hora.</small> : null}
                {status.kind === "canceled" ? <small>Sua assinatura não está ativa. Peças e cálculos continuam guardados. Escolha Essencial ou Pro abaixo para voltar.</small> : null}
                {fatura ? <small>{fatura.pausado
                  ? "A fatura do seu plano está em aberto há mais de 7 dias, então o atendimento pelo WhatsApp está pausado. Peças, cálculos e fornecedores continuam guardados: assim que o pagamento cair, a mila volta na hora."
                  : `A fatura do seu plano ${status.currentPlan === "pro" ? "Pro" : "Essencial"} venceu e ainda não foi paga.${fatura.pausaEm ? ` O atendimento pelo WhatsApp segue até ${fatura.pausaEm}; depois, pausa até o pagamento cair.` : ""}`}</small> : null}
                {status.kind === "paid" ? <small>Sua assinatura está em dia. Dá para mudar de plano quando quiser.</small> : null}
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

      {fatura && !loading ? (
        <div className="ledger-notice plan-invoice" data-tone="error">
          {fatura.url
            ? <><span>Pague a fatura em aberto pelo Asaas.</span><a className="ledger-button ledger-button-primary" href={fatura.url} target="_blank" rel="noopener noreferrer">Pagar a fatura</a></>
            : <span>Para pagar, use a fatura que o Asaas enviou para o seu e-mail.</span>}
        </div>
      ) : null}

      {/* Dados de quem paga: o Asaas exige nome e CPF/CNPJ na cobrança. */}
      {contratando && !loading ? (
        <section className="ledger-section desk-panel plan-payer" aria-labelledby="plan-payer-title">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onOrder?.(contratando, { nome: nome.trim(), documento });
            }}
          >
            <div className="ledger-section-head">
              <h2 id="plan-payer-title">Plano {contratando === "pro" ? "Pro" : "Essencial"}: quem paga</h2>
              <p>Para gerar a cobrança no Asaas, informe quem paga. O CPF ou CNPJ vai só para o Asaas.</p>
            </div>
            <div className="plan-payer-fields">
              <label className="plan-payer-field">
                <span>Nome completo ou razão social</span>
                <input id="plano-nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required minLength={3} maxLength={120} />
              </label>
              <label className="plan-payer-field">
                <span>CPF ou CNPJ</span>
                <input id="plano-documento" value={documento} onChange={(e) => setDocumento(e.target.value)} inputMode="numeric" required maxLength={18} />
              </label>
            </div>
            <div className="plan-payer-actions">
              <button className="ledger-button ledger-button-primary" type="submit" disabled={orderingPlan !== null}>{orderingPlan ? "Gerando cobrança…" : "Ir para o pagamento"}</button>
              <button className="ledger-button ledger-button-quiet" type="button" onClick={() => setContratando(null)} disabled={orderingPlan !== null}>Cancelar</button>
            </div>
          </form>
        </section>
      ) : null}

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
        <p className="plan-pay-note">Pagamento no Asaas, por Pix, boleto ou cartão. Quando cair, o plano entra na hora no WhatsApp e aqui.</p>
      </section>
      </div>
    </div>
  );
}
