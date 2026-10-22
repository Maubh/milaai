/**
 * Fatura em aberto na tela "Meu plano": quando a assinatura atrasa, o Eve
 * manda o link da fatura do Asaas e quando o atendimento pelo WhatsApp pausa
 * (7 dias depois do primeiro vencimento).
 *
 * Módulo puro (sem `next/*`): testado fora do Next.
 */

export interface FaturaAberta {
  /** Link de pagamento, só do Asaas; null quando o Eve não recebeu. */
  url: string | null;
  /** Último dia com atendimento, em Brasília (dd/mm/aaaa). */
  pausaEm: string | null;
  pausado: boolean;
}

/** Só link de fatura do próprio Asaas vira botão. */
export function linkDeFaturaAsaas(v: unknown): string | null {
  return typeof v === "string" && /^https:\/\/([a-z0-9-]+\.)*asaas\.com\/\S+$/i.test(v) ? v : null;
}

/** Null fora do atraso. */
export function lerFaturaAberta(
  sessao: { billing?: string; fatura_aberta_url?: string | null; pausa_em?: string | null; acesso_pausado?: boolean } | null,
  agora = new Date(),
): FaturaAberta | null {
  if (sessao?.billing !== "atrasado") return null;
  const pausa = sessao.pausa_em ? new Date(sessao.pausa_em) : null;
  const pausaValida = pausa && !Number.isNaN(pausa.getTime()) ? pausa : null;
  return {
    url: linkDeFaturaAsaas(sessao.fatura_aberta_url),
    pausaEm: pausaValida
      ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }).format(
          new Date(pausaValida.getTime() - 1),
        )
      : null,
    pausado: sessao.acesso_pausado === true || (pausaValida !== null && agora >= pausaValida),
  };
}
