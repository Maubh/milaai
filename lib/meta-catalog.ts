/**
 * Regras compartilhadas das rotas BFF do catálogo Meta (módulo puro).
 *
 * A allowlist de fontes vive num lugar só: a rota de source e a de sync-now
 * validam contra o mesmo `Set`, então um POST artesanal não consegue injetar
 * `source_override` arbitrário nem pular a confirmação de duplicação via
 * `force` (campo que a UI nunca envia e as rotas nunca aceitam).
 */

/** Fontes oficiais de produtos aceitas pelo backend (`agent/lib/meta_catalog.ts`). */
export const META_PRODUCT_SOURCES = new Set([
  "mila",
  "erp_olist",
  "erp_jueri",
  "site_nuvemshop",
  "site",
  "other",
] as const);

export function isValidProductSource(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const s = v.trim();
  return s.length > 0 && (META_PRODUCT_SOURCES as Set<string>).has(s);
}

/** Teto de itens de texto vindos do VPS antes de repassar ao browser. */
const META_MAX_ITEMS = 20;
const META_MAX_TEXT = 300;

function textoSeguro(v: unknown): string {
  const s = typeof v === "string" ? v : String(v ?? "");
  return s.length > META_MAX_TEXT ? s.slice(0, META_MAX_TEXT) : s;
}

function numeroOuIndefinido(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function listaTexto(
  v: unknown,
): Array<{ item: string; erro?: string; aviso?: string }> | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, META_MAX_ITEMS).map((e) => {
    // Primitivo (número, booleano) ou null: `in` lançaria TypeError.
    if (typeof e !== "object" || e === null) {
      return { item: "", erro: textoSeguro(e) };
    }
    const o = e as Record<string, unknown>;
    if ("aviso" in o) return { item: textoSeguro(o.item), aviso: textoSeguro(o.aviso) };
    return { item: textoSeguro(o.item), erro: textoSeguro(o.erro) };
  });
}

function listaConjuntos(v: unknown): Array<{ id: string; nome: string; totalProdutos: number }> | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, META_MAX_ITEMS).map((c) => {
    if (typeof c !== "object" || c === null) {
      return { id: "", nome: textoSeguro(c), totalProdutos: 0 };
    }
    const o = c as Record<string, unknown>;
    return {
      id: textoSeguro(o.id),
      nome: textoSeguro(o.nome),
      totalProdutos: typeof o.totalProdutos === "number" && Number.isFinite(o.totalProdutos) ? o.totalProdutos : 0,
    };
  });
}

/**
 * Sanitiza a resposta do VPS do catálogo antes de entregar ao browser.
 *
 * As rotas `app/api/oauth/*` usam `sanitizeOAuthResponse`; as rotas de
 * catálogo seguem a mesma convenção com allowlist própria, em vez de
 * repassar o JSON cru do VPS.
 */
export function sanitizeMetaCatalogResponse(
  data: Record<string, unknown>,
): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const out: Record<string, unknown> = {};
  if (typeof data.ok === "boolean") out.ok = data.ok;
  if (typeof data.detail === "string") out.detail = textoSeguro(data.detail);
  if (typeof data.status === "string") out.status = textoSeguro(data.status);
  if (typeof data.mensagem === "string") out.mensagem = textoSeguro(data.mensagem);
  if (typeof data.source === "string") out.source = textoSeguro(data.source);
  if (typeof data.product_source === "string") out.product_source = textoSeguro(data.product_source);
  if (typeof data.sync_only_published === "boolean") {
    out.sync_only_published = data.sync_only_published;
  }
  if (typeof data.expurgados === "number" && Number.isFinite(data.expurgados)) {
    out.expurgados = data.expurgados;
  }
  for (const k of [
    "total",
    "totalAvaliados",
    "totalAptos",
    "totalEnviados",
    "totalNovos",
    "totalAtualizados",
    "totalExcluidos",
    "totalErros",
    "enviados",
    "falhas",
    "conjuntosCriados",
    "colecoesCriadas",
  ]) {
    const n = numeroOuIndefinido(data[k]);
    if (n !== undefined) out[k] = n;
  }
  const erros = listaTexto(data.erros);
  if (erros !== undefined) out.erros = erros;
  const avisos = listaTexto(data.avisos);
  if (avisos !== undefined) out.avisos = avisos;
  const conjuntos = listaConjuntos(data.conjuntos);
  if (conjuntos !== undefined) out.conjuntos = conjuntos;
  if (data.summary && typeof data.summary === "object") {
    out.summary = sanitizeMetaCatalogResponse(data.summary as Record<string, unknown>);
  }
  return out;
}
