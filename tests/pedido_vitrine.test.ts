import test from "node:test";
import assert from "node:assert/strict";
import {
  gerarCodigoPedido,
  montarMensagemPedido,
  quantidadeSacola,
  totalSacola,
  type ItemSacola,
} from "../lib/pedido_vitrine.ts";

const formatarPreco = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const sacola: ItemSacola[] = [
  { nome: "Macaquinho Pulse", precoVenda: 289.9, sku: "M04-MAR", qtd: 1 },
  { nome: "Conjunto Hype", precoVenda: 378, qtd: 2 },
];

test("total e quantidade somam quantidade × preço", () => {
  assert.equal(totalSacola(sacola), 289.9 + 378 * 2);
  assert.equal(quantidadeSacola(sacola), 3);
  assert.equal(totalSacola([]), 0);
});

test("código do pedido tem prefixo e só caracteres do alfabeto", () => {
  const codigo = gerarCodigoPedido(() => 0.5);
  assert.match(codigo, /^PED-[A-Z2-9]{4}$/);
  assert.equal(gerarCodigoPedido(() => 0.5), codigo, "mesmo sorteio, mesmo código");
});

test("mensagem traz itens, quantidades, total, entrega e nome, sem nome vazio", () => {
  const msg = montarMensagemPedido({
    nomeLoja: "Ritrovarsi",
    codigo: "PED-K7QM",
    itens: sacola,
    formatarPreco,
    nomeCliente: "  Ana ",
    entrega: "entrega",
    observacao: "",
  });
  assert.match(msg, /Oi, Ritrovarsi! Montei este pedido pelo catálogo:/);
  assert.match(msg, /\*Pedido PED-K7QM\*/);
  assert.match(msg, /1\) Macaquinho Pulse/);
  assert.match(msg, /1 × R\$\s289,90 = R\$\s289,90/);
  assert.match(msg, /2 × R\$\s378,00 = R\$\s756,00/);
  assert.match(msg, /\*Total: R\$\s1\.045,90\*/);
  assert.match(msg, /Recebimento: Receber em casa/);
  assert.match(msg, /Para: Ana/);
  assert.doesNotMatch(msg, /Recado:/);
  assert.match(msg, /confirma estoque e pagamento antes de fechar\._$/);
});

test("retirada sem nome nem observação não gera linhas vazias de rótulo", () => {
  const msg = montarMensagemPedido({
    nomeLoja: "Loja",
    codigo: "PED-AAAA",
    itens: [{ nome: "Blusa", precoVenda: 169.9, qtd: 1 }],
    formatarPreco,
    entrega: "retirada",
    nomeCliente: "   ",
  });
  assert.match(msg, /Recebimento: Retirar na loja/);
  assert.doesNotMatch(msg, /Para:/);
});

test("variações: falta escolher, descrição e linha separada por escolha", async () => {
  const { variacoesValidas, variacaoFaltando, descreverEscolhas, chaveLinha } = await import("../lib/pedido_vitrine.ts");
  const vars = variacoesValidas([
    { nome: "Tamanho", opcoes: ["16", "18"] },
    { nome: "Cor", opcoes: ["Dourado", "Prata"] },
    { nome: "", opcoes: ["x"] },
    { nome: "Vazia", opcoes: [] },
    "lixo",
  ]);
  assert.deepEqual(vars.map((v) => v.nome), ["Tamanho", "Cor"], "só as bem formadas");
  assert.equal(variacaoFaltando(vars, {}), "Tamanho");
  assert.equal(variacaoFaltando(vars, { Tamanho: "16" }), "Cor");
  assert.equal(variacaoFaltando(vars, { Tamanho: "16", Cor: "Azul" }), "Cor", "opção que não existe não vale");
  assert.equal(variacaoFaltando(vars, { Tamanho: "16", Cor: "Prata" }), null);
  assert.equal(descreverEscolhas(vars, { Cor: "Prata", Tamanho: "16" }), "Tamanho 16 · Cor Prata");
  assert.equal(descreverEscolhas([], {}), null);
  assert.notEqual(chaveLinha(0, vars, { Tamanho: "16", Cor: "Prata" }), chaveLinha(0, vars, { Tamanho: "18", Cor: "Prata" }));
  assert.equal(chaveLinha(2, [], {}), "2");
});

test("mensagem mostra a variação escolhida de cada linha", () => {
  const msg = montarMensagemPedido({
    nomeLoja: "Loja",
    codigo: "PED-AAAA",
    itens: [
      { nome: "Anel Solar", precoVenda: 189, qtd: 1, variacao: "Tamanho 16 · Cor Prata" },
      { nome: "Anel Solar", precoVenda: 189, qtd: 2, variacao: "Tamanho 18 · Cor Prata" },
    ],
    formatarPreco,
    entrega: "combinar",
  });
  assert.match(msg, /1\) Anel Solar \(Tamanho 16 · Cor Prata\)/);
  assert.match(msg, /2\) Anel Solar \(Tamanho 18 · Cor Prata\)/);
});
