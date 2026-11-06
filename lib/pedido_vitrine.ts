/**
 * Sacola da vitrine web: monta o total e a mensagem do pedido que a lojista
 * recebe pelo WhatsApp. Não processa pagamento: o pedido só vira venda quando
 * a lojista confirma disponibilidade, pagamento e entrega com a cliente.
 */

export type ModoEntrega = "retirada" | "entrega" | "combinar";

export interface ItemSacola {
  nome: string;
  precoVenda: number;
  sku?: string | null;
  qtd: number;
  /** Escolhas da cliente, já descritas (ex.: "Tamanho 16 · Cor Dourado"). */
  variacao?: string | null;
}

/** Variação que a lojista cadastrou para a peça (ex.: Cor: Dourado, Prata). */
export interface VariacaoPeca {
  nome: string;
  opcoes: string[];
}

/** Escolha da cliente em cada variação, na ordem da peça. */
export type Escolhas = Record<string, string>;

/** Só as variações bem formadas (nome e ao menos uma opção). */
export function variacoesValidas(variacoes: unknown): VariacaoPeca[] {
  if (!Array.isArray(variacoes)) return [];
  return variacoes.flatMap((v) => {
    const nome = typeof v?.nome === "string" ? v.nome.trim() : "";
    const opcoes = Array.isArray(v?.opcoes) ? v.opcoes.filter((o: unknown): o is string => typeof o === "string" && !!o.trim()) : [];
    return nome && opcoes.length ? [{ nome, opcoes }] : [];
  });
}

/** Qual variação ainda falta escolher (null quando já dá para pôr no pedido). */
export function variacaoFaltando(variacoes: readonly VariacaoPeca[], escolhas: Escolhas): string | null {
  return variacoes.find((v) => !v.opcoes.includes(escolhas[v.nome] ?? ""))?.nome ?? null;
}

/** "Tamanho 16 · Cor Dourado", na ordem das variações da peça. */
export function descreverEscolhas(variacoes: readonly VariacaoPeca[], escolhas: Escolhas): string | null {
  const partes = variacoes.filter((v) => escolhas[v.nome]).map((v) => `${v.nome} ${escolhas[v.nome]}`);
  return partes.length ? partes.join(" · ") : null;
}

/** Linha da sacola: a mesma peça com escolhas diferentes é outra linha. */
export function chaveLinha(indicePeca: number, variacoes: readonly VariacaoPeca[], escolhas: Escolhas): string {
  return [String(indicePeca), ...variacoes.map((v) => escolhas[v.nome] ?? "")].join("|");
}

export const ROTULO_ENTREGA: Record<ModoEntrega, string> = {
  retirada: "Retirar na loja",
  entrega: "Receber em casa",
  combinar: "A combinar no chat",
};

const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código curto do pedido (ex.: PED-K7QM). Aleatório, só para a conversa. */
export function gerarCodigoPedido(aleatorio: () => number = Math.random): string {
  let sufixo = "";
  for (let i = 0; i < 4; i++) {
    sufixo += ALFABETO_CODIGO[Math.floor(aleatorio() * ALFABETO_CODIGO.length)];
  }
  return `PED-${sufixo}`;
}

export function totalSacola(itens: readonly ItemSacola[]): number {
  return itens.reduce((soma, item) => soma + item.precoVenda * item.qtd, 0);
}

export function quantidadeSacola(itens: readonly ItemSacola[]): number {
  return itens.reduce((soma, item) => soma + item.qtd, 0);
}

export interface OpcoesMensagem {
  nomeLoja: string;
  codigo: string;
  itens: readonly ItemSacola[];
  formatarPreco: (valor: number) => string;
  nomeCliente?: string;
  entrega: ModoEntrega;
  observacao?: string;
}

/** Texto do pedido, no mesmo formato que a lojista recebe no WhatsApp. */
export function montarMensagemPedido(opcoes: OpcoesMensagem): string {
  const { nomeLoja, codigo, itens, formatarPreco, nomeCliente, entrega, observacao } = opcoes;
  const linhas: string[] = [];

  linhas.push(`Oi, ${nomeLoja}! Montei este pedido pelo catálogo:`, "");
  linhas.push(`*Pedido ${codigo}*`, "");

  itens.forEach((item, i) => {
    const ref = item.sku ? ` · Ref ${item.sku}` : "";
    const variacao = item.variacao ? ` (${item.variacao})` : "";
    linhas.push(`${i + 1}) ${item.nome}${variacao}${ref}`);
    linhas.push(`   ${item.qtd} × ${formatarPreco(item.precoVenda)} = ${formatarPreco(item.precoVenda * item.qtd)}`);
    linhas.push("");
  });

  linhas.push(`*Total: ${formatarPreco(totalSacola(itens))}*`);
  linhas.push(`Recebimento: ${ROTULO_ENTREGA[entrega]}`);
  if (nomeCliente?.trim()) linhas.push(`Para: ${nomeCliente.trim()}`);
  if (observacao?.trim()) linhas.push(`Recado: ${observacao.trim()}`);
  linhas.push("", `_Preços de tabela. ${nomeLoja} confirma estoque e pagamento antes de fechar._`);

  return linhas.join("\n");
}
