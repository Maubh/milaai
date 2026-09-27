/**
 * Defesa extra de CSRF nas rotas POST do site.
 *
 * O cookie de sessão é `SameSite=Lax`: isso já barra POST cross-site clássico.
 * Mas `milaai.com.br` e `wa.milaai.com.br` são *same-site* entre si, então um
 * subdomínio comprometido conseguiria um POST com cookie. Conferir o `Origin`
 * contra o host do próprio site fecha esse caso.
 *
 * Requisições sem `Origin` (curl, testes, chamadas server-to-server) são
 * aceitas: a sessão continua sendo a única credencial real.
 *
 * Módulo puro (nenhum import) para o teste poder construir `Request` de verdade
 * e conferir o 403 sem carregar o runtime do Next.
 */

const SITE_HOSTS = ["milaai.com.br", "www.milaai.com.br"];

/** Host da requisição, sem porta, em minúsculas. */
export function requestHost(hostHeader: string | null | undefined): string {
  return String(hostHeader || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
}

export function isSameOriginRequest(
  originHeader: string | null | undefined,
  hostHeader: string | null | undefined,
): boolean {
  const origin = (originHeader ?? "").trim();
  if (!origin) return true; // sem Origin: não é browser, e a sessão é a credencial
  if (origin === "null") return false;
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  const originHost = parsed.hostname.toLowerCase();
  const host = requestHost(hostHeader);
  if (!host) return false;
  if (originHost === host) return true;
  // Apex e www são o mesmo site para a lojista.
  return SITE_HOSTS.includes(originHost) && SITE_HOSTS.includes(host);
}

/** Negativa de same-origin já resolvida, pronta para virar resposta HTTP. */
export interface SameOriginDenial {
  status: 403;
  body: { ok: false; detail: "origem_invalida" };
}

/**
 * Aplica a checagem a uma `Request` de verdade.
 *
 * Devolve a negativa (para o chamador virar 403) ou `null` para seguir. Fica
 * aqui, e não junto do wrapper do Next, para o teste exercitar o caminho
 * completo — cabeçalhos reais entrando, 403 saindo.
 */
export function sameOriginDenial(req: Request): SameOriginDenial | null {
  if (isSameOriginRequest(req.headers.get("origin"), req.headers.get("host"))) {
    return null;
  }
  return { status: 403, body: { ok: false, detail: "origem_invalida" } };
}
