/**
 * O site não pode prometer o que a mila não entrega.
 *
 * Furo medido 2026-09-29: o plano Essencial anunciava
 * "Google Workspace (Gmail, Agenda, Tarefas, Drive, Documentos, Planilhas e
 * Apresentações)" e o produto fazia só UMA coisa — escrever na planilha do
 * caderno de fornecedores, com o escopo `auth/drive.file`. Gmail e Agenda
 * acabaram de sair do código (`auth/oauth.py`), então o texto era promessa
 * sem entrega em três telas.
 *
 * ── Histórico deste teste (as duas versões anteriores foram reprovadas) ──────
 * v1 — filtrava as linhas do FONTE que continham "Google Workspace" e varria só
 *      essas. Burlável: a promessa na linha de BAIXO, ou dentro do VALOR de uma
 *      constante, passava. Também não pegava "documentos" nem "gmail" minúsculo.
 * v2 — passou a varrer os valores, mas com lista MANUAL de constantes e um
 *      removedor de comentários que engolia `//` dentro de string. O Grok 4.7
 *      mostrou duas brechas: "Sheets"/"e-mail" (fora da denylist) e um export
 *      NOVO que não estava na lista manual — este renderizava na tela e passava.
 *
 * v3 (esta) — não depende de lista manual nem de regex frágil:
 *   - importa MÓDULO INTEIRO (`import * as`) e varre TODO export de texto;
 *     export novo já nasce coberto;
 *   - o removedor de comentários é uma máquina de estados que respeita strings,
 *     então `"sync // Gmail"` continua visível;
 *   - a denylist tem os nomes de produto (gmail, e-mail, sheets, docs, slides,
 *     calendar, tasks) E as palavras da promessa antiga.
 *
 * ── Falso positivo: o teste é um arame farpado, não um muro ──────────────────
 * Se um dia "documentos fiscais" for texto legítimo nestas telas, o teste vai
 * falhar apontando a palavra. Aí a saída é ser explícito — foi o que se fez com
 * a negação honesta ("não acessa seu Gmail nem sua Agenda"), que é transparência
 * e por isso está em allowlist. Nunca afrouxe a denylist inteira por causa disso.
 *
 *   npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import * as GW from "../lib/google-workspace.ts";
import * as NO from "../lib/notion.ts";

const ler = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

const TELAS: Array<[string, string]> = [
  ["PricingSection", ler("../components/PricingSection.tsx")],
  ["demo-data", ler("../lib/demo-data.ts")],
  ["integrations/[app]", ler("../app/integrations/[app]/page.tsx")],
  ["IntegrationsMarquee", ler("../components/IntegrationsMarquee.tsx")],
];

/**
 * Remove comentários respeitando strings.
 *
 * Por que não um regex: `"sync // Gmail"` tem `//` DENTRO de uma string. Um
 * regex simples apaga o resto da linha e a promessa desaparece da varredura —
 * foi exatamente a brecha que o Grok apontou.
 */
function semComentarios(src: string): string {
  let saida = "";
  let i = 0;
  let estado: "codigo" | "string" | "linha" | "bloco" = "codigo";
  let aspas = "";
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1] ?? "";
    if (estado === "codigo") {
      if (c === "/" && d === "/") { estado = "linha"; i += 2; continue; }
      if (c === "/" && d === "*") { estado = "bloco"; i += 2; continue; }
      if (c === '"' || c === "'" || c === "`") { estado = "string"; aspas = c; }
      saida += c; i++; continue;
    }
    if (estado === "linha") {
      if (c === "\n") { estado = "codigo"; saida += "\n"; }
      i++; continue;
    }
    if (estado === "bloco") {
      if (c === "*" && d === "/") { estado = "codigo"; i += 2; continue; }
      i++; continue;
    }
    // dentro de string: `//` é texto, não comentário
    if (c === "\\") { saida += c + d; i += 2; continue; }
    if (c === aspas) estado = "codigo";
    saida += c; i++;
  }
  return saida;
}

/**
 * Apaga identificadores técnicos que NÃO são promessa: caminho de asset
 * (`/integrations/google-sheets.png`), `className`, imports. Sem isso, o próprio
 * nome do arquivo do ícone faria `sheets` disparar — falso positivo.
 */
