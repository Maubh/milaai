import { GOOGLE_DESC } from "@/lib/google-workspace";
import { NOTION_DESC } from "@/lib/notion";

export type Integracao = {
  /** slug da rota /integrations/[app] */
  id: string;
  nome: string;
  /** status curto no estilo Instinct — vai entre parênteses no nome */
  status: string;
  desc: string;
};

/**
 * Conectores da área logada. Parêntese = status/variante (Instinct), não a descrição.
 *
 * O Google e o Notion importam a descrição de `lib/google-workspace.ts` e
 * `lib/notion.ts`: era aqui que as duas versões divergiam da tela de conexão.
 */
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
    id: "nuvemshop",
    nome: "Nuvemshop",
    status: "disponível",
    desc: "Cadastre produtos com foto, descrição e preço na sua loja virtual em 1 clique pelo WhatsApp.",
  },
  {
    id: "google",
    nome: "Google Workspace",
    status: "disponível",
    desc: GOOGLE_DESC,
  },
  {
    id: "notion",
    nome: "Notion",
    status: "disponível",
    desc: NOTION_DESC,
  },
  {
    id: "meta",
    nome: "Meta",
    status: "disponível",
    desc: "Sincronize as peças e fotos da loja diretamente com o seu catálogo de produtos no Facebook e Instagram.",
  },
  {
    id: "trello",
    nome: "Trello",
    status: "disponível",
    desc: "Organize a rotina e as atividades da sua loja em quadros e cards pelo WhatsApp.",
  },
];
