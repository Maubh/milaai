import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GET as health } from "../app/api/health/route.ts";
import { needsPublicHttps, publicSiteUrl } from "../lib/public-site-url.ts";
import { cookieDomainFor, parseSessionCookie } from "../lib/cookie-domain.ts";
import { isSameOriginRequest } from "../lib/request-origin.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const dockerfile = read("ops/container/Dockerfile");
const compose = read("ops/container/compose.yml");
const tunnel = read("ops/container/cloudflared.config.yml.example");
const ignore = read(".dockerignore");

// No Docker daemon, credentials, production backend or network are needed here.
test("container: standalone, dev dependencies at build and nonroot runtime", async () => {
  const config = (await import("../next.config.mjs")).default;
  assert.equal(config.output, "standalone");
  assert.ok(config.headers);
  assert.deepEqual(await config.headers(), [{ source: "/:path*", headers: [{ key: "Strict-Transport-Security", value: "max-age=63072000" }] }]);
  assert.match(dockerfile, /ARG NODE_IMAGE=node:24-trixie-slim/);
  assert.match(dockerfile, /npm ci --include=dev/);
  assert.match(dockerfile, /FROM \$\{NODE_IMAGE\} AS runner/);
  assert.match(dockerfile, /COPY --from=builder --chown=node:node \/app\/\.next\/standalone \.\//);
  assert.match(dockerfile, /COPY --from=builder --chown=node:node \/app\/\.next\/static \.\/\.next\/static/);
  assert.match(dockerfile, /COPY --from=builder --chown=node:node \/app\/public \.\/public/);
  assert.match(dockerfile, /USER node\n/);
  assert.match(dockerfile, /STOPSIGNAL SIGTERM/);
  assert.match(dockerfile, /CMD \["node", "server.js"\]/);
  assert.doesNotMatch(dockerfile, /COPY \. |COPY \.\//);
  assert.deepEqual(
    [...dockerfile.matchAll(/^ARG (\w+)/gm)].map((m) => m[1]),
    ["NODE_IMAGE", "NEXT_PUBLIC_MILA_WA_E164", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"],
  );
  assert.doesNotMatch(dockerfile, /MILA_AUTH_SECRET|MILA_INTERNAL_HMAC_SECRET|TURNSTILE_SECRET_KEY/);
});

test("container: context allows only build inputs and excludes env/secrets/output", () => {
  const rules = ignore.split("\n").filter((s) => s && !s.startsWith("#"));
  assert.equal(rules[0], "**");
  assert.deepEqual(rules.filter((s) => s.startsWith("!")), [
    "!package.json", "!package-lock.json", "!next-env.d.ts", "!next.config.mjs", "!tsconfig.json",
    "!middleware.ts", "!tokens.css", "!app/", "!app/**", "!components/", "!components/**", "!lib/", "!lib/**",
    "!public/", "!public/**", "!ops/", "!ops/container/", "!ops/container/Dockerfile",
  ]);
  for (const rule of ["**/.env*", "**/*.env", "**/*secret*", "**/*credential*", "**/secrets/**", "**/*.key", "**/*.pem", "**/node_modules/**", "**/.next/**", "**/.git/**"]) {
    assert.ok(rules.includes(rule), rule);
    assert.ok(rules.indexOf(rule) > rules.lastIndexOf("!ops/container/Dockerfile"), rule);
  }
});

test("container: separate project, external Eve network, no public ports or Eve lifecycle", () => {
  assert.match(compose, /^name: milaai\n/);
  assert.match(compose, /external: true\n    name: mila-eve_default/);
  assert.match(compose, /MILA_AUTH_BASE: http:\/\/mila-eve:4274/);
  assert.match(compose, /MILA_INTERNAL_API_URL: http:\/\/mila-eve:4274/);
  assert.doesNotMatch(compose, /^\s+(?:ports|network_mode|container_name|env_file):/m);
  assert.doesNotMatch(compose, /docker\.sock|privileged:|4274:|3000:/);
  const services = [...compose.matchAll(/^  ([a-z]+):\n(?=    (?:image|#))/gm)].map((m) => m[1]);
  assert.deepEqual(services, ["site", "cloudflared"]);
  for (const name of ["MILA_AUTH_SECRET", "MILA_INTERNAL_HMAC_SECRET", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_MILA_WA_E164", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"]) {
    assert.ok(compose.includes(`\${${name}:?`), `${name} must fail closed`);
  }
  assert.equal((compose.match(/restart: unless-stopped/g) ?? []).length, 2);
  assert.equal((compose.match(/stop_grace_period: 45s/g) ?? []).length, 2);
  assert.equal((compose.match(/healthcheck:/g) ?? []).length, 2);
  assert.equal((compose.match(/logging: \*bounded-logs/g) ?? []).length, 2);
  assert.match(compose, /max-size: "10m"/);
  assert.match(compose, /max-file: "3"/);
  assert.match(compose, /fetch\('http:\/\/127\.0\.0\.1:3000\/api\/health'/);
});

test("container: tunnel has only two readonly external files and only site network", () => {
  const sidecar = compose.split("  cloudflared:\n")[1].split("\nnetworks:\n")[0];
  assert.match(sidecar, /user: "65532:65532"/);
  assert.match(sidecar, /read_only: true/);
  assert.match(sidecar, /networks:\n      - site\n    volumes:/);
  assert.doesNotMatch(sidecar, /environment:|env_file:|build:|\.env|\.\.:|\.\/:/);
  assert.equal((sidecar.match(/type: bind/g) ?? []).length, 2);
  assert.equal((sidecar.match(/create_host_path: false/g) ?? []).length, 2);
  assert.equal((sidecar.match(/        read_only: true/g) ?? []).length, 2);
  assert.match(sidecar, /MILAAI_TUNNEL_CONFIG_FILE:\?/);
  assert.match(sidecar, /MILAAI_TUNNEL_CREDENTIALS_FILE:\?/);
  assert.match(sidecar, /"cloudflared", "tunnel", "--metrics", "127.0.0.1:2000", "ready"/);
  assert.deepEqual([...tunnel.matchAll(/^  - hostname: (.+)$/gm)].map((m) => m[1]), ["milaai.com.br", "www.milaai.com.br", "vitrine.milaai.com.br"]);
  assert.match(tunnel, /tunnel: REPLACE_WITH_NEW_SITE_TUNNEL_UUID/);
  assert.match(tunnel, /credentials-file: \/etc\/cloudflared\/tunnel.json/);
  assert.match(tunnel, /  - service: http_status:404/);
  assert.doesNotMatch(tunnel, /^\s*(?:httpHostHeader|token):/m);
  assert.doesNotMatch(tunnel, /hostname: (?:app|wa)\./);
});

test("container: local health is no-store and independent of all services", async () => {
  const response = health();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true });
  const source = read("app/api/health/route.ts");
  assert.doesNotMatch(source, /\bimport\b|\bfetch\b|process\.env|cookies\(/);
});

test("container: HTTPS proxy leg never loops, local health and other hosts stay untouched", () => {
  for (const host of ["milaai.com.br", "www.milaai.com.br", "vitrine.milaai.com.br", "MILAAI.COM.BR:443"]) {
    assert.equal(needsPublicHttps(host, "http"), true);
    assert.equal(needsPublicHttps(host, null), true);
    assert.equal(needsPublicHttps(host, "https"), false);
    assert.equal(needsPublicHttps(host, " https, http"), false);
    const target = publicSiteUrl(host, "/login", "?next=%2Fworkspace");
    assert.equal(target?.protocol, "https:");
    assert.equal(target?.pathname, "/login");
    assert.equal(target?.search, "?next=%2Fworkspace");
  }
  for (const host of ["127.0.0.1:3000", "localhost:3000", "site:3000", "app.milaai.com.br", "wa.milaai.com.br", "milaai.com.br.evil.test", null]) {
    assert.equal(needsPublicHttps(host, "http"), false);
    assert.equal(publicSiteUrl(host, "/"), null);
  }
  assert.equal(publicSiteUrl("milaai.com.br", "//evil.test/login")?.origin, "https://milaai.com.br");
});

test("container: HTTPS guard precedes the previous asset routing exclusions", () => {
  const middleware = read("middleware.ts");
  assert.match(middleware, /matcher: \["\/:path\*"\]/);
  assert.ok(middleware.indexOf("if (needsPublicHttps") < middleware.indexOf('pathname.startsWith("/_next/static")'));
  assert.match(middleware, /publicSiteUrl\(host, cleanPath \|\| "\/", search\) \?\? new URL/);
  assert.doesNotMatch(middleware, /app\.milaai\.com\.br/);
});

test("container: HTTP private transport does not relax cookie domain/flags or CSRF", () => {
  for (const host of ["milaai.com.br", "www.milaai.com.br"]) {
    assert.equal(cookieDomainFor(host), ".milaai.com.br");
    const cookie = parseSessionCookie("mila_session=synthetic; Path=/; Domain=mila-eve", host)!;
    assert.equal(cookie.options.domain, ".milaai.com.br");
    assert.equal(cookie.options.secure, true);
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.sameSite, "lax");
    assert.equal(isSameOriginRequest(`https://${host}`, host), true);
    assert.equal(isSameOriginRequest("https://wa.milaai.com.br", host), false);
    assert.equal(isSameOriginRequest("http://mila-eve:4274", host), false);
    assert.equal(isSameOriginRequest("https://vitrine.milaai.com.br", host), false);
  }
  assert.equal(cookieDomainFor("vitrine.milaai.com.br"), undefined);
});
