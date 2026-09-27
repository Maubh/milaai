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
] as const;

export function sanitizeProviderStatus(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of PROVIDER_PUBLIC_KEYS) {
    if (k in src) out[k] = src[k];
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
