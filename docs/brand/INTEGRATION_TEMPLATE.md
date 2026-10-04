# Template das páginas de integração

Formato aprovado pelo usuário em 03/10/2026 na página do Notion. Todas as integrações novas devem usar `components/IntegrationConnectionLayout.tsx`, inclusive as que usam OAuth.

O template fornece fundo marfim, cabeçalho com a marca Mila e retorno às integrações, coluna de até 560 px, marca do provedor, título, descrição e rodapé opcional. O conteúdo principal usa `notion-connect-panel`: superfície branca, borda discreta, raio de 16 px e espaços iguais ao Notion aprovado. Os nomes CSS são históricos; os estilos são compartilhados por todos os provedores.

## Como criar uma integração

1. Defina o nome, logo, título e descrição factual do provedor.
2. Use o template compartilhado e um único painel de ação.
3. Para OAuth, explique o acesso e ofereça uma ação de autorizar. Para credenciais, mantenha labels visíveis, ajuda expansível e token oculto com controle Mostrar/Ocultar.
4. Preserve os estados de carregamento, erro e sucesso. Confirme conexão somente após validação real do servidor.
5. Se a integração não estiver disponível, use o estado Em breve e não ofereça o botão de conectar.

`components/NotionConnection.tsx` é a referência para formulários de credenciais. A rota `app/integrations/[app]/page.tsx` aplica o mesmo template ao Jueri, Google, Olist, Nuvemshop e Bling.

## Notion e OAuth

A experiência atual usa um token de conexão interna. O Notion também suporta conexões públicas via OAuth: a pessoa entra na conta e seleciona as páginas autorizadas. A migração exige um app público e a configuração do fluxo de autorização, callback e armazenamento de credenciais no serviço de autenticação da Mila. O template suporta os dois formatos; mudar o design não habilita OAuth.

Referência: https://developers.notion.com/guides/get-started/authorization
