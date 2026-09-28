/**
 * Testes das regras puras do fluxo de integração/sessão do site.
 *
 * Rodam com o test runner do Node (type stripping nativo), sem Next:
 *   npm test
 *
 * Cobrem os pontos que o review apontou como risco silencioso: domínio do
 * cookie (o callback do OAuth depende dele), o `Set-Cookie` real do login e do
 * logout, a projeção do status de conector (nunca vazar campo cru do upstream),
 * o 403 do same-origin numa `Request` de verdade e o teto de body.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  cookieDomainFor,
  pickSessionSetCookie,
  SESSION_COOKIE,
  sessionCookieOptionsFor,
  sessionCookieHeader,
  PRODUCTION_COOKIE_HOSTS,
} from "../lib/cookie-domain.ts";
import {
  sanitizeProviderList,
  sanitizeProviderStatus,
  PROVIDER_PUBLIC_KEYS,
} from "../lib/provider-status.ts";
import { integrationErrorText, isSafeAuthorizeUrl } from "../lib/integration-errors.ts";
import { isSameOriginRequest, requestHost, sameOriginDenial } from "../lib/request-origin.ts";
import { readJsonBounded } from "../lib/bounded-json.ts";
import { WORKSPACE_LOGIN_REDIRECT, shouldRedirectToLogin } from "../lib/workspace-gate.ts";
import { shouldShowMissingPhoneNote } from "../lib/verify-ui.ts";

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

test("Set-Cookie: só o cookie de sessão é repassado, verbatim", () => {
  // O auth manda a sessão pronta (inclusive o Domain decidido por ele). O site
  // repassa sem tocar: é assim que o HttpOnly fica de pé — o JS do site nunca
  // vê o valor do token.
  const upstream = [
    "mila_session=tok_opaco; Path=/; Max-Age=1209600; HttpOnly; SameSite=Lax; Secure; Domain=milaai.com.br",
    "rastreador=abc; Path=/",
    "outro_session=nope; Path=/",
    "",
  ];
  const repassados = pickSessionSetCookie(upstream);
  assert.equal(repassados.length, 1);
  assert.match(repassados[0], /^mila_session=tok_opaco;/);
  // Domain e flags vêm do emissor, sem alteração do site.
  assert.match(repassados[0], /Domain=milaai\.com\.br/);
  assert.match(repassados[0], /HttpOnly/);
  assert.match(repassados[0], /Secure/);
});

test("Set-Cookie: cookie de nome parecido não passa", () => {
  // `mila_session_old` começa com os mesmos caracteres: sem o `=`, o filtro
  // por prefixo deixaria passar um cookie que não é a sessão.
  assert.deepEqual(pickSessionSetCookie(["mila_session_old=x; Path=/"]), []);
  assert.deepEqual(pickSessionSetCookie(["session=x; Path=/"]), []);
  assert.deepEqual(pickSessionSetCookie([]), []);
});

test("Set-Cookie: sem sessão do upstream, nenhum cookie é criado", () => {
  // Fail-closed: o site não inventa cookie a partir de token no JSON.
  assert.deepEqual(pickSessionSetCookie(["outro=1; Path=/"]), []);
});

test("cookie: o nome da sessão é o mesmo dos dois lados", () => {
  // Divergência aqui = logout que não apaga (sessão órfã por 14 dias).
  assert.equal(SESSION_COOKIE, "mila_session");
  const header = sessionCookieHeader(sessionCookieOptionsFor("milaai.com.br", 60), "t");
  assert.match(header, new RegExp(`^${SESSION_COOKIE}=`));
});

test("Set-Cookie: login grava a sessão com as flags certas", () => {
  const header = sessionCookieHeader(sessionCookieOptionsFor("milaai.com.br", 1209600), "tok123");
  assert.match(header, /^mila_session=tok123;/);
  assert.match(header, /Domain=\.milaai\.com\.br/);
  assert.match(header, /Path=\//);
  assert.match(header, /Max-Age=1209600/);
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  assert.match(header, /SameSite=Lax/);
});

test("Set-Cookie: logout expira exatamente o mesmo cookie que o login gravou", () => {
  // Regressão real: se o logout mudasse Domain/Path, o cookie de produção
  // continuaria vivo no browser por 14 dias ("logout" que não desloga).
  // Max-Age é a única diferença esperada (0 = expira agora).
  for (const host of ["milaai.com.br", "www.milaai.com.br"]) {
    const login = sessionCookieHeader(sessionCookieOptionsFor(host, 1209600), "tok");
    const logout = sessionCookieHeader(sessionCookieOptionsFor(host, 0), "");
    const identity = (h: string) =>
      h
        .split("; ")
        .slice(1)
        .filter((attr) => !attr.startsWith("Max-Age="))
        .sort();
    assert.deepEqual(identity(logout), identity(login));
    assert.match(logout, /Max-Age=0/);
  }
  // Preview/local: host-only nos dois, e sem Domain no header.
  const local = sessionCookieHeader(sessionCookieOptionsFor("preview.vercel.app", 0), "");
  assert.doesNotMatch(local, /Domain=/);
  assert.equal(sessionCookieOptionsFor("preview.vercel.app", 60, "-").domain, undefined);
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
  assert.match(integrationErrorText("origem_invalida"), /endereço inesperado/i);
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

test("same-origin: 403 numa Request real, e liberado quando é o próprio site", () => {
  const postFromVps = new Request("https://milaai.com.br/api/oauth/olist/revoke", {
    method: "POST",
    headers: { origin: "https://wa.milaai.com.br", host: "milaai.com.br" },
  });
  const denial = sameOriginDenial(postFromVps);
  assert.equal(denial?.status, 403);
  assert.deepEqual(denial?.body, { ok: false, detail: "origem_invalida" });

  const fromSite = new Request("https://milaai.com.br/api/oauth/olist/revoke", {
    method: "POST",
    headers: { origin: "https://milaai.com.br", host: "milaai.com.br" },
  });
  assert.equal(sameOriginDenial(fromSite), null);

  const fromCurl = new Request("https://milaai.com.br/api/oauth/olist/revoke", { method: "POST" });
  assert.equal(sameOriginDenial(fromCurl), null);
});

test("requestHost normaliza porta e caixa", () => {
  assert.equal(requestHost("MILAAI.com.br:443"), "milaai.com.br");
  assert.equal(requestHost("localhost:3000"), "localhost");
  assert.equal(requestHost(null), "");
});

test("body: chave dentro do teto passa; acima do teto corta antes de parsear", async () => {
  const okReq = new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body: JSON.stringify({ key: "x".repeat(64) }),
  });
  const ok = await readJsonBounded(okReq, 8192);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal((ok.data.key as string).length, 64);

  // Content-Length declarado já barra: nem lê o corpo.
  const huge = new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body: JSON.stringify({ key: "x".repeat(20_000) }),
  });
  const tooBig = await readJsonBounded(huge, 8192);
  assert.deepEqual(tooBig, { ok: false, reason: "too_large" });
});

/** Corpo em stream, sem Content-Length — força o caminho getReader()/cancel(). */
function streamedRequest(chunks: string[]): Request {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
  return new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body,
    // @ts-expect-error duplex é exigido pelo Node para body em stream
    duplex: "half",
  });
}

