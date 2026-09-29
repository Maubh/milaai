/**
 * O que a mila REALMENTE faz no Notion — fonte única da verdade.
 *
 * Por que este arquivo existe: o site dizia "Documentos, Wiki, Páginas e Bancos
 * de dados — o espaço da marca com a mila". Duas coisas erradas de uma vez:
 *
 *   1. dava a entender que o Notion NÃO recebe o caderno de fornecedores — e
 *      recebe: é uma das duas opções que a lojista escolhe (a outra é a planilha
 *      do Google). Correção apontada pelo Maurício em 2026-09-29: *"mas o caderno
 *      também pode ser salvo no notion, certo?"* — sim;
 *   2. prometia "Wiki, Páginas e Documentos", que não existem no produto.
 *
 * O que o código faz de verdade (`mila_router/notion_client.py`):
 *   - `gravar_caderno` → espelha o caderno de fornecedores numa base do Notion
 *                        (upsert pelo nome: fornecedor repetido ATUALIZA);
 *   - `gravar_compra`  → grava as peças de uma nota de compra (XML/PDF) na base.
 *
 * A mila NÃO cria a base do Notion: ela lista as bases compartilhadas com a
 * integração, pergunta qual usar e lembra a escolha. Se a base sumir, ela
 * esquece e pergunta de novo (nunca chuta). Por isso o texto NÃO diz "viram
 * bases" — diz que a mila grava NA base que a lojista indicar.
 *
 * ⚠️ Mexeu aqui? O teste `tests/google-suite.test.ts` quebra se o site prometer
 * o que o produto não entrega — e se o Notion deixar de ser oferecido como
 * destino do caderno. É de propósito.
 */

/** Descrição de uma linha, usada na lista da área logada e na tela de conexão. */
export const NOTION_DESC =
  "Bases de dados — a mila grava o caderno de fornecedores e as notas de compra " +
  "na base do Notion que você indicar (ela não cria a base). O caderno, se você " +
  "quiser, pode ir em vez disso para uma planilha no Google Drive.";
