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
    id: "anel-aurora",
    nome: "Anel Aurora",
    categoria: "Joia em prata 925 · exemplo fictício",
    custoPeca: 280,
    embalagem: 18,
    rateio: 32,
    legenda:
      "Exemplo fictício de legenda: Anel Aurora em prata 925, com linhas suaves e acabamento polido. Uma peça para acompanhar momentos especiais e o dia a dia. Confirme material, medidas e disponibilidade antes de publicar.",
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
    status: "disponível",
    desc: "Gestão especializada de joias e semijoias, consignados, estoque e custos.",
  },
  {
    id: "bling",
    nome: "Bling",
    status: "disponível",
    desc: "Trazer notas, estoque e custos sem digitar tudo de novo.",
  },
  {
    id: "olist",
    nome: "Olist",
    status: "disponível",
    desc: "Mesma ideia: estoque e custos organizados por peça.",
  },
  {
    id: "google",
    nome: "Google Workspace",
    status: "disponível",
    desc: "Drive e Planilhas — o caderno de fornecedores vira uma planilha no seu Google. A mila cria e mantém o arquivo.",
  },
  {
    id: "notion",
    nome: "Notion",
    status: "disponível",
    desc: "Bases de dados — o caderno de fornecedores e as notas de compra viram bases no seu Notion. Você escolhe onde guardar o caderno: no Notion ou na planilha do Google.",
  },
];
