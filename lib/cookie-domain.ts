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
