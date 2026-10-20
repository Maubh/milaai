/**
 * Projeção do status de conector (módulo puro, testável fora do Next).
 *
 * O BFF nunca repassa o JSON cru do serviço de auth para o browser: cada item
 * de `providers` é reduzido a estes campos, sem segredo nem campo novo que o
 * VPS venha a acrescentar sem revisão.
 */

export const PROVIDER_PUBLIC_KEYS = [
  "id",
  "name",
  "mode",
  "connected",
  "app_configured",
  // Metadados públicos seguros para catálogo (Meta Catalog, etc.)
  "catalog_id",
  "catalog_name",
  "business_id",
  "product_source",
  "sync_only_published",
  "last_sync_at",
  "last_sync_status",
  "last_sync_summary",
  "suggested_source",
] as const;

/** Teto de itens de texto vindos do resumo de sync (anti-abuso de tamanho). */
const SYNC_SUMMARY_MAX_ITEMS = 20;
const SYNC_SUMMARY_MAX_TEXT = 300;

function textoSeguro(v: unknown): string {
  const s = typeof v === "string" ? v : String(v ?? "");
  return s.length > SYNC_SUMMARY_MAX_TEXT ? s.slice(0, SYNC_SUMMARY_MAX_TEXT) : s;
}

function numeroSeguro(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/**
 * Projeta o resumo de sincronização com allowlist de segundo nível.
 *
 * A allowlist de `PROVIDER_PUBLIC_KEYS` é só de primeiro nível: copiar
 * `last_sync_summary` por referência rasa deixaria qualquer campo aninhado
 * que o VPS acrescentar (mensagem de erro com token, debug interno) vazar
 * para o browser. Aqui só passam contadores e textos curtos conhecidos.
 */
export function sanitizeSyncSummary(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const erros = Array.isArray(src.erros)
    ? src.erros.slice(0, SYNC_SUMMARY_MAX_ITEMS).map((e) => {
        if (typeof e === "string") return { item: "", erro: textoSeguro(e) };
        const o = (e ?? {}) as Record<string, unknown>;
        return { item: textoSeguro(o.item), erro: textoSeguro(o.erro ?? o.aviso) };
      })
    : [];
  const avisos = Array.isArray(src.avisos)
    ? src.avisos.slice(0, SYNC_SUMMARY_MAX_ITEMS).map((a) => {
        if (typeof a === "string") return { item: "", aviso: textoSeguro(a) };
        const o = (a ?? {}) as Record<string, unknown>;
        return { item: textoSeguro(o.item), aviso: textoSeguro(o.aviso ?? o.erro) };
      })
    : [];
  const conjuntos = Array.isArray(src.conjuntos)
    ? src.conjuntos.slice(0, SYNC_SUMMARY_MAX_ITEMS).map((c) => {
        const o = (c ?? {}) as Record<string, unknown>;
        return {
          id: textoSeguro(o.id),
          nome: textoSeguro(o.nome),
          totalProdutos: numeroSeguro(o.totalProdutos),
        };
      })
    : [];
  return {
    total: numeroSeguro(src.total),
    totalAvaliados: numeroSeguro(src.totalAvaliados),
    totalAptos: numeroSeguro(src.totalAptos),
    totalExcluidos: numeroSeguro(src.totalExcluidos),
    enviados: numeroSeguro(src.enviados),
    falhas: numeroSeguro(src.falhas),
    erros,
    avisos,
    conjuntos,
  };
}

export function sanitizeProviderStatus(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of PROVIDER_PUBLIC_KEYS) {
    if (k in src) out[k] = src[k];
  }
  // Projeção aninhada: o resumo de sync nunca viaja cru para o browser.
  if ("last_sync_summary" in out) {
    out.last_sync_summary = sanitizeSyncSummary(out.last_sync_summary);
  }
  // Sem `id` o item não identifica conector nenhum: descarta.
  return typeof out.id === "string" && out.id ? out : null;
}

export function sanitizeProviderList(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(sanitizeProviderStatus)
    .filter((p): p is Record<string, unknown> => p !== null);
}
