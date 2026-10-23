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
  desk-track: "oklch(92.6% 0.01 85)"
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
  panel: "20px"
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
    backgroundColor: "{colors.desk-track}"
    rounded: "{rounded.pill}"
    padding: "4px"
  desk-panel:
    backgroundColor: "{colors.desk-panel}"
    rounded: "{rounded.panel}"
    padding: "24px 32px"
  conversation-panel:
    backgroundColor: "{colors.mineral}"
    textColor: "{colors.mineral-ink}"
    rounded: "{rounded.panel}"
    padding: "40px"
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

A área logada é uma mesa de trabalho: um canvas marfim um tom abaixo dos painéis, onde cada painel tem uma densidade própria e um trabalho só. A conversa com a mila é o único painel mineral; o estado da conta (conexões, plano, versão) fica num painel claro ao lado; as listas de trabalho (integrações, histórico, recursos do plano) vivem em linhas pautadas dentro de painéis. É uma interface Operate: sóbria e próxima, familiar no uso, com a marca nos detalhes (o verde mineral, o ponto do `mila.`, o raio largo).

A mesa evoluiu do "livro da loja" (linhas pautadas sobre papel), que segue como a gramática interna dos painéis. Referências usadas como princípio, nunca como fonte de dados, assets ou código: a demo Cadra (cápsula de navegação com destino ativo cheio, painéis tonais, composição assimétrica de densidades), Refero Superhuman/Ramp (cor pontual e superfícies tonais com escala controlada), MagicUI e 21st.dev (vocabulário do indicador compartilhado e do dock), landing.love, motionsites e scroll-craft (respiro e economia de movimento).

**Key Characteristics:**
- Canvas marfim + painéis claros com sombra curta; nenhum painel tem borda.
- Preenchimento mineral concentrado no destino ativo, na ação principal e no painel da conversa; texto mineral também sinaliza marca, links e pequenos destaques.
- Linhas pautadas (hairline 1px) para qualquer lista; cartões iguais em grade não existem.
- Manrope em escala fixa de rem; números tabulares em contagens, datas e preços.
- Todo estado exibido vem da sessão ou do vault; vazio, carregando e falha têm linguagem própria.

## Colors

Restrito: neutros marfim quentes, um acento mineral, cores semânticas só para estado.

### Primary
- **Verde mineral:** cápsula do destino ativo, botão principal e painel da conversa; em texto, marca, links de ação, contagens, avatar e selo Pro. Escurece para o tom profundo no hover. Os valores normativos estão no frontmatter; a cor de marca histórica está em `PRODUCT.md`.
- **Marfim sobre mineral** (oklch(96.6% 0.008 85)): texto e botão invertido dentro do mineral; o texto secundário ali usa o mineral esmaecido (oklch(86% 0.022 170)), nunca cinza.

### Tertiary
- **Areia** (oklch(93.5% 0.018 75)): fundo do avatar e dos números de passo. Apoio, nunca texto.

### Neutral
- **Canvas da mesa** (oklch(95.6% 0.009 85)): fundo da página e da barra.
- **Painel** (oklch(99.2% 0.003 85)): superfície de todo painel, menu da conta e dock.
- **Papel e superfície:** os neutros herdados do livro permanecem nos controles, no hover e no ladrilho do QR, distintos do canvas e do painel da mesa.
- **Recuo** (oklch(96.8% 0.007 85)): áreas dentro de painel (gerenciador do Meta, colunas de plano, "onde gerar").
- **Trilho** (oklch(92.6% 0.01 85)): fundo da cápsula de navegação.
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

Conteúdo em coluna de até 1120px com respiro lateral de 16–40px. A visão geral é uma grade 2/1: conversa ocupando duas linhas à esquerda; estado da conta e última versão empilhados à direita. Abaixo de 860px tudo vira uma coluna na ordem conversa → estado → versão. Linhas de integração herdam cinco colunas por subgrid: marca (6,5rem) · texto (flexível) · nível (3,5rem) · estado (8,5rem) · ação (11,5rem), com intervalo de 24px. Abaixo de 760px do container, marca, nível e estado ficam na primeira linha; texto, ação e expansão ocupam a largura. A barra superior tem 72px no desktop e 60px abaixo de 1024px, quando a navegação vai para o dock inferior (64px + safe area). Espaçamento em degraus de 4px.

## Elevation & Depth

Profundidade por camada tonal mais uma sombra curta e única no painel. Sem bordas em painéis: a borda é reservada para controles e para o destaque do plano atual.

