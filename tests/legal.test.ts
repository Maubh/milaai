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
const NAO_PODE_TER_ESTILO = /\sstyle\s*=|\shidden[\s/>=]|aria-hidden|dangerouslySetInnerHTML/i;

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

test("legal: nenhum PROIBIDO aparece no HTML", async () => {
  for (const p of PAGINAS) {
    const h = texto(await htmlDe(p.caminho));
    for (const [nome, re] of PROIBIDOS) {
      assert.doesNotMatch(h, re, `${p.nome}: apareceu "${nome}" (${re})`);
    }
  }
});

test("legal: nenhuma página esconde texto", () => {
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
    const src = readFileSync(join(RAIZ, p.caminho), "utf8");
    assert.doesNotMatch(
      src,
      NAO_PODE_TER_ESTILO,
      `${p.nome}: usa style/hidden/aria-hidden/dangerouslySetInnerHTML — ` +
        "é assim que se esconde texto do titular sem esconder do teste",
    );
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
  const script = [
    "import ast, json, sys",
    "arvore = ast.parse(open(sys.argv[1], encoding='utf-8').read())",
    "achado = None",
    "for no in ast.walk(arvore):",
    "    alvo = valor = None",
    "    if isinstance(no, ast.AnnAssign) and isinstance(no.target, ast.Name):",
    "        alvo, valor = no.target.id, no.value",
    "    elif isinstance(no, ast.Assign) and len(no.targets) == 1 and isinstance(no.targets[0], ast.Name):",
    "        alvo, valor = no.targets[0].id, no.value",
    "    if alvo == 'PROVIDERS' and isinstance(valor, ast.Dict):",
    "        mapa = valor",
    "        if isinstance(mapa, ast.Dict):",
    "            for chave, valor in zip(mapa.keys, mapa.values):",
    "                if isinstance(chave, ast.Constant) and chave.value == 'google':",
    "                    if isinstance(valor, ast.Dict):",
    "                        for k2, v2 in zip(valor.keys, valor.values):",
    "                            if isinstance(k2, ast.Constant) and k2.value == 'scopes':",
    "                                achado = ast.literal_eval(v2)",
    "print(json.dumps(achado))",
  ].join("\n");

  const cache = join(CACHE, "_leitor_escopos.py");
  writeFileSync(cache, script);
  const saida = execFileSync("python3", [cache, fonte], { encoding: "utf8" }).trim();
  assert.notEqual(saida, "null", "não achei PROVIDERS['google']['scopes'] na AST");

  const reais = JSON.parse(saida) as string[];
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
