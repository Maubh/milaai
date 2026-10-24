---
name: mila. área logada
description: A mesa da loja — o workspace onde a lojista conversa com a mila e administra integrações e plano.
colors:
  mineral: "oklch(33.5% 0.045 184)"
  mineral-deep: "oklch(29% 0.042 184)"
  mineral-ink: "oklch(96.6% 0.008 85)"
  mineral-muted: "oklch(86% 0.022 170)"
  paper: "oklch(97% 0.008 85)"
  surface: "oklch(99% 0.002 85)"
  desk-canvas: "oklch(95.6% 0.009 85)"
  desk-panel: "oklch(99.2% 0.003 85)"
  desk-inset: "oklch(96.8% 0.007 85)"
  desk-glass: "oklch(99.6% 0.003 85 / 0.62)"
  desk-glass-hover: "oklch(99.6% 0.003 85 / 0.82)"
  desk-hairline: "oklch(100% 0 0 / 0.82)"
  desk-tint: "oklch(27% 0.025 165 / 0.06)"
  desk-wash-mineral: "oklch(86% 0.04 184 / 0.45)"
  desk-wash-sand: "oklch(90% 0.035 75 / 0.55)"
  sand: "oklch(93.5% 0.018 75)"
  ink: "oklch(27% 0.025 165)"
  muted: "oklch(46% 0.016 165)"
  rule: "oklch(87% 0.009 160)"
  rule-strong: "oklch(78% 0.012 165)"
  positive: "oklch(42% 0.09 155)"
  error: "oklch(43% 0.15 28)"
  error-paper: "oklch(96% 0.016 28)"
typography:
  display:
    fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
  caption:
    fontFamily: "Manrope, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control: "10px"
  inset: "14px"
  panel: "24px"
  panel-mobile: "18px"
  popover: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.mineral}"
    textColor: "{colors.mineral-ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.mineral-deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  chat-action:
    backgroundColor: "{colors.mineral}"
    textColor: "{colors.mineral-ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  nav-pill-active:
    backgroundColor: "{colors.mineral}"
    textColor: "{colors.mineral-ink}"
    rounded: "{rounded.pill}"
    height: "40px"
  nav-track:
    backgroundColor: "{colors.desk-glass}"
    rounded: "{rounded.pill}"
    padding: "4px"
  desk-panel:
    backgroundColor: "{colors.desk-glass}"
    rounded: "{rounded.panel}"
    padding: "24px 32px"
  conversation-panel:
    backgroundColor: "{colors.mineral}"
    textColor: "{colors.mineral-ink}"
    rounded: "{rounded.panel}"
    padding: "32px 40px"
  desk-tile:
    backgroundColor: "{colors.desk-glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px 32px"
  desk-tile-hover:
    backgroundColor: "{colors.desk-glass-hover}"
  updates-bell:
    backgroundColor: "{colors.desk-glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  updates-popover:
    backgroundColor: "{colors.desk-panel}"
    rounded: "{rounded.popover}"
    padding: "12px"
  conversation-action:
    backgroundColor: "{colors.mineral-ink}"
    textColor: "{colors.mineral}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  state:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  integration-tier:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.mineral}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
    height: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "48px"
  inset-area:
    backgroundColor: "{colors.desk-inset}"
    rounded: "{rounded.inset}"
    padding: "16px 24px"
---

# Design System: mila. área logada

## Overview

**Creative North Star: "A mesa da loja"**

Este documento registra a proposta A da área logada, na branch `feat/workspace-opus-proposal`. A proposta B é independente e está em outro worktree; não está documentada aqui. O estado de revisão e as evidências reportadas para a proposta A ficam no surface brief.

A área logada é uma mesa de trabalho sobre um canvas marfim com manchas minerais e areia suaves. Os painéis claros deixam o pano tonal aparecer através da superfície; filete claro, brilho interno e sombra longa suave dão espessura. A conversa com a mila é o único painel mineral. As listas de trabalho continuam em linhas pautadas dentro dos painéis. É uma interface Operate: sóbria e próxima, com Manrope e a marca nos detalhes.

A Cadra observada ao vivo orienta o acabamento: material translúcido, filete com sombra, elevação de cartões clicáveis e pílula recortada que estica ao trocar destino. No celular, cinco destinos ficam no dock inferior; o sino do topo abre as atualizações em tela cheia. Cadra é uma critique-reference. A implementação preserva a marca da mila e usa código próprio, sem copiar bundles, assets, dados, paleta ou fonte. O caminho é code-led; seed de imagem não se aplica.

