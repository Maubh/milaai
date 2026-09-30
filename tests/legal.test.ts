/**
 * A política e os termos não podem afirmar o que o produto não faz.
 *
 * ── Furos medidos em 2026-09-30 (antes deste guard) ─────────────────────────
 *   1. `privacy@milaai.com.br` em 4 lugares — endereço que não existe.
 *   2. "Provedor de modelo de IA (LLM) — a definir" — FALSO. Já em produção:
 *      Google, TypeSafe/Jev e fallback Alibaba/Zhipu.
 *   3. Prometia Olist e Bling e OMITIA o Google — quem processa imagem e texto
 *      e que exige divulgação nominal.
 *   4. Retenção ("90 dias", "180 dias") sem rotina de expurgo.
 *   5. `PricingSection` anunciava "Integração direta Jueri, Bling e Olist".
 *
 * ── v2, depois da revisão do Grok 4.7 (REQUEST_CHANGES) ────────────────────
 * A v1 varria o FONTE com regex e era burlável de dez formas medidas. A mais
 * grave: o teste só exigia que os identificadores certos estivessem no arquivo,
 * então bastava importar a constante e escrever a mentira no JSX ao lado —
 * inclusive com o ternário invertido, renderizando "apagados automaticamente em
 * 90 dias" com `EXPURGO_AUTOMATICO_ATIVO === false`. O teste passava.
 *
 * A v2 muda o método: **transpila as páginas e RENDERIZA em HTML**
 * (`typescript` + `react-dom/server`) e verifica o TEXTO QUE O USUÁRIO LÊ.
 * Se não está no HTML, não existe.
 *
 * ── Desenho ────────────────────────────────────────────────────────────────
 *   A. a página usa a fonte única (`lib/legal.ts`);
 *   B. todo item das listas da fonte APARECE no HTML — se alguém apagar a seção,
 *      o teste cai junto;
 *   C. fatos proibidos não aparecem no HTML, em nenhuma forma;
 *   D. o produto não passou a fazer o que a política nega (rastreador, escopo
 *      sensível do Google).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, relative, resolve } from "node:path";
import { createRequire } from "node:module";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(RAIZ, "package.json"));
const ts = req("typescript") as typeof import("typescript");
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");

const PAGINAS = [
  { caminho: "app/(site)/privacidade/page.tsx", nome: "política" },
  { caminho: "app/(site)/termos/page.tsx", nome: "termos" },
] as const;

const FONTE = "lib/legal.ts";
const CACHE = join(RAIZ, ".next", "legal-guard");

// ─────────────────────────────────────────── infraestrutura de render

const nomeSaida = (rel: string) => rel.replace(/[/.]/g, "_") + ".mjs";

/** Transpila um arquivo do projeto para .mjs, resolvendo o alias `@/`. */
function transpilar(rel: string): void {
  const abs = join(RAIZ, rel);
  const js = ts.transpileModule(readFileSync(abs, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      esModuleInterop: true,
    },
    fileName: abs,
  }).outputText;
  // `@/lib/legal` → `./lib_legal_ts.mjs`, já presente no cache.
  const comAlias = js.replace(
    /from\s+["']@\/([\w./-]+)["']/g,
    (_m, p: string) => `from "./${nomeSaida(p + ".ts")}"`,
  );
  // `next/link` não resolve fora do Next: shim para uma âncora.
  const comShim = comAlias.replace(/from\s+["']next\/link["']/g, `from "./_link.mjs"`);
  writeFileSync(join(CACHE, nomeSaida(rel)), comShim, "utf8");
}

let pronto = false;
function preparar(): void {
  if (pronto) return;
  rmSync(CACHE, { recursive: true, force: true });
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(
    join(CACHE, "_link.mjs"),
    'import React from "react";\n' +
      'export default function Link(p){return React.createElement("a",{href:p.href},p.children);}\n',
  );
  for (const dep of ["lib/legal.ts", "lib/google-workspace.ts", "lib/notion.ts"]) {
    try {
      transpilar(dep);
    } catch {
      /* dependência opcional: a página que a usar falha com erro claro */
    }
  }
  pronto = true;
}

/** HTML renderizado de uma página. */
async function htmlDe(rel: string): Promise<string> {
  preparar();
  transpilar(rel);
  const mod = (await import(pathToFileURL(join(CACHE, nomeSaida(rel))).href)) as {
    default: () => unknown;
  };
  return renderToStaticMarkup(React.createElement(mod.default as never));
}

/** Texto visível: tags fora, entidades resolvidas. */
function texto(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Módulo da fonte única, importado com os valores REAIS de runtime. */
async function fatos(): Promise<Record<string, unknown>> {
  preparar();
  transpilar(FONTE);
  return (await import(pathToFileURL(join(CACHE, nomeSaida(FONTE))).href)) as Record<
    string,
    unknown
  >;
}

// ─────────────────────────────────────────── A. fonte única

test("legal: as páginas importam a fonte única", () => {
  for (const p of PAGINAS) {
    assert.match(
      readFileSync(join(RAIZ, p.caminho), "utf8"),
      /from\s+["']@\/lib\/legal["']/,
      `${p.nome} deve importar @/lib/legal`,
    );
  }
});

// ─────────────────────────────────────────── B. o que a fonte afirma aparece

test("legal: os valores de runtime são exatamente os esperados", async () => {
  const f = await fatos();
  // Não basta o fonte conter o identificador: uma expressão como
  // `"contato@milaai.com.br".replace("contato","privacy")` passaria na v1.
  assert.equal(f.CONTATO_PRIVACIDADE, "contato@milaai.com.br");
  assert.equal(f.EXPURGO_AUTOMATICO_ATIVO, false);
  // `email` saiu em 2026-09-30 (ordem do Maurício). Nenhum escopo sensível:
  // só `openid` (identificador da conta) e `drive.file` (arquivos da mila).
  assert.deepEqual(f.GOOGLE_ESCOPOS, [
    "openid",
    "https://www.googleapis.com/auth/drive.file",
  ]);
  // A política não pode mais prometer/negar com base no endereço recebido.
  assert.ok(
    !(f.GOOGLE_ESCOPOS as string[]).includes("email"),
    "o escopo email não deve estar na lista",
  );
  assert.deepEqual(f.CONECTORES_NAO_PRONTOs, ["Olist", "Bling"]);
  // As listas não podem estar vazias — lista vazia faria os laços abaixo
  // passarem sem verificar nada.
  assert.ok((f.SUBCONTROLADORES as unknown[]).length >= 8, "subprocessadores faltando");
  assert.ok((f.DADOS_TRATADOS as unknown[]).length >= 6, "dados tratados faltando");
  assert.ok((f.BASES_LEGAIS as unknown[]).length >= 4, "bases legais faltando");
  assert.ok((f.DIREITOS as unknown[]).length >= 6, "direitos faltando");
  assert.ok((f.NAO_FEITO as unknown[]).length >= 4, "negações faltando");
  assert.ok((f.RETENCAO as unknown[]).length >= 4, "retenção faltando");
  assert.equal(f.DECISAO_AUTOMATIZADA, false);
});

test("legal: todo subprocessador aparece no HTML, com país", async () => {
  const f = await fatos();
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  const subs = f.SUBCONTROLADORES as Array<{ nome: string; pais: string }>;
  for (const s of subs) {
    assert.ok(h.includes(s.nome), `subprocessador ${s.nome} não aparece no HTML`);
    assert.ok(h.includes(s.pais), `país de ${s.nome} (${s.pais}) não aparece no HTML`);
  }
  assert.ok(subs.some((s) => s.nome === "Google"), "Google ausente da lista");
  // A transferência internacional precisa estar nomeada (art. 33).
  for (const pais of ["Estados Unidos", "China"]) {
    assert.ok(h.includes(pais), `país ${pais} não declarado`);
  }
});

test("legal: todo dado tratado, base legal e direito aparecem no HTML", async () => {
  const f = await fatos();
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  for (const d of f.DADOS_TRATADOS as Array<{ dado: string }>) {
    assert.ok(h.includes(d.dado.slice(0, 40)), `dado não renderizado: ${d.dado.slice(0, 40)}`);
  }
  for (const b of f.BASES_LEGAIS as Array<{ base: string }>) {
    assert.ok(h.includes(b.base.slice(0, 25)), `base legal não renderizada: ${b.base}`);
  }
  for (const d of f.DIREITOS as string[]) {
    assert.ok(h.includes(d.slice(0, 25)), `direito não renderizado: ${d}`);
  }
  for (const n of f.NAO_FEITO as string[]) {
    assert.ok(h.includes(n.slice(0, 40)), `negação ausente no HTML: ${n.slice(0, 40)}`);
  }
});

test("legal: a retenção aparece sem prometer expurgo automático", async () => {
  const f = await fatos();
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  for (const r of f.RETENCAO as Array<{ item: string }>) {
    assert.ok(h.includes(r.item.slice(0, 30)), `item de retenção ausente: ${r.item}`);
  }
  assert.ok(
    h.includes("rotina automática de expurgo ainda não está no ar"),
    "a página precisa dizer que o expurgo automático não está no ar",
  );
  // A frase de escapatória nada vale se o ternário da página a esconder.
  assert.doesNotMatch(
    h,
    /apagad\w*\s+automaticamente|excluíd\w*\s+automaticamente/i,
    "a página afirma expurgo automático que não existe",
  );
});

test("legal: conectores não prontos aparecem como NÃO disponíveis", async () => {
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  for (const nome of ["Olist", "Bling"]) {
    assert.ok(h.includes(nome), `${nome} precisa aparecer como não disponível`);
  }
  assert.ok(
    /ainda não disponíveis|ainda não foram habilitados/i.test(h),
    "os conectores não prontos precisam vir com a ressalva",
  );
});

test("legal: Google com escopo, limite e cláusula de Limited Use", async () => {
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  assert.match(h, /drive\.file/, "o escopo drive.file precisa ser declarado");
  assert.match(h, /Limited Use/i, "falta a cláusula de Limited Use exigida pelo Google");
  // Depois de 2026-09-30 o escopo `email` saiu: a política pode dizer que a mila
  // não acessa e-mail NEM recebe o endereço — sem a ressalva que a 2ª rodada
  // exigia. Se alguém reintroduzir `email`, este teste cai.
  assert.match(h, /não recebe seu endereço de e-mail/i, "a mila não recebe endereço");
  assert.match(h, /não lê sua caixa de e-mail/i, "e não lê a caixa de e-mail");
  assert.match(h, /não acessa sua agenda ou seu calendário/i, "nem agenda/calendário");
  assert.match(h, /openid/, "o escopo openid precisa estar listado");
  assert.doesNotMatch(
    h,
    /escopos solicitados[^.]*email/i,
    "o escopo email foi removido — não pode voltar à lista publicada",
  );
  assert.match(h, /China/, "o processamento na China precisa ser declarado");
});

// ─────────────────────────────────────────── C. fatos proibidos

test("legal: nenhum HTML publica o e-mail inexistente privacy@", async () => {
  for (const p of PAGINAS) {
    const html = await htmlDe(p.caminho);
    assert.doesNotMatch(html, /privacy@/i, `${p.nome} publica privacy@`);
    assert.match(html, /contato@milaai\.com\.br/, `${p.nome} não publica o contato oficial`);
  }
});

test("legal: a única forma de e-mail no HTML é o contato oficial", async () => {
  for (const p of PAGINAS) {
    const emails = [...(await htmlDe(p.caminho)).matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map(
      (m) => m[0],
    );
    const estranhos = emails.filter((e) => e !== "contato@milaai.com.br");
    assert.deepEqual(estranhos, [], `${p.nome} publica e-mail fora do oficial: ${estranhos}`);
  }
});

test("legal: nenhum HTML diz que o provedor de IA está 'a definir'", async () => {
  for (const p of PAGINAS) {
    const h = texto(await htmlDe(p.caminho));
    assert.doesNotMatch(h, /a\s+definir/i, `${p.nome} ainda diz "a definir"`);
    assert.doesNotMatch(h, /ainda\s+ser[aá]\s+escolhid/i, `${p.nome} promete escolher depois`);
  }
});

test("legal: as páginas não usam dangerouslySetInnerHTML", () => {
  for (const p of PAGINAS) {
    assert.doesNotMatch(
      readFileSync(join(RAIZ, p.caminho), "utf8"),
      /dangerouslySetInnerHTML/,
      `${p.nome}: HTML cru pode esconder texto da verificação`,
    );
  }
});

test("legal: o pricing importa os fatos em vez de digitar à mão", () => {
  const pricing = readFileSync(join(RAIZ, "components/PricingSection.tsx"), "utf8");
  assert.match(
    pricing,
    /from\s+["']@\/lib\/legal["']/,
    "PricingSection deve importar os fatos de lib/legal",
  );
  // O nome do conector não pronto não pode aparecer sem a ressalva — em
  // nenhuma forma (linha única, string solta, comentário de escape).
  const linha = pricing
    .split("\n")
    .filter((l) => /\b(Olist|Bling)\b/i.test(l) && !/^\s*(\/\/|\*)/.test(l));
  for (const l of linha) {
    assert.match(
      l,
      /ainda não|ainda nao|não dispon|nao dispon/i,
      `PricingSection promete conector não pronto sem ressalva: ${l.trim()}`,
    );
  }
});

// ─────────────────────────────────────────── D. o produto não contradiz o texto

test("legal: o site nega rastreadores — então não pode ter rastreador", () => {
  // v2: varre o repositório INTEIRO (menos artefatos) e todos os tipos de
  // arquivo, porque a v1 só olhava app/components/lib e só .ts/.tsx — o Grok
  // mostrou que `public/`, `middleware.ts`, `next.config.*` e `next/script`
  // ficavam cegos.
  const proibidos = [
    "googletagmanager",
    "google-analytics",
    "googletag",
    "gtag(",
    "gtm.js",
    "fbq(",
    "hotjar",
    "clarity.ms",
    "posthog",
    "mixpanel",
    "plausible.io",
    "segment.com/analytics",
    "cloudflareinsights",
    "googleanalytics",
    "next/third-parties",
  ];
  const IGNORAR = new Set(["node_modules", ".next", ".git", "tests", ".vercel", "coverage"]);
  const achados: string[] = [];
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      if (IGNORAR.has(nome)) continue;
      const caminho = join(dir, nome);
      let st;
      try {
        st = statSync(caminho);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        varrer(caminho);
        continue;
      }
      if (!/\.(tsx?|jsx?|mjs|cjs|html|json)$/.test(nome)) continue;
      const txt = readFileSync(caminho, "utf8").toLowerCase();
      for (const p of proibidos) {
        if (txt.includes(p)) achados.push(`${relative(RAIZ, caminho)} → ${p}`);
      }
    }
  };
  varrer(RAIZ);
  assert.deepEqual(achados, [], `a política nega rastreadores, mas há: ${achados.join("; ")}`);
});

test("legal: o site não pede escopo sensível do Google", async () => {
  const f = await fatos();
  const permitidos = new Set(f.GOOGLE_ESCOPOS as string[]);
  const SENSIVEIS = ["gmail", "calendar", "tasks", "drive.readonly", "spreadsheets", "contacts"];
  const achados: string[] = [];
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      if (["node_modules", ".next", ".git", "tests", ".vercel"].includes(nome)) continue;
      const caminho = join(dir, nome);
      if (statSync(caminho).isDirectory()) {
        varrer(caminho);
        continue;
      }
      if (!/\.(tsx?|jsx?)$/.test(nome)) continue;
      const txt = readFileSync(caminho, "utf8");
      for (const m of txt.matchAll(/googleapis\.com\/auth\/[\w.]+/g)) {
        const escopo = m[0];
        if (permitidos.has(`https://www.${escopo}`) || permitidos.has(escopo)) continue;
        if (SENSIVEIS.some((s) => escopo.toLowerCase().includes(s))) {
          achados.push(`${relative(RAIZ, caminho)} → ${escopo}`);
        }
      }
    }
  };
  varrer(RAIZ);
  assert.deepEqual(
    achados,
    [],
    `a política diz que não acessamos e-mail/agenda, mas apareceu: ${achados.join("; ")}`,
  );
});

test("legal: as duas páginas usam a mesma data, vinda da fonte", async () => {
  const f = await fatos();
  for (const p of PAGINAS) {
    const src = readFileSync(join(RAIZ, p.caminho), "utf8");
    assert.doesNotMatch(src, /Última atualização:\s*\d/i, `${p.nome} tem data à mão`);
    assert.match(src, /ATUALIZADO_EM/, `${p.nome} deve usar ATUALIZADO_EM`);
    const h = texto(await htmlDe(p.caminho));
    assert.ok(h.includes(String(f.ATUALIZADO_EM)), `${p.nome} não renderizou a data da fonte`);
  }
});

test("legal: os termos linkam a política e explicam os papéis", async () => {
  assert.match(
    await htmlDe(PAGINAS[1].caminho),
    /href="\/privacidade"/,
    "termos devem linkar a política",
  );
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  assert.match(h, /controladora/, "a política precisa falar de controladora");
  assert.match(h, /operadora/, "a política precisa falar de operadora");
});
