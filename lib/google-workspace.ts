/**
 * O que a mila REALMENTE faz na suíte do Google — fonte única da verdade.
 *
 * Por que este arquivo existe: o site anunciava "Gmail, Agenda, Tarefas, Drive,
 * Documentos, Planilhas e Apresentações" no plano Essencial, e o produto não
 * fazia quase nada disso. O código pede UM escopo de dados do Google:
 * `auth/drive.file` (ver `auth/oauth.py`). Com ele a mila:
 *
 *   - CRIA a planilha do caderno de fornecedores no Drive da lojista e escreve
 *     nela (`mila_router/sheets_client.py`, via `sheets.googleapis.com/v4`);
 *   - lê/escreve SÓ os arquivos que ela mesma criou ou que a lojista escolheu
 *     pela tela. Ela NÃO enxerga o Drive inteiro.
 *
 * O que ficou de fora, e por quê:
 *   - Gmail — a mila não lê nem envia e-mail (decisão do Maurício, 2026-09-29);
 *   - Agenda (Calendar) — escopo SENSÍVEL, exigiria verificação do Google, e
 *     não existe nenhuma linha do produto usando a Calendar API;
 *   - Tarefas, Documentos e Apresentações — nada no produto usa.
 *
 * ⚠️ Mexeu aqui? O teste `tests/google-suite.test.ts` quebra se a lista passar a
 * prometer o que o produto não entrega. É de propósito.
 */

export interface FerramentaGoogle {
  /** slug usado no nome do asset em /public/integrations */
  slug: string;
  /** nome como a lojista lê no app do Google */
  nome: string;
  /** ícone oficial (baixado do gstatic do Google), 96×96 */
  icone: string;
  /** o que a mila faz com essa ferramenta, em uma linha */
  uso: string;
}

export const FERRAMENTAS_GOOGLE: readonly FerramentaGoogle[] = [
  {
    slug: "drive",
    nome: "Drive",
    icone: "/integrations/google-drive.png",
    uso: "guarda os arquivos que a mila cria para você",
  },
  {
    slug: "sheets",
    nome: "Planilhas",
    icone: "/integrations/google-sheets.png",
    uso: "o caderno de fornecedores vira uma planilha que abre no seu celular",
  },
] as const;

/** Resumo curto para título/lista: "Drive e Planilhas". */
export const GOOGLE_RESUMO = "Drive e Planilhas";

/** Descrição de uma linha, para a lista de integrações da área logada. */
export const GOOGLE_DESC =
  "Drive e Planilhas — o caderno de fornecedores vira uma planilha no seu Google. " +
  "A mila cria e mantém o arquivo; ela não enxerga o resto do seu Drive.";

/**
 * O caderno tem DOIS destinos possíveis — a lojista escolhe, e a mila pergunta
 * uma vez e lembra. Fica num só lugar para as duas telas dizerem a mesma coisa
 * (o Maurício apontou a inconsistência em 2026-09-29).
 */
export const CADERNO_DESTINOS = "planilha do Google ou no seu Notion";
