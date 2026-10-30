/**
 * Prévias da página inicial (`/propostas`, `/propostas/a`, `/propostas/b`).
 *
 * A direção aprovada posiciona a mila. como assistente pessoal da lojista no
 * WhatsApp. As únicas demonstrações são o mockup do iPhone e o mapa animado de
 * integrações da landing atual, os dois reutilizados sem cópia. Aqui ficam a
 * copy, a oferta, a ausência das interfaces rejeitadas, a integridade dos dois
 * componentes, o escopo do CSS e o HTML renderizado das três rotas.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as LP from "../lib/landing-proposals.ts";
import {
  COMO_AJUDA,
  DUVIDAS,
  GRUPOS_INTEGRACAO,
  INTEGRACOES_PUBLICAS,
  LEAD_A,
  LEAD_B,
  LEGENDA_MOCKUP,
  META_A,
  META_B,
  META_INDICE,
  PLANOS,
  RECURSOS,
  ROTINA,
  TITULO_A,
  TITULO_B,
} from "../lib/landing-proposals.ts";
import { GOOGLE_DESC, PLANO_GOOGLE } from "../lib/google-workspace.ts";
import { NOTION_DESC } from "../lib/notion.ts";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (rel: string) => readFileSync(join(RAIZ, rel), "utf8");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const daHead = (rel: string) => execFileSync("git", ["show", `HEAD:${rel}`], { cwd: RAIZ, encoding: "utf8" });

function arquivosNovos(): string[] {
  const dir = "components/landing-proposals";
  return [
    ...readdirSync(join(RAIZ, dir)).map((f) => posix.join(dir, f)),
    "app/propostas/layout.tsx",
    "app/propostas/page.tsx",
    "app/propostas/a/page.tsx",
    "app/propostas/b/page.tsx",
    "lib/landing-proposals.ts",
  ];
}
const fontesNovas = () => arquivosNovos().filter((f) => !f.endsWith(".css"));

// ─────────────────────────────────────────── posicionamento e rotina

test("posicionamento: assistente pessoal da lojista no WhatsApp, nas duas propostas", () => {
  for (const titulo of [TITULO_A, TITULO_B]) {
    assert.match(titulo, /assistente pessoal/);
    assert.match(titulo, /WhatsApp/);
  }
  assert.equal(TITULO_A, "Sua assistente pessoal para o dia a dia da loja. No WhatsApp.");
  for (const lead of [LEAD_A, LEAD_B]) {
    assert.match(lead, /assistente de IA/);
    assert.match(lead, /joias e semijoias/);
  }
  assert.match(LEAD_A, /^Chegou mercadoria, tem uma peça para cadastrar ou precisa preparar uma descrição\? Converse com a mila\./);
  assert.match(LEAD_A, /conforme as integrações conectadas/);
});

test("rotina: seis tarefas reais, preço é só uma delas e não abre a lista", () => {
  assert.deepEqual(ROTINA.map((t) => t.id), ["mercadoria", "peca", "preco", "fornecedores", "instagram", "ferramentas"]);
  assert.notEqual(ROTINA[0].id, "preco");
  assert.equal(ROTINA.filter((t) => /preço|margem/i.test(t.titulo)).length, 1);
  const por = (id: string) => ROTINA.find((t) => t.id === id)!;
  assert.match(por("mercadoria").texto, /XML ou PDF/);
  for (const campo of ["texto", "frase"] as const) {
    const peca = por("peca")[campo];
    assert.match(peca, /no Pro, pode cadastrar a peça no Jueri, no Olist ou na Nuvemshop que você conectou e autorizou/, `peça.${campo}`);
    assert.match(peca, /descrição técnica/, `peça.${campo}`);
    assert.doesNotMatch(peca, /Jueri, no Olist e na Nuvemshop|Essencial/, `peça.${campo}: não exige os três nem promete no Essencial`);
  }
  assert.match(por("peca").texto, /Você pede pela conversa\./);
  assert.match(por("fornecedores").texto, /salvo e consultável no WhatsApp/);
  assert.equal(por("instagram").nivel, "pro");
  assert.match(por("instagram").texto, /Quem revisa e publica é você/);
  assert.equal(por("ferramentas").nivel, "pro");
  assert.match(por("ferramentas").texto, /Com a sua autorização/);
  for (const t of ROTINA) assert.ok(t.titulo && t.texto && t.frase, t.id);
});

test("copy: sem calculadora, hype, promessa fora do produto ou frases do mockup", () => {
  const PROIBIDO =
    /calculadora|magnétic|sem esforço|grátis|na hora|instantâne|comece agora|depoimento|clientes satisfeit|\bmilhares\b|garantid|automação completa|automaticamente|publica(?:ção)? automátic|posta sozinha|agenda|calendário|gmail|contas a pagar|emite nota|emissão de nota|atendimento|Estoque de Joias|Sincronizei|Inteligência comercial|\b46\s?%/i;
  for (const f of fontesNovas()) {
    const src = ler(f);
    const achado = src.match(PROIBIDO);
    assert.equal(achado, null, `${f}: "${achado?.[0]}"`);
    for (const linha of src.split("\n").filter((l) => /\bBling\b/.test(l))) {
      assert.match(linha, /ainda não/, `${f}: Bling sem ressalva`);
    }
  }
  assert.equal(LP.NOTA_NAO_PRONTOS, "Bling ainda não está disponível.");
  assert.equal(LEGENDA_MOCKUP, "Conversa de demonstração, em loop. Exemplo ilustrativo.");
  assert.doesNotMatch(JSON.stringify(LP.COMO_AJUDA), /áudio/i);
});

test("interfaces rejeitadas: arquivos e helpers da calculadora e do chat com abas saíram", () => {
  for (const f of ["ContaBar.tsx", "ContaCalculator.tsx", "ConversationDemo.tsx"]) {
    assert.ok(!existsSync(join(RAIZ, "components/landing-proposals", f)), `${f} ainda existe`);
  }
  for (const nome of ["calcularConta", "avaliarConta", "lerNumero", "pedidosA", "linhasRaioX", "EXEMPLO_A", "EXEMPLO_B", "FICHA_HERO_A"]) {
    assert.ok(!(nome in LP), `lib ainda exporta ${nome}`);
  }
  const fontes = fontesNovas().map(ler).join("\n");
  assert.doesNotMatch(fontes, /role="tab|<input|<form|<table|Usado nesta resposta|Da sua loja, nesta resposta|E se baixar o preço|Faça a conta/);
  const css = arquivosNovos().filter((f) => f.endsWith(".css")).map(ler).join("\n");
  assert.doesNotMatch(css, /lpb-calc|lpb-folha|lpb-raiox|lp-contabar|lpa-chat|lpa-tab|lpa-dados|lpa-ficha|lpa-msg/);
});

// ─────────────────────────────────────────── oferta

test("oferta: mesmos preços e os mesmos itens da PricingSection, sem selo nem hype", () => {
  assert.deepEqual(PLANOS.map((p) => [p.id, p.preco, p.periodo]), [["essencial", "39", "/mês"], ["pro", "69", "/mês"]]);
  const pricing = ler("components/PricingSection.tsx");
  for (const r of RECURSOS) {
    if (r.texto === PLANO_GOOGLE) continue;
    if (r.texto.startsWith("Conteúdo para Instagram")) {
      assert.match(pricing, /Marketing de Instagram: legendas magnéticas, carrosséis, ideias de Reels e planejamento semanal/);
      assert.equal(r.texto, "Conteúdo para Instagram: legendas, carrosséis, ideias de Reels e planejamento semanal");
      assert.equal(r.nivel, "pro");
      continue;
    }
    if (r.texto.startsWith("Integração direta com ERP")) {
      assert.equal(r.texto, "Integração direta com ERP (Jueri e Olist disponíveis; planilha pronta para importar na Phibo; Bling ainda não)");
      continue;
    }
    assert.ok(pricing.includes(r.texto), `item fora da PricingSection: ${r.texto}`);
  }
  for (const p of PLANOS) assert.ok(pricing.includes(p.resumo), `resumo fora da PricingSection: ${p.resumo}`);
  assert.ok(PLANOS[0].recursos.includes(PLANO_GOOGLE));
  assert.equal(PLANOS[1].recursos[0], "Tudo do Essencial");
  assert.equal(PLANOS[0].recursos.length, 7);
  assert.equal(PLANOS[1].recursos.length, 7);
  assert.doesNotMatch(JSON.stringify({ PLANOS, DUVIDAS }), /Recomendado|magnétic|sem esforço/i);
});

// ─────────────────────────────────────────── componentes da landing atual

test("mockup do iPhone, site.css e CSS do mapa iguais ao HEAD", () => {
  for (const f of ["components/IPhoneMockup.tsx", "app/site.css"]) {
    assert.equal(sha(ler(f)), sha(daHead(f)), `${f} mudou`);
  }
  // O CSS do mapa só ganhou a variante com Meta, acrescentada no fim; a geometria de cinco nós, os feixes,
  // os keyframes e o movimento reduzido do HEAD seguem byte a byte.
  const beamHead = daHead("components/integrations-beam.css");
  const beam = ler("components/integrations-beam.css");
  assert.ok(beam.startsWith(beamHead), "integrations-beam.css: o conteúdo do HEAD mudou");
  const acrescimo = beam.slice(beamHead.length).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of acrescimo.matchAll(/([^{}]+)\{/g)) {
    const bloco = m[1].trim();
    if (bloco.startsWith("@media")) continue;
    for (const sel of bloco.split(",")) assert.match(sel.trim(), /^\.integrations-graph\.has-meta\b/, `regra nova fora da variante: ${sel.trim()}`);
  }
  assert.doesNotMatch(acrescimo, /animation|@keyframes|prefers-reduced-motion/);
  const demo = ler("components/landing-proposals/PhoneDemo.tsx");
  assert.match(demo, /import IPhoneMockup from "@\/components\/IPhoneMockup";/);
  assert.match(demo, /<IPhoneMockup \/>/);
});

const bloco = (src: string, inicio: string, fim: string) => {
  const i = src.indexOf(inicio);
  assert.ok(i >= 0, `trecho ausente: ${inicio}`);
  return src.slice(i, src.indexOf(fim, i) + fim.length);
};

test("IntegrationsMarquee: só ganhou CTA e Meta opcionais; medida, feixes e lista da home iguais ao HEAD", () => {
  const atual = ler("components/IntegrationsMarquee.tsx");
  const head = daHead("components/IntegrationsMarquee.tsx");
  for (const [inicio, fim] of [
    ["const INTEGRATIONS: IntegrationItem[] = [", "\n];"],
    ["const PURPOSES: Record<string, string> = {", "\n};"],
    ["  useEffect(() => {", "  }, []);"],
    ['<svg className="integrations-paths"', "</svg>"],
    ['<div className="integrations-hub"', "</div>"],
  ]) {
    assert.equal(bloco(atual, inicio, fim), bloco(head, inicio, fim), `mudou: ${inicio}`);
  }
  assert.match(atual, /ctaHref = "\/workspace\/integracoes",\n  ctaLabel = "Conhecer as integrações",\n  includeMeta = false,/);
  assert.match(atual, /const items = includeMeta \? \[\.\.\.INTEGRATIONS, META\] : INTEGRATIONS;/);
  assert.match(atual, /integrations-graph\$\{includeMeta \? " has-meta" : ""\}\$\{visible \? " is-visible" : ""\}/);
  for (const trecho of ["integrations-pulse", "ResizeObserver", "IntersectionObserver", "is-visible", "animationDelay", 'import "./integrations-beam.css"']) {
    assert.ok(atual.includes(trecho), `animação original sem ${trecho}`);
  }
  assert.match(ler("app/(site)/page.tsx"), /<IntegrationsMarquee \/>/, "a home continua sem props");
});

// ─────────────────────────────────────────── rotas, metadados e CSS

test("rotas: prévias sem indexação, com Open Graph e Twitter próprios, sem segundo main", () => {
  const usos: Array<[string, string]> = [
    ["app/propostas/layout.tsx", "META_INDICE"],
    ["app/propostas/page.tsx", "META_INDICE"],
    ["app/propostas/a/page.tsx", "META_A"],
    ["app/propostas/b/page.tsx", "META_B"],
  ];
  for (const [f, constante] of usos) {
    const src = ler(f);
    assert.match(src, new RegExp(`export const metadata: Metadata = ${constante};`), `${f} sem metadata da prévia`);
    assert.doesNotMatch(src, /<main\b/, `${f} renderiza outro main`);
  }
  assert.match(META_A.title, /Perto de você, na loja/);
  assert.match(META_B.title, /A rotina ganha uma assistente/);
  const metas: Array<[typeof META_A, string]> = [[META_INDICE, "/propostas"], [META_A, "/propostas/a"], [META_B, "/propostas/b"]];
  for (const [m, url] of metas) {
    assert.equal(m.robots.index, false);
    assert.equal(m.robots.follow, false);
    assert.equal(m.openGraph.url, url);
    assert.equal(m.openGraph.title, m.title);
    assert.equal(m.twitter.title, m.title);
    assert.equal(m.twitter.card, "summary");
    assert.match(m.title, /Prévia/);
    assert.match(m.description, /Prévia interna, não publicada/);
    assert.ok(!("images" in m.openGraph) && !("images" in m.twitter));
    assert.doesNotMatch(JSON.stringify(m), /sem esforço|magnétic|inteligência por trás|Da peça ao preço|A conversa resolve/i);
  }
  assert.doesNotMatch(ler("lib/landing-proposals.ts"), /from\s+["']next/);
  assert.doesNotMatch(ler("app/propostas/layout.tsx"), /SiteHeader|SiteFooter/);
});

test("css: escopo .lp*, sem !important, atalhos visíveis no celular e telefone de até 19rem", () => {
  const novos = arquivosNovos().filter((x) => x.endsWith(".css"));
  for (const f of novos) {
    const bruto = ler(f);
    assert.doesNotMatch(bruto, /!important/, `${f}: !important`);
    const css = bruto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@import[^;]+;/g, "");
    for (const m of css.matchAll(/([^{}]+)\{/g)) {
      const bloco = m[1].trim();
      if (bloco.startsWith("@") || /^(from|to|\d+%)$/.test(bloco)) continue;
      for (const sel of bloco.split(",")) assert.match(sel.trim(), /^\.lp/, `${f}: seletor fora do escopo "${sel.trim()}"`);
    }
    assert.doesNotMatch(bruto, /transition:[^;]*\bwidth\b/);
    assert.doesNotMatch(bruto, /align-items:\s*end\b/);
  }
  const a = ler("components/landing-proposals/landing-a.css");
  const b = ler("components/landing-proposals/landing-b.css");
  for (const [css, nav] of [[b, ".lpb-nav"]] as const) {
    assert.doesNotMatch(css, new RegExp(`\\${nav}\\s*\\{[^}]*display:\\s*none`), `${nav} some em alguma largura`);
    assert.match(css, new RegExp(`\\n\\${nav} \\{[^}]*grid-row: 2`), `${nav} precisa descer para a segunda linha no celular`);
  }
  assert.match(a, /\.lpa-nav-item \{[^}]*min-height: 44px/);
  assert.match(b, /\.lpb-nav-item \{[^}]*min-height: 44px/);
  const base = ler("components/landing-proposals/proposals.css");
  assert.match(base, /\.lp-phone \{[^}]*width: min\(100%, 19rem\)/);
  assert.match(base, /\.lp-phone \.iphone15 \{[^}]*width: 100%[^}]*drop-shadow/);
  assert.doesNotMatch(base, /\.lp-root \.integrations-[^{]*\{[^}]*(?:animation|transform|display:\s*none|height)/,
    "o pano das prévias não pode mexer no movimento nem na geometria do mapa");
});

// ─────────────────────────────────────────── render

const req = createRequire(join(RAIZ, "package.json"));
const ts = req("typescript") as typeof import("typescript");
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");

/** CSS importado por componente: o SSR do Next ignora; aqui só os listados, e precisam existir. */
const CSS_PERMITIDO = new Set(["components/integrations-beam.css"]);

