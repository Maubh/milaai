/**
 * Leitura do plano a partir de `/api/session` — pura, para a visão geral e a
 * página do plano dizerem a mesma coisa e para ser testável.
 *
 * As regras comerciais são as da produção (`app/workspace/plano/page.tsx` em
 * main antes da proposta A): o teste só tem fim com `trial_ends_at` da sessão,
 * dá para contratar durante o teste, e a fatura em atraso vem de
 * `lerFaturaAberta`. O nome do plano sai só do `plan` da sessão.
 */

import { lerFaturaAberta, type FaturaAberta } from "./fatura-aberta.ts";

export interface PlanSession {
  plan?: string | null;
  billing?: string | null;
  role?: string | null;
  trial_ends_at?: string | null;
  phone?: string | null;
  store_name?: string | null;
  fatura_aberta_url?: string | null;
  pausa_em?: string | null;
  acesso_pausado?: boolean;
}

export type PlanKind = "founder" | "late" | "paid" | "trial" | "trial_ended" | "canceled" | "plan";

export interface PlanStatus {
  kind: PlanKind;
  /** Plano da regra de contratação (no teste encerrado a regra assume Pro). */
  currentPlan: "essencial" | "pro";
  /** Plano que a sessão informa de forma explícita; null quando ausente ou desconhecido. */
  informedPlan: "essencial" | "pro" | null;
  /** Nome do plano como a sessão informa: "Plano Essencial", "Plano Pro" ou "Plano não informado". */
  title: string;
  /** Situação comercial, separada do nome. */
  situation: string | null;
  /** Instante em que o teste acaba, como a sessão informa; null quando ausente ou inválido. */
  trialEnd: Date | null;
  /** Fatura em atraso (billing "atrasado"); null fora do atraso. */
  fatura: FaturaAberta | null;
  /** Só a cortesia/founder não contrata pelo site. */
  hiringLocked: boolean;
}

function parseDate(raw: unknown): Date | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function readPlanStatus(session: PlanSession, now: Date = new Date()): PlanStatus {
  const trialEnd = parseDate(session.trial_ends_at);
  const billing = session.billing ?? "";
  const isFounder = session.role === "founder" || billing === "comped" || billing === "cortesia";
  const fatura = lerFaturaAberta({ billing, fatura_aberta_url: session.fatura_aberta_url, pausa_em: session.pausa_em, acesso_pausado: session.acesso_pausado }, now);
  const isPaid = billing === "pago";
  const isPilot = billing === "pilot" || billing === "piloto";
  const isTrialExpired = !isFounder && (billing === "trial_expirado" || (isPilot && trialEnd !== null && now >= trialEnd));
  const isCanceled = !isFounder && (billing === "cancelado" || billing === "expired");
  const trialOpen = isPilot && !isTrialExpired;
  const currentPlan: "essencial" | "pro" =
    isTrialExpired ? "pro" : session.plan === "essencial" ? "essencial" : "pro";

  const kind: PlanKind = isFounder ? "founder" : fatura ? "late" : isPaid ? "paid" : trialOpen ? "trial" : isTrialExpired ? "trial_ended" : isCanceled ? "canceled" : "plan";
  const informedPlan = session.plan === "pro" || session.plan === "essencial" ? session.plan : null;
  const title = informedPlan === "pro" ? "Plano Pro" : informedPlan === "essencial" ? "Plano Essencial" : "Plano não informado";
  const situation = {
    founder: "Cortesia, sem cobrança",
    late: fatura?.pausado ? "WhatsApp pausado" : "Pagamento pendente",
    paid: "Assinatura em dia",
    trial: "Em teste, sem cobrança",
    trial_ended: "Teste encerrado",
    canceled: "Assinatura inativa",
    plan: null,
  }[kind];

  return { kind, currentPlan, informedPlan, title, situation, trialEnd, fatura, hiringLocked: isFounder };
}

/**
 * O cartão marcado como "seu plano" na tela. Só a sessão diz qual é; durante
 * o teste, com o teste encerrado ou a assinatura inativa, nenhum cartão é o atual.
 */
export function isShownCurrentPlan(status: PlanStatus, planId: "essencial" | "pro"): boolean {
  return (status.kind === "founder" || status.kind === "late" || status.kind === "paid" || status.kind === "plan") && status.informedPlan === planId;
}

const dayFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

/**
 * Último dia de uso do teste, em Brasília: `trial_ends_at` é o instante em que
 * o teste acaba (00:00 do dia seguinte), então o último dia é o anterior.
 */
export function formatTrialLastDay(trialEnd: Date): string {
  return dayFormat.format(new Date(trialEnd.getTime() - 1));
}

/**
 * Erro do pedido de assinatura em português, com o que fazer a seguir.
 * O `detail` do backend é código técnico: nunca vai cru para a tela.
 */
export function orderErrorText(status: number, detail?: unknown): string {
  const code = typeof detail === "string" ? detail : "";
  if (status === 401 || code === "no_session") {
    return "Sua sessão expirou. Entre de novo com o WhatsApp e tente contratar outra vez.";
  }
  if (status === 504 || status === 502 || status === 0 || code.startsWith("upstream_")) {
    return "Não deu para falar com o sistema de pagamento agora. Tente de novo em alguns minutos.";
  }
  if (status === 400 || code === "invalid_request") {
    return "Não deu para gerar o pedido com esses dados. Atualize a página e tente de novo.";
  }
  return "Não deu para gerar o pedido agora. Tente de novo ou fale com a mila no WhatsApp.";
}
