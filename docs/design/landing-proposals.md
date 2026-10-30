# Prévias da página inicial: mila. como assistente pessoal da lojista

Implementação: Claude Opus 5.5 (`claude-opus-5-5`), a pedido do coordenador. Base: `0a6258a` (`feat/workspace-opus-proposal`). A página atual em `/` não foi alterada e segue no ar até a escolha.

## Direção aprovada pelo usuário

A mila. é uma assistente pessoal da lojista no WhatsApp, para a rotina da loja de joias e semijoias, e trabalha com as integrações conectadas. Não é calculadora, ERP nem painel. O usuário pediu três coisas e depois aprovou com "siga nessa proposta":

1. As interfaces que inventamos não existem e não entram: a mila funciona pelo WhatsApp.
2. O mockup do iPhone com a interação permanece.
3. A animação das integrações permanece, nas duas versões.

**Direção rejeitada e removida.** As rodadas anteriores tinham:

- uma calculadora de margem;
- uma folha de Raio-X fora do telefone, com tabela de decisão de preço e régua de margem;
- uma conversa com abas fora do WhatsApp;
- fichas "Usado nesta resposta" e "Da sua loja, nesta resposta";
- listas que simulavam o perfil da loja.

Tudo isso saiu do código e da copy. Nada aqui deve ser lido como interface aprovada do produto.

## Rotas

| Rota | Conteúdo |
| --- | --- |
| `/propostas` | Índice comparativo, com link para cada proposta e para a página atual. |
| `/propostas/a` | Proposta A, "Perto de você, na loja". |
| `/propostas/b` | Proposta B, "A rotina ganha uma assistente". |

As três ficam fora do grupo `(site)`, sem `SiteHeader`/`SiteFooter` e sem outro `main` (o `main#conteudo` vem do layout raiz). Os metadados vêm de `metadataPrevia()` em `lib/landing-proposals.ts`. Eles são noindex/nofollow e substituem o Open Graph e o Twitter da raiz, com título de prévia, `url` em `/propostas…`, `card: "summary"` e nenhuma imagem. A troca de prévia (`Prévias · A · B`) fica no canto do topo. Os quatro atalhos de seção (Rotina, Integrações, Planos, Dúvidas) são uma cápsula em A (≥1024px) ou links sobre a régua em B (≥960px). Em A, o topo é persistente e, abaixo de 1024px, os atalhos ficam em menu hambúrguer acessível; B mantém sua segunda linha de links.

## Demonstrações: só as da landing atual

- **Mockup do iPhone.** `components/IPhoneMockup.tsx` está intacto (moldura, roteiro, tempos e estilos de `app/site.css`). `PhoneDemo.tsx` só renderiza `<IPhoneMockup />` e põe abaixo a legenda "Conversa de demonstração, em loop. Exemplo ilustrativo.". Nas prévias, o telefone fica com `width: min(100%, 19rem)`, centralizado e com `drop-shadow` mineral. A legenda interna do mockup fica oculta. A copy nova não repete as afirmações do mockup ("46%", "Estoque de Joias", "Sincronizei").
- **Mapa de integrações.** `components/IntegrationsMarquee.tsx` é o componente original, em uma instância por página: hub, cinco nós, feixes medidos por `ResizeObserver`, pulsos pausados fora da tela por `IntersectionObserver` e o CSS de `components/integrations-beam.css` sem alteração. A única mudança no componente é uma prop opcional de CTA, `ctaHref` e `ctaLabel`, com os defaults `"/workspace/integracoes"` e `"Conhecer as integrações"`. A home continua usando `<IntegrationsMarquee />` sem props e renderiza igual. A proposta A passa `#planos` e "Conhecer os planos", pois a seção detalhada foi retirada a pedido do usuário. A proposta B mantém `#sobre-integracoes` e "Ver o que cada integração faz".
- **Pano das prévias.** A faixa branca e o gradiente verde-claro foram rejeitados pelo usuário. O mapa em ambas as prévias agora usa fundo sólido mineral oficial `#173F3B`, texto e feixes marfim `#F6F3ED`, nós marfim e tinta `#1E2B28`, sem gradiente. A Meta é o sexto nó, opcional via `includeMeta` (home mantém cinco). Movimento, observadores e keyframes permanecem os originais; a geometria 3+3 é restrita à variante com Meta.

## Copy compartilhada (`lib/landing-proposals.ts`)

