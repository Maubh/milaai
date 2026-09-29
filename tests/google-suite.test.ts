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
 * ── Por que este teste NÃO lê "a linha que contém Google Workspace" ──────────
 * A primeira versão fazia isso e foi reprovada na revisão do Grok 4.7: bastava
 * escrever "Documentos"/"Calendário"/"Sheets" na linha de BAIXO, ou dentro do
 * valor de uma constante, para a promessa voltar sem quebrar nada — o teste
 * media o TEXTO-FONTE, não o que a lojista lê.
 *
 * Agora ele mede os VALORES que vão para a tela: importa as constantes reais e
 * varre o conteúdo delas, sem depender de onde a string foi escrita. E confere
 * que cada tela continua LIGADA na fonte única (se alguém voltar a digitar a
 * promessa à mão em outro arquivo, o teste pega).
 *
 *   npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  FERRAMENTAS_GOOGLE,
  GOOGLE_DESC,
  GOOGLE_ESCOPO_NOTA,
  GOOGLE_TITULO,
  PLANO_GOOGLE,
} from "../lib/google-workspace.ts";
import { NOTION_DESC } from "../lib/notion.ts";

const ler = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

const PRICING = ler("../components/PricingSection.tsx");
const DEMO = ler("../lib/demo-data.ts");
const INTEGRACAO = ler("../app/integrations/[app]/page.tsx");
const MARQUEE = ler("../components/IntegrationsMarquee.tsx");

/** Tira comentários: eles EXPLICAM o que saiu do ar e não são lidos pela lojista. */
const semComentarios = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

/**
 * Ferramentas que o produto NÃO usa. Não podem aparecer como promessa.
 *
 * `agenda`/`calendar`/`gmail` entram aqui porque foram anunciados e nunca
 * existiram; `documentos`/`docs`/`slides`/`apresenta`/`wiki`/`páginas`/`tarefas`
 * fecham o resto da suíte que o texto antigo citava.
 */
const NAO_ENTREGUES =
  /\b(gmail|agenda|calendar|calend[áa]rio|tarefas?|tasks|docs|documentos|apresenta\w*|slides|wiki|p[áa]ginas?|planilhas do google sheets)\b/i;

/**
 * Negação HONESTA: o aviso de escopo diz que a mila NÃO acessa Gmail/Agenda.
 * Isso protege a lojista — então é allowlist, não violação. Sem esta exceção o
 * próprio texto que dá transparência quebraria o teste.
 */
const NEGACAO_HONESTA = /não acessa seu Gmail nem sua Agenda/gi;
const despirNegacao = (t: string) => t.replace(NEGACAO_HONESTA, " ");

/** Todos os textos de UI que a lojista lê, como VALOR (não como fonte). */
const TEXTOS_DE_UI: Array<[string, string]> = [
  ["PLANO_GOOGLE", PLANO_GOOGLE],
  ["GOOGLE_DESC", GOOGLE_DESC],
  ["GOOGLE_ESCOPO_NOTA", GOOGLE_ESCOPO_NOTA],
  ["GOOGLE_TITULO", GOOGLE_TITULO],
  ["NOTION_DESC", NOTION_DESC],
  ...FERRAMENTAS_GOOGLE.map((f) => [`uso de ${f.nome}`, f.uso] as [string, string]),
];

test("google: a lista de ferramentas é só o que o produto usa", () => {
  const nomes = FERRAMENTAS_GOOGLE.map((f) => f.nome).sort();
  assert.deepEqual(nomes, ["Drive", "Planilhas"]);
  for (const f of FERRAMENTAS_GOOGLE) {
    assert.match(f.icone, /^\/integrations\/google-.+\.png$/, f.nome);
    assert.ok(f.uso.length > 10, `uso de ${f.nome} precisa explicar algo`);
  }
  // Cada ícone declarado tem que existir em disco, senão a faixa fica com
  // quadrado vazio / 404 e ninguém percebe.
  for (const f of FERRAMENTAS_GOOGLE) {
    const caminho = new URL(`../public${f.icone}`, import.meta.url);
    assert.ok(readFileSync(caminho).length > 100, `asset ausente: ${f.icone}`);
  }
});

test("google: nenhum texto de UI promete ferramenta fora da lista", () => {
  for (const [rotulo, texto] of TEXTOS_DE_UI) {
    const limpo = despirNegacao(texto);
    const achado = limpo.match(NAO_ENTREGUES);
    assert.equal(
      achado,
      null,
      `${rotulo} promete "${achado?.[0]}" — o produto não entrega: ${texto}`,
    );
  }
});

test("google: nem no fonte das telas, com comentários fora", () => {
  // Blinda contra alguém digitar a promessa à mão numa tela NOVA, sem passar
  // pelas constantes. O comentário de código não conta (não é lido por ninguém).
  for (const [nome, src] of [
    ["PricingSection", PRICING],
    ["demo-data", DEMO],
    ["integrations/[app]", INTEGRACAO],
    ["IntegrationsMarquee", MARQUEE],
  ] as Array<[string, string]>) {
    const achado = despirNegacao(semComentarios(src)).match(NAO_ENTREGUES);
    assert.equal(achado, null, `${nome} traz "${achado?.[0]}" como promessa`);
  }
});

