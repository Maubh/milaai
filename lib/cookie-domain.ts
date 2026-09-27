/**
 * Lógica pura do domínio do cookie de sessão — separada do wrapper `server-only`
 * para poder ser exercitada (e testada) fora do Next.
 */

/** Hosts do site que podem emitir o cookie de produção. */
export const PRODUCTION_COOKIE_HOSTS = ["milaai.com.br", "www.milaai.com.br"] as const;

/**
 * Domínio do cookie a partir do `Host` da requisição.
 *
 * O callback do OAuth mora em `wa.milaai.com.br` (só o VPS tem a credencial de
 * app), então o cookie precisa valer para `.milaai.com.br` — sem isso o
 * redirect do provedor chega sem sessão e todo callback cai em `sessao_expirada`.
 *
 * Apenas o apex e o `www` emitem o cookie de produção: um
 * `staging.milaai.com.br` futuro não vira dono do cookie (ele vazaria também
 * para `wa.` e para o apex). Preview/local segue host-only.
 *
 * `explicitOverride === "-"` força host-only; outro valor sobrepõe tudo.
 */
export function cookieDomainFor(
  hostHeader: string | null | undefined,
  explicitOverride?: string,
): string | undefined {
  const explicit = (explicitOverride ?? "").trim();
  if (explicit === "-") return undefined;
  if (explicit) return explicit;
  const host = String(hostHeader || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
  if (!host) return undefined;
  if ((PRODUCTION_COOKIE_HOSTS as readonly string[]).includes(host)) return ".milaai.com.br";
  return undefined;
}

export interface SessionCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
  domain?: string;
}

/**
 * Opções do cookie de sessão — regra pura, sem `next/headers`, para o teste
 * conseguir cobrir name/path/domain/secure/SameSite e o `Set-Cookie` que sai
 * no login e no logout.
 *
 * `domain` sai como `undefined` (e não como chave ausente) quando host-only:
 * é o que o `cookies().set` do Next espera.
 */
export function sessionCookieOptionsFor(
  hostHeader: string | null | undefined,
  maxAgeSeconds: number,
  explicitOverride?: string,
): SessionCookieOptions {
  const options: SessionCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  };
  const domain = cookieDomainFor(hostHeader, explicitOverride);
  if (domain) options.domain = domain;
  return options;
}

/**
 * Serializa o `Set-Cookie` como o browser recebe. Serve para o teste verificar
 * que login e logout mandam exatamente o mesmo cookie (o logout precisa expirar
 * o que o login gravou; nome/path/domain divergentes deixariam sessão órfã).
 */
export function sessionCookieHeader(
  options: SessionCookieOptions,
  value: string,
): string {
  const parts = [`mila_session=${value}`, `Path=${options.path}`, `Max-Age=${options.maxAge}`];
  if (options.domain) parts.push(`Domain=${options.domain}`);
  parts.push(`SameSite=Lax`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}