- **Títulos.**
  - A: "Sua assistente pessoal para o dia a dia da loja. No WhatsApp."
  - B: "A rotina da loja ganha uma assistente pessoal no WhatsApp."
  - Os dois leads dizem "assistente de IA" e "joias e semijoias". O lead de A é o aprovado: "Chegou mercadoria, tem uma peça para cadastrar ou precisa preparar uma descrição? Converse com a mila. …conforme as integrações conectadas."
- **Rotina.** Seis tarefas em texto editorial, com título, texto e uma frase para B:
  1. chegou mercadoria (nota em XML ou PDF);
  2. peça nova para vender (descrição técnica; no Pro, cadastro da peça no Jueri, no Olist ou na Nuvemshop que a lojista conectou e autorizou, quando ela pede pela conversa; base: `lib/releases.ts`, versão 0.2.0);
  3. antes de definir o preço (conta com os custos da loja e radar do Google Shopping), a única tarefa de preço, em terceiro lugar;
  4. fornecedores à mão (caderno consultável no WhatsApp, espelho no Google ou no Notion);
  5. conteúdo para o Instagram (Pro; quem revisa e publica é a lojista);
  6. estoque e vendas nas ferramentas (Pro, com autorização: Jueri, Olist, Nuvemshop, balanço mensal e alerta de carência).
- **Como a conversa ajuda.** Do seu jeito de escrever; com o que a loja já contou; com as ferramentas conectadas. O workspace aparece só numa frase de apoio: um painel web simples para administrar dados, conexões e plano.
- **Integrações.** Cada ferramenta tem nome, um resumo de uma linha, plano e grupo (`INTEGRACOES_PUBLICAS`, `GRUPOS_INTEGRACAO`). Jueri, Olist e Nuvemshop ficam em "Estoque e vendas", no Pro; Google Drive e Planilhas e Notion em "Fornecedores e compras", nos dois planos. O texto completo de `GOOGLE_DESC` e `NOTION_DESC` (fonte única) fica num disclosure nativo, "Detalhes do Google" ou "Detalhes do Notion", com alvo de 44px (`DetalheIntegracao.tsx`), sem perder nenhum limite. Seguem a nota da Meta (liberada por loja e sincronizada depois da autorização) e "Bling ainda não está disponível." (de `CONECTORES_NAO_PRONTOs`).
- **Oferta.** Essencial R$ 39/mês e Pro R$ 69/mês, item por item igual à `PricingSection`, com uma exceção: a linha de Instagram troca "Marketing de Instagram: legendas magnéticas…" por "Conteúdo para Instagram: legendas, carrosséis, ideias de Reels e planejamento semanal", sem perder benefício. Os resumos dos planos também são os da `PricingSection`. O selo "Recomendado" não entra. Todos os CTAs vão para `/login`, com "Acesso piloto, por convite".
- **Fora do texto.** Nada de calculadora, agenda, Gmail, contas a pagar, emissão de nota, atendimento a clientes, postagem automática, depoimentos ou métricas.

## Composição

- **A, "Perto de você, na loja".**
  - Abertura: texto, CTA e nota de acesso à esquerda; o telefone numa coluna de 19rem à direita a partir de 760px; no celular, o texto vem antes do telefone.
  - Rotina: título fixo à esquerda (≥1024px) e as seis tarefas em linhas pautadas, com o selo Pro onde vale.
  - Depois: "Uma conversa que já conhece a loja"; o mapa animado; uma nota curta com as ressalvas da Meta e do Bling; planos lado a lado; dúvidas; faixa mineral arredondada com o CTA.
  - "Uma conversa que já conhece a loja" (ajuste a pedido do usuário). A Rotina e esta seção estavam parecidas demais: título à esquerda e lista pautada à direita nas duas. Agora a Rotina continua clara, com lista vertical pautada, e esta seção virou uma faixa mineral dentro de `lp-wrap`. O raio é o do sistema (24px, 18px até 640px) e o padding é generoso. O título fica no topo, os três pontos de `COMO_AJUDA` ficam lado a lado a partir de 900px (com filete vertical de 1px entre as colunas) e empilhados no celular, com divisores sutis. A nota do painel web fica no rodapé da faixa. Texto em marfim, secundário em mineral claro. Sem cartões, ícones ou números.
  - "O que cada integração faz" saiu da proposta A a pedido do usuário (redundante com o mapa). O CTA do mapa agora é "Conhecer os planos" (`#planos`). Os limites de Google e Notion continuam em `PLANO_GOOGLE`, nos planos, e na dúvida sobre o caderno de fornecedores. As ressalvas da Meta e do Bling ficam numa nota curta logo depois do mapa. B mantém a seção de detalhes, com os disclosures de fonte única.