const nome = (rel: string) => rel.replace(/\.tsx?$/, "").replace(/[/.()[\]]/g, "_") + ".mjs";

function resolverComponente(deRel: string, spec: string): string | null {
  if (spec.startsWith("@/components/")) return spec.slice(2) + ".tsx";
  if (spec.startsWith("./") && deRel.startsWith("components/")) return posix.join(posix.dirname(deRel), spec.slice(2)) + ".tsx";
  return null;
}

async function renderizar(rel: string, props: Record<string, unknown> = {}, fontes: Record<string, string> = {}): Promise<string> {
  const cache = mkdtempSync(join(tmpdir(), "mila-propostas-"));
  try {
    writeFileSync(
      join(cache, "_link.mjs"),
      `import React from ${JSON.stringify(pathToFileURL(req.resolve("react")).href)};\n` +
        "export default function Link({ href, children, ...resto }) { return React.createElement('a', { href, ...resto }, children); }\n",
    );
    const feitos = new Set<string>();
    const transpilar = (arquivo: string) => {
      if (feitos.has(arquivo)) return;
      feitos.add(arquivo);
      let js = ts.transpileModule(fontes[arquivo] ?? ler(arquivo), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
        fileName: arquivo,
      }).outputText;
      js = js.replace(/^\s*import\s+["']([^"']+\.css)["'];?\s*$/gm, (_m, spec: string) => {
        const css = spec.startsWith("./") ? posix.join(posix.dirname(arquivo), spec.slice(2)) : spec.replace(/^@\//, "");
        assert.ok(CSS_PERMITIDO.has(css), `${arquivo}: CSS fora da lista do teste: ${spec}`);
        assert.ok(existsSync(join(RAIZ, css)), `${arquivo}: CSS ausente: ${css}`);
        return "";
      });
      js = js.replace(/from\s+["']([^"']+)["']/g, (_m, spec: string) => {
        if (spec === "react" || spec.startsWith("react/") || spec === "framer-motion") {
          return `from ${JSON.stringify(pathToFileURL(req.resolve(spec)).href)}`;
        }
        if (spec === "next/link") return `from "./_link.mjs"`;
        if (spec.startsWith("@/lib/")) return `from ${JSON.stringify(pathToFileURL(join(RAIZ, spec.slice(2) + ".ts")).href)}`;
        const comp = resolverComponente(arquivo, spec);
        if (comp) {
          transpilar(comp);
          return `from "./${nome(comp)}"`;
        }
        throw new Error(`${arquivo}: import sem resolução no teste: ${spec}`);
      });
      writeFileSync(join(cache, nome(arquivo)), js);
    };
    transpilar(rel);
    const mod = (await import(pathToFileURL(join(cache, nome(rel))).href)) as { default: () => unknown };
    return renderToStaticMarkup(React.createElement(mod.default as never, props));
  } finally {
    rmSync(cache, { recursive: true, force: true });
  }
}

