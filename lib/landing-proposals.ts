/**
 * Prévias da página inicial (`/propostas/a` e `/propostas/b`).
 *
 * Módulo puro (sem `next/*` nem React): a copy compartilhada pelas duas
 * propostas — a rotina da loja, como a conversa ajuda, a oferta, as
 * integrações que a página pública pode afirmar, as dúvidas e os metadados.
 * A única demonstração de produto nas páginas é o mockup do iPhone da landing
 * atual; aqui só há texto editorial, nenhuma interface simulada.
 */

import { PLANO_GOOGLE } from "./google-workspace.ts";
import { CONECTORES_NAO_PRONTOs } from "./legal.ts";

// ─────────────────────────────────────────── posicionamento

export const TITULO_A = "Sua assistente pessoal para o dia a dia da loja. No WhatsApp.";
export const TITULO_B = "A rotina da loja ganha uma assistente pessoal no WhatsApp.";

export const LEAD_A =
  "Chegou mercadoria, tem uma peça para cadastrar ou precisa preparar uma descrição? Converse com a mila. " +
  "Ela é uma assistente de IA para lojistas de joias e semijoias: ajuda com as tarefas da loja e trabalha com " +
  "as ferramentas que você já usa, conforme as integrações conectadas.";
export const LEAD_B =
  "A mila. é uma assistente de IA para lojistas de joias e semijoias. Você conta o que precisa, como contaria " +
  "para alguém da equipe, e ela ajuda a organizar e preparar, com as ferramentas que a sua loja já conectou.";

export const LEGENDA_MOCKUP = "Conversa de demonstração, em loop. Exemplo ilustrativo.";

// ─────────────────────────────────────────── rotina (texto editorial, não interface)

export type NivelRotina = "ambos" | "pro";

export interface Tarefa {
  id: "mercadoria" | "peca" | "preco" | "fornecedores" | "instagram" | "ferramentas";
  titulo: string;
  texto: string;
  /** Versão em uma frase, para a proposta B. */
  frase: string;
  nivel: NivelRotina;
}

export const ROTINA: readonly Tarefa[] = [
  {
    id: "mercadoria",
    titulo: "Chegou mercadoria",
    texto:
      "Mande a nota de compra em XML ou PDF. A mila lê os itens, as quantidades e os valores, e você confere tudo ali mesmo, sem digitar de novo.",
    frase: "Quando chega mercadoria, ela lê a nota de compra em XML ou PDF e organiza itens, quantidades e valores.",
    nivel: "ambos",
  },
  {
    id: "peca",
    titulo: "Uma peça nova para vender",
    texto:
      "Mande a foto e os detalhes. A mila prepara a descrição técnica para a loja virtual e, no Pro, pode cadastrar a peça no Jueri, no Olist ou na Nuvemshop que você conectou e autorizou. Você pede pela conversa.",
    frase:
      "Quando entra uma peça nova, ela escreve a descrição técnica e, no Pro, pode cadastrar a peça no Jueri, no Olist ou na Nuvemshop que você conectou e autorizou, quando você pede.",
    nivel: "ambos",
  },
  {
    id: "preco",
    titulo: "Antes de definir o preço",
    texto:
      "Ela faz a conta com o custo da peça e com a taxa e a embalagem que a loja já informou, mostra a margem e consulta preços parecidos no radar do Google Shopping.",
    frase: "Antes de definir o preço, ela faz a conta com os custos da loja e consulta preços parecidos no Google Shopping.",
    nivel: "ambos",
  },
  {
    id: "fornecedores",
    titulo: "Fornecedores à mão",
    texto:
      "O caderno de fornecedores fica salvo e consultável no WhatsApp. Se quiser, ele ganha um espelho numa planilha do Google ou numa base do Notion.",
    frase: "Quando você precisa de um fornecedor, o caderno da loja está ali, consultável pela conversa.",
    nivel: "ambos",
  },
  {
    id: "instagram",
    titulo: "Conteúdo para o Instagram",
    texto: "Ela sugere legendas, carrosséis, ideias de Reels e um planejamento semanal. Quem revisa e publica é você.",
    frase: "Quando falta ideia para o Instagram, ela sugere legendas, carrosséis, Reels e um planejamento da semana.",
    nivel: "pro",
  },
  {
    id: "ferramentas",
    titulo: "Estoque e vendas nas ferramentas da loja",
    texto:
      "Com a sua autorização, ela consulta e grava no Jueri, no Olist e na Nuvemshop, faz o balanço mensal de compras e avisa antes de vencer a carência de um fornecedor.",
    frase: "Quando o estoque está em outra ferramenta, ela consulta e grava ali, com a sua autorização.",
    nivel: "pro",
  },
];