- **B, "A rotina ganha uma assistente".**
  - Abertura: a partir de 760px, o telefone fica à esquerda e o título curto, maior, à direita; no celular, o texto vem antes do telefone.
  - Rotina: seis frases grandes pautadas, sem cartões, com o selo Pro.
  - Depois: uma frase grande sobre a conversa, com três colunas abertas e a frase do painel; o mapa animado; integrações agrupadas por atividade, sem vidro: cada grupo abre com uma linha mineral de 2px, título, plano e uma frase à esquerda, e uma grade aberta de ferramentas à direita (logo real, nome, resumo e detalhes); oferta em folha única (dois preços e a lista de recursos com nível); dúvidas em duas colunas; faixa mineral de ponta a ponta com o CTA.

## O que foi removido (só código criado nesta sessão)

- `components/landing-proposals/ContaBar.tsx`, `ContaCalculator.tsx` e `ConversationDemo.tsx`. O `IntegrationMark.tsx` também saiu na rodada da direção nova, mas voltou no refinamento para mostrar os logos reais na seção de detalhes (os mesmos assets do mapa).
- Em `lib/landing-proposals.ts`: conta em centavos, parser de números, formatação, exemplos A e B, nota de exemplo, conversa por abas, origens e ficha do hero, campos e destinos do painel, pedidos do dia a dia.
- `Icons.tsx`: os ícones sem uso (chat, foto, arquivo e voltar).
- CSS morto da calculadora, da folha, da régua, do chat, das fichas e das marcas das integrações. O bloco de movimento reduzido com `!important` foi trocado por seletores explícitos.

## Validação registrada pelo implementador

Comandos rodados com Node v24.21.0, sem build, sem navegador e sem detector (o build isolado e as capturas ficam com o coordenador):

- `node node_modules/typescript/bin/tsc --noEmit`: só os dois erros antigos em `.next/types/app/workspace/page.ts`.
- `node --test --no-warnings 'tests/**/*.test.ts'` (após o refinamento das integrações): 135 testes, 133 aprovados, 1 ignorado (backend OAuth ausente) e 1 reprovado. A falha é `legal: conjunto completo de fontes…`, que acusa as fontes das prévias alteradas e removidas e também `components/IntegrationsMarquee.tsx`, pela prop nova. O lock não foi tocado: fica para o coordenador depois da revisão.
- Os 15 testes de `tests/landing-proposals.test.ts` cobrem, além do que vem abaixo, a seção de detalhes das integrações nas duas propostas (sem vidro, cinco logos, resumos, plano discreto, os dois disclosures com o texto de fonte única, filetes de 24px em A e grupos com linha mineral em B) e a seção "Como ajuda" de A sem painel:
  - o posicionamento nos títulos e leads, e a ordem e os níveis da rotina;
  - a copy proibida, a remoção dos arquivos e helpers rejeitados e a paridade da oferta;
  - `IPhoneMockup.tsx`, `app/site.css` e `integrations-beam.css` iguais ao `HEAD`;
  - `IntegrationsMarquee.tsx` igual ao `HEAD` quando a prop é revertida, e a home sem props;
  - os metadados, o escopo e a ausência de `!important` no CSS novo, os atalhos de 44px;
  - o render de A, B e do índice: um mockup no hero com legenda, um mapa com hub, cinco nós e a camada de feixes, ids únicos, âncoras com destino e nenhuma interface rejeitada;
  - o render do mapa com e sem props, que só troca o link.
- O renderizador do teste ignora só `components/integrations-beam.css` entre os imports de CSS, como o SSR do Next faz, e confere que o arquivo existe. No HTML do servidor os feixes ainda não têm `<path>` (são medidos no navegador), então o teste confere a camada `svg.integrations-paths` e o código dos pulsos, não o pulso em execução.

## Revisão final do coordenador e do Fable

O registro acima descreve a execução do implementador antes da revisão. Depois dele, o coordenador removeu a menção a áudio sem comprovação, incluiu regressão e concluiu o build isolado, navegador, verificação dos feixes e capturas desktop/mobile. Fable confirmou o achado de copy resolvido e aprovou visualmente as oito capturas de hero e detalhes de integrações (`disposition: ship`, no escopo delas). A seção rejeitada está aberta sobre o fundo, com logos reais e separadores, sem a grande caixa branca.