test("body: stream sem Content-Length respeita o teto e corta no meio", async () => {
  // O teste acima cai no atalho do Content-Length; este exercita o laço de
  // leitura, que é o que protege quando o tamanho não vem declarado.
  const big = await readJsonBounded(streamedRequest(["x".repeat(6_000), "y".repeat(6_000)]), 8192);
  assert.deepEqual(big, { ok: false, reason: "too_large" });

  // Stream partido bem na borda do teto, terminando dentro dele: passa.
  const edges = await readJsonBounded(
    streamedRequest(['{"key":"', "a".repeat(4_000), "b".repeat(4_000), '"}']),
    8192,
  );
  assert.equal(edges.ok, true);
  if (edges.ok) assert.equal((edges.data.key as string).length, 8_000);

  // UTF-8 multibyte partido entre chunks não corrompe o decode.
  const multi = await readJsonBounded(
    streamedRequest(['{"key":"', "ção".repeat(1_000), '"}']),
    8192,
  );
  assert.equal(multi.ok, true);
  if (multi.ok) assert.equal(multi.data.key, "ção".repeat(1_000));
});

test("body: stream quebrado é invalid_json, não too_large", async () => {
  // Erro de leitura não é corpo grande: o detalhe devolvido ao cliente precisa
  // dizer a verdade (antes virava 413 chave_longa).
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"key":"abc'));
      controller.error(new Error("conexão caiu no meio"));
    },
  });
  const req = new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body,
    // @ts-expect-error duplex é exigido pelo Node para body em stream
    duplex: "half",
  });
  assert.deepEqual(await readJsonBounded(req, 8192), { ok: false, reason: "invalid_json" });
});

