/**
 * Testes das regras puras do fluxo de integração/sessão do site.
 *
 * Rodam com o test runner do Node (type stripping nativo), sem Next:
 *   npm test
 *
 * Cobrem exatamente os pontos que o review apontou como risco silencioso:
 * domínio do cookie (o callback do OAuth depende dele), projeção do status de
 * conector (nunca vazar campo cru do upstream) e vocabulário de erro.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { cookieDomainFor, PRODUCTION_COOKIE_HOSTS } from "../lib/cookie-domain.ts";
import {
  sanitizeProviderList,
  sanitizeProviderStatus,
  PROVIDER_PUBLIC_KEYS,
} from "../lib/provider-status.ts";
import { integrationErrorText, isSafeAuthorizeUrl } from "../lib/integration-errors.ts";
import { isSameOriginRequest, requestHost } from "../lib/request-origin.ts";

test("cookie: apex e www emitem cookie de produção", () => {
  assert.equal(cookieDomainFor("milaai.com.br"), ".milaai.com.br");
  assert.equal(cookieDomainFor("www.milaai.com.br"), ".milaai.com.br");
  assert.equal(cookieDomainFor("MILAAI.COM.BR"), ".milaai.com.br");
  assert.equal(cookieDomainFor("www.milaai.com.br:443"), ".milaai.com.br");
});

test("cookie: staging não vira dono do cookie de produção", () => {
  // Regressão: antes qualquer *.milaai.com.br recebia Domain=.milaai.com.br,
  // o que faria um staging futuro vazar sessão para wa. e para o apex.
  assert.equal(cookieDomainFor("staging.milaai.com.br"), undefined);
  assert.equal(cookieDomainFor("wa.milaai.com.br"), undefined);
  assert.equal(cookieDomainFor("preview-abc.vercel.app"), undefined);
  assert.equal(cookieDomainFor("localhost:3000"), undefined);
  assert.equal(cookieDomainFor(""), undefined);
  assert.equal(cookieDomainFor(null), undefined);
  assert.equal(cookieDomainFor(undefined), undefined);
});

test("cookie: override explícito vence; '-' força host-only", () => {
  assert.equal(cookieDomainFor("milaai.com.br", ".outro.com"), ".outro.com");
  assert.equal(cookieDomainFor("milaai.com.br", "-"), undefined);
  assert.equal(cookieDomainFor("preview.vercel.app", " .milaai.com.br "), ".milaai.com.br");
});

test("cookie: a lista de hosts de produção é fechada", () => {
  assert.deepEqual([...PRODUCTION_COOKIE_HOSTS], ["milaai.com.br", "www.milaai.com.br"]);
});

test("providers: projeta só os campos públicos", () => {
  const raw = {
    id: "olist",
    name: "Olist",
    mode: "oauth",
    connected: true,
    app_configured: true,
    /* campos que não devem passar para o browser */
    access_token: "secreto",
    client_secret: "secreto",
    tenant_id: "loja-123",
  };
  const out = sanitizeProviderStatus(raw);
  assert.deepEqual(Object.keys(out ?? {}).sort(), [...PROVIDER_PUBLIC_KEYS].sort());
  assert.equal(out?.connected, true);
  assert.equal("access_token" in (out ?? {}), false);
  assert.equal("client_secret" in (out ?? {}), false);
  assert.equal("tenant_id" in (out ?? {}), false);
});

test("providers: descarta item sem id e lixo não-array", () => {
  assert.equal(sanitizeProviderStatus({ name: "sem id" }), null);
  assert.equal(sanitizeProviderStatus(null), null);
  assert.equal(sanitizeProviderStatus("olist"), null);
  assert.deepEqual(sanitizeProviderList(null), []);
  assert.deepEqual(sanitizeProviderList({}), []);
  assert.deepEqual(sanitizeProviderList([{ name: "x" }]), []);
  assert.deepEqual(
    sanitizeProviderList([{ id: "olist" }, null, { id: "bling" }]).map((p) => p.id),
    ["olist", "bling"],
  );
});

test("erros: detail conhecido vira PT; desconhecido não vaza texto cru", () => {
  assert.match(integrationErrorText("state_reused"), /já foi usada/i);
  assert.match(integrationErrorText("sessao_expirada"), /sessão expirou/i);
  assert.doesNotMatch(integrationErrorText("erro_interno_xyz"), /erro_interno_xyz/);
  assert.match(integrationErrorText(undefined), /Não foi possível conectar/);
  assert.match(integrationErrorText("chave_longa"), /longa demais/i);
});

test("authorize_url: só https em host oficial de provedor", () => {
  assert.equal(isSafeAuthorizeUrl("https://accounts.tiny.com.br/oauth/nv2"), true);
  assert.equal(isSafeAuthorizeUrl("https://accounts.google.com/o/oauth2/v2/auth"), true);
  assert.equal(isSafeAuthorizeUrl("http://accounts.tiny.com.br/oauth"), false);
  assert.equal(isSafeAuthorizeUrl("https://evil.example.com/oauth"), false);
  assert.equal(isSafeAuthorizeUrl("javascript:alert(1)"), false);
  assert.equal(isSafeAuthorizeUrl(undefined), false);
});

test("same-origin: apex e www são o mesmo site; subdomínio alheio não", () => {
  assert.equal(isSameOriginRequest("https://milaai.com.br", "milaai.com.br"), true);
  assert.equal(isSameOriginRequest("https://www.milaai.com.br", "milaai.com.br"), true);
  assert.equal(isSameOriginRequest("https://milaai.com.br", "www.milaai.com.br"), true);
  // wa. é o VPS: não pode disparar POST com o cookie da loja.
  assert.equal(isSameOriginRequest("https://wa.milaai.com.br", "milaai.com.br"), false);
  assert.equal(isSameOriginRequest("https://evil.example.com", "milaai.com.br"), false);
  assert.equal(isSameOriginRequest("null", "milaai.com.br"), false);
});

test("same-origin: sem Origin passa (clientes que não são browser)", () => {
  assert.equal(isSameOriginRequest(undefined, "milaai.com.br"), true);
  assert.equal(isSameOriginRequest(null, "milaai.com.br"), true);
  assert.equal(isSameOriginRequest("", "milaai.com.br"), true);
});

test("requestHost normaliza porta e caixa", () => {
  assert.equal(requestHost("MILAAI.com.br:443"), "milaai.com.br");
  assert.equal(requestHost("localhost:3000"), "localhost");
  assert.equal(requestHost(null), "");
});
