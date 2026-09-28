/**
 * Lógica pura do domínio do cookie de sessão — separada do wrapper `server-only`
 * para poder ser exercitada (e testada) fora do Next.
 */

/** Hosts do site que podem emitir o cookie de produção. */
export const PRODUCTION_COOKIE_HOSTS = ["milaai.com.br", "www.milaai.com.br"] as const;

/** Nome do cookie de sessão da mila (mesmo nome nos dois lados). */
export const SESSION_COOKIE = "mila_session";

/**
 * Filtra os `Set-Cookie` vindos do serviço de auth, deixando passar **só** a
 * sessão da mila.
 *
 * O cookie de sessão é montado no serviço de auth (que é quem sabe o domínio) e
 * chega pronto para ser repassado ao browser — o site **nunca** vê o valor do
 * token. Repassar verbatim é o ponto: as flags (`HttpOnly`, `Secure`,
 * `SameSite`) vêm de quem emitiu, então não existe caminho em que o JS leia a
 * sessão.
 *
 * ⚠️ Por que filtrar em vez de repassar tudo: um `Set-Cookie` de `.milaai.com.br`
 * vale para **todo** subdomínio. Se o upstream (ou um bug futuro nele) mandar
 * outro cookie, o site estaria publicando um cookie de domínio inteiro em nome
 * de outra origem. Só o cookie de sessão passa.
 */
export function pickSessionSetCookie(
  setCookieHeaders: readonly string[],
  cookieName: string = SESSION_COOKIE,
): string[] {
  const nome = `${cookieName}=`;
  return setCookieHeaders.filter((raw) => {
    const primeira = String(raw || "").split(";")[0].trim();
    return primeira.startsWith(nome);
  });
}

export interface ParsedSessionCookie {
  name: string;
  value: string;
  options: {
    path?: string;
    domain?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
}

/**
 * Converte a string de `Set-Cookie` vinda do auth nas opções esperadas pelo
 * `res.cookies.set(...)` do Next.js.
 *
 * Necessário porque o Next.js App Router (rodando no ambiente Serverless da Vercel)
 * serializa cookies a partir da coleção interna `res.cookies`. Usar apenas
 * `res.headers.append("Set-Cookie", ...)` não popula `res.cookies` e o header
 * é descartado pelo adapter da Vercel.
 */
export function parseSessionCookie(raw: string): ParsedSessionCookie | null {
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.split(";").map((p) => p.trim());
  const [first, ...attrs] = parts;
  if (!first) return null;
  const eqIdx = first.indexOf("=");
  if (eqIdx <= 0) return null;
  const name = first.slice(0, eqIdx).trim();
  const value = first.slice(eqIdx + 1).trim();

  const options: ParsedSessionCookie["options"] = {};
  for (const attr of attrs) {
    if (!attr) continue;
    const aEq = attr.indexOf("=");
    const key = (aEq > 0 ? attr.slice(0, aEq) : attr).trim().toLowerCase();
    const val = aEq > 0 ? attr.slice(aEq + 1).trim() : "";
    if (key === "path") {
      options.path = val;
    } else if (key === "domain") {
      options.domain = val;
    } else if (key === "max-age") {
      const num = parseInt(val, 10);
      if (!isNaN(num)) options.maxAge = num;
    } else if (key === "httponly") {
      options.httpOnly = true;
    } else if (key === "secure") {
      options.secure = true;
    } else if (key === "samesite") {
      const s = val.toLowerCase();
      if (s === "lax" || s === "strict" || s === "none") {
        options.sameSite = s;
      }
    }
  }
  return { name, value, options };
}

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
