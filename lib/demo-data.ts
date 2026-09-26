export interface PecaExemplo {
  id: string;
  nome: string;
  categoria: string;
  custoPeca: number;
  embalagem: number;
  rateio: number;
  legenda: string;
}

export const PECAS: PecaExemplo[] = [
  {
    id: "brinco-onda",
    nome: "Brinco Onda",
    categoria: "Semijoia · exemplo",
    custoPeca: 48,
    embalagem: 6.5,
    rateio: 9,
    legenda:
      "Exemplo de legenda: o Brinco Onda acompanha você do almoço ao jantar sem pesar. Banho dourado, fecho seguro e aquele brilho que parece feito sob medida. Chame no direct para garantir o seu.",
  },
  {
    id: "colar-corrente",
    nome: "Colar Corrente Fina",
    categoria: "Semijoia · exemplo",
    custoPeca: 62,
    embalagem: 7,
    rateio: 11,
    legenda:
      "Exemplo de legenda: corrente fina para usar sozinha ou em mix. regulagem em três alturas e acabamento que não escurece com o uso do dia a dia. Peça para presente — vai em caixinha pronta.",
  },
  {
    id: "anel-liso",
    nome: "Anel Liso Dourado",
    categoria: "Semijoia · exemplo",
    custoPeca: 35,
    embalagem: 5,
    rateio: 8,
    legenda:
      "Exemplo de legenda: o anel que combina com todos os outros. Liso, confortável e com presença na medida. Numeração do 14 ao 22 — me conta o seu que eu separo.",
  },
];

export const CUSTOS_BASE = {
  taxaPagamento: 4.5,
  imposto: 6,
  margemDesejada: 45,
};

export const INTEGRACOES = [
  { nome: "Jueri", desc: "Gestão especializada de joias e semijoias, consignados, estoque e custos.", estado: "Disponível em breve" },
  { nome: "Bling", desc: "Trazer notas, estoque e custos sem digitar tudo de novo.", estado: "Disponível em breve" },
  { nome: "Olist", desc: "Mesma ideia: estoque e custos organizados por peça.", estado: "Disponível em breve" },
  { nome: "Google", desc: "Gmail, Calendar, Tasks, Drive, Docs, Sheets e Slides — lado a lado com o preço.", estado: "Previsto" },
  { nome: "Notion", desc: "Catálogo e diretrizes de marca num só lugar.", estado: "Previsto" },
];