// ─────────────────────────────────────────── como a conversa ajuda

export const COMO_AJUDA: readonly { titulo: string; texto: string }[] = [
  {
    titulo: "Do seu jeito de escrever",
    texto: "Mande uma mensagem, foto ou nota de compra, como faria com alguém da equipe. A resposta chega na mesma conversa.",
  },
  {
    titulo: "Com o que a loja já contou",
    texto:
      "Taxa do cartão, custo de embalagem, tipo de banho e outros dados da loja ficam guardados e entram nas próximas respostas. Você corrige quando algo mudar.",
  },
  {
    titulo: "Com as ferramentas conectadas",
    texto:
      "Quando uma integração está conectada e o plano permite, ela consulta e grava nela em nome da loja, só depois de conferir a credencial.",
  },
];

export const NOTA_PAINEL =
  "Para administrar os dados da loja, as conexões e o plano, há um painel web simples. O dia a dia continua na conversa.";

// ─────────────────────────────────────────── oferta (mesmos limites de components/PricingSection.tsx)

export const PLANO_ERP_PROPOSTA =
  "Integração direta com ERP (Jueri e Olist disponíveis; planilha pronta para importar na Phibo; " +
  CONECTORES_NAO_PRONTOs.join(" e ") +
  " ainda não)";

export const PLANO_VITRINE_ESSENCIAL_PROPOSTA =
  "Vitrine web interativa (1 ativa por vez) e até 2 catálogos em PDF/mês com fotos reais";
export const PLANO_VITRINE_PRO_PROPOSTA = "Vitrines web ilimitadas e catálogos em PDF ilimitados com fotos reais";
export const PLANO_NUVEMSHOP_PRO_PROPOSTA =
  "Integração com Nuvemshop: consulta de estoque, preços e publicação de produtos direto no WhatsApp";
export const PLANO_INSTAGRAM_PROPOSTA =
  "Conteúdo para Instagram: legendas, carrosséis, ideias de Reels e planejamento semanal";

export type Nivel = "ambos" | "essencial" | "pro";

export interface Recurso {
  texto: string;
  /** "ambos": Essencial e Pro; "essencial": a versão com limite do Essencial; "pro": só no Pro. */
  nivel: Nivel;
}

export const RECURSOS: readonly Recurso[] = [
  { texto: "Precificação ilimitada com Raio-X e margem real", nivel: "ambos" },
  { texto: "Radar de concorrentes no Google Shopping", nivel: "ambos" },
  { texto: "Descrições técnicas prontas para loja virtual", nivel: "ambos" },
  { texto: "Caderno de fornecedores validados no WhatsApp", nivel: "ambos" },
  { texto: "Leitor de notas fiscais de compra (XML e PDF)", nivel: "ambos" },
  { texto: PLANO_GOOGLE, nivel: "ambos" },
  { texto: PLANO_VITRINE_ESSENCIAL_PROPOSTA, nivel: "essencial" },
  { texto: PLANO_VITRINE_PRO_PROPOSTA, nivel: "pro" },
  { texto: PLANO_NUVEMSHOP_PRO_PROPOSTA, nivel: "pro" },
  { texto: "Balanço mensal de compras e projeção de faturamento no WhatsApp", nivel: "pro" },
  { texto: "Alertas ativos de carência de fornecedores (aviso antes de perder pedido sem mínimo)", nivel: "pro" },
  { texto: PLANO_ERP_PROPOSTA, nivel: "pro" },
  { texto: PLANO_INSTAGRAM_PROPOSTA, nivel: "pro" },
];