**Key Characteristics:**
- Canvas marfim com pano tonal fixo; painéis translúcidos com filete claro de 1px, brilho interno e sombra longa suave.
- Preenchimento mineral concentrado no destino ativo, na ação principal e no painel da conversa; texto mineral também sinaliza marca, links e pequenos destaques.
- Linhas pautadas para listas; cartões inteiros como links quando cada unidade leva a uma página, com elevação de 4px em hover e foco.
- Manrope em escala fixa de rem; números tabulares em contagens, datas e preços.
- Estado da conta vem da sessão ou do vault; versões vêm de `RELEASES`. Vazio, carregando e falha têm linguagem própria.

## Colors

Restrito: neutros marfim quentes, um acento mineral, cores semânticas só para estado.

### Primary
- **Verde mineral:** cápsula do destino ativo, botão principal e painel da conversa; em texto, marca, links de ação, contagens, avatar e selo Pro. Escurece para o tom profundo no hover. Os valores normativos estão no frontmatter; a cor de marca histórica está em `PRODUCT.md`.
- **Marfim sobre mineral** (oklch(96.6% 0.008 85)): texto e botão invertido dentro do mineral; o texto secundário ali usa o mineral esmaecido (oklch(86% 0.022 170)), nunca cinza.

### Tertiary
- **Areia** (oklch(93.5% 0.018 75)): fundo do avatar e dos números de passo. Apoio, nunca texto.

### Neutral
- **Canvas da mesa:** fundo marfim com três manchas radiais fixas em mineral e areia de baixa opacidade; a barra flutua sobre ele.
- **Painel sólido:** fundo dos popovers de atualizações e conta.
- **Vidro marfim:** superfície translúcida dos painéis, cartões, cápsula e botões do topo. O hover dos cartões e do sino aumenta a opacidade; o filete claro preserva a borda sobre o pano tonal.
- **Papel e superfície:** os neutros herdados do livro permanecem nos controles, no hover e no ladrilho do QR, distintos do canvas e do painel da mesa.
- **Recuo** (oklch(96.8% 0.007 85)): áreas dentro de painel (gerenciador do Meta, colunas de plano, "onde gerar").
- **Tinta de hover:** preenchimento mineral a 6% nas abas e linhas-link do popover; hover de aba não desloca a pílula.
- **Tinta** (oklch(27% 0.025 165)) e **tinta suave** (oklch(46% 0.016 165)): texto principal e secundário.
- **Régua** (oklch(87% 0.009 160)) e **régua forte** (oklch(78% 0.012 165)): hairlines entre linhas e sob cabeçalhos de seção.

### Named Rules
**The Mineral Fill Rule.** O preenchimento mineral se concentra no destino ativo, na ação principal e no painel da conversa. Marca, links e pequenos destaques podem usar texto mineral sem criar outro painel de destaque.
**The State Speaks Rule.** Positivo e erro sempre vêm com texto; a cor nunca é o único sinal. O selo Pro informa o nível exigido, separado do estado da conexão.

## Typography

**Display Font:** Manrope (com Avenir Next, Segoe UI)
**Body Font:** Manrope

**Character:** Uma família só, arredondada e legível, que carrega título, rótulo, dado e botão. A hierarquia vem de peso e tamanho, não de troca de face.

### Hierarchy
- **Display** (700, 2rem, 1.15, -0.03em; 1.625rem no celular): título da página.
- **Headline** (700, 1.5rem, 1.2): título do painel da conversa.
- **Title** (700, 1.25rem, 1.3): cabeçalho de painel e valores do estado da conta.
- **Body** (400, 0.9375rem, 1.6): descrições, até 62ch.
- **Label** (600, 0.875rem): navegação, botões, rótulos de linha.
- **Caption** (500, 0.8125rem): versão, datas, notas.

### Named Rules
**The Sentence Case Rule.** Rótulos, etiquetas e estados em frase ("Catálogo do Instagram & Facebook", "Pendente"). Caixa alta com tracking não volta.

## Layout

