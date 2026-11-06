import test from "node:test";
import assert from "node:assert/strict";
import {
  COLECAO_DE_EXEMPLO,
  DESCRICAO_TEMPLATE,
  MAX_GRUPOS_VARIACAO,
  MAX_NOME_VARIACAO,
  MAX_OPCAO_VARIACAO,
  MAX_OPCOES_VARIACAO,
  TEMPLATES_VITRINE,
  TEMPLATE_PADRAO,
  contraste,
  corDeTextoLegivel,
  corOuReserva,
  normalizarItens,
  normalizarVariacoes,
  pecasDeExemplo,
  templateDaVitrine,
  tintaSobre,
  vitrineExpirada,
} from "../lib/vitrine.ts";
import { projetarMarca } from "../lib/marca.ts";
import { destinoPermitido } from "../lib/pos-login.ts";

test("vitrine expirada: leva só os campos públicos da loja", () => {
  const r = vitrineExpirada({
    ok: false,
    error: "showcase_expired",
    tituloColecao: "Outono",
    loja: {
      nomeExibicao: "Ritrovarsi",
      whatsappContato: "+55 31 99999-0000",
      corPrimaria: "#123456",
      logoUrl: "https://exemplo.test/logo.png",
      custo: 10,
    },
  });
  assert.deepEqual(r, {
    tipo: "expirada",
    loja: {
      nomeExibicao: "Ritrovarsi",
      whatsappContato: "+55 31 99999-0000",
      corPrimaria: "#123456",
      logoUrl: "https://exemplo.test/logo.png",
    },
    tituloColecao: "Outono",
  });
});

test("vitrine expirada: sem loja no corpo, a página ainda abre sem botão", () => {
  assert.deepEqual(vitrineExpirada({}), {
    tipo: "expirada",
    loja: { nomeExibicao: null, whatsappContato: null, corPrimaria: null, logoUrl: null },
    tituloColecao: null,
  });
});

test("vitrine expirada: logo fora de https não é usado", () => {
  assert.equal(vitrineExpirada({ loja: { logoUrl: "javascript:alert(1)" } }).tipo, "expirada");
  assert.equal((vitrineExpirada({ loja: { logoUrl: "http://x.test/a.png" } }) as any).loja.logoUrl, null);
});

/* ---- layouts ---- */

test("layouts: os três nomes do contrato com o Eve, com nome e descrição para a lojista", () => {
  assert.deepEqual([...TEMPLATES_VITRINE], ["classico", "editorial", "minimalista"]);
  for (const t of TEMPLATES_VITRINE) {
    assert.equal(templateDaVitrine(t), t);
    assert.ok(DESCRICAO_TEMPLATE[t].nome.trim() && DESCRICAO_TEMPLATE[t].descricao.trim());
  }
  assert.equal(templateDaVitrine(" Editorial "), "editorial", "aceita maiúscula e espaço em volta");
});

test("layouts: campo ausente ou desconhecido cai no clássico (vitrines antigas continuam iguais)", () => {
  assert.equal(TEMPLATE_PADRAO, "classico");
  for (const v of [undefined, null, "", "moderno", 3, {}, "classico2"]) assert.equal(templateDaVitrine(v), "classico", String(v));
});

test("layouts: a marca da área logada lê o mesmo campo, com o mesmo padrão", () => {
  assert.equal(projetarMarca({ marca: { template: "minimalista" } }).marca.template, "minimalista");
  assert.equal(projetarMarca({ marca: {} }).marca.template, "classico");
  assert.equal(projetarMarca({ marca: { template: "qualquer" } }).marca.template, "classico");
});

test("layouts: a página Vitrine da área logada é destino permitido depois do login", () => {
  assert.equal(destinoPermitido("/workspace/vitrine"), true);
});

/* ---- peças e variações ---- */

const foto = "https://fotos.test/a.jpg";

test("peças: sem variação, o campo não vai para o layout", () => {
  const [p] = normalizarItens([{ nome: "Brinco", precoVenda: 89.9, fotoUrl: foto }]);
  assert.equal(p.nome, "Brinco");
  assert.equal(p.variacoes, null);
  assert.equal(p.fotos, null);
});

