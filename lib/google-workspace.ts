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

/** Linha única do caderno de fornecedores no plano: onde ele fica (WhatsApp) e
 *  para onde pode ser espelhado (Google ou Notion). Antes eram duas linhas, uma
 *  do caderno e outra do espelho, e o card repetia a mesma feature
 *  (Maurício, 2026-10-22). */
export const PLANO_GOOGLE =
  "Caderno de fornecedores validados, salvo e consultável no WhatsApp e, se " +
  "você quiser, também no seu Google (planilha) ou no seu Notion (base)";

/**
 * O que a lojista autoriza, dito sem enfeite, antes de clicar em conectar.
 *
 * ⚠️ 2026-09-30 — o escopo `email` FOI REMOVIDO do app (`auth/oauth.py`), a
 * pedido do Maurício: *"lembra que nao iremos ter o escopo de email mais"*.
 * Antes disso a frase precisava declarar que o endereço da conta era recebido,
 * porque "não acessa seu Gmail" com o escopo `email` ativo podia ser lido como
 * falso pelo revisor do Google. Agora a mila recebe só o identificador da conta
 * (openid) — então a negação é limpa e não precisa de ressalva.
 */
export const GOOGLE_ESCOPO_NOTA =
  "A mila cria e mantém a planilha do seu caderno de fornecedores. Ela não abre " +
  "nem lista seus outros arquivos do Drive, não recebe nem lê seu e-mail e não " +
  "acessa sua agenda ou seu calendário. Da conta Google ela recebe um " +
  "identificador que registra a conexão — a tela não mostra o endereço da conta.";

/**
 * Passo que a lojista precisa fazer na tela do Google, mostrado acima do botão.
 *
 * A tela de consentimento do Google lista o Drive com uma caixa que vem
 * DESMARCADA. Quem toca em Continuar sem marcar conecta sem o `drive.file`, e a
 * mila não cria a planilha (o Eve recusa essa conexão com
 * `permissao_drive_faltando`). A caixa é descrita pelo ícone, não pelo texto
 * do Google: a tela segue o idioma da conta e pode vir em inglês.
 */
export const GOOGLE_PASSO_CAIXA =
  "na tela do Google, marque a caixa ao lado do ícone do Drive antes de tocar " +
  "em Continuar. Ela vem desmarcada, e sem ela a mila não consegue criar a planilha.";
