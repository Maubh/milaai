# Direção de design e implementação — socIA (minimalista, 2026-09)

Este documento substitui a direção anterior como referência vigente. Leia `README.md`,
`SPEC_LANDING_PAGE.md`, `SPEC_ONBOARDING_WORKFLOW.md` e `PLAN_REVIEW.md` como referência
original, e `MINIMAL_LANDING_BRIEF.md` como a decisão de produto atual (revisão do usuário
em 24/09/2026, referência estrutural instinct.com apenas para disciplina de conteúdo e espaço).

## Tese do produto

A socIA é uma assistente de negócios **no WhatsApp e no Telegram** para lojistas de semijoias e moda. A
conversa é o produto. A landing minimalista apresenta a proposta em um viewport e inicia o
onboarding local; a **conversa simulada** (`/conversa`) mostra o valor enquanto não há número
oficial nem API. O workspace web serve para configurar custos base e conexões e voltar à
conversa. Não há Telegram no plano atual.

## Composição visual

**Uma afirmação, um CTA, uma conversa.** Paleta editorial preservada (ameixa `#24191F`,
papel `#F5F1EA`, vinho `#4D1F2D`, ouro discreto `#B99A62` só no detalhe). Sem fotografia,
sem gradientes grandes, pílulas, labels em caixa alta, card boxes ou sombras decorativas.
Títulos e corpo em Manrope legível. Header só com a palavra `socIA` pequena, sem nav e sem
CTA competindo com o principal. Footer mínimo: marca, estado de prévia, copyright.

A moldura do iPhone (moldura leve em React/CSS, sem Vue ou biblioteca dedicada) pode ter
grafite/ameixa escuro, dimensão realista e cantos contidos. É a única peça de profundidade
da página; preservar grandes áreas de respiro ao redor.

## Rotas e comportamento

1. **Landing `/`**: H1 “A sua sócia de negócios no seu bolso.”, dois parágrafos de produto
   (custos/preço/divulgação; foto, nota ou pergunta na mesma conversa), um CTA tipográfico
   “Começar com a socIA” → `/login`, microtexto “Prévia interativa · nenhuma mensagem é
   enviada.” Um único iPhone à direita (desktop) / depois do CTA (mobile) com troca curta
   simulada rotulada “Conversa simulada”. Sem formulário, preços, FAQ, cards, “como
   funciona”, integrações, âncoras ou footer grande.
2. **Onboarding minimalista**: `/login` (número BR, CTA “Continuar para o código”, “nada foi
   enviado”), `/login/verify` (seis dígitos, código de teste 123456 visível, reenvio
   simulado), `/onboarding/connect` (QR conceitual não escaneável no desktop, “Abrir
   conversa simulada” como CTA principal). Largura de leitura contida, um parágrafo, um
   controle, retorno textual. Cada rota funciona em acesso direto com estado de
   pré-requisito compreensível. Sem JWT ou segurança fictícia. Botões de voltar funcionam.
3. **Conversa simulada** (`/conversa`, preservada): ao menos três prompts do plano
   (“Quanto devo cobrar por esta peça?”, “O que faço com esta nota fiscal?”, “Crie uma
   legenda para esta peça”). Respostas úteis com dados de exemplo, Raio-X com custo, taxa,
   embalagem, rateio e margem. Envio livre restrito a sugestões; não finjir IA generativa.
   Estado de simulação sempre visível.
4. **Workspace `/workspace`** (preservado): painel secundário de custos base e conectores,
   com CTA “Continuar conversa simulada”. `/workspace/precificacao`, `/workspace/conteudo`
   como apoio. `/workspace/integracoes` lista Bling, Olist, Google e Notion com telas de
   conexão simulada.
5. **`/integrations/[app]`** (preservada): transição com nome do provedor, estado
   demonstrativo e retorno à conversa. Sem OAuth real.
6. Header e footer sem links a seções removidas; nenhum link sem destino, nenhum `wa.me`.

## Movimento, acessibilidade, veracidade

Uma entrada GSAP sutil da coluna da landing (conteúdo visível por padrão), escopo e limpeza
via `useGSAP`; respeite redução de movimento. Campos com labels, seis dígitos acessíveis por
teclado, foco visível, toque confortável, 390px e 1440px sem overflow. Nenhuma chamada a API
de WhatsApp, OAuth, cobrança ou IA. Tudo que possa parecer serviço ativo recebe rótulo de
simulação.

## Critérios de aceite

- `npm run build` passa e as rotas servem em localhost:3107.
- Landing → telefone → código `123456` → conexão → conversa → workspace é navegável no
  desktop e mobile.
- `/login`, `/login/verify`, `/onboarding/connect`, `/conversa` e `/workspace` são
  acessíveis por URL direta e exibem interfaces próprias.
- A primeira dobra da landing tem apenas proposta, CTA e mockup de conversa.
- Nenhum botão decorativo, link sem destino ou alegação de integração ativa.
- `PRODUCT.md`, `DESIGN.md` e este briefing refletem a direção minimalista.