export interface Plano {
  id: "essencial" | "pro";
  nome: string;
  preco: string;
  periodo: string;
  resumo: string;
  recursos: readonly string[];
}

const doNivel = (...niveis: Nivel[]) => RECURSOS.filter((r) => niveis.includes(r.nivel)).map((r) => r.texto);

export const PLANOS: readonly Plano[] = [
  {
    id: "essencial",
    nome: "Essencial",
    preco: "39",
    periodo: "/mês",
    resumo: "Precificação, margem e descrição de peças desde o primeiro dia",
    recursos: doNivel("ambos", "essencial"),
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "69",
    periodo: "/mês",
    resumo: "Visão contínua de estoque, fornecedores, faturamento e conteúdo",
    recursos: ["Tudo do Essencial", ...doNivel("pro")],
  },
];

export const NOTA_ACESSO = "Acesso piloto, por convite. Você entra com o número de WhatsApp da loja.";
export const NOTA_COBRANCA = "A contratação é feita no painel, por Pix ou cartão.";

// ─────────────────────────────────────────── integrações (o que a página pública pode afirmar)

export const NOTA_NAO_PRONTOS = `${CONECTORES_NAO_PRONTOs.join(" e ")} ainda não está disponível.`;

export interface IntegracaoPublica {
  id: "jueri" | "olist" | "nuvemshop" | "google" | "notion" | "trello";
  nome: string;
  /** Uma linha, para escanear. Google e Notion têm o texto completo da fonte única em "Detalhes". */
  resumo: string;
  nivel: "ambos" | "pro";
  grupo: "fornecedores" | "vendas" | "organizacao";
}

export const INTEGRACOES_PUBLICAS: readonly IntegracaoPublica[] = [
  { id: "jueri", nome: "Jueri", resumo: "Estoque, consignados e custos de joias e semijoias.", nivel: "pro", grupo: "vendas" },
  { id: "olist", nome: "Olist", resumo: "Estoque e custos organizados por peça.", nivel: "pro", grupo: "vendas" },
  {
    id: "nuvemshop",
    nome: "Nuvemshop",
    resumo: "Estoque e preços na conversa; a peça só é publicada quando você pede.",
    nivel: "pro",
    grupo: "vendas",
  },
  {
    id: "google",
    nome: "Google Drive e Planilhas",
    resumo: "Espelho do caderno de fornecedores numa planilha criada pela mila.",
    nivel: "ambos",
    grupo: "fornecedores",
  },
  {
    id: "notion",
    nome: "Notion",
    resumo: "Caderno de fornecedores e notas de compra numa base que você já tem.",
    nivel: "ambos",
    grupo: "fornecedores",
  },
  {
    id: "trello",
    nome: "Trello",
    resumo: "Tarefas, compras e pendências organizadas em cards.",
    nivel: "ambos",
    grupo: "organizacao",
  },
];

export const GRUPOS_INTEGRACAO: readonly { id: IntegracaoPublica["grupo"]; titulo: string; texto: string; nivel: Nivel }[] = [
  {
    id: "fornecedores",
    titulo: "Fornecedores e compras",
    texto: "Onde o caderno e as notas de compra ficam guardados, além da conversa.",
    nivel: "ambos",
  },
  {
    id: "vendas",
    titulo: "Estoque e vendas",
    texto: "As ferramentas onde a loja já controla peças, estoque e loja virtual.",
    nivel: "pro",
  },
  {
    id: "organizacao",
    titulo: "Organização da loja",
    texto: "Tarefas, compras e pendências em um quadro simples.",
    nivel: "ambos",
  },
];

export const NOTA_META =
  "O catálogo do Instagram e Facebook (Meta) aparece só para lojas liberadas e sincroniza depois da sua autorização.";
export const NOTA_CONEXAO =
  "Cada conexão é autorizada por você no painel, e a mila só grava numa ferramenta depois de conferir a credencial.";