const mascararTecnico = (src: string) =>
  src
    .replace(/\bclassName=(\{[^}]*\}|"[^"]*")/g, " ")
    .replace(/\bfrom\s+"[^"]*"/g, " ")
    .replace(/\bimport\s+[^;]+;/g, " ")
    .replace(/["'`][^"'`]*\.(png|svg|jpe?g|css|tsx?|ts)["'`]/g, " ")
    .replace(/^\s*[a-zA-Z]+:\s*"[a-z0-9-]+",?\s*$/gm, " "); // slug: "sheets",

/**
 * Junta string concatenada em pedaços: `"lê " + "G" + "mail"` → `"lê Gmail"`.
 * Sem isto, quebrar a palavra com `+` esconderia a promessa do teste (brecha
 * apontada pelo Grok na 2ª rodada).
 */
const juntarConcatenacao = (src: string) => src.replace(/"\s*\+\s*"/g, "");

/** Tira as negações HONESTAS: elas protegem a lojista e não são promessa. */
const NEGACAO_HONESTA = /não (acessa seu Gmail nem sua Agenda|abre nem lista seus outros arquivos do Drive)/gi;
const despirNegacao = (t: string) => t.replace(NEGACAO_HONESTA, " ");

/**
 * Nomes de produto e palavras da promessa antiga.
 * `sheets`/`e-mail` entraram depois da 2ª rodada do Grok (passavam batido).
 */
const NAO_ENTREGUES =
  /\b(gmail|e-?mails?|sheets?|docs|documentos?|apresenta\w*|slides?|wiki|p[áa]ginas?|tarefas?|tasks|calendar|calend[áa]rio|agenda)\b/i;

/** Coleta TODO texto exportado pelos módulos-fonte (sem lista manual). */
function textosExportados(): Array<[string, string]> {
  const achados: Array<[string, string]> = [];
  const visitar = (v: unknown, caminho: string): void => {
    if (typeof v === "string") {
      // Só prosa. `slug: "sheets"` e `icone: "/integrations/..."` não têm espaço
      // e são identificadores, não copy — quem os cobre é a varredura de fonte.
      if (v.includes(" ") && v.length > 8) achados.push([caminho, v]);
      return;
    }
    if (Array.isArray(v)) { v.forEach((x, i) => visitar(x, `${caminho}[${i}]`)); return; }
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) visitar(x, `${caminho}.${k}`);
    }
  };
  visitar(GW, "google-workspace");
  visitar(NO, "notion");
  return achados;
}

const TEXTOS_DE_UI = textosExportados();

test("google: a lista de ferramentas é só o que o produto usa", () => {
  const nomes = GW.FERRAMENTAS_GOOGLE.map((f) => f.nome).sort();
  assert.deepEqual(nomes, ["Drive", "Planilhas"]);
  for (const f of GW.FERRAMENTAS_GOOGLE) {
    assert.match(f.icone, /^\/integrations\/google-.+\.png$/, f.nome);
    assert.ok(f.uso.length > 10, `uso de ${f.nome} precisa explicar algo`);
    // Cada ícone declarado tem que existir em disco, senão a faixa fica com
    // quadrado vazio / 404 e ninguém percebe.
    assert.ok(readFileSync(new URL(`../public${f.icone}`, import.meta.url)).length > 100,
      `asset ausente: ${f.icone}`);
  }
});

test("google: nenhum texto exportado promete ferramenta fora da lista", () => {
  // Cobre TODO export dos módulos-fonte — inclusive um export novo, que na
  // versão anterior passava batido (brecha apontada pelo Grok).
  assert.ok(TEXTOS_DE_UI.length >= 6, `esperava textos exportados, achei ${TEXTOS_DE_UI.length}`);
  for (const [caminho, texto] of TEXTOS_DE_UI) {
    const achado = despirNegacao(texto).match(NAO_ENTREGUES);
    assert.equal(achado, null,
      `${caminho} promete "${achado?.[0]}" — o produto não entrega: ${texto}`);
  }
});

test("google: nem no fonte das telas, com comentários fora", () => {
  // Pega a promessa digitada À MÃO numa tela nova (sem passar pelas constantes),
  // e o texto solto no JSX. Comentário não conta: não é lido por ninguém.
  for (const [nome, src] of TELAS) {
    const limpo = juntarConcatenacao(mascararTecnico(semComentarios(src)));
    const achado = despirNegacao(limpo).match(NAO_ENTREGUES);
    assert.equal(achado, null, `${nome} traz "${achado?.[0]}" como promessa`);
  }
});

test("google: as telas continuam LIGADAS na fonte única", () => {
  // Se uma tela voltar a digitar o texto à mão, ela deixa de citar a constante e
  // este teste cai — foi assim que três versões da mesma frase divergiram.
  assert.match(TELAS[0][1], /\bPLANO_GOOGLE\b/, "o plano precisa usar PLANO_GOOGLE");
  assert.match(TELAS[1][1], /\bGOOGLE_DESC\b/, "a lista logada precisa usar GOOGLE_DESC");
  assert.match(TELAS[1][1], /\bNOTION_DESC\b/, "a lista logada precisa usar NOTION_DESC");
  assert.match(TELAS[2][1], /\bGOOGLE_ESCOPO_NOTA\b/);
  assert.match(TELAS[2][1], /\bGOOGLE_TITULO\b/);
  assert.match(TELAS[2][1], /\bFERRAMENTAS_GOOGLE\b/);
  assert.match(TELAS[3][1], /\bFERRAMENTAS_GOOGLE\b/);
});

test("google: a tela de conexão explica o limite do escopo", () => {
  // Com `drive.file` a mila vê só o que ela cria. Prometer leitura do Drive
  // inteiro seria falso — e é o que a lojista precisa saber antes de autorizar.
  //
  // As DUAS transparências são verificadas separadamente de propósito: com uma
  // regex de alternativas, apagar só a parte do Gmail/Agenda passava (brecha
  // encontrada por regressão). Cada uma tem que estar lá, textualmente.
  assert.match(GW.GOOGLE_ESCOPO_NOTA, /não abre nem lista seus outros arquivos do Drive/,
    "o aviso precisa dizer que a mila não abre os outros arquivos do Drive");
  assert.match(GW.GOOGLE_ESCOPO_NOTA, /não acessa seu Gmail nem sua Agenda/,
    "o aviso precisa dizer que a mila não acessa Gmail nem Agenda");
  // E o título não pode voltar a sugerir a suíte inteira.
  assert.doesNotMatch(GW.GOOGLE_TITULO, /Workspace/);
  assert.match(GW.GOOGLE_TITULO, /Drive e Planilhas/);
});

test("google: o essencial diz que o caderno fica salvo mesmo sem destino", () => {
  // Decisão do Maurício (2026-09-29): *"Se a loja não escolher nenhum, eh
  // informar que ficará salvo e ele pode consultar a qualquer momento"*.
  assert.match(GW.PLANO_GOOGLE, /salvo e consultável no WhatsApp/);
  assert.match(GW.GOOGLE_DESC, /salvo e consultável no WhatsApp/);
  // E a escolha do destino aparece nas duas telas.
  assert.match(GW.PLANO_GOOGLE, /planilha/i);
  assert.match(GW.PLANO_GOOGLE, /Notion/);
  // A linha do espelho NÃO pode repetir "Caderno de fornecedores": a feature
  // anterior já diz isso, e repetir deixou o plano redundante.
  assert.match(TELAS[0][1], /Caderno de fornecedores validados/,
    "a feature do caderno deve seguir no plano");
  assert.doesNotMatch(GW.PLANO_GOOGLE, /Caderno de fornecedores/,
    "a linha do espelho não repete a feature anterior");
});

test("google: os ícones das ferramentas são exibidos sob o nome da marca", () => {
  // Pedido do Maurício (2026-09-29): o nome "Google Workspace" visível, com os
  // ícones das ferramentas abaixo.
  const src = TELAS[3][1];
  const bloco = src.slice(src.indexOf('id: "google-workspace"'));
  const item = bloco.slice(0, bloco.indexOf('id: "notion"'));
  assert.match(item, /showName: true/, "sem o nome, os ícones ficam sem dono");
  assert.match(item, /tools: FERRAMENTAS_GOOGLE/);
  // E o render usa mesmo os ícones, com nome acessível.
  assert.match(src, /className="marquee-mark-tools"/);
  assert.match(src, /alt=\{t\.nome\}/);
});

test("notion: o site diz que o caderno pode ir para o Notion", () => {
  // Correção do Maurício (2026-09-29): *"mas o caderno tbm pode ser salvo tbm
  // no notion, certo?"* — sim. O site dava a entender que só o Google recebia
  // o caderno, e o Notion era genérico ("Documentos, Wiki, Páginas").
  assert.match(NO.NOTION_DESC, /caderno de fornecedores e as notas de compra/);
  assert.match(NO.NOTION_DESC, /planilha no Google Drive/);
  assert.match(GW.PLANO_GOOGLE, /Notion/);
});

test("notion: a mila NÃO cria a base — e o texto não promete que cria", () => {
  // Medido em `notion_client.py`: existe `listar_bases` e ZERO chamadas a
  // `POST /databases`. Ela pergunta qual base usar. "Viram bases" sugeria que a
  // mila criava uma base por nota — impreciso.
  assert.match(NO.NOTION_DESC, /ela não cria a base/);
  assert.doesNotMatch(NO.NOTION_DESC, /viram bases/);
});

test("marquee: só o Google tem sub-ícones; o Notion fica como estava", () => {
  // Pedido do Maurício (2026-09-29): *"no marquee os icones para o google
  // workspace. Para notion nao precisa ter nada"* / *"o notion nao precisa de
  // nenhuma mudanca"*.
  const src = TELAS[3][1];
  const bloco = src.slice(src.indexOf('id: "notion"'));
  const item = bloco.slice(0, bloco.indexOf('id: "outlook"'));
  assert.doesNotMatch(item, /tools/, "o item do Notion na faixa não tem sub-ícones");
  assert.match(item, /name: "Notion"/, "o nome aparece, como nas outras marcas");
  // E o Notion continua na faixa (não pode ser removido).
  assert.match(src, /id: "notion"/);
});
