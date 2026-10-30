/** Run after a synthetic `npm run build`. Never reads env files or real credentials. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer, request as httpRequest, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const standalone = join(root, ".next/standalone");
const authSecret = "synthetic-auth-only";
const internalSecret = "synthetic-internal-only";
const session = "synthetic-session-only";
const phone = "5500000000000";
const seen: Array<{ path: string; method: string; headers: Record<string, unknown>; body: unknown }> = [];
const mockErrors: unknown[] = [];

async function listen(server: Server): Promise<number> {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return address.port;
}

const mock = createServer(async (req, res) => {
  try {
    const path = new URL(req.url!, "http://127.0.0.1").pathname;
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const raw = Buffer.concat(chunks).toString();
    const body = raw ? JSON.parse(raw) : undefined;
    seen.push({ path, method: req.method!, headers: { ...req.headers }, body });
    res.setHeader("content-type", "application/json");
    const json = (data: unknown) => res.end(JSON.stringify(data));
    if (path === "/api/internal/showcase") {
      assert.equal(req.headers.authorization, `Bearer ${internalSecret}`);
      res.statusCode = 410;
      json({ ok: false, tituloColecao: "Coleção Sintética", loja: { nomeExibicao: "Loja Sintética", whatsappContato: phone } });
      return;
    }
    assert.equal(req.headers["x-mila-auth-secret"], authSecret);
    if (!["/api/auth/otp/start", "/api/auth/otp/verify", "/api/billing/plans"].includes(path)) {
      assert.equal(req.headers["x-mila-session"], session);
    }
    switch (path) {
      case "/api/auth/otp/start":
        json({ ok: true, phone, ttl_seconds: 300, private_debug: "must-not-leak" });
        return;
      case "/api/auth/otp/verify":
        res.setHeader("set-cookie", [
          `mila_session=${session}; Path=/; Domain=.milaai.com.br; Max-Age=1209600; Secure; HttpOnly; SameSite=Lax`,
          "other_cookie=must-not-leak; Path=/",
        ]);
        json({ ok: true, phone, plan: "pro", session_token: "must-not-leak", tenant_id: "must-not-leak" });
        return;
      case "/api/oauth/providers":
        json({ ok: true, tenant: "loja-sintetica", plan: "pro", providers: [{ id: "meta", connected: true, access_token: "must-not-leak" }] });
        return;
      case "/api/oauth/google/start":
        json({ ok: true, authorize_url: "https://accounts.google.com/o/oauth2/v2/auth?state=synthetic", access_token: "must-not-leak" });
        return;
      case "/api/billing/plans":
        json({ ok: true, plans: [{ id: "pro", price: 69 }] });
        return;
      case "/api/billing/order":
        res.statusCode = 201;
        json({ ok: true, order_id: "synthetic-order" });
        return;
      case "/api/meta/catalog/sync-now":
        json({ ok: true, status: "sucesso", enviados: 0, access_token: "must-not-leak" });
        return;
      case "/api/workspace/dados-loja":
        json({ ok: true, dados: { nome_loja: "Loja Sintética", private_debug: "must-not-leak" } });
        return;
      case "/api/auth/logout":
        assert.equal(req.headers.cookie, `mila_session=${session}`);
        json({ ok: true, revoked: true });
        return;
      default:
        throw new Error(`Unexpected mock path ${path}`);
    }
  } catch (error) {
    mockErrors.push(error);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, detail: "mock_assertion_failed" }));
  }
});

const mockPort = await listen(mock);
const reservation = createServer();
const sitePort = await listen(reservation);
await new Promise<void>((done) => reservation.close(() => done()));
const home = await mkdtemp(join(tmpdir(), "milaai-site-smoke-"));
let child: ReturnType<typeof spawn> | undefined;
let logs = "";
let checks = 0;

try {
  await cp(join(root, "public"), join(standalone, "public"), { recursive: true });
  await cp(join(root, ".next/static"), join(standalone, ".next/static"), { recursive: true });
  child = spawn(process.execPath, ["--dns-result-order=ipv4first", join(standalone, "server.js")], {
    cwd: standalone,
    // Intentionally NOT ...process.env. Turnstile has no secret => no real network call.
    env: {
      HOME: home, PATH: "/usr/bin:/bin", NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
      HOSTNAME: "localhost", PORT: String(sitePort),
      MILA_AUTH_BASE: `http://127.0.0.1:${mockPort}`, MILA_AUTH_SECRET: authSecret,
      MILA_INTERNAL_API_URL: `http://127.0.0.1:${mockPort}`, MILA_INTERNAL_HMAC_SECRET: internalSecret,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (chunk) => { logs = (logs + chunk).slice(-12_000); });
  child.stderr?.on("data", (chunk) => { logs = (logs + chunk).slice(-12_000); });

  // Undici fetch ignores a custom Host in Node 24; use HTTP directly so this
  // actually tests the public Host + forwarded protocol seen behind the tunnel.
  const request = (path: string, init: RequestInit = {}, host = "milaai.com.br"): Promise<Response> => new Promise((done, reject) => {
    const headers = new Headers({ Host: host, "X-Forwarded-Proto": "https", ...init.headers });
    const req = httpRequest({ hostname: "127.0.0.1", port: sitePort, path, method: init.method ?? "GET", headers: Object.fromEntries(headers) }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      res.on("error", reject);
      res.on("end", () => {
        const responseHeaders = new Headers();
        for (let i = 0; i < res.rawHeaders.length; i += 2) responseHeaders.append(res.rawHeaders[i], res.rawHeaders[i + 1]);
        done(new Response(Buffer.concat(chunks), { status: res.statusCode!, headers: responseHeaders }));
      });
    });
    req.setTimeout(10_000, () => req.destroy(new Error(`Loopback request timed out: ${path}`)));
    req.on("error", reject);
    req.end(init.body);
  });
  const post = (path: string, body: unknown, extra: Record<string, string> = {}) => request(path, {
    method: "POST", body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Origin: "https://milaai.com.br", ...extra },
  });
  const cookieHeader = { Cookie: `mila_session=${session}` };
  const expectStatus = (response: Response, status: number) => { assert.equal(response.status, status); checks++; };
  const safeJson = async (response: Response) => {
    const text = await response.text();
    assert.ok(!text.includes("must-not-leak"));
    assert.ok(!text.includes(authSecret) && !text.includes(internalSecret));
    return JSON.parse(text);
  };

  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (child.exitCode !== null) throw new Error(`Standalone exited ${child.exitCode}\n${logs}`);
    try {
      ready = (await request("/api/health", {}, "127.0.0.1")).status === 200;
      if (ready) break;
    } catch { /* only a not-yet-listening loopback socket is retried */ }
    await new Promise((done) => setTimeout(done, 100));
  }
  assert.ok(ready, logs);

  const health = await request("/api/health", {}, "127.0.0.1");
  expectStatus(health, 200);
  assert.equal(health.headers.get("cache-control"), "no-store");
  assert.deepEqual(await health.json(), { ok: true });
  assert.equal(seen.length, 0);

  const buildId = (await readFile(join(root, ".next/BUILD_ID"), "utf8")).trim();
  const nextAsset = `/_next/static/${buildId}/_buildManifest.js`;
  for (const host of ["milaai.com.br", "www.milaai.com.br"]) {
    for (const path of ["/", "/login", "/login/verify", "/privacidade", "/termos", "/exclusao-de-dados", "/favicon.svg"]) {
      const response = await request(path, {}, host);
      expectStatus(response, 200);
      assert.equal(response.headers.get("strict-transport-security"), "max-age=63072000");
      await response.arrayBuffer();
    }
    const http = await request("/login?probe=synthetic", { headers: { "X-Forwarded-Proto": "http" } }, host);
    expectStatus(http, 308);
    assert.equal(http.headers.get("location"), `https://${host}/login?probe=synthetic`);
    await http.arrayBuffer();
    const httpAsset = await request("/favicon.svg", { headers: { "X-Forwarded-Proto": "http" } }, host);
    expectStatus(httpAsset, 308);
    assert.equal(httpAsset.headers.get("location"), `https://${host}/favicon.svg`);
    expectStatus(await request(nextAsset, {}, host), 200);
    const httpNextAsset = await request(nextAsset, { headers: { "X-Forwarded-Proto": "http" } }, host);
    expectStatus(httpNextAsset, 308);
    assert.equal(httpNextAsset.headers.get("location"), `https://${host}${nextAsset}`);
    const markdown = await request("/login*?probe=synthetic", {}, host);
    expectStatus(markdown, 308);
    assert.equal(markdown.headers.get("location"), `https://${host}/login?probe=synthetic`);
    await markdown.arrayBuffer();
  }
  const workspace = await request("/workspace/integracoes");
  expectStatus(workspace, 307);
  assert.equal(workspace.headers.get("location"), "/login?erro=sessao_necessaria&destino=%2Fworkspace%2Fintegracoes");
  await workspace.arrayBuffer();
  const onboarding = await request("/onboarding/connect");
  expectStatus(onboarding, 307);
  assert.match(onboarding.headers.get("location")!, /\/login\/verify$/);
  await onboarding.arrayBuffer();

  expectStatus(await request("/api/session"), 401);
  assert.equal(seen.length, 0);
  const turnstile = await post("/api/turnstile", { token: "synthetic-invalid-token" });
  expectStatus(turnstile, 500); // no secret: fail closed, no Cloudflare request
  assert.deepEqual(await turnstile.json(), { ok: false });

  const start = await post("/api/auth/otp/start", { phone });
  expectStatus(start, 200);
  assert.equal((await safeJson(start)).ok, true);
  const verify = await post("/api/auth/otp/verify", { phone, code: "123456" });
  expectStatus(verify, 200);
  assert.equal((await safeJson(verify)).ok, true);
  const setCookie = verify.headers.getSetCookie();
  assert.equal(setCookie.length, 1);
  for (const flag of ["mila_session=", "Domain=.milaai.com.br", "Path=/", "HttpOnly", "Secure"]) assert.ok(setCookie[0].includes(flag), setCookie[0]);
  assert.match(setCookie[0], /SameSite=lax/i);
  assert.ok(seen.some((r) => r.path === "/api/auth/otp/verify"), "production must not use the development OTP bypass");

  const sessionResponse = await request("/api/session", { headers: cookieHeader });
  expectStatus(sessionResponse, 200);
  assert.equal((await safeJson(sessionResponse)).tenant, "loja-sintetica");
  assert.match(sessionResponse.headers.get("cache-control")!, /private, no-store/);
  const beforeBlocked = seen.length;
  expectStatus(await post("/api/oauth/google/start", {}, { ...cookieHeader, Origin: "https://wa.milaai.com.br" }), 403);
  assert.equal(seen.length, beforeBlocked);
  const oauth = await post("/api/oauth/google/start", {}, cookieHeader);
  expectStatus(oauth, 200);
  assert.match((await safeJson(oauth)).authorize_url, /^https:\/\/accounts\.google\.com\//);

  const plans = await request("/api/billing/plans");
  expectStatus(plans, 200);
  assert.equal((await safeJson(plans)).plans[0].id, "pro");
  const order = await post("/api/billing/order", { plan: "pro" }, cookieHeader);
  expectStatus(order, 201);
  assert.equal((await safeJson(order)).order_id, "synthetic-order");
  const dados = await request("/api/dados-loja", { headers: cookieHeader });
  expectStatus(dados, 200);
  assert.equal((await safeJson(dados)).dados.nome_loja, "Loja Sintética");
  const sync = await post("/api/meta/catalog/sync-now", { confirm_duplication: false }, cookieHeader);
  expectStatus(sync, 200);
  assert.equal((await safeJson(sync)).ok, true);

  const showcase = await request("/vitrine/loja-sintetica/colecao-sintetica");
  expectStatus(showcase, 200);
  assert.ok((await showcase.text()).includes("Loja Sintética"));
  assert.ok(seen.some((r) => r.path === "/api/internal/showcase"));
  const vitrineHttp = await request("/loja-sintetica/colecao-sintetica?probe=synthetic", { headers: { "X-Forwarded-Proto": "http" } }, "vitrine.milaai.com.br");
  expectStatus(vitrineHttp, 308);
  assert.equal(vitrineHttp.headers.get("location"), "https://vitrine.milaai.com.br/loja-sintetica/colecao-sintetica?probe=synthetic");
  const vitrineHost = await request("/loja-sintetica/colecao-sintetica", {}, "vitrine.milaai.com.br");
  expectStatus(vitrineHost, 200);
  assert.ok((await vitrineHost.text()).includes("Loja Sintética"));
  assert.equal(vitrineHost.headers.get("set-cookie"), null);
  const logout = await post("/api/auth/logout", {}, cookieHeader);
  expectStatus(logout, 200);
  assert.equal((await safeJson(logout)).revoked, true);
  assert.match(logout.headers.get("set-cookie")!, /Max-Age=0/);
  assert.match(logout.headers.get("set-cookie")!, /Domain=.milaai.com.br/);
  assert.deepEqual(mockErrors, []);

  const exit = once(child, "exit");
  child.kill("SIGTERM");
  const result = await Promise.race([exit, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("graceful shutdown exceeded 10s")), 10_000).unref())]);
  assert.deepEqual(result, [0, null]);
  console.log(`Standalone smoke passed: ${checks} HTTP checks, mock-only auth/billing/OAuth/Meta/showcase, SIGTERM exit 0.`);
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  if (child && child.exitCode === null) child.kill("SIGKILL");
  mock.closeAllConnections();
  await new Promise<void>((done) => mock.close(() => done()));
  await rm(home, { recursive: true, force: true });
}
