import { createHash } from "node:crypto";
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
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, relative, resolve } from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

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
/** Caminho absoluto único da fonte — o MESMO arquivo que as páginas importam.
 *  (O ataque descrito pelo Grok era concatenar um arquivo no fim: um segundo
 *  `export const CONTATO_PRIVACIDADE` passava a definir o valor publicado.) */
const FONTE_LEGAL = join(RAIZ, FONTE);
const CACHE = join(RAIZ, ".next", "legal-guard");

// ─────────────────────────────────────────── infraestrutura de render

const nomeSaida = (rel: string) => rel.replace(/[/.]/g, "_") + ".mjs";

/** Transpila um arquivo do projeto para .mjs, resolvendo o alias `@/`.
 *  `aliasLegal` redireciona `@/lib/legal` para outro módulo (a versão
 *  instrumentada com sentinelas, usada pelo teste de prosa estática). */
function transpilar(rel: string, aliasLegal?: string): void {
  const abs = join(RAIZ, rel);
  const source = readFileSync(abs, "utf8");
  if (PAGINAS.some((p) => p.caminho === rel) || rel === "components/PricingSection.tsx") {
    assert.doesNotMatch(source, /["']use client["']|\b(?:process|window|document|globalThis)\b|\bnext\/dynamic\b|\buse(?:Effect|LayoutEffect|InsertionEffect|State|Reducer|SyncExternalStore)\b/, `${rel}: conteúdo dinâmico fora do harness estático`);
  }
  const js = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      esModuleInterop: true,
    },
    fileName: abs,
  }).outputText;
  // `@/lib/legal` → `./lib_legal_ts.mjs`, já presente no cache.
  let comAlias = js.replace(
    /from\s+["']@\/([\w./-]+)["']/g,
    (_m, p: string) => `from "./${nomeSaida(p + ".ts")}"`,
  );
  if (aliasLegal) {
    comAlias = comAlias.replace(
      /from\s+["']\.\/lib_legal_ts\.mjs["']/g,
      `from "./${aliasLegal}"`,
    );
  }
  // `next/link` não resolve fora do Next: shim para uma âncora.
  const comShim = comAlias.replace(/from\s+["']next\/link["']/g, `from "./_link.mjs"`);
  const saida = aliasLegal ? nomeSaida(rel).replace(/\.mjs$/, ".sentinela.mjs") : nomeSaida(rel);
  writeFileSync(join(CACHE, saida), comShim, "utf8");
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

/**
 * ── TEXTOS CONGELADOS (o ponto que faltava, achado na 2ª revisão do Grok) ────
 * A v2 ainda era burlável de um jeito simples e grave: todos os testes exigiam
 * que o HTML contivesse "o que `lib/legal.ts` diz AGORA". Mudar a fonte mudava
 * os DOIS lados da asserção — dava para trocar `praticado` de "Mantido até
 * exclusão sob pedido" para "Removido sozinho ao fim do prazo" e a suíte seguia
 * verde, porque nada estava ancorado em literal.
 *
 * Aqui ficam os trechos que são DECISÃO, não texto editável. Cada um é um
 * fragmento literal que tem de existir no HTML. Mudar a redação exige mudar
 * este arquivo de teste também — que é o ponto: obriga a decisão consciente.
 */
const CONGELADOS: Array<[string, string]> = [
  // expurgo — o produto NÃO apaga sozinho hoje
  ["expurgo", "rotina automática de expurgo ainda não está no ar"],
  // contato oficial
  ["contato", "contato@milaai.com.br"],
  // retenção praticada (o Grok mostrou que `praticado` não era assertido)
  ["retencao-msg", "Mantido até exclusão sob pedido"],
  // payload cru É gravado
  ["payload-cru", "registrado em arquivo de diagnóstico"],
  // papéis
  ["controladora", "controladora"],
  ["operadora", "operadora"],
  // dados de terceiros
  ["fornecedor", "operadora, para prestar o serviço que a loja pediu"],
  // escopos do Google
  ["escopo-openid", "openid"],
  ["escopo-drive-file", "drive.file"],
  // Limited Use — a 3ª revisão do Grok mostrou que só "Limited Use" e
  // "autorização específica" estavam congelados; a proibição de crédito/scoring
  // não estava, então dava para apagá-la com a suíte verde.
  ["limited-use", "Limited Use"],
  ["limited-use-credito", "avaliar crédito, pontuação ou risco"],
  ["limited-use-transferencia", "sob contrato"],
  ["acesso-humano", "autorização específica"],
  // art. 33 — congelar só "transferência internacional" e "China" não bastava:
  // dava para trocar o corpo por "cláusulas-padrão já firmadas". Estes três
  // fragmentos carregam a DECISÃO (mecanismo pendente, o que vai, o que não vai).
  ["transferencia", "transferência internacional"],
  ["transferencia-pendente", "formalização das cláusulas-padrão segue pendente"],
  ["transferencia-mecanismo", "Mecanismo: os contratos de adesão"],
  ["transferencia-minimo", "o texto da mensagem que você envia"],
  ["china", "China"],
  // Google não é usado para achar a loja
  ["google-vinculo", "sessão autenticada no WhatsApp"],
  // conectores não prontos
  ["olist", "Olist"],
  ["bling", "Bling"],
];

/** Trechos congelados que vivem FORA das páginas jurídicas (home/pricing). */
const CONGELADOS_PRICING: Array<[string, string]> = [
  // A linha inteira do ERP fica congelada: é a que estava mentindo no ar
  // ("Integração direta Jueri, Bling e Olist") quando o guard nasceu.
  ["erp-ressalva", "Olist e Bling ainda não"],
  ["jueri-disponivel", "Jueri disponível"],
];

/**
 * PARÁGRAFOS VISÍVEIS, exatos.
 *
 * Terceira camada contra o ataque mais sujo (verdade escondida ao lado da
 * mentira). As camadas anteriores são: proibido por regex (frágil à redação),
 * contagem de seção (frágil à estrutura). Esta compara o **parágrafo inteiro**
 * com o esperado — a ordem das palavras não importa, porque o parágrafo é a
 * unidade. "Os dados são automaticamente excluídos" passa por qualquer regex de
 * verbo+advérbio, mas não é o parágrafo que está congelado.
 */
const EXATOS: Array<{
  quando: string;
  exato: (f: Record<string, unknown>) => string;
}> = [
  {
    quando: "declaração de expurgo",
    // O parágrafo é a NOTA (vinda da fonte) + a frase de expurgo (CONGELADA —
    // é a decisão). Comparar o parágrafo inteiro é o que pega o ataque: uma
    // frase a mais, contradizendo o resto, aparece como parágrafo diferente.
    exato: (f) =>
      f.EXPURGO_AUTOMATICO_ATIVO === true
        ? String(f.RETENCAO_NOTA)
        : `${f.RETENCAO_NOTA} Especificamente: a rotina automática de expurgo ainda não está no ar.`,
  },
];

/** O que o HTML NUNCA pode conter, mesmo com a fonte mudando.
 *
 * A 3ª revisão do Grok mostrou que a 1ª versão era denylist de exemplos: cada
 * regex casava UMA redação. "Eliminado automaticamente" passava por fora de
 * `apagad\w*`/`excluíd\w*`/`removid\w*`. As regex abaixo cobrem a CLASSE. */
const PROIBIDOS: Array<[string, RegExp]> = [
  // Verbo de sumiço + "automaticamente/sozinho" precisa vir com SUJEITO de
  // dado na mesma frase. A versão anterior (`\w+\s+(automaticamente|sozinh\w*)`)
  // casava "o código expira sozinho" — verdade legítima sobre o OTP, que a
  // política conta no login. Sujeito de dado, então.
  [
    "expurgo automatico",
    /(dados?|informa\w+|conte[uú]do|arquiv\w+|registr\w+|mensage\w+|nota|hist[oó]rico|credencia\w+|payload|cadastro|foto)\b[^.!?]{0,60}\b(apagad\w*|exclu[ií]d\w*|removid\w*|eliminad\w*|deletad\w*|expir\w*|sumi\w*)\b[^.!?]{0,30}(automaticamente|sozinh\w*)/i,
  ],
  // E a automação declarada em funcionamento — a redação que o Grok usou.
  [
    "expurgo no ar",
    /(expurgo|exclusão autom[aá]tica|automação de exclusão)[^.!?]{0,90}?((?<!n[ãa]o\s)j[aá] (est[aá]|funciona)|(?<!n[ãa]o\s)est[aá] no ar|(?<!n[ãa]o\s)cumpre os prazos)/i,
  ],
  ["e-mail inexistente", /privacy@/i],
  ["provedor a definir", /a\s+definir/i],
  ["endereco recebido", /recebe\s+o\s+endereço|endereço\s+de\s+e-mail\s+associado/i],
  ["escopo email", /["'`]email["'`]|\bemail\b\s*,/i],
  // Escopo sensível: cobrir o Drive inteiro (`drive`, `drive.readonly`) e a URL
  // montada por concatenação — o Grok mostrou que `"…/auth/" + "gmail.readonly"`
  // escapava de um regex que exigia a URL inteira em aspas duplas.
  ["escopo sensivel", /googleapis\.com\/?["'`+ ]|auth\/(gmail|calendar|tasks|spreadsheets|contacts)|["'`]drive["'`]|drive\.readonly/i],
  ["promessa de venda de dados", /(?<!não\s)vendemos\s+(seus\s+)?dados/i],
  // Art. 33: a v1 afirmava "usamos cláusulas contratuais-padrão" como se o
  // mecanismo estivesse fechado, sem instrumento nem pessoa jurídica para
  // assinar. A 3ª revisão do Grok mostrou que trocar o corpo por "cláusulas-
  // padrão já firmadas" passava — as palavras-chave continuavam lá. Agora a
  // afirmativa é proibida por CLASSE, não por redação.
  [
    "art33 como fechado",
    /cl[áa]usulas?[- ]padr[ãa]o[^.!?]{0,60}(j[áa]\s+)?(firmad|assinad|celebrad|vigent|acordad|estabelecid)/i,
  ],
  ["art33 como fechado 2", /(temos|mantemos|usamos)[^.!?]{0,40}cl[áa]usulas?[- ]padr[ãa]o[^.!?]{0,30}(com|junto)/i],
  // Mecanismo de transferência afirmado como existente sem qualificação.
  ["mecanismo afirmado", /art\.?\s*33\)[^.!?]{0,40}mecanismo:\s*(os\s+)?(contratos|cl[áa]usulas)[^.!?]{0,40}(firmad|assinad|celebrad)/i],
];

/**
 * CSS/atributo que ESCONDE do titular mas não do `texto()`.
 *
 * A 3ª revisão do Grok derrubou a versão anterior: era denylist de 4 literais,
 * sem flag `i`, exigindo aspas simples/duplas — então `display: \`none\``
 * (template string), `display: "None"` (CSS é case-insensitive) e
 * `hidden={true}` (o regex exigia espaço, `/` ou `>` depois) passavam.
 * Abordagem nova: aqui as páginas jurídicas são proibidas de usar `style=` e
 * `hidden` de QUALQUER forma. Elas não têm motivo para ter estilo inline.
 */
const NAO_PODE_TER_ESTILO =
  /\sstyle\s*[=:]|\shidden[\s/>=]|aria-hidden|dangerouslySetInnerHTML|<style|<script/i;

/**
 * Atributo que ESCONDE, procurado no HTML RENDERIZADO.
 *
 * O Grok derrubou a versão que varria o FONTE com denylist de `style=`/`hidden=`
 * usando `{...{ style: { display: "none" } }}` — o spread não tem `=`, e o
 * `texto()` não aplica CSS. No HTML renderizado o spread já virou atributo, então
 * não há sintaxe de JSX que escape: se está no documento, está nos atributos.
 */
const ESCONDE_NO_HTML: Array<[string, RegExp]> = [
  ["style inline", /<[a-z][^>]*\sstyle\s*=/i],
  ["hidden", /<[a-z][^>]*\shidden(\s|>|=)/i],
  ["aria-hidden", /<[a-z][^>]*\saria-hidden\s*=\s*["']true["']/i],
  // A 5ª rodada do Grok mostrou que eu estava errado ao afirmar que "nenhuma
  // sintaxe escapa no HTML renderizado": `<style>{`.s{display:none}`}</style>`
  // não vira atributo, o `texto()` não aplica CSS, e a frase honesta segue no DOM
  // para o `includes`. Bloco de estilo não tem razão de existir em página
  // jurídica — então é PROIBIDO, no documento e no fonte.
  ["bloco de estilo", /<style[\s>]/i],
  ["script", /<script[\s>]/i],
  ["iframe", /<iframe[\s>]/i],
];

/** Texto visível: tags fora, entidades resolvidas.
 *
 * Limitação conhecida: NÃO aplica CSS, então um `display:none` esconde do leitor
 * e não deste teste. Por isso o guard também reprova `display: "none"` e
 * `hidden` nas páginas — ver o teste específico. */
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

// ─────────────────────────── instrumento: prosa estática vs conteúdo da fonte

const MARCA = "\u00a7"; // § — separador entre sentinelas e prosa fixa

/**
 * Escreve `lib/legal.ts` "instrumentado": cada string e cada campo de texto de
 * objeto vira uma SENTINELA `«nome»`. Booleanos e números ficam reais (para não
 * trocar o ramo dos ternários da página). Assim, ao renderizar, tudo que vier da
 * fonte aparece como sentinela — e o texto que sobrar é PROSA FIXA da página.
 *
 * Por que isto fecha a classe: a mentira que o Grok injetou era uma FRASE NOVA
 * na página ("Os dados são automaticamente excluídos…"). Com a prosa fixa
 * congelada numa whitelist, qualquer frase a mais — em `<p>`, `<div>` ou `<li>`,
 * com ou sem "não", na ordem que for — é texto que não estava previsto e falha.
 * Não depende de redação, de regex, nem de eu adivinhar a paráfrase.
 */
function escreverFonteInstrumentada(real: Record<string, unknown>): void {
  const linhas: string[] = [];
  for (const [nome, valor] of Object.entries(real)) {
    linhas.push(`export const ${nome} = ${instrumentar(nome, valor)};`);
  }
  writeFileSync(join(CACHE, "lib_legal_sentinela.mjs"), linhas.join("\n") + "\n", "utf8");
}

function instrumentar(caminho: string, valor: unknown): string {
  const s = (n: string) => JSON.stringify(`\u00ab${n}\u00bb`);
  if (typeof valor === "string") return s(caminho);
  if (typeof valor === "number" || typeof valor === "boolean" || valor === null) {
    return JSON.stringify(valor); // real: não troca o ramo dos ternários
  }
  if (Array.isArray(valor)) {
    const itens = valor.map((v, i) => instrumentar(`${caminho}[${i}]`, v));
    return `[${itens.join(",")}]`;
  }
  if (typeof valor === "object") {
    const campos = Object.entries(valor as Record<string, unknown>).map(
      ([k, v]) => `${JSON.stringify(k)}: ${instrumentar(`${caminho}.${k}`, v)}`,
    );
    return `{${campos.join(",")}}`;
  }
  return JSON.stringify(valor);
}

/** Renderiza a página usando a fonte INSTRUMENTADA (tudo da fonte = sentinela). */
async function htmlComSentinela(rel: string, real: Record<string, unknown>): Promise<string> {
  preparar();
  escreverFonteInstrumentada(real);
  transpilar(rel, "lib_legal_sentinela.mjs");
  const saida = nomeSaida(rel).replace(/\.mjs$/, ".sentinela.mjs");
  const mod = (await import(pathToFileURL(join(CACHE, saida)).href)) as {
    default: () => unknown;
  };
  return renderToStaticMarkup(React.createElement(mod.default as never));
}

/**
 * PROSA FIXA da página: o texto visível que NÃO vem da fonte, já congelado.
 * Cada string aqui é decisão consciente. Frase nova na página = falha.
 */
const PROSA_FIXA: string[] = [
  "PLACEHOLDER_para_dump",
];

/** Módulo da fonte única, importado com os valores REAIS de runtime. */
async function fatos(): Promise<Record<string, unknown>> {
  const bruto = readFileSync(FONTE_LEGAL, "utf8");

  // (a) o arquivo termina na sentinela — se alguém concatenou outro arquivo no
  //     fim, a última declaração não é mais a sentinela e falhamos aqui.
  const ultima = bruto.trimEnd().split("\n").filter((l) => l.startsWith("export ")).pop();
  assert.ok(
    ultima?.startsWith("export const MILA_LEGAL_FIM"),
    `lib/legal.ts foi alterado depois da sentinela — última exportação: ${ultima}`,
  );

  // (b) cada constante é declarada UMA vez. Um arquivo concatenado declararia
  //     de novo, e no ESM a última venceria em silêncio.
  for (const nome of ["CONTATO_PRIVACIDADE", "EXPURGO_AUTOMATICO_ATIVO", "GOOGLE_ESCOPOS"]) {
    const n = bruto.split(`export const ${nome}`).length - 1;
    assert.equal(n, 1, `"${nome}" está declarada ${n}× em lib/legal.ts (esperado: 1)`);
  }

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

test("legal: os trechos decisivos estão CONGELADOS no HTML", async () => {
  // O Grok apontou o furo central da v2: todo teste exigia "o que legal.ts diz
  // agora", então mudar a fonte mudava os dois lados. Estes literais são
  // decisão (não texto editável) e não vêm da fonte.
  // A política é o documento canônico (é ela que carrega as seções). Os termos
  // são resumo de uma lauda que aponta para a política — não repetem as seções,
  // então não têm os trechos. O que garante que os termos não mentem é o teste
  // de PROIBIDOS (roda nas duas) + o de "as duas páginas usam a mesma data".
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  const faltando = CONGELADOS.filter(([, frag]) => !h.includes(frag));
  assert.deepEqual(
    faltando.map(([nome]) => nome),
    [],
    "trecho congelado sumiu do HTML — se a mudança foi intencional, atualize CONGELADOS no teste",
  );
});

test("legal: cada seção aparece uma única vez (sem texto duplicado)", async () => {
  // A 3ª revisão do Grok mostrou o ataque mais sujo: manter o texto honesto
  // escondido (display:none) E escrever a mentira no lado visível. O teste de
  // CSS barra o `display:none`; a classe toda é "verdade escondida ao lado de
  // mentira", e isso se pega por CONTAGEM — não por conteúdo.
  //
  // Contagem por SEÇÃO, não no documento: "Credenciais de integração" aparece
  // legitimamente duas vezes (seção 5 "que dado", seção 9 "por quanto tempo").
  // Contar no todo dava falso positivo; contar na seção é o que pega a duplicata.
  const secao = (html: string, n: number): string => {
    const ini = html.indexOf(`<h2>${n}.`);
    if (ini < 0) return "";
    const fim = html.indexOf("<h2>", ini + 4);
    return html.slice(ini, fim < 0 ? undefined : fim);
  };

  for (const p of PAGINAS) {
    const html = await htmlDe(p.caminho);
    const f = await fatos();
    // §9 = retenção SÓ na política (a canônica). Os termos têm numeração
    // própria ("1. Aceite", "2. O que é a mila.") — assumir o mesmo número nos
    // dois dava falso positivo.
    const s9 = p.nome === "política" ? texto(secao(html, 9)) : "";
    if (s9) {
      for (const r of f.RETENCAO as Array<{ item: string }>) {
        const n = s9.split(r.item).length - 1;
        assert.equal(n, 1, `${p.nome} §9: "${r.item}" aparece ${n}× (esperado 1)`);
      }
      const e = s9.split("rotina automática de expurgo ainda não está no ar").length - 1;
      assert.equal(e, 1, `${p.nome} §9: declaração de expurgo aparece ${e}×`);
    }
    // toda seção numerada da fonte aparece uma vez só no documento
    const numeros = [...html.matchAll(/<h2>(\d+)\./g)].map((m) => m[1]);
    const repetidos = numeros.filter((n, idx) => numeros.indexOf(n) !== idx);
    assert.deepEqual(repetidos, [], `${p.nome}: seção numerada duplicada: ${repetidos}`);
  }
});

test("legal: os parágrafos decisivos são exatamente o esperado", async () => {
  // Terceira camada. A denylist por regex depende da redação ("automaticamente
  // excluídos" passava porque o advérbio vinha antes do verbo); a contagem de
  // seção depende da estrutura. Aqui o parágrafo INTEIRO é a unidade: uma frase
  // nova que contradiga o que está congelado aparece como parágrafo a mais, e
  // falha — independentemente de como foi escrita.
  const f = await fatos();
  const html = await htmlDe(PAGINAS[0].caminho);

  // extrai só os <p> visíveis (os que não estão dentro de bloco escondido — e
  // esconder é proibido pelo teste de estilo, então aqui não há filtro extra)
  const paragrafos = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => texto(m[1]))
    .filter((s) => s.length > 0);

  for (const caso of EXATOS) {
    const esperado = caso.exato(f);
    if (!esperado) continue; // quando a automação existe, não há o que declarar
    assert.ok(
      paragrafos.includes(esperado),
      `${caso.quando}: o parágrafo exato não está no HTML.\n` +
        `Esperado: "${esperado}"\n` +
        `Parágrafos com "expurgo": ${JSON.stringify(paragrafos.filter((s) => /expurgo/i.test(s)))}`,
    );
  }

  // E nenhum parágrafo pode afirmar sumiço automático de dado. Como o parágrafo
  // é a unidade, qualquer ORDEM das palavras cai aqui: só precisa ter sujeito de
  // dado, verbo de sumiço e advérbio na MESMA frase.
  for (const s of paragrafos) {
    if (!/\b(dados?|informa\w+|conte[uú]do|arquiv\w+|registr\w+|mensage\w+|nota|hist[oó]rico|payload)\b/i.test(s)) continue;
    const temVerbo = /\b(apagad\w*|exclu[ií]d\w*|removid\w*|eliminad\w*|deletad\w*|expirad\w*)\b/i.test(s);
    const temAdv = /\b(automaticamente|sozinh\w*)\b/i.test(s);
    if (!(temVerbo && temAdv)) continue;
    // é mentira? só é verdade se disser que NÃO acontece (e hoje não acontece)
    assert.match(
      s,
      /\b(n[ãa]o|ainda n[ãa]o|sem rotina|n[ãa]o h[áa])\b/i,
      `parágrafo afirma sumiço automático de dado, sem negar: "${s}"`,
    );
  }
});

test("legal: nenhum PROIBIDO aparece no HTML", async () => {
  for (const p of PAGINAS) {
    const h = texto(await htmlDe(p.caminho));
    for (const [nome, re] of PROIBIDOS) {
      assert.doesNotMatch(h, re, `${p.nome}: apareceu "${nome}" (${re})`);
    }
  }
});

test("legal: nenhuma página esconde texto", async () => {
  // O `texto()` do guard não aplica CSS: `display:none` esconderia do titular e
  // não do teste. A 3ª revisão do Grok derrubou a versão anterior desta checagem
  // — era denylist de 4 literais, sem flag `i`, exigindo aspas simples/duplas,
  // então `display: \`none\``, `display: "None"` e `hidden={true}` passavam.
  //
  // Regra nova, pela CLASSE: página jurídica não usa estilo inline nem atributo
  // de ocultação, de forma alguma. Ela não precisa disso — o layout vem de
  // classe. Qualquer tentativa de esconder texto do titular falha aqui, seja
  // qual for a sintaxe.
  for (const p of PAGINAS) {
    // (a) no FONTE: pega cedo e cobre o que ainda não é atributo (CSS em classe,
    //     dangerouslySetInnerHTML). Sintaxe que escape aqui NÃO escapa de (b).
    const src = readFileSync(join(RAIZ, p.caminho), "utf8");
    assert.doesNotMatch(
      src,
      NAO_PODE_TER_ESTILO,
      `${p.nome}: usa style/hidden/aria-hidden/dangerouslySetInnerHTML — ` +
        "é assim que se esconde texto do titular sem esconder do teste",
    );

    // (b) no HTML RENDERIZADO: é a checagem que fecha a classe. `{...{style:
    //     {display:"none"}}}` não tem `=` no fonte e passava em (a); renderizado,
    //     vira `style="..."` e não passa aqui.
    const html = await htmlDe(p.caminho);
    for (const [nome, re] of ESCONDE_NO_HTML) {
      assert.doesNotMatch(
        html,
        re,
        `${p.nome}: o HTML renderizado tem ${nome} — esconde conteúdo do titular`,
      );
    }
  }
});

test("legal: todo campo de decisão da fonte chega ao HTML", async () => {
  // Este é o furo que o Grok chamou de "o campo não é lido por teste nenhum":
  // `dadoDoGoogle: true` existia na fonte e NUNCA era renderizado, então dava
  // para marcar o que quisesse. A regra agora é estrutural: cada subprocessador
  // tem de dizer, NA PÁGINA, o que recebe do Google.
  const h = texto(await htmlDe(PAGINAS[0].caminho));
  const f = await fatos();
  for (const s of f.SUBCONTROLADORES as Array<{ nome: string; tocaDadoDoGoogle: string | false }>) {
    const esperado =
      s.tocaDadoDoGoogle === false
        ? "Não recebe dado das APIs do Google."
        : `Recebe do Google: ${s.tocaDadoDoGoogle}.`;
    assert.ok(
      h.includes(esperado),
      `o subprocessador ${s.nome} não declara na página o que recebe do Google ` +
        `(faltou: "${esperado}")`,
    );
  }
  // E o campo tem de existir em todo item — sem buraco onde caberia um booleano.
  for (const s of f.SUBCONTROLADORES as Array<Record<string, unknown>>) {
    assert.ok(
      "tocaDadoDoGoogle" in s,
      `subprocessador sem o campo tocaDadoDoGoogle: ${JSON.stringify(s.nome)}`,
    );
  }
});

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

test("legal: a fonte REAL dos escopos (auth/oauth.py) bate com a lista publicada", async () => {
  // Histórico desta checagem (3 rodadas de revisão do Grok):
  //   v1: varria só `.tsx?` do site → `auth/oauth.py` ficava totalmente fora.
  //   v2: recortava de `"google"` até `"notion"` no TEXTO e casava aspas duplas.
  //       O Grok derrubou com um decoy no topo do arquivo
  //       (`_DECOY = 'see "google" ' + … + ' then "notion"'`), que fazia o corte
  //       cair num comentário — os escopos reais ficavam fora do bloco lido.
  //   v3 (aqui): o arquivo é lido com o COMPILADOR do Python. O decoy é uma
  //       string e nunca vira valor de `scopes`; a AST não tem como ser
  //       confundida por comentário, concatenação ou aspas.
  //
  // E a regra passou a ser de PARIDADE, não de "lista negra": todo escopo que o
  // app pede tem de estar publicado, e todo escopo publicado tem de ser pedido.
  // Sem isso, a política podia listar `openid`/`drive.file` enquanto o app pedia
  // outra coisa — que era exatamente o furo.
  const f = await fatos();
  const publicados = new Set(f.GOOGLE_ESCOPOS as string[]);

  const candidatos = [
    "/opt/data/profiles/mila/auth/oauth.py",
    join(RAIZ, "../auth/oauth.py"),
  ];
  const fonte = candidatos.find((c) => existsSync(c));
  if (!fonte) {
    // Sem acesso ao arquivo, o mínimo honesto: avisar que NÃO cobriu, em vez de
    // passar em silêncio fingindo cobertura.
    console.warn("⚠️  auth/oauth.py não acessível — escopos reais NÃO verificados");
    return;
  }

  // O `python3` real lê e imprime só a lista de escopos do provider google.
  // Nada é importado/executado: `ast.parse` não roda o módulo.
  // O script aplica TODA escrita que afete `scopes`, em ordem de linha: o
  // literal inicial, mutação por Subscript (`PROVIDERS["google"]["scopes"] = …`)
  // e `update()`. A versão anterior só lia o literal — o Grok mostrou que dava
  // para trocar os escopos EM RUNTIME e a suíte ficava verde, comparando a lista
  // publicada com um literal que ninguém mais usava.
  const script = [
    "import ast, json, sys",
    "src = open(sys.argv[1], encoding='utf-8').read()",
    "arvore = ast.parse(src)",
    "escopos = None",
    "",
    "def alvo_e_providers(no):",
    "    if isinstance(no, ast.AnnAssign):",
    "        return isinstance(no.target, ast.Name) and no.target.id == 'PROVIDERS'",
    "    if isinstance(no, ast.Assign) and len(no.targets) == 1:",
    "        return isinstance(no.targets[0], ast.Name) and no.targets[0].id == 'PROVIDERS'",
    "    return False",
    "",
    "# 1. o literal inicial",
    "for no in ast.walk(arvore):",
    "    if alvo_e_providers(no) and isinstance(no.value, ast.Dict):",
    "        for chave, valor in zip(no.value.keys, no.value.values):",
    "            if isinstance(chave, ast.Constant) and chave.value == 'google' and isinstance(valor, ast.Dict):",
    "                for k2, v2 in zip(valor.keys, valor.values):",
    "                    if isinstance(k2, ast.Constant) and k2.value == 'scopes':",
    "                        escopos = ast.literal_eval(v2)",
    "",
    "# 2. QUALQUER escrita posterior, em ordem de linha",
    "escritas = []",
    "for no in ast.walk(arvore):",
    "    if alvo_e_providers(no):",
    "        continue  # o literal já foi aplicado",
    "    alvo = None",
    "    if isinstance(no, ast.Assign) and len(no.targets) == 1:",
    "        alvo = no.targets[0]",
    "    elif isinstance(no, ast.AnnAssign):",
    "        alvo = no.target",
    "    if alvo is not None:",
    "        # cadeia de subscrito enraizada em PROVIDERS?",
    "        partes = []",
    "        cur = alvo",
    "        while isinstance(cur, ast.Subscript):",
    "            partes.append(ast.literal_eval(cur.slice))",
    "            cur = cur.value",
    "        if isinstance(cur, ast.Name) and cur.id == 'PROVIDERS':",
    "            partes.reverse()",
    "            escritas.append((no.lineno, partes, no.value))",
    "    if isinstance(no, ast.Expr) and isinstance(no.value, ast.Call):",
    "        f = no.value.func",
    "        if isinstance(f, ast.Attribute) and f.attr == 'update':",
    "            partes = []",
    "            cur = f.value",
    "            while isinstance(cur, ast.Subscript):",
    "                partes.append(ast.literal_eval(cur.slice))",
    "                cur = cur.value",
    "            if isinstance(cur, ast.Name) and cur.id == 'PROVIDERS':",
    "                partes.reverse()",
    "                escritas.append((no.lineno, partes, no.value.args[0] if no.value.args else None))",
    "",
    "for _, partes, valor in sorted(escritas, key=lambda x: x[0]):",
    "    try:",
    "        if partes == ['google', 'scopes']:",
    "            escopos = ast.literal_eval(valor)",
    "        elif partes == ['google'] and isinstance(valor, ast.Dict):",
    "            for k2, v2 in zip(valor.keys, valor.values):",
    "                if isinstance(k2, ast.Constant) and k2.value == 'scopes':",
    "                    escopos = ast.literal_eval(v2)",
    "    except Exception:",
    "        pass  # escrita não literal não dá para resolver sem executar",
    "",
    "# 3. rede de segurança: escrita em 'scopes' que NÃO conseguimos resolver",
    "bruto = src",
    "sospeitos = []",
    "for no in ast.walk(arvore):",
    "    if isinstance(no, ast.Assign) and len(no.targets) == 1 and isinstance(no.targets[0], ast.Subscript):",
    "        if isinstance(no.targets[0].slice, ast.Constant) and no.targets[0].slice.value == 'scopes':",
    "            try:",
    "                ast.literal_eval(no.value)",
    "            except Exception:",
    "                sospeitos.append(no.lineno)",
    "print(json.dumps({'escopos': escopos, 'nao_resolvidas': sospeitos}))",
  ].join("\n");

  const cache = join(CACHE, "_leitor_escopos.py");
  writeFileSync(cache, script);
  const saida = execFileSync("python3", [cache, fonte], { encoding: "utf8" }).trim();
  const lido = JSON.parse(saida) as { escopos: string[] | null; nao_resolvidas: number[] };
  assert.notEqual(lido.escopos, null, "não achei PROVIDERS['google']['scopes'] na AST");
  // Escrita em `scopes` que o leitor não conseguiu resolver (valor não literal)
  // é motivo para falhar: pode ser exatamente o runtime escapando do guard.
  assert.deepEqual(
    lido.nao_resolvidas,
    [],
    `escrita não-literal em 'scopes' nas linhas ${lido.nao_resolvidas.join(", ")} — ` +
      "o guard não consegue provar o que o app pede",
  );

  const reais = lido.escopos as string[];
  assert.ok(reais.length > 0, "PROVIDERS['google']['scopes'] está vazio");

  // 1. tudo que o app pede está publicado
  for (const e of reais) {
    assert.ok(
      publicados.has(e),
      `auth/oauth.py pede "${e}", que NÃO está publicado em lib/legal.ts — a política mentiria`,
    );
  }
  // 2. e tudo que está publicado é realmente pedido (paridade nos dois sentidos)
  for (const e of publicados) {
    assert.ok(
      reais.includes(e),
      `lib/legal.ts publica "${e}", que o app NÃO pede — a política inventa escopo`,
    );
  }
  // 3. o proibido não volta, em NENHUMA forma: aqui é comparação de VALOR, então
  //    concatenação, aspas simples e variável intermediária não escapam.
  for (const ruim of [
    "email",
    "profile",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/spreadsheets",
  ]) {
    assert.ok(!reais.includes(ruim), `escopo proibido voltou ao app: ${ruim}`);
  }
});

test("legal: nenhum prestador na China recebe dado das APIs do Google", async () => {
  // O ataque que derrubou a v3 da prova: marcar o Zhipu com
  // `tocaDadoDoGoogle: "conteúdo do Drive"`. A página passa a exibir isso (o
  // campo é renderizado), então não é uma mentira silenciosa — mas é uma
  // CONTRADIÇÃO: a cláusula de Limited Use e a de transferência dizem que nada
  // de Drive, credencial ou planilha sai para os modelos alternativos, e que só
  // o texto da mensagem vai. Se alguém marcar um prestador chinês como receptor
  // de dado do Google, uma das duas frases publicadas fica falsa.
  //
  // Este é o tipo de regra que o Grok cobrou: não a redação de um caso, e sim o
  // invariante que o produto precisa manter.
  const f = await fatos();
  const naChina = (f.SUBCONTROLADORES as Array<{
    nome: string;
    pais: string;
    tocaDadoDoGoogle: string | false;
  }>).filter((s) => /china/i.test(s.pais));

  assert.ok(naChina.length >= 2, "esperava Alibaba e Zhipu na lista (China)");
  for (const s of naChina) {
    assert.equal(
      s.tocaDadoDoGoogle,
      false,
      `${s.nome} (${s.pais}) está marcado como receptor de dado do Google ` +
        `("${s.tocaDadoDoGoogle}") — isso contradiz a cláusula de Limited Use e a ` +
        "de transferência internacional, que prometem não mandar Drive/credencial/" +
        "planilha para os modelos alternativos",
    );
  }

  // E o inverso, explícito: quem não está na China e recebe dado do Google
  // precisa aparecer com o campo — não pode haver prestador sem o campo.
  for (const s of f.SUBCONTROLADORES as Array<Record<string, unknown>>) {
    assert.ok(
      "tocaDadoDoGoogle" in s,
      `prestador sem o campo tocaDadoDoGoogle: ${String(s.nome)}`,
    );
  }
});

test("legal: o pricing renderizado não promete conector não pronto", async () => {
  // `PricingSection` é "use client", mas `renderToStaticMarkup` renderiza do
  // mesmo jeito (a diretiva é dica de build). Renderizar de verdade importa
  // aqui: a linha do ERP é MONTADA em runtime (`CONECTORES_NAO_PRONTOs.join`),
  // então procurar o texto no fonte nunca acharia — foi o que me fez perder uma
  // rodada. O Grok apontou que o guard antigo nem abria este arquivo.
  preparar();
  transpilar("components/PricingSection.tsx");
  const mod = (await import(
    pathToFileURL(join(CACHE, nomeSaida("components/PricingSection.tsx"))).href
  )) as { default: () => unknown };
  const h = texto(renderToStaticMarkup(React.createElement(mod.default as never)));
  assert.ok(h.includes("Planos para o momento da sua loja"), "o pricing não renderizou");

  // Os trechos que são DECISÃO ficam congelados no HTML renderizado.
  for (const [nome, frag] of CONGELADOS_PRICING) {
    assert.ok(h.includes(frag), `pricing perdeu o trecho congelado "${nome}": ${frag}`);
  }

  // E nenhuma menção a conector não pronto pode aparecer sem a ressalva, na
  // mesma frase do HTML renderizado.
  const f = await fatos();
  for (const nome of f.CONECTORES_NAO_PRONTOs as string[]) {
    for (const frase of h.split(/(?<=[.!?])\s+/)) {
      if (!new RegExp(`\\b${nome}\\b`, "i").test(frase)) continue;
      assert.match(
        frase,
        /ainda não|ainda nao|não dispon|nao dispon/i,
        `pricing promete ${nome} sem ressalva: "${frase.trim()}"`,
      );
    }
  }
});

test("legal: as duas páginas declaram a mesma data, vinda da fonte", async () => {
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

// ────────────────── E. GOLDEN MASTER: a prosa fixa da página, congelada

/**
 * GOLDEN MASTER da prosa estática da política.
 *
 * Por que esta camada existe (5ª revisão do Grok 4.7): as camadas anteriores
 * tentavam reconhecer a MENTIRA ("apagados automaticamente", "cláusulas
 * firmadas") por regex. O Grok derrubou cada uma com uma paráfrase: advérbio
 * antes do verbo, "Não há dúvida:" satisfazendo a negação, a frase numa `<div>`
 * em vez de `<p>`. Reconhecer mentira em português por regex é jogo perdido.
 *
 * Esta camada inverte o jogo. O texto da página vem de dois lugares:
 *
 *   (a) da fonte única (`lib/legal.ts`) — verificado por outros testes;
 *   (b) PROSA FIXA escrita à mão nas páginas — é aqui que a mentira se esconde.
 *
 * Renderizo a página com a fonte INSTRUMENTADA (todo valor da fonte vira `§`).
 * Então (a) some e sobra (b). Comparo com este golden: **qualquer** texto novo
 * na página falha, sem eu precisar prever a redação. Foi assim que a frase que o
 * Grok injetou na 5ª rodada seria pega — ela não está neste golden.
 *
 * Regenerar (só com decisão consciente, e o diff é revisado):
 *   ver o teste "TEMP dump golden" no histórico do git, ou rodar o dump descrito
 *   em `references/guard-de-copy.md`.
 */
const GOLDEN_POLITICA = `← Voltar
Política de privacidade
Como tratamos informações na mila. — assistente de negócios no WhatsApp para lojas de joias e semijoias. Última atualização: §.
1. Quem somos
Esta política descreve o tratamento de dados no site
milaai.com.br
, no workspace web e no canal WhatsApp da
mila.
. O serviço é operado pela § — a empresa ainda não está constituída, e por isso não há CNPJ a informar. Quando estiver, ele será publicado aqui.
Na relação com a loja — conta, plano e cobrança — a mila. é a
controladora
dos dados. Nos dados que a loja cadastra ou envia sobre a própria operação (custos, notas, fornecedores, destinatários que aparecem na nota), a mila. atua como
operadora
, a serviço da loja, que é quem decide o que registrar.
Encarregado (DPO):
a mila. é operada hoje sem CNPJ — é um serviço em lançamento, e o enquadramento formal como agente de pequeno porte depende de constituição da empresa. O canal do titular não depende disso e já funciona: é o contato no fim desta página, com resposta em até 15 dias.
2. De quem são os dados
Titulares dos dados tratados neste serviço:
A mila.
não mantém CRM
, histórico de vendas a consumidores finais nem base de compradores da loja. Mas ela
lê a nota fiscal
, e a nota traz o destinatário — nome, CPF/CNPJ e endereço. Esses dados de terceiros são tratados pela mila. como operadora, a serviço da loja; a loja é a controladora deles.
3. O que o serviço faz
4. Para que usamos e com que base legal
5. Quais dados são tratados e para onde vão
6. Com quem compartilhamos (subprocessadores)
Não vendemos dados. Para operar, usamos prestadores que processam informações
em nosso nome e por nossa conta
Recebe do Google: §.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
Não recebe dado das APIs do Google.
7. Google: o que a mila acessa e o que não acessa
Escopos solicitados ao conectar: §, §.
8. Integrações que a loja conecta
Quando a lojista autoriza um conector, a mila. age na conta
em nome dela
, nos limites da permissão concedida. Isso é distinto dos subprocessadores acima.
Disponíveis hoje:
Disponíveis, com validação em andamento:
9. Por quanto tempo guardamos
— § Alvo: §.
— § Alvo: §.
— § Alvo: §.
— § Alvo: §.
— § Alvo: §.
— § Alvo: §.
§ Especificamente: a rotina automática de expurgo ainda não está no ar.
10. Isolamento entre lojas
11. Seus direitos (LGPD)
Você pode pedir:
Os pedidos são atendidos pelo e-mail
, em até 15 dias, prorrogáveis na forma da LGPD. Também é possível reclamar à ANPD.
12. Segurança
Controles proporcionais ao porte do serviço: segredos de autenticação fora do navegador, acesso por lista de números autorizados, limite de tentativas, código de verificação guardado apenas em hash com salt, credenciais de integração em cofre cifrado e sessão de login com registro por loja.
Nenhum sistema é perfeito, e respostas de IA podem errar: revise preço, estoque e textos importantes antes de usar.
13. O que não fazemos
14. Crianças
O serviço é voltado a titulares de negócio adultos. Não coletamos de forma consciente dados de menores de 18 anos.
15. Contato
Privacidade e dados:
. Instagram: §.
16. Mudanças
Podemos atualizar esta política. A versão vigente fica sempre nesta página, com a data no topo. Mudanças materiais serão comunicadas de forma razoável (site e/ou WhatsApp).`;

const GOLDEN_TERMOS = `← Voltar
Termos de uso
Regras da mila. — assistente de negócios no WhatsApp para lojas de joias e semijoias. Última atualização: §.
1. Aceite
Ao acessar milaai.com.br, solicitar código de verificação, usar o WhatsApp da mila. ou o workspace, você concorda com estes termos e com a
política de privacidade
. Se não concordar, não use o serviço.
2. O que é a mila.
A mila. é uma assistente operacional: você envia foto, nota ou pergunta e recebe apoio de precificação, leitura de custos, organização e rascunhos de conteúdo. O canal principal é o
WhatsApp
. O site e o workspace são apoio (login, status de plano e conectores).
Neste momento o serviço opera em
piloto / prévia
. O acesso é restrito a números autorizados. Recursos marcados como “em breve” ou demonstrativos não devem ser tratados como funcionalidade ativa.
3. Conta e elegibilidade
Você declara ter 18 anos ou mais e capacidade para contratar.
Se usa a mila. em nome de uma loja, declara ter autorização para vincular o número e, quando existirem, os conectores dessa loja.
Você é responsável por quem tem acesso ao WhatsApp e ao workspace ligados à sua conta.
4. Entradas, saídas e ações
Você pode enviar textos, imagens e arquivos (“entradas”). A mila. pode gerar respostas (“saídas”) e, quando um conector estiver disponível e você autorizar — com confirmação quando exigirmos — executar ações nas ferramentas conectadas.
Você garante ter direito de enviar o conteúdo e de autorizar o uso das contas conectadas.
Saídas de IA podem conter erros. Não use preço, estoque, prazo ou texto gerado sem revisão humana quando isso importar para a sua loja.
Quando esse controle estiver disponível e houver ações que alteram dados, pediremos confirmação ligada à prévia da ação. Um “sim” solto no chat sobre outro assunto não conta como autorização.
Conteúdo do mockup do site e da rota de conversa simulada é ilustrativo — não é orientação real de preço.
5. Planos e pagamento
Os planos publicados no site (por exemplo Essencial e Pro) descrevem a intenção comercial do produto. No piloto, founders e convidados podem ter acesso sem cobrança ou em condições especiais. Quando a cobrança estiver ativa, preços, ciclo e cancelamento serão confirmados no checkout ou no WhatsApp antes da cobrança.
6. Integrações de terceiros
Conectores (Google, Notion, Jueri e outros que venham a ser liberados), quando disponíveis, são serviços de terceiros. Ao conectar, você autoriza a mila. a agir nos limites da permissão concedida e aceita os termos desses provedores. A mila. não controla indisponibilidade, mudança de API ou políticas deles.
Estes conectores ainda não estão disponíveis para uso: §, §. As telas existem, mas o acesso ainda não foi habilitado.
7. Uso aceitável
Você se compromete a não:
violar lei, direito de terceiros ou estes termos;
tentar acessar conta, dados ou loja de outra pessoa sem autorização;
contornar a lista de números autorizados, o código de verificação, limites de tentativa ou proteções anti-abuso;
enviar malware, spam ou conteúdo ilícito pelo canal da mila.;
usar saídas da mila. para treinar ou destilar modelos concorrentes de forma abusiva;
sobrecarregar de propósito a infraestrutura ou fazer engenharia reversa indevida do serviço.
8. Propriedade intelectual
A marca mila., o site, o software e a identidade visual pertencem aos respectivos titulares. Você mantém direitos sobre o conteúdo da sua loja. Concedemos licença limitada para usar o serviço conforme estes termos; você nos concede licença para processar suas entradas só na medida necessária para prestar o serviço (veja a política de privacidade).
9. Isenções e limite de responsabilidade
O serviço é oferecido “como está”, com esforço razoável de disponibilidade e segurança, sem garantia de resultado comercial específico (lucro, conversão, aprovação de anúncio etc.).
Na máxima extensão permitida pela lei brasileira: (a) no piloto sem cobrança, a responsabilidade da mila. limita-se às hipóteses inafastáveis por lei; (b) se houver pagamento, limita-se ao valor efetivamente pago por você nos 3 meses anteriores ao evento — salvo dolo ou outra hipótese legal inafastável.
A mila. não é consultoria jurídica, contábil ou fiscal. Decisões de preço, tributação e compliance fiscal são suas.
10. Suspensão e encerramento
Podemos suspender ou encerrar o acesso em caso de violação, risco de segurança, ordem legal ou fim do piloto. Você pode parar de usar a qualquer momento e pedir exclusão de dados pelo canal indicado na política de privacidade.
11. Mudanças
Podemos atualizar estes termos. A versão vigente fica nesta página, com a data no topo. O uso continuado após mudança material, quando comunicada de forma razoável, implica aceite — salvo regra legal em contrário.
12. Lei e foro
Aplica-se a legislação brasileira. Fica eleito o foro da comarca de Belo Horizonte/MG, salvo foro privilegiado legal do consumidor quando aplicável.
13. Contato
Privacidade e dados:
. Suporte: Instagram §.
Estes textos foram redigidos com base nas práticas atuais do produto. Não substituem revisão por advogado antes de cobrança ampla ou constituição formal da empresa.`;

/** Normaliza o HTML renderizado: sentinelas → `§`, tags → quebra, entidades. */
function normalizar(html: string): string {
  return html
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join("\n");
}

/** Prosa fixa: o que sobra depois de a fonte virar sentinela. */
function prosaDe(html: string): string {
  return normalizar(html.replace(/\u00ab[^\u00bb]*\u00bb/g, "\u00a7"))
    .split("\n")
    .filter((s) => !/^[\u00a7\s.,:;—–-]*$/.test(s) && !/^[\(\u00a7\)\s—–-]*$/.test(s))
    .join("\n");
}

/**
 * TEXTO VISÍVEL do render REAL (valores da fonte reais, sem sentinela).
 *
 * É a camada que fecha a classe, e ela veio da 7ª revisão do Grok. O argumento
 * dele, que eu aceito: o render instrumentado é um **segundo programa**. Enquanto
 * a única fotografia da frase for o render em que as strings da fonte foram
 * apagadas, um PREDICADO sobre essas strings decide o que o browser mostra e o
 * golden não vê. Dois diffs que passavam em tudo:
 *
 *   {RETENCAO_NOTA.length > 100 ? <p>…mentira…</p> : null}
 *   {GOOGLE_LIMITED_USE.replace("não os vendemos", "e os vendemos")}
 *
 * No primeiro, `«RETENCAO_NOTA»`.length é 16 e o ramo da mentira nem existe no
 * render instrumentado; no segundo, a sentinela não contém o needle e o replace
 * vira no-op. Nos dois, o golden da prosa, o `GOLDEN_FONTE` e o vocabulário de DOM
 * ficam idênticos — e o titular lê outra coisa.
 *
 * Aqui o golden é o texto do render REAL, byte a byte. Não há sentinela para um
 * predicado enganar: o texto do render estático real é comparado sem sentinelas; CSS e hidratação não são medidos por este snapshot.
 */
const GOLDEN_TEXTO: Record<string, string> = {
  "política": `← Voltar
Política de privacidade
Como tratamos informações na mila. — assistente de negócios no WhatsApp para lojas de joias e semijoias. Última atualização: 30 de setembro de 2026.
1. Quem somos
Esta política descreve o tratamento de dados no site
milaai.com.br
, no workspace web e no canal WhatsApp da
mila.
. O serviço é operado pela equipe fundadora da mila. — a empresa ainda não está constituída, e por isso não há CNPJ a informar. Quando estiver, ele será publicado aqui.
Na relação com a loja — conta, plano e cobrança — a mila. é a
controladora
dos dados. Nos dados que a loja cadastra ou envia sobre a própria operação (custos, notas, fornecedores, destinatários que aparecem na nota), a mila. atua como
operadora
, a serviço da loja, que é quem decide o que registrar.
Encarregado (DPO):
a mila. é operada hoje sem CNPJ — é um serviço em lançamento, e o enquadramento formal como agente de pequeno porte depende de constituição da empresa. O canal do titular não depende disso e já funciona: é o contato no fim desta página, com resposta em até 15 dias.
2. De quem são os dados
Titulares dos dados tratados neste serviço:
A lojista (dona ou pessoa autorizada da loja) — usuária do serviço.
O representante do fornecedor, quando a lojista o cadastra no caderno.
O destinatário que aparece na nota fiscal, quando a lojista envia uma nota para leitura.
A mila.
não mantém CRM
, histórico de vendas a consumidores finais nem base de compradores da loja. Mas ela
lê a nota fiscal
, e a nota traz o destinatário — nome, CPF/CNPJ e endereço. Esses dados de terceiros são tratados pela mila. como operadora, a serviço da loja; a loja é a controladora deles.
3. O que o serviço faz
Calcula preço de venda a partir do custo, do imposto e da margem que a lojista informa.
Pesquisa preços praticados por concorrentes e a média do mercado.
Lê notas fiscais (XML ou foto) e extrai os itens.
Mantém o cadastro de fornecedores da loja: contato, pedido mínimo, carência e histórico.
Gera textos para site e catálogo (recursos do plano Pro).
A mila recomenda; quem decide é a lojista. Não há perfilamento, pontuação, ranqueamento de pessoas nem decisão de crédito.
Algumas ações que alteram dados ainda não pedem confirmação separada — estamos implantando isso rota a rota. Enquanto não estiver completo, confira a prévia antes de confirmar.
4. Para que usamos e com que base legal
Prestar o serviço pedido (precificar, ler nota, caderno, conteúdo)
— Execução de contrato (art. 7, V)
Autenticar o acesso por código no WhatsApp
— Execução de contrato e legítimo interesse em segurança (art. 7, V e IX)
Segurança, anti-abuso e limites de tentativa
— Legítimo interesse (art. 7, IX)
Cumprir obrigação legal e atender autoridade
— Obrigação legal e regulatória (art. 7, II)
Medir uso com métricas agregadas ou dados desidentificados
— Legítimo interesse (art. 7, IX)
5. Quais dados são tratados e para onde vão
Mensagens de texto enviadas pela lojista no WhatsApp
— Classificadas para a mila entender o pedido, com apoio de provedor de IA. O conteúdo da mensagem é registrado em arquivo de diagnóstico para investigar erro e é excluído sob pedido.
Fotos de peças e de notas fiscais
— Enviadas a modelo de visão para identificação do que está na imagem. O texto e os dados extraídos ficam no histórico da loja. As imagens não são guardadas em pasta própria pela mila; o arquivo de diagnóstico da mensagem pode conter a referência recebida.
Descrição da peça e região da loja
— Usadas na consulta de preço de mercado. Fica em cache o preço agregado, para não repetir consulta.
Notas fiscais: dados do emitente, itens e o destinatário (nome, CPF/CNPJ, endereço)
— Lidos para extrair custo e itens. Quando aparecem dados de terceiros (destinatário, fornecedor), a loja é a controladora desses dados e a mila atua como operadora, para prestar o serviço que a loja pediu.
Cadastro de fornecedores (nome, contato, pedido mínimo, carência, histórico)
— Gravado no caderno da loja. A lojista escolhe onde: Notion (a mila só grava em base que já existe) ou planilha criada no Google Drive da loja. A mila não envia mensagens a fornecedores.
Telefone e código de verificação (login)
— O telefone identifica a loja. O código é de vida curta e guardado apenas em hash com salt (SHA-256 + salt aleatório) — a mila não consegue lê-lo.
Dados de cobrança (quando houver plano pago)
— Processados pela operadora de pagamentos. Dados de cartão são coletados e guardados por ela; não passam nem repousam nos servidores da mila.
Credenciais de integração, quando a lojista conecta uma conta
— Guardadas em cofre cifrado com Fernet (AES-128-CBC + HMAC), com a chave de decifragem em arquivo de permissão restrita (600).
6. Com quem compartilhamos (subprocessadores)
Não vendemos dados. Para operar, usamos prestadores que processam informações
em nosso nome e por nossa conta
:
Google
(Estados Unidos) — Modelo de visão (lê a foto da peça e da nota) e geração de texto. Também guarda a planilha do caderno no Drive da loja, quando ela escolhe essa opção.
Recebe do Google: arquivo e conteúdo do Drive.
TypeSafe (System One)
(Estados Unidos) — Classificação da intenção da mensagem, para a mila entender o pedido. Recebe o texto da mensagem.
Não recebe dado das APIs do Google.
Alibaba
(China) — Modelo de texto alternativo, usado só quando o provedor principal está indisponível. Recebe o mesmo texto que seria enviado ao principal.
Não recebe dado das APIs do Google.
Zhipu
(China) — Segundo modelo de texto alternativo, na mesma condição do anterior. Acionado só quando a alternativa gratuita está fora. Recebe o texto da mensagem enviada à mila no WhatsApp — não recebe arquivo do seu Drive, nem o conteúdo da sua planilha, nem credencial de acesso.
Não recebe dado das APIs do Google.
Serper
(Estados Unidos) — Consulta de preço de concorrentes e média de mercado.
Não recebe dado das APIs do Google.
MegaAPI
(Brasil) — Transporte da mensagem no WhatsApp (texto e mídia). O WhatsApp/Meta também participa do transporte.
Não recebe dado das APIs do Google.
Vercel
(Estados Unidos) — Hospedagem do site e do workspace web.
Não recebe dado das APIs do Google.
Cloudflare
(Estados Unidos) — DNS, túnel, proteção do endpoint e verificação anti-robô no login (Turnstile).
Não recebe dado das APIs do Google.
Asaas
(Brasil) — Processamento de pagamento, quando houver cobrança.
Não recebe dado das APIs do Google.
Vários prestadores acima processam dados fora do Brasil — Estados Unidos (Google, TypeSafe, Serper, Vercel, Cloudflare) e China (Alibaba, Zhipu). Isso é transferência internacional (LGPD, art. 33). Mecanismo: os contratos de adesão (termos de serviço) desses fornecedores preveem as salvaguardas de proteção de dados, e a formalização das cláusulas-padrão segue pendente enquanto a empresa não estiver constituída. Enquanto isso, transferimos o mínimo necessário: o texto da mensagem que você envia à mila. Nada de arquivo do seu Drive, de credencial da sua conta ou de conteúdo da sua planilha vai para os modelos alternativos. Chips de fornecedor chinês aparecem nominalmente porque você tem o direito de saber para onde o dado vai.
7. Google: o que a mila acessa e o que não acessa
Ao conectar o Google, a mila recebe um identificador da conta (escopo openid). Ela NÃO recebe seu endereço de e-mail. Na prática, quem mantém o vínculo entre a conexão e a sua loja é a sessão autenticada no WhatsApp — a mila não usa o identificador para saber de qual conta se trata, e a tela não mostra o endereço da conta conectada. Acesso a arquivos fica restrito ao escopo drive.file: só os arquivos que a própria mila cria. Ela não abre, não lista e não altera o restante do seu Drive, não lê sua caixa de e-mail e não acessa sua agenda ou seu calendário.
Escopos solicitados ao conectar: openid, auth/drive.file.
Uso de dados do Google. O que a mila recebe das APIs do Google é usado somente para fornecer e melhorar as funcionalidades que você vê: criar e manter a planilha do caderno de fornecedores que ela mesma cria, e registrar a conexão da conta. Não usamos esses dados para publicidade, não os vendemos, não os usamos para avaliar crédito, pontuação ou risco de pessoas, nem para treinar modelos de inteligência artificial. Esses dados só são repassados a prestador que nos atende sob contrato e apenas no necessário para a finalidade contratada, para segurança ou para cumprir a lei. Nenhuma pessoa lê o conteúdo do seu Drive ou da sua conta sem a sua autorização específica para aquela situação — o suporte a que você dá acesso é feito em conversa conosco, não pela leitura do seu Drive. O uso segue a Política de Dados de Usuário dos Serviços de API do Google, incluindo os requisitos de Limited Use.
8. Integrações que a loja conecta
Quando a lojista autoriza um conector, a mila. age na conta
em nome dela
, nos limites da permissão concedida. Isso é distinto dos subprocessadores acima.
Disponíveis hoje:
Google (Drive/Planilhas) — a mila cria a planilha do caderno na conta da loja, com o escopo drive.file (só o arquivo que ela mesma criou).
Notion — a mila grava o caderno numa base que a loja já tem; não cria base.
Disponíveis, com validação em andamento:
Jueri — a tela de conexão está pronta e a mila responde consultas de estoque; a validação com a credencial real da loja ainda está pendente.
Anunciados anteriormente e ainda não disponíveis: Olist e Bling. A tela de conexão existe, mas o acesso ainda não foi habilitado — não conte com eles para a operação da sua loja por enquanto.
9. Por quanto tempo guardamos
Código de verificação (OTP)
— Vida curta; expira sozinho. Alvo: minutos.
Arquivo de diagnóstico da mensagem recebida
— Mantido até exclusão sob pedido.
Histórico operacional da conversa
— Mantido até exclusão sob pedido. Alvo: até cerca de 90 dias.
Notas fiscais processadas
— Mantido até exclusão sob pedido. Alvo: até cerca de 180 dias.
Logs técnicos de visão e download
— Só metadado (data, modelo, latência, erro) — sem o conteúdo da mensagem. Alvo: até cerca de 30 dias.
Credenciais de integração
— Mantidas enquanto a integração estiver conectada. Alvo: até a lojista desconectar.
Estes prazos são alvo, ainda não são automáticos: hoje a exclusão é feita pela equipe sob pedido, pelo canal de privacidade. A mila não substitui a obrigação da loja de guardar documentos fiscais nos prazos legais. Especificamente: a rotina automática de expurgo ainda não está no ar.
10. Isolamento entre lojas
Praticado: cada loja é um espaço separado; o acesso é restrito por lista de números autorizados e o registro de sessão é por loja.
Em implantação: registro sistemático de acesso excepcional da equipe fundadora. A estrutura de auditoria existe, mas o registro automático ainda não está ligado.
11. Seus direitos (LGPD)
Você pode pedir:
confirmação de que tratamos seus dados e acesso a eles
correção de dados incompletos, inexatos ou desatualizados
anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos
portabilidade, quando aplicável
eliminação dos dados tratados com consentimento
informação sobre com quem compartilhamos
informação sobre a possibilidade de não consentir e as consequências disso
revogação do consentimento e oposição a tratamento fundado em legítimo interesse
Os pedidos são atendidos pelo e-mail
contato@milaai.com.br
, em até 15 dias, prorrogáveis na forma da LGPD. Também é possível reclamar à ANPD.
12. Segurança
Controles proporcionais ao porte do serviço: segredos de autenticação fora do navegador, acesso por lista de números autorizados, limite de tentativas, código de verificação guardado apenas em hash com salt, credenciais de integração em cofre cifrado e sessão de login com registro por loja.
Nenhum sistema é perfeito, e respostas de IA podem errar: revise preço, estoque e textos importantes antes de usar.
13. O que não fazemos
Não vendemos nem cedemos dados a terceiros fora dos prestadores listados acima.
Não usamos o conteúdo da loja para treinar modelo próprio, nem enviamos esse conteúdo a terceiros para treinar modelos de fundação.
Não acessamos o endereço, a caixa de e-mail, a agenda ou o calendário da conta Google da loja.
Não mantemos CRM, histórico de vendas a consumidores finais nem base de compradores da loja.
O site não usa rastreadores de marketing: sem analytics de terceiros, pixel ou cookie de publicidade.
Não há decisão totalmente automatizada que afete a lojista ou seus clientes.
14. Crianças
O serviço é voltado a titulares de negócio adultos. Não coletamos de forma consciente dados de menores de 18 anos.
15. Contato
Privacidade e dados:
contato@milaai.com.br
. Instagram: @usemila.ai.
16. Mudanças
Podemos atualizar esta política. A versão vigente fica sempre nesta página, com a data no topo. Mudanças materiais serão comunicadas de forma razoável (site e/ou WhatsApp).`,
  "termos": `← Voltar
Termos de uso
Regras da mila. — assistente de negócios no WhatsApp para lojas de joias e semijoias. Última atualização: 30 de setembro de 2026.
1. Aceite
Ao acessar milaai.com.br, solicitar código de verificação, usar o WhatsApp da mila. ou o workspace, você concorda com estes termos e com a
política de privacidade
. Se não concordar, não use o serviço.
2. O que é a mila.
A mila. é uma assistente operacional: você envia foto, nota ou pergunta e recebe apoio de precificação, leitura de custos, organização e rascunhos de conteúdo. O canal principal é o
WhatsApp
. O site e o workspace são apoio (login, status de plano e conectores).
Neste momento o serviço opera em
piloto / prévia
. O acesso é restrito a números autorizados. Recursos marcados como “em breve” ou demonstrativos não devem ser tratados como funcionalidade ativa.
3. Conta e elegibilidade
Você declara ter 18 anos ou mais e capacidade para contratar.
Se usa a mila. em nome de uma loja, declara ter autorização para vincular o número e, quando existirem, os conectores dessa loja.
Você é responsável por quem tem acesso ao WhatsApp e ao workspace ligados à sua conta.
4. Entradas, saídas e ações
Você pode enviar textos, imagens e arquivos (“entradas”). A mila. pode gerar respostas (“saídas”) e, quando um conector estiver disponível e você autorizar — com confirmação quando exigirmos — executar ações nas ferramentas conectadas.
Você garante ter direito de enviar o conteúdo e de autorizar o uso das contas conectadas.
Saídas de IA podem conter erros. Não use preço, estoque, prazo ou texto gerado sem revisão humana quando isso importar para a sua loja.
Quando esse controle estiver disponível e houver ações que alteram dados, pediremos confirmação ligada à prévia da ação. Um “sim” solto no chat sobre outro assunto não conta como autorização.
Conteúdo do mockup do site e da rota de conversa simulada é ilustrativo — não é orientação real de preço.
5. Planos e pagamento
Os planos publicados no site (por exemplo Essencial e Pro) descrevem a intenção comercial do produto. No piloto, founders e convidados podem ter acesso sem cobrança ou em condições especiais. Quando a cobrança estiver ativa, preços, ciclo e cancelamento serão confirmados no checkout ou no WhatsApp antes da cobrança.
6. Integrações de terceiros
Conectores (Google, Notion, Jueri e outros que venham a ser liberados), quando disponíveis, são serviços de terceiros. Ao conectar, você autoriza a mila. a agir nos limites da permissão concedida e aceita os termos desses provedores. A mila. não controla indisponibilidade, mudança de API ou políticas deles.
Estes conectores ainda não estão disponíveis para uso: Olist, Bling. As telas existem, mas o acesso ainda não foi habilitado.
7. Uso aceitável
Você se compromete a não:
violar lei, direito de terceiros ou estes termos;
tentar acessar conta, dados ou loja de outra pessoa sem autorização;
contornar a lista de números autorizados, o código de verificação, limites de tentativa ou proteções anti-abuso;
enviar malware, spam ou conteúdo ilícito pelo canal da mila.;
usar saídas da mila. para treinar ou destilar modelos concorrentes de forma abusiva;
sobrecarregar de propósito a infraestrutura ou fazer engenharia reversa indevida do serviço.
8. Propriedade intelectual
A marca mila., o site, o software e a identidade visual pertencem aos respectivos titulares. Você mantém direitos sobre o conteúdo da sua loja. Concedemos licença limitada para usar o serviço conforme estes termos; você nos concede licença para processar suas entradas só na medida necessária para prestar o serviço (veja a política de privacidade).
9. Isenções e limite de responsabilidade
O serviço é oferecido “como está”, com esforço razoável de disponibilidade e segurança, sem garantia de resultado comercial específico (lucro, conversão, aprovação de anúncio etc.).
Na máxima extensão permitida pela lei brasileira: (a) no piloto sem cobrança, a responsabilidade da mila. limita-se às hipóteses inafastáveis por lei; (b) se houver pagamento, limita-se ao valor efetivamente pago por você nos 3 meses anteriores ao evento — salvo dolo ou outra hipótese legal inafastável.
A mila. não é consultoria jurídica, contábil ou fiscal. Decisões de preço, tributação e compliance fiscal são suas.
10. Suspensão e encerramento
Podemos suspender ou encerrar o acesso em caso de violação, risco de segurança, ordem legal ou fim do piloto. Você pode parar de usar a qualquer momento e pedir exclusão de dados pelo canal indicado na política de privacidade.
11. Mudanças
Podemos atualizar estes termos. A versão vigente fica nesta página, com a data no topo. O uso continuado após mudança material, quando comunicada de forma razoável, implica aceite — salvo regra legal em contrário.
12. Lei e foro
Aplica-se a legislação brasileira. Fica eleito o foro da comarca de Belo Horizonte/MG, salvo foro privilegiado legal do consumidor quando aplicável.
13. Contato
Privacidade e dados:
contato@milaai.com.br
. Suporte: Instagram @usemila.ai.
Estes textos foram redigidos com base nas práticas atuais do produto. Não substituem revisão por advogado antes de cobrança ampla ou constituição formal da empresa.`,
};

const GOLDEN_POR_PAGINA: Record<string, string> = {
  "política": GOLDEN_POLITICA,
  "termos": GOLDEN_TERMOS,
};

test("legal: a prosa fixa de cada página é exatamente o golden", async () => {
  const f = await fatos();
  for (const pg of PAGINAS) {
  const golden = GOLDEN_POR_PAGINA[pg.nome];
  assert.ok(golden, `sem golden para ${pg.nome}`);
  const prosa = prosaDe(await htmlComSentinela(pg.caminho, f));

  if (prosa !== golden) {
    const a = golden.split("\n");
    const b = prosa.split("\n");
    const novas = b.filter((l) => !a.includes(l));
    const removidas = a.filter((l) => !b.includes(l));
    assert.fail(
      `a prosa estática de ${pg.nome} mudou.\n` +
        (novas.length ? `\nTEXTO NOVO (não previsto no golden):\n  - ${novas.join("\n  - ")}` : "") +
        (removidas.length ? `\n\nTEXTO REMOVIDO:\n  - ${removidas.join("\n  - ")}` : "") +
        `\n\nSe a mudança é intencional, atualize GOLDEN_${pg.nome === "política" ? "POLITICA" : "TERMOS"} no teste — de ` +
        "propósito, para que a mudança de texto seja uma decisão e não um efeito " +
        "colateral.",
    );
  }
  assert.equal(prosa, golden);
  }
});

// ────────── F. GOLDEN DA FONTE e do VOCABULÁRIO do DOM

/**
 * Canonicaliza um valor para comparação estável: chaves ordenadas, 2 espaços.
 * Mesmo formato de `json.dumps(sort_keys=True, indent=2, ensure_ascii=False)`.
 */
function canonico(v: unknown, ind = 0): string {
  const pad = "  ".repeat(ind);
  const pad2 = "  ".repeat(ind + 1);
  if (v === null) return "null";
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    return `[\n${v.map((x) => pad2 + canonico(x, ind + 1)).join(",\n")}\n${pad}]`;
  }
  if (typeof v === "object") {
    const ks = Object.keys(v as Record<string, unknown>).sort();
    if (!ks.length) return "{}";
    return (
      `{\n` +
      ks
        .map(
          (k) =>
            `${pad2}${JSON.stringify(k)}: ` +
            canonico((v as Record<string, unknown>)[k], ind + 1),
        )
        .join(",\n") +
      `\n${pad}}`
    );
  }
  return JSON.stringify(v);
}

/**
 * GOLDEN DA FONTE — todos os valores de `lib/legal.ts`, congelados.
 *
 * Fecha o furo que o Grok abriu na 6ª rodada: o golden da prosa transforma todo
 * valor da fonte em sentinela, então uma FRASE ADICIONADA DENTRO DA FONTE
 * (concatenando na string de `GOOGLE_LIMITED_USE`, por exemplo) desaparecia do
 * golden da prosa e nenhum outro teste a pegava. Aqui a fonte inteira é o
 * golden: mudar qualquer valor — inclusive uma frase a mais dentro de uma string
 * — falha, e o diff mostra exatamente o texto novo.
 *
 * Regenerar: `scripts/gerar_golden_legal.sh`.
 */
const GOLDEN_FONTE = `{
  "ATUALIZADO_EM": "30 de setembro de 2026",
  "BASES_LEGAIS": [
    {
      "base": "Execução de contrato (art. 7, V)",
      "finalidade": "Prestar o serviço pedido (precificar, ler nota, caderno, conteúdo)"
    },
    {
      "base": "Execução de contrato e legítimo interesse em segurança (art. 7, V e IX)",
      "finalidade": "Autenticar o acesso por código no WhatsApp"
    },
    {
      "base": "Legítimo interesse (art. 7, IX)",
      "finalidade": "Segurança, anti-abuso e limites de tentativa"
    },
    {
      "base": "Obrigação legal e regulatória (art. 7, II)",
      "finalidade": "Cumprir obrigação legal e atender autoridade"
    },
    {
      "base": "Legítimo interesse (art. 7, IX)",
      "finalidade": "Medir uso com métricas agregadas ou dados desidentificados"
    }
  ],
  "CONECTORES_DISPONIVEIS": [
    "Google (Drive/Planilhas) — a mila cria a planilha do caderno na conta da loja, com o escopo drive.file (só o arquivo que ela mesma criou).",
    "Notion — a mila grava o caderno numa base que a loja já tem; não cria base."
  ],
  "CONECTORES_NAO_PRONTOs": [
    "Olist",
    "Bling"
  ],
  "CONECTORES_VALIDACAO_PENDENTE": [
    "Jueri — a tela de conexão está pronta e a mila responde consultas de estoque; a validação com a credencial real da loja ainda está pendente."
  ],
  "CONTATO_PRIVACIDADE": "contato@milaai.com.br",
  "CONTROLADOR_CNPJ": null,
  "CONTROLADOR_NOME": "equipe fundadora da mila.",
  "DADOS_TRATADOS": [
    {
      "dado": "Mensagens de texto enviadas pela lojista no WhatsApp",
      "destino": "Classificadas para a mila entender o pedido, com apoio de provedor de IA. O conteúdo da mensagem é registrado em arquivo de diagnóstico para investigar erro e é excluído sob pedido."
    },
    {
      "dado": "Fotos de peças e de notas fiscais",
      "destino": "Enviadas a modelo de visão para identificação do que está na imagem. O texto e os dados extraídos ficam no histórico da loja. As imagens não são guardadas em pasta própria pela mila; o arquivo de diagnóstico da mensagem pode conter a referência recebida."
    },
    {
      "dado": "Descrição da peça e região da loja",
      "destino": "Usadas na consulta de preço de mercado. Fica em cache o preço agregado, para não repetir consulta."
    },
    {
      "dado": "Notas fiscais: dados do emitente, itens e o destinatário (nome, CPF/CNPJ, endereço)",
      "destino": "Lidos para extrair custo e itens. Quando aparecem dados de terceiros (destinatário, fornecedor), a loja é a controladora desses dados e a mila atua como operadora, para prestar o serviço que a loja pediu."
    },
    {
      "dado": "Cadastro de fornecedores (nome, contato, pedido mínimo, carência, histórico)",
      "destino": "Gravado no caderno da loja. A lojista escolhe onde: Notion (a mila só grava em base que já existe) ou planilha criada no Google Drive da loja. A mila não envia mensagens a fornecedores."
    },
    {
      "dado": "Telefone e código de verificação (login)",
      "destino": "O telefone identifica a loja. O código é de vida curta e guardado apenas em hash com salt (SHA-256 + salt aleatório) — a mila não consegue lê-lo."
    },
    {
      "dado": "Dados de cobrança (quando houver plano pago)",
      "destino": "Processados pela operadora de pagamentos. Dados de cartão são coletados e guardados por ela; não passam nem repousam nos servidores da mila."
    },
    {
      "dado": "Credenciais de integração, quando a lojista conecta uma conta",
      "destino": "Guardadas em cofre cifrado com Fernet (AES-128-CBC + HMAC), com a chave de decifragem em arquivo de permissão restrita (600)."
    }
  ],
  "DECISAO_AUTOMATIZADA": false,
  "DECISAO_AUTOMATIZADA_RESSALVA": "Algumas ações que alteram dados ainda não pedem confirmação separada — estamos implantando isso rota a rota. Enquanto não estiver completo, confira a prévia antes de confirmar.",
  "DECISAO_AUTOMATIZADA_TEXTO": "A mila recomenda; quem decide é a lojista. Não há perfilamento, pontuação, ranqueamento de pessoas nem decisão de crédito.",
  "DIREITOS": [
    "confirmação de que tratamos seus dados e acesso a eles",
    "correção de dados incompletos, inexatos ou desatualizados",
    "anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos",
    "portabilidade, quando aplicável",
    "eliminação dos dados tratados com consentimento",
    "informação sobre com quem compartilhamos",
    "informação sobre a possibilidade de não consentir e as consequências disso",
    "revogação do consentimento e oposição a tratamento fundado em legítimo interesse"
  ],
  "EXPURGO_AUTOMATICO_ATIVO": false,
  "FUNCOES": [
    "Calcula preço de venda a partir do custo, do imposto e da margem que a lojista informa.",
    "Pesquisa preços praticados por concorrentes e a média do mercado.",
    "Lê notas fiscais (XML ou foto) e extrai os itens.",
    "Mantém o cadastro de fornecedores da loja: contato, pedido mínimo, carência e histórico.",
    "Gera textos para site e catálogo (recursos do plano Pro)."
  ],
  "GOOGLE_ESCOPOS": [
    "openid",
    "https://www.googleapis.com/auth/drive.file"
  ],
  "GOOGLE_LIMITED_USE": "Uso de dados do Google. O que a mila recebe das APIs do Google é usado somente para fornecer e melhorar as funcionalidades que você vê: criar e manter a planilha do caderno de fornecedores que ela mesma cria, e registrar a conexão da conta. Não usamos esses dados para publicidade, não os vendemos, não os usamos para avaliar crédito, pontuação ou risco de pessoas, nem para treinar modelos de inteligência artificial. Esses dados só são repassados a prestador que nos atende sob contrato e apenas no necessário para a finalidade contratada, para segurança ou para cumprir a lei. Nenhuma pessoa lê o conteúdo do seu Drive ou da sua conta sem a sua autorização específica para aquela situação — o suporte a que você dá acesso é feito em conversa conosco, não pela leitura do seu Drive. O uso segue a Política de Dados de Usuário dos Serviços de API do Google, incluindo os requisitos de Limited Use.",
  "GOOGLE_O_QUE_ACESSA": "Ao conectar o Google, a mila recebe um identificador da conta (escopo openid). Ela NÃO recebe seu endereço de e-mail. Na prática, quem mantém o vínculo entre a conexão e a sua loja é a sessão autenticada no WhatsApp — a mila não usa o identificador para saber de qual conta se trata, e a tela não mostra o endereço da conta conectada. Acesso a arquivos fica restrito ao escopo drive.file: só os arquivos que a própria mila cria. Ela não abre, não lista e não altera o restante do seu Drive, não lê sua caixa de e-mail e não acessa sua agenda ou seu calendário.",
  "INSTAGRAM": "@usemila.ai",
  "ISOLAMENTO": [
    "Praticado: cada loja é um espaço separado; o acesso é restrito por lista de números autorizados e o registro de sessão é por loja.",
    "Em implantação: registro sistemático de acesso excepcional da equipe fundadora. A estrutura de auditoria existe, mas o registro automático ainda não está ligado."
  ],
  "MILA_LEGAL_FIM": "mila-legal-fim",
  "NAO_FEITO": [
    "Não vendemos nem cedemos dados a terceiros fora dos prestadores listados acima.",
    "Não usamos o conteúdo da loja para treinar modelo próprio, nem enviamos esse conteúdo a terceiros para treinar modelos de fundação.",
    "Não acessamos o endereço, a caixa de e-mail, a agenda ou o calendário da conta Google da loja.",
    "Não mantemos CRM, histórico de vendas a consumidores finais nem base de compradores da loja.",
    "O site não usa rastreadores de marketing: sem analytics de terceiros, pixel ou cookie de publicidade.",
    "Não há decisão totalmente automatizada que afete a lojista ou seus clientes."
  ],
  "NAO_PRONTOs_FRASE": "Anunciados anteriormente e ainda não disponíveis: Olist e Bling. A tela de conexão existe, mas o acesso ainda não foi habilitado — não conte com eles para a operação da sua loja por enquanto.",
  "RETENCAO": [
    {
      "alvo": "minutos",
      "item": "Código de verificação (OTP)",
      "praticado": "Vida curta; expira sozinho."
    },
    {
      "alvo": "não definido",
      "item": "Arquivo de diagnóstico da mensagem recebida",
      "praticado": "Mantido até exclusão sob pedido."
    },
    {
      "alvo": "até cerca de 90 dias",
      "item": "Histórico operacional da conversa",
      "praticado": "Mantido até exclusão sob pedido."
    },
    {
      "alvo": "até cerca de 180 dias",
      "item": "Notas fiscais processadas",
      "praticado": "Mantido até exclusão sob pedido."
    },
    {
      "alvo": "até cerca de 30 dias",
      "item": "Logs técnicos de visão e download",
      "praticado": "Só metadado (data, modelo, latência, erro) — sem o conteúdo da mensagem."
    },
    {
      "alvo": "até a lojista desconectar",
      "item": "Credenciais de integração",
      "praticado": "Mantidas enquanto a integração estiver conectada."
    }
  ],
  "RETENCAO_NOTA": "Estes prazos são alvo, ainda não são automáticos: hoje a exclusão é feita pela equipe sob pedido, pelo canal de privacidade. A mila não substitui a obrigação da loja de guardar documentos fiscais nos prazos legais.",
  "SECAO_CONTATO": 15,
  "SUBCONTROLADORES": [
    {
      "nome": "Google",
      "pais": "Estados Unidos",
      "papel": "Modelo de visão (lê a foto da peça e da nota) e geração de texto. Também guarda a planilha do caderno no Drive da loja, quando ela escolhe essa opção.",
      "tocaDadoDoGoogle": "arquivo e conteúdo do Drive"
    },
    {
      "nome": "TypeSafe (System One)",
      "pais": "Estados Unidos",
      "papel": "Classificação da intenção da mensagem, para a mila entender o pedido. Recebe o texto da mensagem.",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "Alibaba",
      "pais": "China",
      "papel": "Modelo de texto alternativo, usado só quando o provedor principal está indisponível. Recebe o mesmo texto que seria enviado ao principal.",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "Zhipu",
      "pais": "China",
      "papel": "Segundo modelo de texto alternativo, na mesma condição do anterior. Acionado só quando a alternativa gratuita está fora. Recebe o texto da mensagem enviada à mila no WhatsApp — não recebe arquivo do seu Drive, nem o conteúdo da sua planilha, nem credencial de acesso.",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "Serper",
      "pais": "Estados Unidos",
      "papel": "Consulta de preço de concorrentes e média de mercado.",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "MegaAPI",
      "pais": "Brasil",
      "papel": "Transporte da mensagem no WhatsApp (texto e mídia). O WhatsApp/Meta também participa do transporte.",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "Vercel",
      "pais": "Estados Unidos",
      "papel": "Hospedagem do site e do workspace web.",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "Cloudflare",
      "pais": "Estados Unidos",
      "papel": "DNS, túnel, proteção do endpoint e verificação anti-robô no login (Turnstile).",
      "tocaDadoDoGoogle": false
    },
    {
      "nome": "Asaas",
      "pais": "Brasil",
      "papel": "Processamento de pagamento, quando houver cobrança.",
      "tocaDadoDoGoogle": false
    }
  ],
  "TITULARES": [
    "A lojista (dona ou pessoa autorizada da loja) — usuária do serviço.",
    "O representante do fornecedor, quando a lojista o cadastra no caderno.",
    "O destinatário que aparece na nota fiscal, quando a lojista envia uma nota para leitura."
  ],
  "TRANSFERENCIA_INTERNACIONAL": "Vários prestadores acima processam dados fora do Brasil — Estados Unidos (Google, TypeSafe, Serper, Vercel, Cloudflare) e China (Alibaba, Zhipu). Isso é transferência internacional (LGPD, art. 33). Mecanismo: os contratos de adesão (termos de serviço) desses fornecedores preveem as salvaguardas de proteção de dados, e a formalização das cláusulas-padrão segue pendente enquanto a empresa não estiver constituída. Enquanto isso, transferimos o mínimo necessário: o texto da mensagem que você envia à mila. Nada de arquivo do seu Drive, de credencial da sua conta ou de conteúdo da sua planilha vai para os modelos alternativos. Chips de fornecedor chinês aparecem nominalmente porque você tem o direito de saber para onde o dado vai."
}`;

/**
 * GOLDEN DO VOCABULÁRIO — tags e atributos que as páginas jurídicas podem usar.
 *
 * Fecha o outro furo da 6ª rodada: `prosaDe` remove tags e não olha atributo,
 * então a mentira podia ir para um `alt`, um data-URI de `<img>` ou um
 * `className`. Aqui o vocabulário é FECHADO: tag ou atributo novo falha, e
 * acrescentar `img`/`alt` a uma página de política passa a ser decisão explícita.
 */
const GOLDEN_TAGS: string[] = ["a", "div", "em", "h1", "h2", "li", "p", "strong", "ul"];
const GOLDEN_ATRIBUTOS: string[] = ["class", "href"];

function vocabulario(html: string): { tags: string[]; atributos: string[] } {
  const tags = new Set<string>();
  const atributos = new Set<string>();
  for (const m of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/gi)) {
    tags.add(m[1].toLowerCase());
    // nome do atributo pode ser seguido de `=`, `/` ou espaço (`hidden`, `checked`)
    for (const a of m[2].matchAll(/(?:^|\s)([a-zA-Z][a-zA-Z0-9-]*)(?=\s*=|\s|$|\/)/g)) {
      atributos.add(a[1].toLowerCase());
    }
  }
  return { tags: [...tags].sort(), atributos: [...atributos].sort() };
}

test("legal: os valores da fonte são exatamente o golden da fonte", async () => {
  const f = await fatos();
  const todos: Record<string, unknown> = {};
  for (const k of Object.keys(f).sort()) todos[k] = f[k];
  const atual = canonico(todos);
  if (atual !== GOLDEN_FONTE) {
    const a = GOLDEN_FONTE.split("\n");
    const b = atual.split("\n");
    const novas = b.filter((l) => !a.includes(l));
    const removidas = a.filter((l) => !b.includes(l));
    assert.fail(
      "os valores de lib/legal.ts mudaram.\n" +
        (novas.length ? `\nLINHAS NOVAS:\n  ${novas.join("\n  ")}` : "") +
        (removidas.length ? `\n\nLINHAS REMOVIDAS:\n  ${removidas.join("\n  ")}` : "") +
        "\n\nSe a mudança é intencional, rode scripts/gerar_golden_legal.sh e LEIA O DIFF.",
    );
  }
});

test("legal: as páginas jurídicas usam só o vocabulário de DOM congelado", async () => {
  for (const pg of PAGINAS) {
    const v = vocabulario(await htmlDe(pg.caminho));
    assert.deepEqual(
      v.tags.filter((x) => !GOLDEN_TAGS.includes(x)),
      [],
      `${pg.nome}: tag nova no HTML — pode veicular texto que o golden da prosa não vê`,
    );
    assert.deepEqual(
      v.atributos.filter((x) => !GOLDEN_ATRIBUTOS.includes(x)),
      [],
      `${pg.nome}: atributo novo no HTML — pode veicular texto que o golden da prosa não vê`,
    );
  }
});

test("legal: o texto visível do render REAL é exatamente o golden", async () => {
  // A camada definitiva (7ª rodada do Grok). O render instrumentado é um segundo
  // programa: predicado sobre a sentinela (`RETENCAO_NOTA.length > 100`) ou um
  // `replace` que mira o texto real mas não casa na sentinela decidem o que o
  // browser mostra sem mexer em nenhum golden anterior. Aqui é a fotografia do
  // que o titular LÊ, com os valores reais.
  for (const pg of PAGINAS) {
    const golden = GOLDEN_TEXTO[pg.nome];
    assert.ok(
      golden && !golden.startsWith("PLACEHOLDER"),
      `sem golden de texto para ${pg.nome}`,
    );
    const real = normalizar(await htmlDe(pg.caminho));

    if (real !== golden) {
      const a = golden.split("\n");
      const b = real.split("\n");
      const novas = b.filter((l) => !a.includes(l));
      const removidas = a.filter((l) => !b.includes(l));
      assert.fail(
        `o texto visível de ${pg.nome} mudou.\n` +
          (novas.length ? `\nTEXTO NOVO (o titular passaria a ler):\n  - ${novas.join("\n  - ")}` : "") +
          (removidas.length ? `\n\nTEXTO REMOVIDO:\n  - ${removidas.join("\n  - ")}` : "") +
          "\n\nSe a mudanca e intencional, rode scripts/gerar_golden_legal.sh e LEIA O DIFF.",
      );
    }
  }
});

/** Hash do código OAuth revisado: a AST é diagnóstico, não aceita código novo
 * silenciosamente. Qualquer mutação, alias, chamada ou atualização desconhecida
 * do arquivo exige nova revisão. NÃO é regenerado pelo gerador de texto. */
test("legal: implementação OAuth é exatamente a versão revisada", () => {
  const path = ["/opt/data/profiles/mila/auth/oauth.py", join(RAIZ, "../auth/oauth.py")].find(existsSync);
  assert.ok(path, "Sem OAuth real não há evidência de paridade");
  assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), "0cd12f7ea58517fb8af5f60f352a484d55cbd28b0d022f99066cea00134f33bb", "OAuth mudou: revisar a implementação antes de aceitar novo hash; AST não garante semântica arbitrária");
});

/** Entorno da rota e CSS congelados; não são compostos no render estático das
 * páginas. Alteração exige revisar o entorno, não apenas regenerar a copy. */
const ENTORNO_REVISADO: Record<string, string> = {
  "app/(site)/layout.tsx": "6393d0b33263d81d17f9c1ab2513fe4c87f463a552298672c46c365780707b58",
  "app/(site)/login/auth.css": "89474c9f6c60fd5166ae78c28376f4bca192008ddf6561cbafa4d03cc8e2706e",
  "app/globals.css": "84e3d5f415c9a5ae300726302eae47d7980ea67ca288d9c560531429d5497262",
  "app/layout.tsx": "4a4eb8d86c23f95299d15d62232ba50c93327f03d22cb32f4695c2934106a855",
  "app/site.css": "f8ef6108261d31f6698228cdb0c233f0d2c157893a938910ee2850dbf4cd2e37",
  "app/workspace/workspace.css": "8dcf6352f84a4755bcd434a8b5abc9500b2024c0098d397a0c01454ccd8be02b",
  "components/BrandLogo.tsx": "eadd3ecf16e11bb0fc69d40c528727afc971142daec9367c51266b1f633fabb2",
  "components/SiteFooter.tsx": "ccb5264b00af80a48fdd0d496447085c8f48c6c9a868a547fc456d0e5eed3554",
  "components/SiteHeader.tsx": "ea089f55205cc6a40156232c611d0d162121fc22204acf558b7f7f958ba4b817"
};
test("legal: layout, componentes do entorno e CSS permanecem revisados", () => {
  for (const [rel, hash] of Object.entries(ENTORNO_REVISADO)) {
    assert.equal(createHash("sha256").update(readFileSync(join(RAIZ, rel))).digest("hex"), hash, `${rel}: entorno mudou; revisar antes de atualizar hash`);
  }
});
