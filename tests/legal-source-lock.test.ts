import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const BACKEND = "/opt/data/profiles/mila";
const LOCK = JSON.parse(readFileSync(join(ROOT, "tests/legal-source-lock.json"), "utf8")) as Record<string, string>;

function scan(root: string, suffixes: string[], out: string[] = []): string[] {
  if (!existsSync(root)) return out;
  for (const name of readdirSync(root).sort()) {
    if (["node_modules", ".next", ".git", "__pycache__", ".venv", "tests"].includes(name)) continue;
    const path = join(root, name);
    const stat = lstatSync(path);
    assert.ok(!stat.isSymbolicLink(), `${path}: symlink fora do contrato de fontes`);
    if (stat.isDirectory()) scan(path, suffixes, out);
    else if (suffixes.some((s) => path.endsWith(s))) out.push(path);
  }
  return out;
}

function sourceFiles(): Record<string, string> {
  const out: Record<string, string> = {};
  const add = (base: string, prefix: string, path: string) => {
    out[prefix + relative(base, path)] = createHash("sha256").update(readFileSync(path)).digest("hex");
  };
  // Pin the complete local source/dependency set, not only imports inferred by regex.
  // New layouts/templates, CSS, imported helpers and public assets fail closed.
  for (const dir of ["app", "components", "lib", "public", "src", "pages"]) {
    for (const path of scan(join(ROOT, dir), [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss", ".svg", ".png", ".jpg", ".webp", ".json"])) add(ROOT, "site/", path);
  }
  // Root middleware, Next/config/redirects, dependency versions and Vercel config.
  for (const name of readdirSync(ROOT)) {
    if (/\.(?:ts|tsx|jsx|js|mjs|cjs|json)$/.test(name) && lstatSync(join(ROOT, name)).isFile()) add(ROOT, "site/", join(ROOT, name));
  }
  // Newly introduced Python files anywhere in the web repository also fail closed.
  for (const path of scan(ROOT, [".py"])) add(ROOT, "site/", path);
  assert.ok(existsSync(join(BACKEND, "auth/oauth.py")), "backend real ausente; não certificar paridade");
  for (const dir of ["auth", "tenancy", "webhook", "billing", "mila_router"]) {
    for (const path of scan(join(BACKEND, dir), [".py"])) add(BACKEND, "backend/", path);
  }
  for (const name of readdirSync(BACKEND)) {
    if (name.endsWith(".py") && lstatSync(join(BACKEND, name)).isFile()) add(BACKEND, "backend/", join(BACKEND, name));
  }
  const other = resolve(ROOT, "../auth/oauth.py");
  if (existsSync(other)) assert.deepEqual(readFileSync(other), readFileSync(join(BACKEND, "auth/oauth.py")), "duas implementações OAuth divergentes");
  return out;
}

test("legal: conjunto completo de fontes e configurações é o revisado", () => {
  const actual = sourceFiles();
  const changes = [...new Set([...Object.keys(LOCK), ...Object.keys(actual)])].filter((p) => LOCK[p] !== actual[p]);
  assert.deepEqual(changes, [], "Fontes adicionadas/removidas/alteradas exigem nova revisão: " + changes.join(", "));
});