test("google: as telas continuam LIGADAS na fonte única", () => {
  // Se uma tela voltar a digitar o texto à mão, ela deixa de citar a constante
  // e este teste cai — foi assim que três versões da mesma frase divergiram.
  assert.match(PRICING, /PLANO_GOOGLE/, "o plano precisa usar PLANO_GOOGLE");
  assert.match(DEMO, /GOOGLE_DESC/, "a lista logada precisa usar GOOGLE_DESC");
  assert.match(DEMO, /NOTION_DESC/, "a lista logada precisa usar NOTION_DESC");
  assert.match(INTEGRACAO, /GOOGLE_ESCOPO_NOTA/);
  assert.match(INTEGRACAO, /GOOGLE_TITULO/);
  assert.match(INTEGRACAO, /FERRAMENTAS_GOOGLE/);
  assert.match(MARQUEE, /FERRAMENTAS_GOOGLE/);
});

test("google: a tela de conexão explica o limite do escopo", () => {
  // Com `drive.file` a mila vê só o que ela cria. Prometer leitura do Drive
  // inteiro seria falso — e é o que a lojista precisa saber antes de autorizar.
  assert.match(GOOGLE_ESCOPO_NOTA, /não abre nem lista seus outros arquivos do Drive/);
  // A negação honesta precisa CONTINUAR existindo (não pode ser apagada em
  // silêncio: é ela que a lojista lê antes de autorizar).
  assert.match(GOOGLE_ESCOPO_NOTA, NEGACAO_HONESTA);
  // E o título não pode voltar a sugerir a suíte inteira.
  assert.doesNotMatch(GOOGLE_TITULO, /Workspace/);
  assert.match(GOOGLE_TITULO, /Drive e Planilhas/);
});

test("google: o essencial diz que o caderno fica salvo mesmo sem destino", () => {
  // Decisão do Maurício (2026-09-29): *"Se a loja não escolher nenhum, eh
  // informar que ficará salvo e ele pode consultar a qualquer momento"*.
  assert.match(PLANO_GOOGLE, /salvo e consultável no WhatsApp/);
  assert.match(GOOGLE_DESC, /salvo e consultável no WhatsApp/);
  // E a escolha do destino aparece nas duas telas.
  assert.match(PLANO_GOOGLE, /planilha/i);
  assert.match(PLANO_GOOGLE, /Notion/);
  // A linha do plano NÃO pode repetir "caderno de fornecedores": a feature
  // anterior já diz isso, e repetir foi o que deixou o plano redundante.
  const outrasLinhas = PRICING.split("\n").filter(
    (l) => /Caderno de fornecedores validados/.test(l),
  );
  assert.ok(outrasLinhas.length > 0, "a feature do caderno deve seguir no plano");
  assert.doesNotMatch(
    PLANO_GOOGLE,
    /Caderno de fornecedores/,
    "a linha do espelho não repete a feature anterior",
  );
});

test("google: os ícones das ferramentas são exibidos sob o nome da marca", () => {
  // Pedido do Maurício (2026-09-29): o nome "Google Workspace" visível, com os
  // ícones das ferramentas abaixo.
  const bloco = MARQUEE.slice(MARQUEE.indexOf('id: "google-workspace"'));
  const item = bloco.slice(0, bloco.indexOf('id: "notion"'));
  assert.match(item, /showName: true/, "sem o nome, os ícones ficam sem dono");
  assert.match(item, /tools: FERRAMENTAS_GOOGLE/);

  // E o render usa mesmo os ícones, com nome acessível.
  assert.match(MARQUEE, /className="marquee-mark-tools"/);
  assert.match(MARQUEE, /alt=\{t\.nome\}/);
});

test("notion: o site diz que o caderno pode ir para o Notion", () => {
  // Correção do Maurício (2026-09-29): *"mas o caderno tbm pode ser salvo tbm
  // no notion, certo?"* — sim. O site dava a entender que só o Google recebia
  // o caderno, e o Notion era genérico ("Documentos, Wiki, Páginas").
  assert.match(NOTION_DESC, /caderno de fornecedores e as notas de compra/);
  assert.match(NOTION_DESC, /planilha no Google Drive/);
  // O caderno vai para o Notion OU para a planilha — a escolha é da lojista.
  assert.match(PLANO_GOOGLE, /Notion/);
});

test("notion: a mila NÃO cria a base — e o texto não promete que cria", () => {
  // Medido em `notion_client.py`: `listar_bases` (é o que existe) e nenhuma
  // chamada a `POST /databases`. Ela pergunta qual base usar. "Viram bases"
  // sugeria que a mila criava uma base por nota — era impreciso.
  assert.match(NOTION_DESC, /ela não cria a base/);
  assert.doesNotMatch(NOTION_DESC, /viram bases/);
});

test("marquee: só o Google tem sub-ícones; o Notion fica como estava", () => {
  // Pedido do Maurício (2026-09-29): *"no marquee os icones para o google
  // workspace. Para notion nao precisa ter nada"* / *"o notion nao precisa de
  // nenhuma mudanca"*.
  const bloco = MARQUEE.slice(MARQUEE.indexOf('id: "notion"'));
  const item = bloco.slice(0, bloco.indexOf('id: "outlook"'));
  assert.doesNotMatch(item, /tools/, "o item do Notion na faixa não tem sub-ícones");
  assert.match(item, /name: "Notion"/, "o nome aparece, como nas outras marcas");

  // E o Notion continua na faixa (não pode ser removido).
  assert.match(MARQUEE, /id: "notion"/);
});