const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const todosIds = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const semNbsp = (s: string) => s.replace(/ /g, " ");
const texto = (html: string) =>
  semNbsp(html.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'")).replace(/\s+/g, " ");
/** O mockup é código da landing atual, travado: a copy nova é conferida sem ele. */
const semMockup = (html: string) => html.replace(/<figure class="iphone-figure">[\s\S]*?<\/figure>/, "");
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const NODES = ["jueri", "olist", "nuvemshop", "google-workspace", "notion", "meta"];

function verificarPagina(html: string, nomePagina: "A" | "B", idTitulo: string, titulo: string) {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${nomePagina}: um h1`);
  assert.match(html, new RegExp(`<h1 id="${idTitulo}"[^>]*>${escapar(titulo)}</h1>`), `${nomePagina}: título`);
  assert.doesNotMatch(html, /<main\b/, `${nomePagina}: o main vem do layout raiz`);

  const ids = todosIds(html);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], `${nomePagina}: ids duplicados`);
  const links = hrefs(html);
  for (const destino of ["/login", "/privacidade", "/termos", "/exclusao-de-dados", "/propostas", "#integracoes", "#planos"]) {
    assert.ok(links.includes(destino), `${nomePagina}: falta link para ${destino}`);
  }
  assert.ok(!links.some((h) => h.startsWith("/workspace")), `${nomePagina}: link para área autenticada`);
  for (const h of links.filter((x) => x.startsWith("#"))) assert.ok(ids.includes(h.slice(1)), `${nomePagina}: âncora ${h} sem destino`);
  for (const m of html.matchAll(/aria-(?:labelledby|controls|describedby)="([^"]+)"/g)) {
    for (const id of m[1].split(" ")) assert.ok(ids.includes(id), `${nomePagina}: referência ${id} sem elemento`);
  }

  const nav = html.match(/<nav[^>]*aria-label="Seções"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, `${nomePagina}: atalhos de seção ausentes`);
  assert.deepEqual(hrefs(nav[1]), ["#rotina", "#integracoes", "#planos", "#duvidas"]);
  assert.doesNotMatch(nav[0], /hidden|<button/);

  // Mockup: um só, no hero, com a legenda fora do componente.
  assert.equal((html.match(/class="iphone15"/g) ?? []).length, 1, `${nomePagina}: um mockup`);
  assert.match(html, /data-testid="mockup-chat"/);
  const hero = html.slice(html.indexOf(`aria-labelledby="${idTitulo}"`), html.indexOf('id="rotina"'));
  assert.match(hero, /class="iphone15"/, `${nomePagina}: mockup no hero`);
  assert.match(hero, new RegExp(`<p class="lp-phone-legenda">${escapar(LEGENDA_MOCKUP)}</p>`));

  // Mapa de integrações original: uma instância, hub, cinco nós e a camada dos feixes.
  assert.equal((html.match(/class="integrations-section"/g) ?? []).length, 1, `${nomePagina}: um mapa`);
  assert.match(html, /<section id="integracoes" class="integrations-section" aria-labelledby="integrations-title">/);
  assert.match(html, /<div class="integrations-graph has-meta"><svg class="integrations-paths" aria-hidden="true" focusable="false">/);
  assert.match(html, /class="integrations-hub" role="img" aria-label="mila\. no WhatsApp"/);
  for (const n of NODES) assert.match(html, new RegExp(`class="integrations-node integrations-node-${n}"`), `${nomePagina}: nó ${n}`);
  // A tirou "O que cada integração faz": o CTA do mapa leva aos planos. B mantém a seção de detalhes.
  assert.match(
    html,
    nomePagina === "A"
      ? /<a href="#planos" class="integrations-link">Conhecer os planos<\/a>/
      : /<a href="#sobre-integracoes" class="integrations-link">Ver o que cada integração faz<\/a>/,
  );

  const limpo = semMockup(html);
  assert.doesNotMatch(limpo, /<input|<form|<table|role="tab"|lpb-calc|lpb-folha|lpa-chat|lpa-dados|lp-contabar/, `${nomePagina}: interface rejeitada`);
  const visivel = texto(limpo);
  assert.match(visivel, /R\$ ?39/);
  assert.match(visivel, /R\$ ?69/);
  assert.match(visivel, /Acesso piloto, por convite/);
  if (nomePagina === "B") {
    assert.ok(visivel.includes(semNbsp(GOOGLE_DESC)), "B: GOOGLE_DESC");
    assert.ok(visivel.includes(semNbsp(NOTION_DESC)), "B: NOTION_DESC");
  } else {
    // Sem a seção de detalhes, A mantém os limites de Google e Notion na oferta e nas dúvidas.
    assert.ok(visivel.includes(semNbsp(PLANO_GOOGLE)), "A: PLANO_GOOGLE nos planos");
    assert.match(visivel, /Ela não cria bases no Notion/, "A: limite do Notion nas dúvidas");
  }
  assert.match(visivel, /Bling ainda não está disponível/);
  assert.match(visivel, /aparece só para lojas liberadas e sincroniza depois da sua autorização/);
  for (const t of ROTINA) assert.ok(visivel.includes(nomePagina === "A" ? t.titulo : t.frase), `${nomePagina}: rotina ${t.id}`);
  assert.doesNotMatch(visivel, /\b46\s?%|Recomendado|magnétic|calculadora|Usado nesta resposta|Raio-X do preço/i);
}

test("render A: assistente pessoal, mockup ao lado do título, rotina pautada e mapa animado", async () => {
  const html = await renderizar("components/landing-proposals/LandingA.tsx");
  verificarPagina(html, "A", "lpa-titulo", TITULO_A);
  const hero = html.slice(html.indexOf('aria-labelledby="lpa-titulo"'), html.indexOf('id="rotina"'));
  assert.ok(hero.indexOf("lpa-intro") < hero.indexOf("iphone15"), "A: texto antes do telefone no DOM");
  assert.ok(html.indexOf('id="como-funciona"') < html.indexOf('id="integracoes"'), "A: como ajuda antes do mapa");
  assert.doesNotMatch(html, /id="sobre-integracoes"|O que cada integração faz|lpa-sobre|lp-detalhe|lp-mark /, "A: seção de detalhes removida");
  assert.ok(html.indexOf('id="integracoes"') < html.indexOf('class="lp-wrap lpa-mapa-nota"'), "A: ressalvas logo após o mapa");
  assert.ok(html.indexOf('class="lp-wrap lpa-mapa-nota"') < html.indexOf('id="planos"'));
});

test("A: rotina em lista aberta e a conversa numa faixa mineral com título em cima e três colunas", async () => {
  const html = await renderizar("components/landing-proposals/LandingA.tsx");
  const rotina = html.slice(html.indexOf('id="rotina"'), html.indexOf('id="como-funciona"'));
  assert.match(rotina, /class="lpa-rotina-lista"/);
  const ajuda = html.slice(html.indexOf('id="como-funciona"'), html.indexOf('id="integracoes"'));
  assert.match(
    ajuda,
    /<div class="lpa-ajuda-faixa"><h2 id="lpa-ajuda-titulo" class="lpa-ajuda-titulo">Uma conversa que já conhece a loja\.<\/h2><ul class="lpa-ajuda-colunas">/,
    "título no topo da faixa, antes das colunas",
  );
  assert.equal((ajuda.match(/<li><h3 class="lpa-ajuda-item">/g) ?? []).length, COMO_AJUDA.length);
  for (const c of COMO_AJUDA) assert.ok(ajuda.includes(c.texto), c.titulo);
  assert.match(ajuda, /<\/ul><p class="lpa-painel">[^<]+<\/p><\/div>/, "nota do painel no rodapé da faixa");
  assert.doesNotMatch(ajuda, /lp-glass|lp-ruled|<button|<input|role="tab"/);

  const css = ler("components/landing-proposals/landing-a.css");
  const regra = (sel: string) => css.match(new RegExp(`\\n${escapar(sel)} \\{([^}]*)\\}`))?.[1] ?? "";
  assert.match(regra(".lpa-ajuda-faixa"), /background: var\(--lp-mineral\)/);
  assert.match(regra(".lpa-ajuda-faixa"), /color: var\(--lp-on-mineral\)/);
  assert.match(regra(".lpa-ajuda-faixa"), /border-radius: var\(--lp-radius\)/);
  assert.match(regra(".lpa-ajuda-colunas"), /grid-template-columns: minmax\(0, 1fr\)/, "uma coluna no celular");
  assert.match(css, /@media \(min-width: 900px\) \{\n  \.lpa-ajuda-colunas \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/, "três colunas no computador");
  assert.match(regra(".lpa-ajuda-colunas p"), /color: var\(--lp-on-mineral-muted\)/);
  assert.match(regra(".lpa-ajuda-colunas li"), /border-top: 1px solid var\(--lp-on-mineral-rule\)/, "divisores sutis no celular");
  assert.doesNotMatch(css, /lpa-sobre|lpa-ajuda-lista|lpa-ajuda-head/, "CSS das versões anteriores removido");
});

test("render B: mesma tese, telefone à esquerda, rotina em frases e mapa animado", async () => {
  const html = await renderizar("components/landing-proposals/LandingB.tsx");
  verificarPagina(html, "B", "lpb-titulo", TITULO_B);
  assert.match(html, /class="lpb-frases"/);
  assert.match(ler("components/landing-proposals/landing-b.css"), /grid-template-areas: "telefone texto"/);
  assert.ok(html.indexOf('id="planos"') > html.indexOf('id="sobre-integracoes"'));
  assert.ok(html.indexOf('id="integracoes"') < html.indexOf('id="sobre-integracoes"'));
});

const SECAO_SOBRE = /<section class="(lp[ab]-sobre) lp-wrap" id="sobre-integracoes"[\s\S]*?<\/section>\s*(?=<section class="lp[ab]-planos)/;

test("integrações: resumos curtos, logos reais e detalhes de fonte única em disclosure", () => {
  assert.deepEqual(INTEGRACOES_PUBLICAS.map((i) => i.id), ["jueri", "olist", "nuvemshop", "google", "notion", "trello"]);
  for (const i of INTEGRACOES_PUBLICAS) {
    assert.ok(i.resumo.length > 20 && i.resumo.length <= 80, `${i.id}: resumo de uma linha`);
    assert.ok(GRUPOS_INTEGRACAO.some((g) => g.id === i.grupo), i.id);
  }
  assert.deepEqual(INTEGRACOES_PUBLICAS.filter((i) => i.nivel === "pro").map((i) => i.grupo), ["vendas", "vendas", "vendas"]);
  assert.equal(INTEGRACOES_PUBLICAS.find((i) => i.id === "trello")?.nivel, "ambos");
  const detalhe = ler("components/landing-proposals/DetalheIntegracao.tsx");
  assert.match(detalhe, /<details className="lp-detalhe">/);
  assert.match(detalhe, /GOOGLE_DESC/);
  assert.match(detalhe, /NOTION_DESC/);
  const base = ler("components/landing-proposals/proposals.css");
  assert.match(base, /\.lp-detalhe summary \{[^}]*min-height: 44px/);
  assert.match(ler("components/landing-proposals/landing-b.css"), /\.lpb-sobre-grupo \{[^}]*border-top: 2px solid var\(--lp-mineral\)/);
});

test("render B: a seção de integrações fica aberta no pano, com as cinco marcas e os detalhes", async () => {
  for (const [rel, chave] of [["components/landing-proposals/LandingB.tsx", "lpb"]] as const) {
    const html = await renderizar(rel);
    const secao = html.match(SECAO_SOBRE);
    assert.ok(secao, `${chave}: seção de detalhes`);
    assert.equal(secao[1], `${chave}-sobre`);
    assert.doesNotMatch(secao[0], /lp-glass/, `${chave}: sem caixa branca na seção`);
    for (const id of ["jueri", "olist", "nuvemshop", "google", "notion"]) {
      assert.match(secao[0], new RegExp(`class="lp-mark lp-mark-${id}"`), `${chave}: logo ${id}`);
    }
    for (const i of INTEGRACOES_PUBLICAS) assert.ok(secao[0].includes(i.resumo), `${chave}: resumo ${i.id}`);
    const detalhes = [...secao[0].matchAll(/<details class="lp-detalhe"><summary><span>([^<]+)<\/span>[\s\S]*?<\/summary><p>([^<]+)<\/p><\/details>/g)];
    assert.deepEqual(detalhes.map((d) => d[1]), ["Detalhes do Google", "Detalhes do Notion"]);
    assert.equal(detalhes[0][2], GOOGLE_DESC);
    assert.equal(detalhes[1][2], NOTION_DESC);
    assert.equal((secao[0].match(/Plano: <\/span>/g) ?? []).length, 3, `${chave}: plano discreto por grupo`);
    for (const g of GRUPOS_INTEGRACAO) assert.ok(secao[0].includes(g.titulo), `B: grupo ${g.titulo}`);
  }
});

test("render do mapa sem props: o CTA da home continua igual", async () => {
  const LINK_HOME = '<a href="/workspace/integracoes" class="integrations-link">Conhecer as integrações</a>';
  const LINK_PREVIA = '<a href="#sobre-integracoes" class="integrations-link">Ver o que cada integração faz</a>';
  const html = await renderizar("components/IntegrationsMarquee.tsx");
  assert.ok(html.includes(LINK_HOME));
  const comProps = await renderizar("components/IntegrationsMarquee.tsx", {
    ctaHref: "#sobre-integracoes",
    ctaLabel: "Ver o que cada integração faz",
  });
  assert.equal(comProps.replace(LINK_PREVIA, ""), html.replace(LINK_HOME, ""), "a prop só troca o link");
});

test("render índice: as duas propostas e a página atual", async () => {
  const html = await renderizar("app/propostas/page.tsx");
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<main\b/);
  const links = hrefs(html);
  for (const destino of ["/propostas/a", "/propostas/b", "/"]) assert.ok(links.includes(destino), destino);
  const visivel = texto(html);
  assert.match(visivel, /Perto de você, na loja/);
  assert.match(visivel, /A rotina ganha uma assistente/);
  assert.doesNotMatch(visivel, /Da peça ao preço|A conversa resolve|Calculadora|raio-X/i);
});

test("A: topo fixo na rolagem, com altura medida e âncoras abaixo dele", async () => {
  const html = await renderizar("components/landing-proposals/LandingA.tsx");
  assert.equal((html.match(/<header class="lp-bar lpa-bar">/g) ?? []).length, 1);
  const topo = html.slice(html.indexOf('<header class="lp-bar lpa-bar">'), html.indexOf("</header>"));
  assert.match(topo, /aria-label="Seções"/, "atalhos dentro do topo fixo");
  assert.match(topo, /aria-label="Trocar prévia"/);
  for (const id of ["rotina", "como-funciona", "integracoes", "planos", "duvidas"]) {
    assert.match(html, new RegExp(`<section[^>]*id="${id}"`), `âncora #${id} é uma section`);
  }

  const cabecalho = ler("components/landing-proposals/CabecalhoFixo.tsx");
  assert.match(cabecalho, /^"use client";/);
  for (const trecho of ["new ResizeObserver(medir)", "observador.disconnect()", 'removeProperty("--lpa-topo")', 'closest<HTMLElement>(".lpa")']) {
    assert.ok(cabecalho.includes(trecho), trecho);
  }
  assert.doesNotMatch(cabecalho, /addEventListener\("scroll"|preventDefault|scrollTo|scrollIntoView/, "sem ouvir rolagem nem mexer na navegação");

  const a = ler("components/landing-proposals/landing-a.css");
  const regra = (sel: string) => a.match(new RegExp(`\\n${escapar(sel)} \\{([^}]*)\\}`))?.[1] ?? "";
  assert.match(regra(".lpa-bar"), /position: sticky;\s*top: 0;\s*z-index: \d+/);
  assert.match(regra(".lpa-bar"), /env\(safe-area-inset-top\)/);
  assert.match(regra(".lpa-bar::before"), /background: oklch\([^)]*\/ 0\.9\)/, "fundo marfim legível atrás do topo");
  assert.match(regra(".lpa-bar::before"), /border-bottom: 1px solid var\(--lp-rule-mineral\)/);
  assert.match(regra(".lpa"), /--lpa-topo: \d+px/, "reserva antes da medida");
  assert.match(a, /@media \(min-width: 1024px\) \{\n  \.lpa \{ --lpa-topo: \d+px; \}/);
  assert.match(regra(".lpa section[id], .lpa-mapa-nota"), /scroll-margin-top: calc\(var\(--lpa-topo\) \+ \d+px\)/);
  assert.match(regra(".lpa a, .lpa button, .lpa summary"), /scroll-margin-top: calc\(var\(--lpa-topo\)/, "foco por teclado não some atrás do topo");
  assert.match(a, /\.lpa-rotina-head \{ position: sticky; top: calc\(var\(--lpa-topo\) \+ 24px\)/);

  assert.doesNotMatch(ler("components/landing-proposals/landing-b.css"), /lpa-|--lpa-topo|position: sticky; top: 0/);
  assert.doesNotMatch(ler("components/landing-proposals/LandingB.tsx"), /CabecalhoFixo/);
});

test("A: menu hambúrguer abaixo de 1024px, com gaveta acessível e cápsula no computador", async () => {
  const html = await renderizar("components/landing-proposals/LandingA.tsx");
  const topo = html.slice(html.indexOf('<header class="lp-bar lpa-bar">'), html.indexOf("</header>"));
  assert.match(
    topo,
    /<button type="button" class="lpa-menu" aria-label="Menu de seções" aria-expanded="false" aria-controls="lpa-secoes">/,
    "botão fechado de início, controlando a nav real",
  );
  assert.equal((html.match(/<nav[^>]*aria-label="Seções"/g) ?? []).length, 1, "uma só nav de seções");
  assert.match(topo, /<div class="lpa-gaveta"><nav id="lpa-secoes" class="lpa-nav" aria-label="Seções">/);
  assert.doesNotMatch(topo, /\shidden\b/, "sem atributo hidden escondendo o computador");
  assert.equal((topo.match(/aria-label="Trocar prévia"/g) ?? []).length, 2, "troca de prévia no topo (≥640px) e na gaveta (<640px)");
  assert.match(topo, /<div class="lpa-gaveta-previa"><span>Prévia<\/span><nav class="lp-switch"/);
  assert.ok(topo.indexOf('href="/login"') > -1, "Entrar continua no topo");

  const cabecalho = ler("components/landing-proposals/CabecalhoFixo.tsx");
  assert.match(cabecalho, /onClick=\{fecharAoNavegar\}/, "clicar numa seção fecha o menu, sem impedir a âncora");
  assert.match(
    cabecalho,
    /const fecharAoNavegar = \(\) => \{\n    if \(!aberto\) return;\n    setAberto\(false\);\n    botao\.current\?\.focus\(\{ preventScroll: true \}\);/,
    "com a gaveta fechada, o foco volta ao botão em vez de ficar num link escondido",
  );
  assert.doesNotMatch(cabecalho, /"Tab"|tabIndex/, "sem forçar o Tab: a ordem vem do DOM");
  const iMarca = topo.indexOf('class="lp-brand"');
  const iEntrar = topo.indexOf('href="/login"');
  const iMenu = topo.indexOf('class="lpa-menu"');
  const iNav = topo.indexOf('id="lpa-secoes"');
  assert.ok(iMarca > -1 && iMarca < iEntrar && iEntrar < iMenu && iMenu < iNav, "ordem de foco: marca, Entrar, menu e só então a gaveta");
  assert.ok(topo.indexOf('class="lpa-nav-item"') > iMenu, "o primeiro link da gaveta vem logo depois do botão");
  assert.match(cabecalho, /e\.key !== "Escape"[\s\S]*setAberto\(false\);\s*botao\.current\?\.focus\(\)/, "Esc fecha e devolve o foco ao botão");
  assert.match(cabecalho, /addEventListener\("pointerdown", foraDoTopo\)/, "clique fora fecha");
  assert.match(cabecalho, /addEventListener\("focusin", foraDoTopo\)/, "foco fora fecha, sem prender o foco");
  assert.match(cabecalho, /removeEventListener\("pointerdown", foraDoTopo\)/);
  assert.match(cabecalho, /matchMedia\("\(min-width: 1024px\)"\)/, "ao virar computador, o menu fecha");
  assert.doesNotMatch(cabecalho, /autoFocus|\.focus\(\);?\s*\}, \[\]/, "sem foco automático ao montar");
  assert.doesNotMatch(ler("components/landing-proposals/LandingA.tsx"), /"use client"/, "LandingA continua no servidor");

  const a = ler("components/landing-proposals/landing-a.css");
  const regra = (sel: string) => a.match(new RegExp(`\\n${escapar(sel)} \\{([^}]*)\\}`))?.[1] ?? "";
  assert.match(regra(".lpa-gaveta"), /display: none;[\s\S]*position: absolute;[\s\S]*top: calc\(100% \+ \d+px\)/, "gaveta fechada some e, aberta, fica fora do fluxo");
  assert.match(a, /\n\.lpa-bar\.is-aberto \.lpa-gaveta \{ display: grid;/);
  assert.match(regra(".lpa-menu"), /width: 44px;\s*height: 44px;/);
  assert.match(regra(".lpa-nav-item"), /min-height: 48px;/);
  assert.match(regra(".lpa"), /--lpa-topo: 60px;/, "reserva do topo fechado no celular, numa linha");
  const desktop = a.slice(a.indexOf("@media (min-width: 1024px) {\n  .lpa { --lpa-topo"));
  assert.match(desktop, /\.lpa-menu \{ display: none; \}/);
  assert.match(desktop, /\.lpa-gaveta, \.lpa-bar\.is-aberto \.lpa-gaveta \{ display: contents; \}/, "cápsula visível no computador, aberta ou fechada");
  assert.match(desktop, /\.lpa-nav \{ grid-column: 2; grid-row: 1;/);
  assert.match(a, /\n\.lpa-bar \.lp-bar-actions \{ grid-column: 3; grid-row: 1; \}/, "ações na mesma linha, apesar da nova ordem no DOM");
  assert.doesNotMatch(a, /\.lpa-nav \{[^}]*display: none/, "a nav nunca some por si; quem esconde é a gaveta fechada");
  assert.doesNotMatch(ler("components/landing-proposals/LandingB.tsx"), /lpa-menu|CabecalhoFixo/);
});

test("mapa com Meta: seis nós só quando pedido, com ressalva visível; a home segue com cinco", async () => {
  const head = await renderizar("components/IntegrationsMarquee.tsx", {}, {
    "components/IntegrationsMarquee.tsx": daHead("components/IntegrationsMarquee.tsx"),
  });
  const padrao = await renderizar("components/IntegrationsMarquee.tsx");
  assert.equal(padrao, head, "sem props, o mapa renderiza exatamente como no HEAD");
  assert.equal((padrao.match(/class="integrations-node integrations-node-/g) ?? []).length, 5);
  assert.doesNotMatch(padrao, /has-meta|integrations-node-meta|Sujeito à liberação/);

  const comMeta = await renderizar("components/IntegrationsMarquee.tsx", { includeMeta: true });
  assert.equal((comMeta.match(/class="integrations-node integrations-node-/g) ?? []).length, 6);
  assert.match(comMeta, /<div class="integrations-graph has-meta">/);
  assert.match(
    comMeta,
    /<li class="integrations-node integrations-node-meta"><span class="integrations-node-brand" role="img" aria-label="Meta"><svg[^>]*aria-hidden="true"[\s\S]*?<\/svg><span>Meta<\/span><\/span><span class="integrations-node-purpose">Catálogo do Instagram e Facebook<\/span><span class="integrations-node-note">Sujeito à liberação<\/span><\/li>/,
  );
  assert.doesNotMatch(comMeta, /Conectad|Grátis|gratuit/i);
  assert.equal(comMeta.indexOf("integrations-node-meta") > comMeta.indexOf("integrations-node-notion"), true, "Meta entra depois das cinco");

  const beam = ler("components/integrations-beam.css");
  for (const [no, y] of [["jueri", 16], ["olist", 50], ["meta", 84], ["nuvemshop", 16], ["google-workspace", 50], ["notion", 84]] as const) {
    assert.match(beam, new RegExp(`\\.integrations-graph\\.has-meta \\.integrations-node-${no} \\{[^}]*top: ${y}%`), `${no} em ${y}%`);
  }
  assert.match(beam, /\.integrations-graph\.has-meta \.integrations-node-meta \{ left: 0;/, "Meta à esquerda, com Jueri e Olist");
  assert.match(beam, /@media \(prefers-reduced-motion: reduce\) \{\n  \.integrations-pulse \{ animation: none; display: none; \}\n\}/, "movimento reduzido intacto");
  const marquee = ler("components/IntegrationsMarquee.tsx");
  assert.match(marquee, /graph\.querySelectorAll<HTMLElement>\("\.integrations-node"\)/, "a medida dos feixes pega todos os nós, inclusive a Meta");
  assert.match(marquee, /\{paths\.map\(\(path, index\) => \(/, "um feixe e um pulso por nó medido");

  const base = ler("components/landing-proposals/proposals.css");
  const mapa = (sel: string) => base.match(new RegExp(`\\n${escapar(sel)} \\{([^}]*)\\}`))?.[1] ?? "";
  assert.match(mapa(".lp-root .integrations-section"), /background: #173F3B;/, "fundo mineral oficial");
  assert.match(mapa(".lp-root .integrations-section"), /color: #F6F3ED;/, "texto marfim oficial");
  assert.match(mapa(".lp-root .integrations-copy h2"), /color: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-copy > p"), /color: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-copy > .integrations-note"), /color: rgba\(246, 243, 237, 0\.\d+\);/, "secundário = marfim translúcido");
  assert.match(mapa(".lp-root .integrations-link"), /color: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-section :focus-visible"), /outline-color: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-path"), /stroke: rgba\(246, 243, 237, 0\.3\);/);
  assert.match(mapa(".lp-root .integrations-pulse"), /stroke: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-hub"), /border: 1px solid #F6F3ED;/, "hub destacado do fundo pelo contorno marfim");
  assert.match(mapa(".lp-root .integrations-hub-caption"), /color: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-node"), /background: #F6F3ED;/);
  assert.match(mapa(".lp-root .integrations-node-brand"), /color: #1E2B28;/);
  assert.match(mapa(".lp-root .integrations-node-purpose"), /color: #173F3B;/);
  const regrasDoMapa = [...base.matchAll(/\n\.lp-root [^{]*\.integrations-[^{]*\{([^}]*)\}/g)].map((m) => m[1]).join("\n");
  for (const cor of regrasDoMapa.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) ?? []) {
    assert.match(cor, /^#173F3B$|^#F6F3ED$|^#1E2B28$|^rgba\(246, 243, 237, 0\.\d+\)$/i, `cor fora da paleta da marca no mapa: ${cor}`);
  }
  assert.doesNotMatch(regrasDoMapa, /gradient|oklch|box-shadow: 0/, "sem gradiente nem tom inventado");
  assert.doesNotMatch(
    regrasDoMapa,
    /(?:^|[\s;])(?:color|background|stroke|fill|border(?:-[a-z]+)*|outline-color|text-decoration-color):[^;]*var\(/m,
    "cores do mapa só em hex oficial, sem token",
  );
  assert.doesNotMatch(beam, /\.lp-root|\.lpa|\.lpb/, "o tom das prévias não entra no CSS da home");
});

