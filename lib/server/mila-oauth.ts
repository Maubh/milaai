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
export const OAUTH_PROVIDERS = ["olist", "nuvemshop", "bling", "google", "meta"] as const;

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
  init?: RequestInit & { timeoutMs?: number },
): Promise<{ status: number; data: Record<string, unknown> }> {
  const token = await currentSessionToken();
  if (!token) {
    return { status: 401, data: { ok: false, detail: "no_session" } };
  }

  // Modo Sandbox Local: responde dados simulados para desenvolvimento seguro (zero chamadas à VPS)
  if (token === "sandbox_dev_session" || token.startsWith("sandbox_")) {
    if (path.includes("/providers")) {
      return {
        status: 200,
        data: {
          ok: true,
          tenant: "loja_sandbox_local",
          store_name: "Loja Sandbox (Local Dev)",
          display_name: "Maurício (Sandbox)",
          plan: "essencial",
          providers: [
            { id: "jueri", name: "Jueri", mode: "guided_key", connected: false, app_configured: true },
            { id: "olist", name: "Olist", mode: "oauth", connected: false, app_configured: true },
            { id: "nuvemshop", name: "Nuvemshop", mode: "oauth", connected: true, app_configured: true },
            { id: "google", name: "Google Workspace", mode: "oauth", connected: false, app_configured: true },
            { id: "notion", name: "Notion", mode: "guided_key", connected: false, app_configured: true },
            {
              id: "meta",
              name: "Meta",
              mode: "oauth",
              connected: true,
              app_configured: true,
              catalog_id: "sandbox-catalogo-1",
              catalog_name: "Catálogo Ritrovarsi (Sandbox)",
              business_id: "sandbox-negocio-1",
              product_source: "site_nuvemshop",
              sync_only_published: true,
              last_sync_at: null,
              last_sync_status: null,
              last_sync_summary: null,
              suggested_source: "site_nuvemshop",
            },
          ],
        },
      };
    }
    if (path.includes("/meta/catalog/source")) {
      return {
        status: 200,
        data: {
          ok: true,
          product_source: "site_nuvemshop",
          sync_only_published: true,
          expurgados: 0,
        },
      };
    }
    if (path.includes("/meta/catalog/catalogs")) {
      return {
        status: 200,
        data: {
          ok: true,
          selected_catalog_id: null,
          business_permission: true,
          catalogs: [
            { id: "1000000000000001", name: "Catálogo Ritrovarsi (Sandbox)", business_name: "Ritrovarsi" },
            { id: "1000000000000002", name: "Catálogo Antigo (Sandbox)", business_name: "Ritrovarsi" },
          ],
        },
      };
    }
    if (path.includes("/meta/catalog/select")) {
      return { status: 200, data: { ok: true, catalog_id: "1000000000000001", catalog_name: "Catálogo Ritrovarsi (Sandbox)" } };
    }
    if (path.includes("/meta/catalog/sync-now")) {
      return {
        status: 200,
        data: {
          ok: true,
          status: "sucesso",
          source: "site_nuvemshop",
          mensagem: "Sincronização de catálogo simulada em modo sandbox.",
          enviados: 5,
          summary: {
            total: 5,
            totalAvaliados: 5,
            enviados: 5,
            falhas: 0,
            erros: [],
            avisos: [],
            conjuntos: [{ id: "sandbox-set-1", nome: "Sandbox", totalProdutos: 5 }],
          },
          erros: [],
          avisos: [],
        },
      };
    }
    const slug = path.split("/")[3] || "provider";
    return {
      status: 200,
      data: {
        ok: true,
        provider: slug,
        authorize_url: `/workspace/integracoes?ok=${slug}`,
        detail: "sandbox_simulated",
      },
    };
  }

  return proxyMilaAuth(path, { ...init, sessionToken: token, timeoutMs: init?.timeoutMs });
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
