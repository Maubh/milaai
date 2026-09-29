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
 * Estes testes leem o TEXTO que vai para a lojista (componente + dados) e
 * barram a volta das ferramentas que não existem. Se um dia Gmail ou Agenda
 * forem implementados de verdade, é aqui que se libera — de propósito.
 *
 *   npm test
 */

import test from "node:test";
import assert from "node:assert/strict";

import { readFileSync } from "node:fs";

import { FERRAMENTAS_GOOGLE, CADERNO_DESTINOS, GOOGLE_DESC, GOOGLE_RESUMO } from "../lib/google-workspace.ts";
import { NOTION_DESC } from "../lib/notion.ts";

const PRICING = readFileSync(new URL("../components/PricingSection.tsx", import.meta.url), "utf8");
const DEMO = readFileSync(new URL("../lib/demo-data.ts", import.meta.url), "utf8");
const INTEGRACAO = readFileSync(
  new URL("../app/integrations/[app]/page.tsx", import.meta.url),
  "utf8",
);
const MARQUEE = readFileSync(new URL("../components/IntegrationsMarquee.tsx", import.meta.url), "utf8");

/** Ferramentas do Google que o produto NÃO usa — não podem ser anunciadas. */
const NAO_ENTREGUES = ["Gmail", "Agenda", "Tarefas", "Apresentações", "Slides"];

test("google: a lista de ferramentas é só o que o produto usa", () => {
  const nomes = FERRAMENTAS_GOOGLE.map((f) => f.nome).sort();
  assert.deepEqual(nomes, ["Drive", "Planilhas"]);
  for (const f of FERRAMENTAS_GOOGLE) {
    assert.match(f.icone, /^\/integrations\/google-.+\.png$/, f.nome);
    assert.ok(f.uso.length > 10, `uso de ${f.nome} precisa explicar algo`);
  }
});

test("google: nenhuma tela anuncia ferramenta fora da lista", () => {
  // Só a linha do Google interessa: as outras integrações (Notion, por
  // exemplo) mencionam ferramentas próprias delas, e isso é legítimo.
  const linhasGoogle = [PRICING, DEMO, INTEGRACAO, MARQUEE]
    .flatMap((src) => src.split("\n"))
    .filter((l) => /Google Workspace|GOOGLE_DESC|GOOGLE_RESUMO/.test(l));

  assert.ok(linhasGoogle.length >= 4, "esperava a linha do Google em 4 arquivos");

  for (const linha of linhasGoogle) {
    for (const fora of NAO_ENTREGUES) {
      assert.doesNotMatch(
        linha,
        new RegExp(fora),
        `a linha do Google ainda promete "${fora}": ${linha.trim()}`,
      );
    }
  }
});

test("google: as telas dizem Drive e Planilhas", () => {
  assert.match(GOOGLE_DESC, /Drive e Planilhas/);
  assert.match(GOOGLE_RESUMO, /Drive e Planilhas/);
  // O plano Essencial cita explicitamente o que entra.
  const linhaPlano = PRICING.split("\n").find((l) => /Google Workspace/.test(l)) ?? "";
  assert.match(linhaPlano, /Drive e Planilhas/);
});

test("google: a tela de conexão explica o limite do escopo", () => {
  // Com `drive.file` a mila vê só o que ela cria. Prometer leitura do Drive
  // inteiro seria falso — e é justamente o que a lojista precisa saber antes
  // de autorizar.
  assert.match(INTEGRACAO, /não enxerga o resto do seu Drive/);
  assert.match(INTEGRACAO, /não acessa seu Gmail nem sua Agenda/);
  // E não pode voltar a prometer sincronizar pedidos/notas na conta Google.
  const trechoGoogle = INTEGRACAO.slice(INTEGRACAO.indexOf('google: {'));
  const bloco = trechoGoogle.slice(0, trechoGoogle.indexOf('notion: {'));
  assert.doesNotMatch(bloco, /sincronizar pedidos, notas fiscais e estoque/);
});

test("google: os ícones das ferramentas são exibidos sob o nome da marca", () => {
  // Pedido do Maurício (2026-09-29): o nome "Google Workspace" visível, com os
  // ícones das ferramentas abaixo.
  const blocoMarquee = MARQUEE.slice(MARQUEE.indexOf('id: "google-workspace"'));
  const item = blocoMarquee.slice(0, blocoMarquee.indexOf('id: "notion"'));
  assert.match(item, /showName: true/, "sem o nome, os ícones ficam sem dono");
  assert.match(item, /tools: FERRAMENTAS_GOOGLE/);

  // E o render usa mesmo os ícones, com nome acessível.
  assert.match(MARQUEE, /className="marquee-mark-tools"/);
  assert.match(MARQUEE, /alt=\{t\.nome\}/);
});

test("notion: o site diz que o caderno pode ir para o Notion", () => {
  // Correção do Maurício (2026-09-29): *"mas o caderno tbm pode ser salvo tbm
  // no notion, certo?"* — sim. O site dava a entender que só o Google recebia o
  // caderno, e o Notion era genérico ("Documentos, Wiki, Páginas").
  assert.match(PRICING, /Google Workspace \(Drive e Planilhas\) ou Notion/);
  assert.match(DEMO, /caderno de fornecedores e as notas de compra viram bases/);
  assert.match(INTEGRACAO, /NOTION_DESC/);
  assert.match(NOTION_DESC, /caderno de fornecedores e as notas de compra/);
  assert.match(NOTION_DESC, /planilha do Google/);
  assert.match(CADERNO_DESTINOS, /Notion/);
});

test("notion: o site não promete Wiki, Documentos ou Páginas", () => {
  // O produto grava CADERNO e NOTAS. Wiki/Documentos/Páginas nunca existiram.
  const proibidos = ["Wiki", "Páginas e Bancos de dados", "o espaço da marca com a mila"];
  for (const src of [PRICING, DEMO, INTEGRACAO, NOTION_DESC]) {
    for (const p of proibidos) {
      assert.doesNotMatch(src, new RegExp(p), `ainda promete "${p}"`);
    }
  }
});

test("marquee: só o Google tem sub-ícones; o Notion fica como estava", () => {
  // Pedido do Maurício (2026-09-29): *"nao precisa no marque nada disso. Eu so
  // quero no marquee os icones para o google workspace. Para notion nao precisa
  // ter nada no marquee"* / *"o notion nao precisa de nenhuma mudanca"*.
  const blocoNotion = MARQUEE.slice(MARQUEE.indexOf('id: "notion"'));
  const item = blocoNotion.slice(0, blocoNotion.indexOf('id: "outlook"'));
  assert.doesNotMatch(item, /tools/, "o item do Notion na faixa não tem sub-ícones");
  assert.match(item, /name: "Notion"/, "o nome aparece, como nas outras marcas");

  // E o Notion continua na faixa (não pode ser removido).
  assert.match(MARQUEE, /id: "notion"/);
});