Conteúdo em coluna de até 1120px com respiro lateral de 16 a 40px. A barra flutua no fluxo em três colunas `auto | 1fr | auto`: marca e loja à esquerda, quatro destinos centralizados no meio que sobra, WhatsApp, sino e conta à direita, sem sobreposição em nenhuma largura de desktop. Até 1023px a cápsula dá lugar ao dock fixo inferior com cinco destinos, enquanto marca, WhatsApp, sino e conta permanecem no topo em fluxo. O dock respeita a área segura do aparelho; o conteúdo reserva espaço inferior para ele e para essa área.

Na visão geral, uma faixa mineral compacta reúne conversa, três mensagens prontas e QR; abaixo, três cartões levam a Integrações, Plano e Última versão, e o painel Próximos passos vem depois deles. Acima de 1100px, conversa, mensagens e QR ficam lado a lado (faixa de 276px em 1440px). Até 1100px, as mensagens descem para uma linha abaixo da conversa, com o QR ao lado do texto. Até 860px, mensagens e cartões viram coluna. O QR mede 132px, passa a 112px até 1100px e sai até 720px. Com os dados do sandbox, em 1440×900 os cartões terminam em 684px e os Próximos passos em 852px. Espaçamento em degraus de 4px. Linhas de integração herdam cinco colunas por subgrid: marca (6,5rem) · texto (flexível) · nível (3,5rem) · estado (8,5rem) · ação (11,5rem), com intervalo de 24px. Abaixo de 760px do container, marca, nível e estado ficam na primeira linha; texto, ação e expansão ocupam a largura.

## Elevation & Depth

A profundidade vem do pano tonal sob a superfície translúcida, com filete claro de 1px e sombra longa suave. Painéis comuns ficam imóveis; só cartões cujo elemento inteiro é link sobem em hover e foco. A sombra permanece igual durante a subida.

### Shadow Vocabulary
- **Painel** (`box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.7), 0 24px 48px -30px oklch(27% 0.025 165 / 0.24)`): painéis claros e cartões; brilho superior mais sombra ambiente.
- **Conversa** (`box-shadow: 0 24px 48px -30px oklch(27% 0.025 165 / 0.32)`): painel mineral.
- **Popover** (`box-shadow: 0 24px 60px -18px oklch(27% 0.025 165 / 0.3), 0 2px 6px oklch(27% 0.025 165 / 0.07)`): atualizações e menu da conta.
- **Cápsula** (`box-shadow: inset 0 0 0 1px var(--color-desk-hairline)`): filete interno da navegação; sem borda CSS adicional.

### Named Rules
**The Material Edge Rule.** Superfícies claras combinam transparência, filete claro e sombra ambiente; a borda não vira contorno escuro.
**The Link Lift Rule.** Só cartões inteiros como links sobem 4px em hover e foco, durante 450ms com `cubic-bezier(0.16, 1, 0.3, 1)`; painéis de conteúdo permanecem imóveis. Movimento reduzido remove a subida.

## Shapes

Raios coordenados: controles 10px, áreas de recuo 14px, popovers 16px, painéis e cartões 24px (18px até 640px), cápsulas e botões de conversa em pílula. O painel mineral mantém 14px até 640px. Hairlines de 1px; a única linha mais grossa é o anel de 1,5px do plano atual.

## Components

### Buttons
- **Shape:** retângulo suave (10px) para ações de página; pílula para conversa e navegação.
- **Primary:** mineral com texto marfim, 44px de altura, peso 600–700.
- **Hover / Focus:** escurece para o mineral profundo; anel de foco de 2px em mineral com 3px de afastamento (marfim dentro do painel da conversa). Pressão: translate 1px ou scale 0,97.
- **Secondary:** superfície do painel com régua forte; hover troca a borda para mineral. **Quiet:** sem borda, para ações de texto de baixa ênfase. No diálogo de desconectar, Cancelar e Desconectar têm a mesma moldura e a mesma altura de 44px (Desconectar com borda e texto de erro), com 12px entre eles no desktop e 16px no celular; o anel de foco ali fica inteiro por dentro da borda (offset -3px, sobre o fundo claro), no raio do botão, para não deixar um dos dois mais alto nem ocupar o vão.

