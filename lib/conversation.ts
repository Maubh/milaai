import { brl, calculatePrice, defaultInputs } from "@/lib/pricing";

export interface ChatLine {
  from: "lojista" | "socia";
  text: string;
}

export interface ScriptedPrompt {
  id: string;
  short: string;
  question: string;
  reply: ChatLine[];
}

const BASE = defaultInputs();
const RAIO = calculatePrice(BASE);
const CUSTO_DIRETO = BASE.custoPeca + BASE.embalagem + BASE.rateio;

const RAIO_LINES: ChatLine[] = [
  { from: "lojista", text: "Quanto devo cobrar por esta peça?" },
  {
    from: "socia",
    text: `Vamos ao Raio-X, com números de exemplo: custo ${brl(BASE.custoPeca)}, embalagem ${brl(BASE.embalagem)}, rateio ${brl(BASE.rateio)} — custo direto de ${brl(CUSTO_DIRETO)} por peça.`,
  },
  {
    from: "socia",
    text: `Com taxa de ${BASE.taxaPagamento}% e imposto de ${BASE.imposto}%, o preço sugerido fica ${brl(RAIO.precoSugerido)} e você mantém ${brl(RAIO.margemReais)} de margem (${Math.round(BASE.margemDesejada)}%) por peça.`,
  },
  {
    from: "socia",
    text: "Quer ajustar? Me diga um novo custo ou margem que eu recalculo aqui na conversa. Tudo com dados de exemplo — nada é enviado para fora deste navegador.",
  },
];

export const SCRIPTED_PROMPTS: ScriptedPrompt[] = [
  {
    id: "preco",
    short: "Quanto devo cobrar por esta peça?",
    question: "Quanto devo cobrar por esta peça?",
    reply: RAIO_LINES,
  },
  {
    id: "nota",
    short: "O que faço com esta nota fiscal?",
    question: "O que faço com esta nota fiscal?",
    reply: [
      { from: "lojista", text: "O que faço com esta nota fiscal?" },
      {
        from: "socia",
        text: "Na versão final eu leria sua NF-e (XML ou PDF) e separaria custo da peça, embalagem e rateio automaticamente. Por enquanto, sem leitura real: me diga os três valores que eu monto o Raio-X com eles.",
      },
      {
        from: "socia",
        text: `Exemplo com os números de demonstração: custo ${brl(BASE.custoPeca)} + embalagem ${brl(BASE.embalagem)} + rateio ${brl(BASE.rateio)} = ${brl(CUSTO_DIRETO)} de custo direto, preço sugerido de ${brl(RAIO.precoSugerido)}.`,
      },
    ],
  },
  {
    id: "legenda",
    short: "Crie uma legenda para esta peça",
    question: "Crie uma legenda para esta peça",
    reply: [
      { from: "lojista", text: "Crie uma legenda para esta peça" },
      {
        from: "socia",
        text: "Aqui vai um rascunho demonstrativo para adaptar ao seu tom — não é geração automática conectada a nenhum serviço:",
      },
      {
        from: "socia",
        text: "“O Brinco Onda acompanha você do almoço ao jantar sem pesar. Banho dourado, fecho seguro e aquele brilho que parece feito sob medida. Chame no direct para garantir o seu.”",
      },
      {
        from: "socia",
        text: "Quer outra versão? Me diga o nome da peça e para quem ela é que eu preparo uma variação de exemplo.",
      },
    ],
  },
  {
    id: "integracao",
    short: "Como conecto meu Bling?",
    question: "Como conecto meu Bling?",
    reply: [
      { from: "lojista", text: "Como conecto meu Bling?" },
      {
        from: "socia",
        text: "Quando a integração existir, eu te mando um link direto de autorização aqui na conversa. Por enquanto é demonstração — abra a tela de transição para ver como ficaria:",
      },
    ],
  },
];

export const HERO_EXCHANGE: ChatLine[] = [
  { from: "lojista", text: "Oi, sócia! Quanto devo cobrar nesse brinco?" },
  {
    from: "socia",
    text: `Raio-X com números de exemplo: custo direto de ${brl(CUSTO_DIRETO)} por peça. Preço sugerido ${brl(RAIO.precoSugerido)}, margem de ${brl(RAIO.margemReais)} por peça.`,
  },
  {
    from: "socia",
    text: "Me manda a próxima peça ou pergunta que eu respondo aqui mesmo — tudo simulado, nenhuma mensagem sai deste navegador.",
  },
];
