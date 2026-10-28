import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PLANO_TRELLO, TRELLO_LOGO } from "../lib/trello.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const req = createRequire(import.meta.url);
const ts = req("typescript") as typeof import("typescript");
const React = req("react") as typeof import("react");
const { renderToStaticMarkup } = req("react-dom/server") as typeof import("react-dom/server");
const read = (path: string) => readFileSync(resolve(ROOT, path), "utf8");

/** Mesmo render estático do guard jurídico, em memória, sem Next nem backend. */
function renderPlans(path: string, copy?: string): string {
  const cache = new Map<string, { exports: Record<string, unknown> }>();
  function load(path: string): Record<string, unknown> {
    const abs = [path, `${path}.ts`, `${path}.tsx`].find(existsSync);
    assert.ok(abs, `módulo local ausente: ${path}`);
    if (copy && abs === resolve(ROOT, "lib/trello.ts")) return { PLANO_TRELLO: copy, TRELLO_LOGO };
    const cached = cache.get(abs);
    if (cached) return cached.exports;
    const mod = { exports: {} as Record<string, unknown> };
    cache.set(abs, mod);
    const js = ts.transpileModule(readFileSync(abs, "utf8"), {
      fileName: abs,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id: string): unknown => {
      if (id.endsWith(".css")) return {};
      if (id === "next/link") return ({ children, ...props }: import("react").ComponentProps<"a">) => React.createElement("a", props, children);
      if (id.startsWith("@/")) return load(resolve(ROOT, id.slice(2)));
      if (id.startsWith(".")) return load(resolve(dirname(abs), id));
      return req(id);
    };
    new Function("require", "module", "exports", js)(localRequire, mod, mod.exports);
    return mod.exports;
  }
  const component = load(resolve(ROOT, path)).default;
  return renderToStaticMarkup(React.createElement(component as never, {
    session: null, loading: false, failed: false,
  }));
}

function cards(html: string): string[] {
  const articles = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/g) ?? [];
  assert.equal(articles.length, 2, "os dois cards precisam estar renderizados");
  return articles;
}

function items(card: string): string[] {
  return [...card.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)]
    .map((item) => item[1].replace(/<[^>]+>/g, "").trim());
}

// O printer tira comentários: import e comentário sozinhos não provam uso.
function code(path: string): string {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return ts.createPrinter({ removeComments: true }).printFile(source);
}

test("trello: a copy canônica promete gestão de tarefas pelo WhatsApp", () => {
  assert.equal(PLANO_TRELLO, "Gestão de tarefas no Trello pelo WhatsApp");
});

for (const [surface, path, headings] of [
  ["home", "components/PricingSection.tsx", ['<span class="pricing-plan-name">Essencial</span>', '<span class="pricing-plan-name">Pro</span>']],
  ["Meu plano", "app/workspace/plano/PlanView.tsx", ['<h3 id="plan-essencial">Plano Essencial</h3>', '<h3 id="plan-pro">Plano Pro</h3>']],
] as const) {
  test(`trello: Essencial e Pro de ${surface} exibem e usam a copy compartilhada`, () => {
    const actual = cards(renderPlans(path));
    const sentinel = "TRELLO_COPY_COMPARTILHADA";
    const instrumented = cards(renderPlans(path, sentinel));
    for (const heading of headings) {
      const card = actual.find((card) => card.includes(heading));
      assert.ok(card, `card ausente: ${heading}`);
      assert.equal(items(card).filter((item) => item === PLANO_TRELLO).length, 1,
        `${heading}: Trello precisa aparecer explicitamente na lista de recursos`);
      const changed = instrumented.find((card) => card.includes(heading));
      assert.ok(changed, `card instrumentado ausente: ${heading}`);
      assert.equal(items(changed).filter((item) => item === sentinel).length, 1,
        `${heading}: a frase precisa vir de lib/trello.ts, não de literal ou comentário`);
      assert.ok(!changed.includes(PLANO_TRELLO), "não repetir a frase à mão");
    }
  });
}

test("trello: Organização da loja leva a logo local da apresentação até a imagem da linha", () => {
  const src = code("app/workspace/integracoes/page.tsx");
  assert.match(src, /import \{ TRELLO_LOGO \} from "@\/lib\/trello"/);
  assert.match(src, /id: "organizacao", title: "Organização da loja"[^}]*providers: \["trello"\]/);
  assert.match(src, /trello: \{[^}]*logo: TRELLO_LOGO\b/);
  assert.match(src, /const logo = PRESENTATION\[provider\]\?\.logo/);
  assert.match(src, /<img src=\{logo\} alt="" className=\{`integrations-logo integrations-logo-\$\{provider\}`\}/);
  assert.match(src, /mark=\{<ToolMark provider=\{i\.id\}/);
});

test("trello: a identidade da conexão usa a mesma logo local", () => {
  const src = code("app/integrations/[app]/page.tsx");
  assert.match(src, /import \{ TRELLO_LOGO \} from "@\/lib\/trello"/);
  assert.match(src, /trello: \{[^}]*logo: TRELLO_LOGO\b/);
  assert.match(src, /const info = KNOWN\[key\]/);
  assert.match(src, /<IntegrationConnectionLayout[\s\S]*?brand=\{info\.logo \? <img src=\{info\.logo\} alt=\{info\.nome\}/);
});

test("trello: o SVG local é quadrado, azul e conserva o desenho do marquee", () => {
  assert.equal(TRELLO_LOGO, "/integrations/trello.svg");
  const svg = read(`public${TRELLO_LOGO}`);
  assert.match(svg, /<svg\b[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  const viewBox = svg.match(/viewBox="([^"]+)"/);
  assert.ok(viewBox, "o asset precisa de viewBox para manter a proporção");
  assert.deepEqual(viewBox[1].split(/\s+/).map(Number), [0, 0, 24, 24]);
  const dimensions = svg.match(/width="(\d+)" height="(\d+)"/);
  assert.ok(dimensions, "dimensões intrínsecas do ícone");
  assert.deepEqual(dimensions.slice(1).map(Number), [38, 38],
    "38×38 intrínsecos deixam o CSS limitar a marca a 34px na conexão e 30px na lista");
  assert.match(svg, /fill="#0052CC"/);
  const original = read("components/IntegrationsMarquee.tsx").match(/id: "trello"[\s\S]*?<path d="([^"]+)"/);
  const asset = svg.match(/<path d="([^"]+)"/);
  assert.ok(original && asset, "o ícone precisa conter o desenho, não um slot vazio");
  assert.equal(asset[1], original[1], "reutilizar o desenho local existente");
  assert.match(read("app/workspace/integracoes/integracoes.css"), /\.integrations-logo \{[^}]*max-height: 30px;[^}]*object-fit: contain/);
  assert.match(read("components/notion-connection.css"), /\.notion-connect-brand > img \{[^}]*max-height: 34px;[^}]*object-fit: contain/);
});
