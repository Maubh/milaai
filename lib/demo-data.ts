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

export type Integracao = {
  /** slug da rota /integrations/[app] */
  id: string;
  nome: string;
  /** status curto no estilo Instinct — vai entre parênteses no nome */
  status: string;
  desc: string;
};

/** Conectores da área logada. Parêntese = status/variante (Instinct), não a descrição. */
export const INTEGRACOES: Integracao[] = [
  {
    id: "jueri",
    nome: "Jueri",
    status: "em breve",
    desc: "Gestão especializada de joias e semijoias, consignados, estoque e custos.",
  },
  {
    id: "bling",
    nome: "Bling",
    status: "em breve",
    desc: "Trazer notas, estoque e custos sem digitar tudo de novo.",
  },
  {
    id: "olist",
    nome: "Olist",
    status: "em breve",
    desc: "Mesma ideia: estoque e custos organizados por peça.",
  },
  {
    id: "google",
    nome: "Google Workspace",
    status: "em breve",
    desc: "Gmail, Agenda, Tarefas, Drive, Documentos, Planilhas e Apresentações — lado a lado com o preço.",
  },
  {
    id: "notion",
    nome: "Notion",
    status: "em breve",
    desc: "Documentos, Wiki, Páginas e Databases — o espaço da marca com a mila.",
  },
];