### Cards / Containers
- **Corner Style:** 24px; 18px até 640px.
- **Background:** vidro marfim sobre pano tonal; recuo sólido dentro de painel.
- **Shadow Strategy:** brilho interno mais sombra longa suave (ver Elevation).
- **Border:** filete claro de 1px.
- **Internal Padding:** 24px × 32px; 16px no celular.
- **Link:** o cartão de destino é um único `Link` nativo, com seleção de texto, clique modificado, botão do meio e menu de contexto do navegador. Hover e foco elevam 4px e clareiam a superfície; anel de foco de 2px acompanha o raio. A tentativa de nova leitura fica fora dos links.

### Inputs / Fields
- **Style:** 48px, borda em régua forte, raio 10px, fundo em superfície herdada, caret mineral.
- **Focus:** borda mineral + anel de 2px.
- **Error:** bloco de erro com borda e fundo de erro, texto que diz o problema e o que fazer.

### Navigation
- **Desktop (≥1024px):** cápsula translúcida com quatro destinos, na ordem da produção: Visão geral, Dados da loja, Integrações e Meu plano. Abas de 40px; hover apenas acrescenta tinta suave. O ativo é uma cópia mineral dos rótulos, oculta da árvore acessível e recortada por `clip-path`. A borda da frente parte primeiro (320ms), a de trás segue (380ms após 110ms), com `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Mudança de destino no desktop:** começa no clique simples e se reconcilia com a rota; teclado e voltar/avançar usam o mesmo caminho. Cliques modificados não movem a pílula. Em Atualizações, sem aba correspondente, ela desaparece. Não há slide da página.
- **Celular e tablet (≤1023px):** dock fixo inferior com Visão geral, Dados da loja, Integrações, Meu plano e Atualizações, cada um com ícone e rótulo inteiro; a 320px as palavras longas quebram com hífen suave (Integra-ções, Atuali-zações), sem reticências. Links de pelo menos 56px de altura; o ativo recebe pílula mineral compartilhada e `aria-current="page"`. Atualizações usa o mesmo estado de versão não lida e nome acessível do sino. O dock respeita `safe-area-inset-bottom`; o conteúdo reserva espaço inferior. Movimento reduzido remove o deslocamento da pílula.
- **Topo estreito (≤360px):** WhatsApp vira controle circular de 44px só com ícone visível; o nome permanece como texto oculto para tecnologia assistiva, preservando espaço para a marca.
- **Conta:** avatar em pílula translúcida com filete; menu sólido com nome, loja e "Sair da conta", foco no sair ao abrir, Esc devolve o foco.

### Sino de atualizações (signature)
Botão circular de 44px com ponto de versão não lida e nome acessível contendo versão e estado. Abre um popover não modal (`role="dialog"`), com título, versão atual e as três últimas entradas reais de `RELEASES` (versão, data, título e link para a âncora no histórico), seguido de "Ver todas as atualizações". Abertura ou visita à página marca a versão como vista; o ponto usa storage local, sem inventar notificações ou pedir push.

O foco fica no sino; Tab entra nos links seguintes. Esc fecha e devolve o foco; clique fora, perda de foco do conjunto, troca de rota ou clique em link fecham. Popover entra com opacidade, escala 0,96→1 e y −4→0 (mola 520/30/0,7); o ícone pulsa em 550ms. Movimento reduzido usa só opacidade por 120ms, sem escala ou deslocamento.

Até 1023px o sino abre uma tela cheia em `<dialog>` modal nativo, na camada do topo: cobre barra e dock de ponta a ponta, opaca, com cabeçalho próprio (Atualizações, versão e fechar de 44px), corpo com rolagem própria e as mesmas três versões com resumo. Usa `100dvh` e as áreas seguras. O resto da página fica inerte e não rola; ao fechar sem navegar, a página volta ao mesmo ponto e o foco volta ao sino sem rolar. Esc, fechar e links fecham; links de versão seguem para a âncora. Redimensionar com a tela aberta troca entre tela e popover. Movimento reduzido: só opacidade.

### Painel da conversa (signature)
Faixa mineral compacta com título, frase curta, botão marfim "Abrir WhatsApp" (48px) e QR em ladrilho claro (132px). Até 1100px o QR mede 112px; até 720px ele sai. A moldura é compartilhada pelo QR pronto e pendente. Até 360px o botão ocupa a largura. A ação de conversa da barra é outra variante: pílula mineral de 44px.

Mensagens prontas: três atalhos com o assunto acima do rótulo, todos da própria mila e sem atribuição a uma integração: Precificação ("Calcular o preço de uma peça"), Produtos ("Escrever a descrição de uma peça") e Compras ("Ler uma nota de compra"). O assunto vem sem o prefixo "Mila ·", porque o bloco já se chama "Conversar com a mila" (pedido da usuária). Só entram tarefas que os dois planos incluem: precificação, descrição de peça para loja virtual e leitura de nota (`components/PricingSection.tsx`, Essencial, herdado pelo Pro). Na produção atual, a legenda de Instagram por peça também está nos dois planos e carrosséis, Reels e planejamento ficam no Pro; os atalhos continuam fora desse assunto. (Na proposta A antes da integração com main, a legenda era tratada como Pro; a lista de main prevalece.) A frase da faixa acompanha: "Preço, descrição ou ajuda com uma peça." Cada um usa o mesmo link verificado do WhatsApp e só troca o parâmetro `text`, com espaço codificado como `%20`. Abre em nova aba e nunca envia sozinho. O nome acessível junta assunto e rótulo ("Precificação: Calcular o preço de uma peça (abre o WhatsApp)"). Sem link verificado, como no esqueleto, os atalhos ficam como texto indisponível, sem `href`. Alvos de pelo menos 44px.

### Próximos passos
Painel comum (`desk-panel`, sem subida) depois dos cartões. Cada linha mostra a origem visível acima da frase: Conta · Plano, Meta · Catálogo do Instagram e Facebook ou Integrações da loja. O link de ação inclui a origem no nome acessível ("Abrir o catálogo: Meta · Catálogo do Instagram e Facebook"). As regras ficam em `lib/overview-steps.ts`, módulo puro com testes. A sessão (`/api/session`) e os conectores (`/api/oauth/providers`, a mesma lista do vault que a página de integrações lê) são leituras separadas.

- **Conexões:** o cartão Integrações e a sugestão de conectar a primeira ferramenta usam a mesma leitura (`connectedTools`), respeitando a allowlist da Meta e ignorando ids fora do catálogo. Ferramenta que volta na lista sem `connected` deixa o zero sem prova: o cartão mostra "Não verificado" e não há sugestão. Uma lista vazia válida sustenta zero.
- **Meta:** `null` explícito sustenta um passo; campo ausente é desconhecido. Sem fonte (`product_source` nulo ou em branco), só "Configurar". Fonte de Nuvemshop, Olist ou Jueri com `connected === false` explícito na ferramenta de origem gera "A fonte do catálogo (…) não está conectada". Ferramenta ausente ou sem `connected` não conclui nada. A fonte `mila` não depende de ferramenta. Fonte reconhecida, ferramenta conectada e `last_sync_at: null` geram "Ainda não há registro de sincronização do catálogo". Fonte não reconhecida não gera passo. O mapa fonte→ferramenta é único (`META_SOURCES` em `lib/meta-catalog.ts`) e o gerenciador do catálogo o importa. Todo CTA da Meta navega para `/workspace/integracoes#integracao-meta`. Sincronizar só acontece no gerenciador.
- **Plano:** o prazo do teste só aparece com `trial_ends_at` real, como último dia de uso. "Seu teste terminou" exige `billing: "trial_expirado"` ou uma data real já vencida. Pelas regras de main não há data de referência do piloto: sem data, o teste continua aberto.
- **Leituras:** um único aviso de falha, preciso ("Não deu para ler o plano agora.", "…as integrações agora." ou "…o plano e as integrações agora."), com um "Tentar de novo" que relê as duas. Os passos da leitura válida continuam na tela, e enquanto uma leitura ainda espera, só ela reserva uma linha. O vazio fala de sugestões, não de pendências: "Nenhum próximo passo identificado com os dados disponíveis."; com as duas leituras falhas, "Sem dados para sugerir passos agora."
- **Ordem:** teste encerrado, depois Meta, depois a primeira conexão, depois o prazo do teste.