Validação final: 135 testes, 134 aprovados, 0 falhas, 1 ignorado (backend OAuth ausente). Lock revisado sem enfraquecer testes. `next build` isolado aprovado. Os dois erros de `tsc` no `.next/types` de desenvolvimento são gerados antigos do workspace; não ocorrem no build isolado. Os componentes do iPhone e o CSS original de integrações seguem intactos. Na execução real, 5 feixes foram confirmados em estado `running` em cada proposta.

Capturas vigentes: `output/landing-proposals/assistente-pessoal/`. Prévias continuam acessíveis em `http://localhost:3232/propostas`. Diagnóstico e limites detalhados em `docs/design/landing-review.md`.

### Ajuste da proposta A — registro do implementador antes da revisão

- `node --test --no-warnings 'tests/**/*.test.ts'`: 136 testes, 134 aprovados, 1 ignorado e 1 reprovado. A falha é o lock de fontes, que acusa `app/propostas/page.tsx`, `LandingA.tsx`, `landing-a.css` e `lib/landing-proposals.ts`; o lock não foi atualizado.
- `tsc --noEmit`: só os dois erros antigos de `.next/types/app/workspace/page.ts`.
- Os 16 testes das prévias agora conferem:
  - a copy do cadastro com os três conectores, no Pro, com conexão e autorização;
  - A sem "O que cada integração faz", sem `#sobre-integracoes` e com o CTA do mapa em `#planos`;
  - a faixa mineral com o título no topo, três colunas e a nota do painel no rodapé;
  - o CSS da faixa: uma coluna no celular, três a partir de 900px e divisores sutis;
  - B com a seção de detalhes, os disclosures e o CTA `#sobre-integracoes`.

### Topo fixo da proposta A

O topo de A acompanha a rolagem: `.lpa-bar` tem `position: sticky; top: 0; z-index: 30` e continua no fluxo, sem salto de layout. O fundo é um `::before` de ponta a ponta em marfim a 90%, com `backdrop-filter: blur(12px)`, filete mineral de 1px embaixo e sombra curta. A cápsula de seções no computador e os atalhos de 44px na segunda linha do celular não mudaram. O padding superior respeita `env(safe-area-inset-top)`, com 8px no celular e 14px a partir de 1024px.

A altura do topo fica em `--lpa-topo`, no `.lpa`. As reservas em CSS (antes da medida) são estimadas, não medidas no navegador: 112px no celular e no tablet (atalhos numa linha), 156px até 359px (atalhos em duas linhas) e 80px a partir de 1024px. O `CabecalhoFixo.tsx` é um componente cliente mínimo que só envolve o `<header>`, mede a altura real com `ResizeObserver` (cobre zoom e quebra de linha), grava `--lpa-topo` e limpa a propriedade ao desmontar. Não escuta rolagem, não anima o topo e não intercepta âncoras: a navegação continua com hash nativo e voltar/avançar.

Ficam abaixo do topo:
- as seções com id (`#rotina`, `#como-funciona`, `#integracoes`, `#planos`, `#duvidas`) e a nota do mapa, com `scroll-margin-top: calc(var(--lpa-topo) + 16px)`, o que vence os 80px do `integrations-beam.css` sem editá-lo;
- links, botões e `summary`, com a mesma margem, para o foco por teclado;
- o título fixo da Rotina (≥1024px), que agora usa `top: calc(var(--lpa-topo) + 24px)`.

B não recebe nada disso. Testes: 17 nas prévias (um novo, para o topo fixo). A suíte completa tem 137 testes: o lock de fontes falha pelos arquivos alterados até a revisão do coordenador, e 1 fica ignorado (backend).

### Faixa verde do mapa, Meta no diagrama e menu hambúrguer em A

- **Faixa do mapa (A e B), revisada a pedido do usuário.** O verde-claro em gradiente foi rejeitado ("essa cor não está na paleta da marca") e saiu. A faixa agora usa só as cores oficiais, em hex, sob `.lp-root`:
  - fundo mineral `#173F3B` liso, sem gradiente, filete ou sombra;
  - título, texto, link, legenda do hub, contorno de foco e pulsos em marfim `#F6F3ED`; a nota secundária em marfim translúcido `rgba(246, 243, 237, 0.82)`;
  - feixe base em marfim a 30%;
  - hub mineral com contorno marfim de 1px, para se destacar do fundo;
  - nós em painel marfim `#F6F3ED`, com nome em `#1E2B28` e propósito em `#173F3B`, e os logos oficiais nas próprias cores.

  A home e o `integrations-beam.css` de cinco nós não mudam.