### Shadow Vocabulary
- **Painel** (`box-shadow: 0 1px 2px oklch(27% 0.025 165 / 0.06), 0 14px 32px -22px oklch(27% 0.025 165 / 0.22)`): todo painel e o botão de conta.
- **Barra** (`box-shadow: 0 1px 0 oklch(27% 0.025 165 / 0.06)`): separa a barra fixa do conteúdo.
- **Dock** (`box-shadow: 0 -1px 0 oklch(27% 0.025 165 / 0.08), 0 -10px 28px -20px oklch(27% 0.025 165 / 0.3)`).
- **Menu** (`box-shadow: 0 1px 2px oklch(27% 0.025 165 / 0.08), 0 18px 40px -18px oklch(27% 0.025 165 / 0.35)`): menu da conta.

### Named Rules
**The One Elevation Rule.** Cada superfície declara borda ou sombra, nunca as duas.

## Shapes

Raios em quatro degraus coordenados: controles 10px, áreas de recuo 14px, painéis 20px (14px no celular), cápsulas e botões de conversa em pílula. Hairlines de 1px; a única linha mais grossa é o anel de 1,5px do plano atual.

## Components

### Buttons
- **Shape:** retângulo suave (10px) para ações de página; pílula para conversa e navegação.
- **Primary:** mineral com texto marfim, 44px de altura, peso 600–700.
- **Hover / Focus:** escurece para o mineral profundo; anel de foco de 2px em mineral com 3px de afastamento (marfim dentro do painel da conversa). Pressão: translate 1px ou scale 0,97.
- **Secondary:** superfície do painel com régua forte; hover troca a borda para mineral. **Quiet:** sem borda, para "Desconectar" e "Cancelar".

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** painel sobre canvas; recuo dentro de painel.
- **Shadow Strategy:** sombra de painel (ver Elevation).
- **Border:** nenhuma.
- **Internal Padding:** 24px × 32px; 16px no celular.

### Inputs / Fields
- **Style:** 48px, borda em régua forte, raio 10px, fundo em superfície herdada, caret mineral.
- **Focus:** borda mineral + anel de 2px.
- **Error:** bloco de erro com borda e fundo de erro, texto que diz o problema e o que fazer.

### Navigation
- **Desktop (≥1024px):** cápsula central sobre o trilho; destino ativo em pílula mineral que desliza entre itens (framer-motion `layoutId`, mola curta, desligado em movimento reduzido). Atualizações mostra versão e ponto de não lida.
- **Celular e tablet:** dock fixo com quatro destinos, ícone + rótulo real, alvos de 56px, pílula ativa compartilhada.
- **Conta:** avatar em pílula; menu com nome, loja e "Sair da conta", foco no sair ao abrir, Esc devolve o foco.

### Painel da conversa (signature)
Painel mineral com título, frase curta, botão marfim "Abrir WhatsApp" (48px) e QR em ladrilho claro (148px). Até 1100px o QR passa para baixo do texto (112px); até 720px ele sai. Até 360px o botão ocupa a largura. A ação de conversa da barra é outra variante: pílula mineral de 44px.

### Linha de integração (signature)
Cinco eixos compartilhados: marca, texto, nível, estado e ação. Nome com detalhe e descrição ficam juntos; Google e Notion têm consentimento em `<details>`. O nível exigido usa um único selo Pro sobre areia, sempre no mesmo eixo, sem repetir a exigência no estado. O estado de conexão tem ponto (cheio = conectado); conectado oferece "Desconectar", sem "Reconectar". O CTA de bloqueio escolhido pelo usuário é "Assinar plano Pro", com destino `/workspace/plano`. No bloqueio por plano, o estado é nulo e sua coluna fica vazia, preservando alinhamento sem repetir "Exige Pro".

Integrações conectadas aparecem primeiro, numa seção "Conectadas". As demais ficam abaixo, agrupadas por finalidade, sem repetir uma ferramenta em duas seções. Só conexão confirmada no vault entra no topo; a allowlist da Meta continua valendo. O mesmo componente de linha, o gerenciador da Meta e as regras de plano por ID são preservados ao reagrupar.

### Catálogo da Meta
Uma área de recuo sob a linha conectada: resumo legível com nome do catálogo, fonte e último envio; "Configurar" expande fonte e filtro; "Sincronizar" permanece no resumo. Os resultados, erros e identificadores ficam em "Detalhes da sincronização". Configuração usa uma régua interna em vez de outro painel com sombra.