### Linha de integração (signature)
Cinco eixos compartilhados: marca, texto, nível, estado e ação. Nome com detalhe e descrição ficam juntos; Google e Notion têm consentimento em `<details>`. O nível exigido usa um único selo Pro sobre areia; só quando o plano bloqueia a linha (`row.state === "locked"`) o selo ganha um cadeado de 12px da família dos ícones do shell (`components/PlanLock.tsx`, `aria-hidden`), e o leitor de tela ouve "Pro, bloqueado no seu plano" sem depender de tooltip. Conectadas, disponíveis e não verificadas mantêm o selo simples, e o CTA continua ativo. O selo fica sempre no mesmo eixo, sem repetir a exigência no estado. O estado de conexão tem ponto (cheio = conectado). A ação de conectadas e disponíveis é uma chave (`role="switch"`, alvo de 44px): ligada só quando o vault confirma `connected === true`. Ligar abre o fluxo real de `/integrations/<id>` e mostra "Abrindo a conexão…" sem ligar a chave; voltar do provedor não deixa a espera presa. Desligar abre um diálogo nativo (`<dialog>` com `showModal`, cartão centrado no desktop e preso embaixo no celular) com "Desconectar …?", a consequência em uma frase (na Meta, também o que acontece com os itens do catálogo, conforme o texto legal) e Cancelar como foco inicial; Esc e toque fora fecham e o foco volta para a chave. Confirmar chama o revoke real e só muda a chave depois de reler o vault; falha mantém a chave ligada com o erro. Trilho desligado em `oklch(60% 0.02 175)` local, 3,8:1 contra o polegar. Sem "Reconectar" genérico em linha conectada saudável (pedido da lojista). Refazer a autorização fica no contexto: quando a Meta nega o acesso aos negócios (`business_permission: false`), a escolha de catálogo mostra "Reautorizar acesso à Meta", que leva a `/integrations/meta` sem desconectar. Estado não verificado fica com o botão "Conectar", sem chave. O CTA de bloqueio escolhido pelo usuário é "Assinar plano Pro", com destino `/workspace/plano`. No bloqueio por plano, o estado é nulo e sua coluna fica vazia, preservando alinhamento sem repetir "Exige Pro".

