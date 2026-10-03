import { cookies } from "next/headers";
import { SESSION_COOKIE, proxyMilaAuth } from "@/lib/server/mila-auth";
import { sanitizeProviderList as projectProviderList } from "@/lib/provider-status";

/** Lê o cookie HttpOnly da sessão (server-only). */
export async function currentSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export const GUIDED_PROVIDERS = ["jueri", "notion"] as const;

/** Conectores OAuth de app. Whitelist única: nada de slug livre no path. */
export const OAUTH_PROVIDERS = ["olist", "nuvemshop", "bling", "google"] as const;

export const ALL_PROVIDERS = [...OAUTH_PROVIDERS, ...GUIDED_PROVIDERS] as const;

export type ProviderSlug = (typeof ALL_PROVIDERS)[number];

export function isKnownProvider(slug: string): slug is ProviderSlug {
  return (ALL_PROVIDERS as readonly string[]).includes(slug);
}

export function isGuidedProvider(slug: string): boolean {
  return (GUIDED_PROVIDERS as readonly string[]).includes(slug);
}

/** Repassa a chamada de integração para o VPS com a identidade da loja. */
export async function proxyOAuth(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const token = await currentSessionToken();
  if (!token) {
    return { status: 401, data: { ok: false, detail: "no_session" } };
  }
  return proxyMilaAuth(path, { ...init, sessionToken: token });
}

/** Campos que o browser pode ver de um item da lista de conectores. */
export { PROVIDER_PUBLIC_KEYS, sanitizeProviderList, sanitizeProviderStatus } from "@/lib/provider-status";

/** Campos que o browser pode ver numa resposta de integração. */
export function sanitizeOAuthResponse(
  data: Record<string, unknown>,
  extraKeys: readonly string[] = [],
): Record<string, unknown> {
  const allowed = ["ok", "detail", "provider", "authorize_url", "removed", ...extraKeys];
  const out: Record<string, unknown> = {};
  for (const k of allowed) {
    if (!(k in data)) continue;
    // `providers` é lista de status: projeta item a item, nunca repassa cru.
    out[k] = k === "providers" ? projectProviderList(data[k]) : data[k];
  }
  return out;
}