- **Meta no mapa animado (A e B).** O `IntegrationsMarquee` ganhou a prop opcional `includeMeta` (padrão `false`). Com ela, entra um sexto nó, "Meta", com a marca oficial em SVG inline (sem asset novo), o propósito "Catálogo do Instagram e Facebook" e a ressalva visível "Sujeito à liberação". O nome acessível do nó é "Meta". A lista de cinco ferramentas, os propósitos, a medição dos feixes (`ResizeObserver` e `IntersectionObserver`), o SVG dos pulsos e o hub são os mesmos do HEAD; a medição já percorre todos os `.integrations-node`, então são seis feixes e seis pulsos. O `integrations-beam.css` só ganhou, no fim do arquivo, a variante `.integrations-graph.has-meta`:
  - três nós de cada lado, em 16%, 50% e 84%: Jueri, Olist e Meta à esquerda; Nuvemshop, Google e Notion à direita;
  - altura de 440px;
  - nós de 96px até 480px de largura.

  Geometria de cinco nós, keyframes e movimento reduzido estão intactos. Sem props, a home renderiza igual ao HEAD (o teste compara o HTML). A nota da Meta fora do mapa (`NOTA_META`) continua nas duas prévias.
- **Menu hambúrguer em A (abaixo de 1024px).** A segunda linha de atalhos saiu.
  - **Botão:** o `CabecalhoFixo`, componente cliente, mostra um botão de 44px ("Menu de seções", com `aria-expanded` e `aria-controls="lpa-secoes"`), que abre uma gaveta ancorada sob o topo, com `position: absolute`. Por isso a altura medida do topo fechado não muda.
  - **Gaveta:** contém a única nav "Seções", com links de 48px. Abaixo de 640px, também traz a troca de prévia. A partir de 640px, a troca volta ao topo, ao lado de Entrar e do botão.
  - **Fechado:** a gaveta fica com `display: none`, então os links não recebem foco.
  - **Fechar:** clicar numa seção fecha o menu sem impedir a âncora nativa. Esc fecha e devolve o foco ao botão. Clique ou foco fora do topo também fecham. Ao passar para 1024px ou mais, o menu fecha. O menu não prende o foco e não tem foco automático.
  - **A partir de 1024px:** o botão some e a gaveta vira `display: contents`, então a cápsula do computador aparece sempre, aberta ou fechada.
  - **Reserva de altura:** a do topo fechado no celular passou de 112px/156px para 60px; a de 1024px ou mais continua em 80px. A medida real vem do `ResizeObserver`. Os valores de reserva são estimativas, não medidas no navegador.

B mantém a navegação atual. Testes: 19 nas prévias. A suíte completa tem 139 testes, 137 aprovados e 1 ignorado; o lock falha pelos arquivos alterados até a revisão do coordenador.

**Ordem de foco do menu de A (correção).** No celular, abrir o menu e apertar Tab levava direto ao CTA do hero, porque a gaveta vinha antes do botão no DOM e o foco fora do topo fechava o menu. O topo agora segue a ordem marca → ações (troca de prévia ≥640px, Entrar, botão do menu) → gaveta. Com isso, o Tab depois do botão entra no primeiro link e Shift+Tab volta a Entrar, sem interceptar teclas nem prender o foco. No computador, a posição visual não mudou: `.lpa-bar .lp-bar-actions` fica fixo em `grid-column: 3; grid-row: 1`, e a nav em `grid-column: 2; grid-row: 1`. Ao clicar num link com a gaveta aberta, o menu fecha e o foco volta ao botão com `preventScroll`, em vez de ficar num link escondido; a âncora nativa continua rolando. Conferido no navegador em 320px, 390px e desktop: Tab entra em Rotina após abrir o botão, Escape fecha e devolve o foco, clique fora fecha, clicar numa seção fecha e mantém o título abaixo do topo. Seis feixes em execução foram medidos, Meta inteira dentro do diagrama. Fable aprovou fonte e quatro capturas da versão final com paleta oficial (`disposition: ship`). Build isolado aprovado e suíte final: 139 testes, 138 aprovados, 0 falhas, 1 ignorado (OAuth indisponível). Os oito hashes de fontes desta rodada foram atualizados após a revisão. Capturas vigentes desta alteração: `output/landing-proposals/assistente-pessoal/navbar-meta-final/`.