Integrações conectadas aparecem primeiro, numa seção "Conectadas". As demais ficam abaixo, agrupadas por finalidade, sem repetir uma ferramenta em duas seções. Só conexão confirmada no vault entra no topo; a allowlist da Meta continua valendo. O mesmo componente de linha, o gerenciador da Meta e as regras de plano por ID são preservados ao reagrupar.

### Catálogo da Meta
Uma área de recuo sob a linha conectada: resumo legível com nome do catálogo, fonte e último envio; "Configurar" expande catálogo, fonte e filtro; "Sincronizar" permanece no resumo. As duas ações formam uma só barra ligada ao resumo, com a mesma altura: Configurar é botão secundário com moldura (`ledger-button`, borda mineral e fundo ativo quando aberto), nunca texto solto, e Sincronizar é o primário. No desktop a barra fica à direita do resumo; em área estreita (≤520px de container), ocupa a largura toda abaixo do resumo, separada por uma régua, com dois botões iguais. Os resultados, erros e identificadores ficam em "Detalhes da sincronização". Configuração usa uma régua interna em vez de outro painel com sombra.

Escolha de catálogo (comportamento de main): sem catálogo escolhido, a área mostra só "Qual catálogo a mila deve usar?", com a lista da conta (`/api/meta/catalog/catalogs`) e "Usar este catálogo" (`/api/meta/catalog/select`); sem permissão ou sem catálogos, diz isso. Com catálogo, "Trocar catálogo" fica em Configurar e reabre a escolha com "Cancelar". A fonte começa vazia até a lojista escolher; a sugestão da mila aparece marcada "(sugerida)" e não vale sozinha. Sincronizar e salvar ficam indisponíveis sem fonte, com nota dizendo o que falta. O aviso de duplicação vem só do status `bloqueado_duplicacao`.

O salvamento da fonte e do filtro antecede o envio; se falhar, a sincronização para. O resumo mostra a fonte selecionada e distingue alterações não salvas da configuração salva, inclusive quando "Configurar" está fechado. Uma nota informa que "Sincronizar" salva antes a seleção. Alterações de fonte e filtro são indicadas separadamente ou juntas; fonte ainda não salva e sugestão também são nomeadas. O container da área fica num wrapper próprio, permitindo que o recuo e suas ações respondam à largura disponível. A fonte antiga não substitui a seleção atual no resumo.

