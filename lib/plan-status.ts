/**
 * Leitura do plano a partir de `/api/session` — pura, para a visão geral e a
 * página do plano dizerem a mesma coisa e para ser testável.
 *
 * A regra comercial continua a de antes: sem `trial_ends_at`, o fim do teste
 * cai na data de referência do piloto. Essa data decide os botões, mas nunca
 * aparece na tela como se tivesse vindo da sessão (`trialEnd` fica null).
 */

export interface PlanSession {
  plan?: string | null;
  billing?: string | null;
  role?: string | null;
  trial_ends_at?: string | null;
  phone?: string | null;
  store_name?: string | null;
}

export type PlanKind = "founder" | "paid" | "trial" | "trial_ended" | "plan";

export interface PlanStatus {
  kind: PlanKind;
  /** Plano da regra de contratação (no teste encerrado a regra assume Pro). */
  currentPlan: "essencial" | "pro";
  /** Plano que a sessão informa de forma explícita; null quando ausente ou desconhecido. */
  informedPlan: "essencial" | "pro" | null;
  /** Nome do plano como a sessão informa: "Plano Essencial", "Plano Pro" ou "Plano não informado". */
  title: string;
  /** Situação comercial, separada do nome: em teste, cortesia, em dia, encerrado. */
  situation: string | null;
  /** Fim do teste informado pela sessão; null quando ausente ou inválido. */
  trialEnd: Date | null;
  hiringLocked: boolean;
}

/** Referência do piloto, usada só na regra quando a sessão não traz a data. */
const PILOT_TRIAL_END = new Date("2026-11-04T23:14:28Z");

function parseDate(raw: unknown): Date | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function readPlanStatus(session: PlanSession, now: Date = new Date()): PlanStatus {
  const trialEnd = parseDate(session.trial_ends_at);
  const ruleEnd = trialEnd ?? PILOT_TRIAL_END;
  const isFounder = session.role === "founder" || session.billing === "comped";
  const isPaid = session.billing === "pago";
  const isTrialExpired =
    !isFounder &&
    !isPaid &&
    (session.billing === "trial_expirado" ||
      (session.billing === "pilot" && now > ruleEnd) ||
      (!session.billing && now > ruleEnd));
  const trialOpen = now <= ruleEnd && !isPaid && !isFounder && !isTrialExpired;
  const currentPlan: "essencial" | "pro" =
    isTrialExpired ? "pro" : session.plan === "essencial" ? "essencial" : "pro";

  const kind: PlanKind = isFounder ? "founder" : isPaid ? "paid" : trialOpen ? "trial" : isTrialExpired ? "trial_ended" : "plan";
  // O nome sai do `plan` da sessão; a condição comercial vai em `situation`.
  // Plano ausente na sessão não vira um nome deduzido pela regra.
  const informedPlan = session.plan === "pro" || session.plan === "essencial" ? session.plan : null;
  const title = informedPlan === "pro" ? "Plano Pro" : informedPlan === "essencial" ? "Plano Essencial" : "Plano não informado";
  const situation = {
    founder: "Cortesia, sem cobrança",
    paid: "Assinatura em dia",
    trial: "Em teste, sem cobrança",
    trial_ended: "Teste encerrado",
    plan: null,
  }[kind];

  return { kind, currentPlan, informedPlan, title, situation, trialEnd, hiringLocked: isFounder || trialOpen };
}

/**
 * O cartão marcado como "seu plano" na tela. Só a sessão diz qual é: o
 * `currentPlan` da regra continua decidindo os botões, mas nunca vira selo.
 */
export function isShownCurrentPlan(status: PlanStatus, planId: "essencial" | "pro"): boolean {
  return status.kind !== "trial_ended" && status.informedPlan === planId;
}

const dayFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });
const shortFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

/** "04/11/2026 às 20:14" no horário de Brasília. */
export function formatTrialEnd(date: Date): string {
  return `${dayFormat.format(date)} às ${timeFormat.format(date)}`;
}

/** "04/11" no horário de Brasília. */
export function formatTrialEndShort(date: Date): string {
  return shortFormat.format(date);
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