test("body: JSON quebrado, vazio e escalar viram invalid_json", async () => {
  const broken = new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body: "{nao-e-json",
  });
  assert.deepEqual(await readJsonBounded(broken, 8192), { ok: false, reason: "invalid_json" });

  const empty = new Request("https://milaai.com.br/api/oauth/jueri/key", { method: "POST" });
  assert.deepEqual(await readJsonBounded(empty, 8192), { ok: false, reason: "invalid_json" });

  const array = new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body: '["a"]',
  });
  assert.deepEqual(await readJsonBounded(array, 8192), { ok: false, reason: "invalid_json" });

  const scalar = new Request("https://milaai.com.br/api/oauth/jueri/key", {
    method: "POST",
    body: '"chave"',
  });
  assert.deepEqual(await readJsonBounded(scalar, 8192), { ok: false, reason: "invalid_json" });
});

test("gate do workspace: só o cookie autoriza, e o destino explica o motivo", () => {
  // O crachá é o cookie HttpOnly. Sem ele, servidor redireciona ANTES de
  // renderizar — o localStorage deixou de ser fechadura.
  assert.equal(shouldRedirectToLogin(null), true);
  assert.equal(shouldRedirectToLogin(undefined), true);
  assert.equal(shouldRedirectToLogin(""), true);
  // `Set-Cookie` de logout pode deixar string vazia ou só espaços: não é sessão.
  assert.equal(shouldRedirectToLogin("   "), true);

  assert.equal(shouldRedirectToLogin("token-opaco"), false);

  // O destino carrega a causa, então a tela de login explica em vez de ficar muda.
  assert.equal(WORKSPACE_LOGIN_REDIRECT, "/login?erro=sessao_necessaria");
  assert.match(WORKSPACE_LOGIN_REDIRECT, /^\/login\?erro=/);
  // E a causa tem texto próprio: quem bate no workspace vindo de um link não
  // leu "para conectar a integração", que é de outro fluxo.
  const texto = integrationErrorText("sessao_necessaria");
  assert.match(texto, /abrir sua área/i);
  assert.doesNotMatch(texto, /integra/i);
});

test("tela do código: só acusa 'sem número' depois de ler o storage", () => {
  // `null` é o primeiro render (servidor + hidratação), antes de ler o
  // localStorage. Avisar aí produzia um recado falso no caminho feliz: quem
  // acabou de informar o número via "Sem número ainda. Informe seu WhatsApp".
  assert.equal(shouldShowMissingPhoneNote(null), false);
  // `""` é leitura concluída e nada guardado — aí o aviso é verdadeiro.
  assert.equal(shouldShowMissingPhoneNote(""), true);
  assert.equal(shouldShowMissingPhoneNote("31999999999"), false);
});

test("chave colada: cada recusa do provedor tem o SEU texto", () => {
  // Furo medido 2026-09-28: a tela dizia "Conectado com sucesso!" para qualquer
  // chave de 8+ caracteres. Agora os motivos chegam à lojista — e cada um
  // precisa ser distinguível, senão ela não sabe o que corrigir.
  const recusada = integrationErrorText("credencial_invalida");
  assert.match(recusada, /provedor recusou/i);
  assert.match(recusada, /nada foi conectado/i);

  const fora = integrationErrorText("nao_verificavel_agora");
  assert.match(fora, /não conseguimos falar/i);
  assert.match(fora, /nada foi conectado/i);
  assert.notEqual(recusada, fora, "chave errada ≠ provedor fora do ar");

  // Jueri precisa dos DOIS valores: confundir os dois faz a lojista trocar o
  // token quando o problema era o código de cliente.
  assert.match(integrationErrorText("cliente_obrigatorio"), /código de cliente/i);
  assert.notEqual(
    integrationErrorText("cliente_invalido"),
    recusada,
    "código de cliente inválido ≠ token inválido",
  );

  // Sem validador não há como dizer "conectado" — e a tela admite isso.
  assert.match(integrationErrorText("sem_verificador"), /nada foi conectado/i);

  // Nenhum desses pode cair no silêncio do genérico.
  const generico = integrationErrorText(undefined);
  for (const codigo of [
    "credencial_invalida",
    "nao_verificavel_agora",
    "cliente_obrigatorio",
    "cliente_invalido",
    "sem_verificador",
  ]) {
    assert.notEqual(integrationErrorText(codigo), generico, codigo);
  }
});