### Plano e situação
As regras comerciais são as de main, portadas para `lib/plan-status.ts` e `PlanView`: teste só com fim vindo de `trial_ends_at` (mostrado como último dia), contratação liberada durante o teste, cortesia/comped/founder sem cobrança, cancelado/expired como assinatura inativa e atrasado com a fatura em aberto (`lib/fatura-aberta.ts`: link só do Asaas, data de pausa e WhatsApp pausado). Contratar abre o formulário de quem paga (nome e CPF/CNPJ, enviados ao `/api/billing/order` para o Asaas), com os erros de main. Assinatura em dia ou em atraso mostra "Troca de plano em breve". As listas de recursos são as de main.

O nome do plano e sua situação são informações distintas. Na visão geral, o plano ocupa o valor principal e a situação aparece abaixo; em "Meu plano", ficam em linhas separadas. "Em teste, sem cobrança", "Teste encerrado" e datas dependem da sessão. Não concatenar situação ao nome do plano nos exemplos do sistema. Sem `session.plan` reconhecido, mostrar "Plano não informado" e não marcar nenhuma opção da comparação como plano atual; durante o teste, no teste encerrado e na assinatura inativa nenhuma opção é a atual. `informedPlan` e `isShownCurrentPlan` mantêm o nome e o selo vinculados ao dado recebido. Parâmetros de URL não alteram o plano lido do vault; com plano não lido, ferramentas que o exigem ficam "Não verificado", sem presumir Pro.

### Dados da loja
Rotas (`/api/dados-loja`, `/api/concorrentes`) e `lib/dados-loja.ts` iguais às de main; a página é `DadosLojaView`, compartilhada com o esqueleto da rota. Cada card tem título e ação no topo, com a ação no canto superior direito: lápis de 44px no celular, "Editar" no desktop, com nome contextual ("Editar custos e taxas", "Editar precificação", "Editar dados da loja", "Editar concorrentes"). Na edição, o mesmo canto tem "Salvar" (enviando o form pelo atributo `form`, então Enter e validação continuam) e fechar de 44px ("Cancelar edição de …"); o foco vai ao primeiro campo e volta ao lápis. No celular, ação larga (Salvar + fechar, "Assinar plano Pro", "Tentar de novo", "Informar custos e taxas") fica sozinha na primeira linha, à direita, e o título ganha a linha seguinte. Rótulos com unidade: Taxa usada no preço (%), Custo de embalagem (R$), Markup padrão (x). Concorrentes só abrem com `analise_no_plano === true`; `false` mostra o selo Pro com cadeado (o mesmo das integrações bloqueadas) e "Assinar plano Pro"; falha ou campo ausente mostra "Não verificado" com "Tentar de novo", sem afirmar bloqueio nem zerar a lista. Custos aparecem mesmo se os concorrentes falharem.

### Esqueleto de carregamento

A visão geral usa `app/workspace/(visao-geral)/page.tsx`, `loading.tsx` e `overview.css`: o grupo mantém `/workspace` e o gate de `app/workspace/layout.tsx`, sem estender seu fallback às rotas irmãs. `OverviewView` e `PlanView` compartilham a apresentação entre página e fallback; o fetch inicial e "Tentar de novo" voltam ao mesmo estado de carregamento. Nos cartões da visão geral, o detalhe ocupa toda a largura disponível (`align-self: stretch`), para que as formas percentuais mantenham largura durante a leitura. `TextBone` fica dentro do elemento real de texto, herda sua fonte e usa altura de 0,8em, sem substituir a altura de linha do título, valor ou detalhe.

`WorkspaceSkeleton` anuncia a espera com `role="status"`, `aria-live="polite"` e `aria-busy="true"`; seu conteúdo é `aria-hidden` e `inert`, incluindo links. Na página cliente, um único status anuncia a leitura e os controles estáticos continuam utilizáveis quando seu destino está disponível; ações que dependem de dados ficam indisponíveis. O QR ainda sem link reserva a própria moldura do QR, sem código fictício: 132px no desktop, 112px até 1100px e oculto até 720px. As mensagens prontas aparecem no esqueleto com assunto e rótulo reais, sem link. Próximos passos reserva duas linhas de forma (origem, frase e ação) enquanto as duas leituras esperam. Na página cliente, cada leitura pendente reserva uma linha, ao lado dos passos já sustentados. Em 1440px as caixas de conversa, mensagens e cartões coincidem entre esqueleto e página pronta; o painel de passos mede 224px no esqueleto e 153px com o único passo do sandbox, porque a quantidade real não é conhecida antes da leitura. A coluna de texto de cada passo usa trilha `minmax(0, 1fr)` e slots com `min-width: 0`, para que as formas de espera (até 40ch, limitadas a 100%) não alarguem o painel no celular.