O salvamento da fonte e do filtro antecede o envio; se falhar, a sincronização para. O resumo mostra a fonte selecionada e distingue alterações não salvas da configuração salva, inclusive quando "Configurar" está fechado. Uma nota informa que "Sincronizar" salva antes a seleção. Alterações de fonte e filtro são indicadas separadamente ou juntas; fonte ainda não salva e sugestão também são nomeadas. O container da área fica num wrapper próprio, permitindo que o recuo e suas ações respondam à largura disponível. A fonte antiga não substitui a seleção atual no resumo.

### Plano e situação
O nome do plano e sua situação são informações distintas. Na visão geral, o plano ocupa o valor principal e a situação aparece abaixo; em "Meu plano", ficam em linhas separadas. "Em teste, sem cobrança", "Teste encerrado" e datas dependem da sessão. Não concatenar situação ao nome do plano nos exemplos do sistema. Sem `session.plan` reconhecido, mostrar "Plano não informado" e não marcar nenhuma opção da comparação como plano atual. `informedPlan` e `isShownCurrentPlan` mantêm o nome e o selo vinculados ao dado recebido, sem transformar o fallback comercial em informação exibida. Parâmetros de URL não alteram o plano lido do vault; com plano não lido, ferramentas que o exigem ficam "Não verificado", sem presumir Pro.

### Esqueleto de carregamento

A visão geral usa `app/workspace/(visao-geral)/page.tsx`, `loading.tsx` e `overview.css`: o grupo mantém `/workspace` e o gate de `app/workspace/layout.tsx`, sem estender seu fallback às rotas irmãs. `OverviewView` e `PlanView` compartilham a apresentação entre página e fallback; o fetch inicial e "Tentar de novo" voltam ao mesmo estado de carregamento. `TextBone` fica dentro do elemento real de texto, herda sua fonte e usa altura de 0,8em, sem substituir a altura de linha do título, valor ou detalhe.

`WorkspaceSkeleton` anuncia a espera com `role="status"`, `aria-live="polite"` e `aria-busy="true"`; seu conteúdo é `aria-hidden` e `inert`, incluindo links. Na página cliente, um único status anuncia a leitura e os controles estáticos continuam utilizáveis quando seu destino está disponível; ações que dependem de dados ficam indisponíveis. O QR ainda sem link reserva a própria moldura do QR, sem código fictício: 148px no desktop, 112px até 1100px e oculto até 720px.

Integrações reserva três áreas neutras com `IntegrationRowPending`, que reutiliza `IntegrationRow` e as cinco colunas por subgrid. As formas não afirmam ferramentas conectadas, quantidade real ou participação da Meta antes da leitura da allowlist. Atualizações usa `UpdatesView` e `ReleaseTimeline` com a prop `loading` e `TextMask`: os textos fixos mantêm quebras e estrutura do histórico sob a máscara; a apresentação pronta permanece igual.

O pulso de formas, texto, máscara e QR pendente alterna opacidade de 1 a 0,5 em 1,4s. `components/workspace-skeleton.css` desliga essas animações em `prefers-reduced-motion: reduce`; o CSS da visão geral também desliga transição e transformação de pressão das ações.

Registro desta correção: `review_skeleton_fix` encerrou o delta com `ship` e `remaining: clear`, segundo o coordenador, após conferir fontes e provas das quatro rotas em 1440/375px, carregamento, falha/nova tentativa e movimento reduzido. Claude reportou 94 testes aprovados, 1 skip, TypeScript e `build-a6` com exit 0, confirmados pelo coordenador; evidências e limites de fixtures/OAuth/backend estão no [surface brief](.impeccable/surfaces/app-workspace-page-tsx.md). Estes checks não foram executados pelo documenter.

## Do's and Don'ts

### Do:
- **Do** colocar toda lista em linhas pautadas dentro de um painel (hairline 1px, sem borda no último item).
- **Do** mostrar só estado lido da sessão ou do vault; quando a leitura falha, dizer "Não deu para ler…" com "Tentar de novo".
- **Do** manter clicáveis numa linha só em 320px; encurtar o rótulo (ex.: "WhatsApp") antes de quebrar.
- **Do** desligar a pílula deslizante e as transições com `prefers-reduced-motion`.

### Don't:
- **Don't** criar grade de cartões iguais com ícone + título + texto, nem métricas, gráficos ou números que a sessão não informa.
- **Don't** pôr caixa dentro de caixa: dentro de um painel use recuo tonal ou régua, nunca outro painel com sombra.
- **Don't** usar borda lateral colorida acima de 1px, rótulo em caixa alta com tracking ou kicker acima de título.
- **Don't** usar vinho, roxo ou dourado como cor de marca.
