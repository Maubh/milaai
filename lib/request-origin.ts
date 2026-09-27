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