export const ROTULO_NIVEL: Record<Nivel, string> = {
  ambos: "Essencial e Pro",
  essencial: "Essencial",
  pro: "Pro",
};

// ─────────────────────────────────────────── dúvidas

export interface Duvida {
  pergunta: string;
  resposta: string;
}

export const DUVIDAS: readonly Duvida[] = [
  {
    pergunta: "O que eu posso pedir para a mila?",
    resposta:
      "Tarefas da rotina da loja: ler uma nota de compra, preparar a descrição de uma peça, fazer a conta de um preço, consultar o caderno de fornecedores e, no Pro, sugerir conteúdo para o Instagram e trabalhar com as ferramentas de estoque e vendas conectadas.",
  },
  {
    pergunta: "Preciso instalar algum aplicativo?",
    resposta:
      "Não. A conversa acontece no WhatsApp que você já usa. O painel web serve só para administrar dados da loja, conexões e plano.",
  },
  {
    pergunta: "Preciso repetir as informações da loja a cada conversa?",
    resposta:
      "Não. Taxa do cartão, embalagem, banho e outros dados ficam guardados e entram nas próximas respostas. Você corrige pela conversa ou pelo painel quando algo mudar.",
  },
  {
    pergunta: "Como eu entro?",
    resposta:
      "Por enquanto o acesso é piloto, por convite. Você entra com o número de WhatsApp da loja e recebe um código. Se o número ainda não tiver convite, a tela de entrada avisa.",
  },
  {
    pergunta: "Qual é a diferença entre o Essencial e o Pro?",
    resposta:
      "O Essencial (R$ 39/mês) tem precificação, descrições, leitura de notas, radar de concorrentes, caderno de fornecedores, 1 vitrine ativa e até 2 catálogos em PDF por mês. O Pro (R$ 69/mês) soma integrações de estoque e vendas, Nuvemshop, vitrines e catálogos ilimitados, balanço mensal, alertas de carência e conteúdo para Instagram.",
  },
  {
    pergunta: "A mila publica ou altera algo sozinha?",
    resposta:
      "Não. Ela só grava em ferramentas que você conectou e autorizou. Na Nuvemshop, a peça é publicada quando você pede na conversa. O catálogo da Meta depende de liberação para a sua loja e da sua autorização.",
  },
  {
    pergunta: "Para onde vai o caderno de fornecedores?",
    resposta:
      "Ele fica salvo e consultável no WhatsApp. Se quiser um espelho, escolha um destino: uma planilha que a mila cria no seu Google Drive ou uma base que já existe no seu Notion. Ela não cria bases no Notion; com ele conectado, também pode gravar ali as peças das notas de compra.",
  },
  {
    pergunta: "A conversa do celular nesta página é real?",
    resposta:
      "É uma demonstração em loop, com peça e valores de exemplo. Na conversa de verdade, a mila usa os dados e as ferramentas da sua loja.",
  },
];

// ─────────────────────────────────────────── metadados das prévias

export function metadataPrevia(caminho: "/propostas" | "/propostas/a" | "/propostas/b", titulo: string, descricao: string) {
  return {
    title: titulo,
    description: descricao,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    openGraph: {
      title: titulo,
      description: descricao,
      url: caminho,
      siteName: "mila.",
      locale: "pt_BR",
      type: "website" as const,
    },
    twitter: { card: "summary" as const, title: titulo, description: descricao },
  };
}

export const META_INDICE = metadataPrevia(
  "/propostas",
  "Prévias da página inicial · mila.",
  "Prévia interna, não publicada: duas propostas de composição para a página inicial da mila.",
);
export const META_A = metadataPrevia(
  "/propostas/a",
  "Prévia A: Perto de você, na loja · mila.",
  "Prévia interna, não publicada, da proposta A para a página inicial da mila., assistente pessoal no WhatsApp para lojistas de joias e semijoias.",
);
export const META_B = metadataPrevia(
  "/propostas/b",
  "Prévia B: A rotina ganha uma assistente · mila.",
  "Prévia interna, não publicada, da proposta B para a página inicial da mila., assistente pessoal no WhatsApp para lojistas de joias e semijoias.",
);