test("peças: muitas variações ficam nos limites (3 grupos, 20 opções) sem quebrar", () => {
  const grupos = Array.from({ length: 6 }, (_, g) => ({
    nome: `Grupo ${g}`,
    opcoes: Array.from({ length: 40 }, (_, o) => `Opção ${o}`),
  }));
  const [p] = normalizarItens([{ nome: "Colar", precoVenda: 120, fotoUrl: foto, variacoes: grupos }]);
  assert.equal(p.variacoes!.length, MAX_GRUPOS_VARIACAO);
  for (const v of p.variacoes!) assert.equal(v.opcoes.length, MAX_OPCOES_VARIACAO);
});

test("peças: nome longo de grupo e de opção são cortados nos limites; repetição e vazio saem", () => {
  const vars = normalizarVariacoes([
    { nome: "x".repeat(80), opcoes: ["y".repeat(100), "  ", "y".repeat(100)] },
    { nome: "X".repeat(80), opcoes: ["a"] },
    { nome: "Cor", opcoes: [] },
    { nome: "", opcoes: ["a"] },
    { nome: "Tamanho", opcoes: ["P", "P", "M"] },
  ]);
  assert.equal(vars.length, 2);
  assert.equal(vars[0].nome.length, MAX_NOME_VARIACAO);
  assert.deepEqual(vars[0].opcoes.map((o) => o.length), [MAX_OPCAO_VARIACAO]);
  assert.deepEqual(vars[1], { nome: "Tamanho", opcoes: ["P", "M"] });
});

test("peças: nome longo da peça fica inteiro (o CSS quebra); peça sem nome, foto ou preço sai", () => {
  const nome = "Pulseira riviera com zircônias cravejadas em banho de ouro 18k e fecho reforçado".repeat(2);
  const itens = normalizarItens([
    { nome, precoVenda: 1, fotoUrl: foto },
    { nome: "Sem foto", precoVenda: 1, fotoUrl: "" },
    { nome: "Foto http", precoVenda: 1, fotoUrl: "http://x.test/a.png" },
    { nome: "Sem preço", fotoUrl: foto },
    { nome: "", precoVenda: 1, fotoUrl: foto },
    null,
    "texto",
  ]);
  assert.equal(itens.length, 1);
  assert.equal(itens[0].nome, nome);
  assert.deepEqual(normalizarItens("nada"), []);
});

/* ---- contraste ---- */

test("contraste: a cor da marca só vira texto quando lê bem; senão, a tinta da página", () => {
  const fundo = "#FCFBF9";
  assert.equal(corDeTextoLegivel("#1F2937", fundo), "#1F2937", "escuro sobre claro passa");
  assert.equal(corDeTextoLegivel("#F5C6D0", fundo), "#18181B", "rosa claro sobre claro cai na tinta");
  assert.ok(contraste("#000000", "#FFFFFF") > 20);
  assert.equal(tintaSobre("#1F2937"), "#FCFBF9", "fundo escuro pede texto claro");
  assert.equal(tintaSobre("#F5C6D0"), "#18181B", "fundo claro pede texto escuro");
  assert.equal(corOuReserva("b76e79", "#000000"), "#B76E79");
  assert.equal(corOuReserva("vermelho", "#000000"), "#000000");
  assert.equal(corOuReserva("#FA0", "#000000"), "#FFAA00");
});

/* ---- exemplo ---- */

test("exemplo: peças fixas, sem preço real, com os casos de sem variação, com variações e nome longo", () => {
  const pecas = pecasDeExemplo("#B76E79");
  assert.ok(pecas.length >= 4);
  assert.ok(pecas.every((p) => p.precoVenda === 0 && /exemplo/i.test(p.nome)));
  assert.ok(pecas.every((p) => p.fotoUrl.startsWith("data:image/svg+xml,")), "imagem desenhada, nunca foto de loja");
  assert.ok(pecas.some((p) => !p.variacoes));
  assert.ok(pecas.some((p) => (p.variacoes?.length ?? 0) >= 2));
  assert.ok(pecas.some((p) => p.nome.length > 40));
  assert.equal(normalizarItens(pecas).length, pecas.length, "as peças de exemplo passam pela mesma normalização");
  assert.match(COLECAO_DE_EXEMPLO, /exemplo/i);
  // Cor inválida não quebra a imagem.
  assert.ok(pecasDeExemplo("")[0].fotoUrl.includes("svg"));
});
