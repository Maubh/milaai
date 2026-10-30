/**
 * Catálogo e estado das integrações — puro, compartilhado pela página de
 * integrações (server) e pela visão geral (client), para as duas dizerem a
 * mesma coisa. Quem informa conexão é o vault (lista de provedores do BFF).
 */

export interface ProviderLive {
  id: string;
  name?: string;
  connected?: boolean;
  app_configured?: boolean;
  product_source?: string | null;
  last_sync_at?: number | null;
}

export const GROUPS = [
  { id: "vendas", title: "Estoque e vendas", description: "As peças da sua loja, do estoque à vitrine.", providers: ["jueri", "olist", "nuvemshop", "meta"] },
  { id: "fornecedores", title: "Fornecedores e compras", description: "Escolha onde organizar seus fornecedores e compras.", providers: ["google", "notion"] },
  { id: "organizacao", title: "Organização da loja", description: "Tarefas, compras e pendências em um quadro simples.", providers: ["trello"] },
] as const satisfies ReadonlyArray<{ id: string; title: string; description: string; providers: readonly string[] }>;

const ORDER: readonly string[] = GROUPS.flatMap((g) => [...g.providers]);

export function groupOf(id: string): string {
  return GROUPS.find((g) => (g.providers as readonly string[]).includes(id))?.id ?? "";
}

/**
 * Ferramentas visíveis para a loja. Bling fica fora; Meta só aparece quando o
 * backend inclui o provedor na lista desta loja (allowlist).
 */
export function visibleCatalog<T extends { id: string }>(items: readonly T[], byId: Map<string, unknown>): T[] {
  return items
    .filter((i) => i.id !== "bling" && (i.id !== "meta" || byId.has("meta")))
    .sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
}

export type RowState = "connected" | "available" | "soon" | "unknown" | "locked";
export type RowTone = "positive" | "neutral" | "pro" | "error";

export interface RowStatus {
  state: RowState;
  /** Exige Pro pela categoria original da ferramenta. */
  requiresPro: boolean;
  /** Estado de conexão para exibir; null quando o selo Pro já diz tudo. */
  status: { label: string; tone: RowTone } | null;
}

/**
 * `userPlan` null = plano não lido. Nesse caso a mila não presume Pro: as
 * ferramentas que dependem do plano ficam "Não verificado".
 */
export function rowStatus(id: string, live: ProviderLive | undefined, userPlan: string | null): RowStatus {
  const requiresPro = groupOf(id) === "vendas";
  const connected = live?.connected === true;
  if (connected) return { state: "connected", requiresPro, status: { label: "Conectado", tone: "positive" } };
  if (requiresPro && userPlan === null) return { state: "unknown", requiresPro, status: { label: "Não verificado", tone: "neutral" } };
  if (requiresPro && userPlan !== "pro") return { state: "locked", requiresPro, status: null };
  if (!live) return { state: "unknown", requiresPro, status: { label: "Não verificado", tone: "neutral" } };
  if (!live.app_configured) return { state: "soon", requiresPro, status: { label: "Em breve", tone: "neutral" } };
  return { state: "available", requiresPro, status: { label: "Disponível", tone: "neutral" } };
}