Integrações reserva três áreas neutras com `IntegrationRowPending`, que reutiliza `IntegrationRow` e as cinco colunas por subgrid. As formas não afirmam ferramentas conectadas, quantidade real ou participação da Meta antes da leitura da allowlist. Atualizações, sino, cartão da visão geral e aviso de não lido leem só `PUBLIC_RELEASES`/`LATEST_PUBLIC`. Versões de acabamento (`internal: true`) ficam no histórico técnico, e o não lido compara versões por ordem, então um deploy só de acabamento não acende o aviso. "Versão atual" mostra a versão real do app, separada da versão e da data da última nota pública. Em cada nota, o tipo (Novo, Melhoria, Correção) fica sempre acima do selo de plano, numa coluna explícita; os selos "Plano Pro" e "Essencial e Pro" usam o mesmo `PlanTag` (mesma borda, raio, padding e tipografia), e só o texto muda. Os selos Pro com cadeado das integrações e de Dados da loja são outro componente. Atualizações usa `UpdatesView` e `ReleaseTimeline` com a prop `loading` e `TextMask`: os textos fixos mantêm quebras e estrutura do histórico sob a máscara; a apresentação pronta permanece igual.

O pulso de formas, texto, máscara e QR pendente alterna opacidade de 1 a 0,5 em 1,4s. `components/workspace-skeleton.css` desliga essas animações em `prefers-reduced-motion: reduce`; o CSS da visão geral também desliga transição e transformação de pressão das ações.

Registro histórico da correção de esqueletos: `review_skeleton_fix` encerrou o delta com `ship` e `remaining: clear`, segundo o coordenador, após conferir fontes e provas das quatro rotas em 1440/375px, carregamento, falha/nova tentativa e movimento reduzido. Claude reportou 94 testes aprovados, 1 skip, TypeScript e `build-a6` com exit 0, confirmados pelo coordenador; evidências e limites de fixtures/OAuth/backend estão no [surface brief](.impeccable/surfaces/app-workspace-page-tsx.md). Estes checks não foram executados pelo documenter.

Registro do acabamento material: `review_cadra_material` encerrou com `ship` e `remaining: clear`, conforme coordenador, incluindo a correção de largura do detalhe no skeleton dos cartões. Checks de aplicação foram executados por Claude e conferidos pelo coordenador; a fonte final corresponde a `build-a9`. Provas e limites ficam no [surface brief](.impeccable/surfaces/app-workspace-page-tsx.md). O documenter conferiu fontes, evidências registradas e consistência documental.

Registro de mensagens prontas e próximos passos: documentação escrita por Claude a partir da proposta do documenter (que atingiu o limite antes da conferência final) e conferida pelo coordenador Codex. Gate: Fable fresco com veredito próprio (`fix` de docs na rodada 1, `ship` na rodada 2) e gate final `ship` do coordenador Codex, que rodou o `tsc` completo sem filtro no `build-a15`. Código em `21baa54`. Provas, checks e limites estão no [surface brief](.impeccable/surfaces/app-workspace-page-tsx.md).

## Do's and Don'ts

### Do:
- **Do** usar linhas pautadas para listas de trabalho e cartões inteiros como links para destinos; manter a hierarquia entre conversa, dados da conta e versões.
- **Do** mostrar só estado lido da sessão ou do vault; quando a leitura falha, dizer "Não deu para ler…" com "Tentar de novo".
- **Do** preservar os controles em 320px: encurtar rótulos ou usar ícone com nome acessível, como o WhatsApp do topo até 360px.
- **Do** respeitar `prefers-reduced-motion`: pílulas mudam de destino sem deslocamento; cartões não sobem; botões e sino não escalam; esqueletos não pulsam.

### Don't:
- **Don't** inventar métricas, gráficos, notificações ou números que a sessão e o histórico real não informam; a faixa de três cartões representa destinos, sem dados promocionais.
- **Don't** pôr caixa dentro de caixa: dentro de um painel use recuo tonal ou régua, nunca outro painel com sombra.
- **Don't** usar borda lateral colorida acima de 1px, rótulo em caixa alta com tracking ou kicker acima de título.
- **Don't** usar vinho, roxo ou dourado como cor de marca.
