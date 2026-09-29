/**
 * O que a mila REALMENTE faz na suíte do Google — fonte única da verdade.
 *
 * Por que este arquivo existe: o site anunciava "Gmail, Agenda, Tarefas, Drive,
 * Documentos, Planilhas e Apresentações" no plano Essencial, e o produto não
 * fazia quase nada disso. O código pede UM escopo de dados do Google:
 * `auth/drive.file` (ver `auth/oauth.py`). Com ele a mila:
 *
 *   - CRIA a planilha do caderno de fornecedores no Drive da lojista e escreve
 *     nela (`mila_router/sheets_client.py`, `POST /spreadsheets`);
 *   - lê/escreve SÓ os arquivos que ela mesma criou. Ela NÃO enxerga o Drive
 *     inteiro. Não há seletor de arquivos (Google Picker) no produto — com
 *     `drive.file` a mila não abre nem lista uma planilha que já era da
 *     lojista; ela sempre cria a dela. (Comentário corrigido em 2026-09-29:
 *     antes dizia "ou que a lojista escolheu pela tela", e essa tela não existe.)
 *
 * O que ficou de fora, e por quê:
 *   - Gmail — a mila não lê nem envia e-mail (decisão do Maurício, 2026-09-29);
 *   - Agenda (Calendar) — escopo SENSÍVEL, exigiria verificação do Google, e
 *     não existe nenhuma linha do produto usando a Calendar API;
 *   - Tarefas, Documentos e Apresentações — nada no produto usa.
 *
 * ⚠️ Mexeu aqui? O teste `tests/google-suite.test.ts` quebra se o site prometer
 * o que o produto não entrega. É de propósito.
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
    uso: "é onde fica a planilha do caderno",
  },
  {
    slug: "sheets",
    nome: "Planilhas",
    icone: "/integrations/google-sheets.png",
    uso: "o caderno de fornecedores vira uma planilha que abre no seu celular",
  },
] as const;

/** Título da tela de conexão. Diz O QUE se conecta, não a suíte inteira. */
export const GOOGLE_TITULO = "Conectar Drive e Planilhas";

/**
 * Descrição de uma linha, para a lista de integrações da área logada e a tela
 * de conexão.
 *
 * Fatos que este texto respeita (medidos no produto):
 *   - o Google sempre RECEBE uma planilha criada pela mila (`POST /spreadsheets`);
 *   - o Notion recebe numa base que JÁ EXISTE e a lojista indica — a mila lista
 *     as bases compartilhadas e pergunta qual usar (`listar_bases`); ela NÃO cria
 *     base (`POST /databases` = 0 ocorrências no código);
 *   - as NOTAS DE COMPRA vão só para o Notion (o Google não tem gravador delas);
 *   - sem destino escolhido, o caderno fica salvo e consultável no WhatsApp.
 */
export const GOOGLE_DESC =
  "Drive e Planilhas — se você escolher o Google, a mila cria a planilha do " +
  "caderno de fornecedores no seu Drive e mexe só nela. Sem escolher destino, " +
  "o caderno fica salvo e consultável no WhatsApp.";

/** Título da feature no plano pago. A linha anterior do plano já diz que o
 *  caderno vive no WhatsApp — aqui entra só o espelhamento. */
export const PLANO_GOOGLE =
  "Espelho do caderno de fornecedores no seu Google (planilha) ou no seu Notion " +
  "(base) — se você não escolher, ele fica salvo e consultável no WhatsApp";

/**
 * O que a lojista autoriza, dito sem enfeite, antes de clicar em conectar.
 *
 * O trecho "não acessa seu Gmail nem sua Agenda" é uma NEGAÇÃO honesta e o teste
 * o trata como allowlist — sem isso, o próprio aviso que protege a lojista
 * quebraria a checagem de promessa.
 */
export const GOOGLE_ESCOPO_NOTA =
  "A mila cria e mantém a planilha do seu caderno de fornecedores. Ela não abre " +
  "nem lista seus outros arquivos do Drive, e não acessa seu Gmail nem sua Agenda.";
