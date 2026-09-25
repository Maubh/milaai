# Direção de design — socIA (minimalista, 2026-09)

Revisão do usuário em 24/09/2026, registrada em `MINIMAL_LANDING_BRIEF.md`. Referência
estrutural: disciplina de conteúdo e espaço de instinct.com — marca discreta, uma afirmação
clara, dois parágrafos curtos, um CTA. Nada de cópia visual, tipográfica ou textual do Instinct.

## Tese

**Uma afirmação, um CTA, uma conversa.** A landing diz o que a socIA é em um olhar: a sócia
de negócios da lojista no WhatsApp e no Telegram. O único elemento de profundidade é um mockup de iPhone
(moldura leve em React/CSS, sem Vue) com uma troca curta simulada sobre uma peça de semijoia.

## Mundo próprio

Papel quente `#F5F1EA`, tinta ameixa `#24191F`, vinho `#4D1F2D`, ouro `#B99A62` só no detalhe
da marca ou no traço do CTA. Títulos e corpo em Manrope legível; sem grandes gradientes,
pílulas, labels em caixa alta, card boxes ou sombras decorativas. Header só com a palavra
`socIA` pequena, à esquerda, sem nav e sem CTA competindo com o principal. Footer mínimo:
marca, estado de prévia, copyright — nenhum link.

## História e forma

Landing `/`: H1 “A sua sócia de negócios no seu bolso.”, dois parágrafos de produto, um CTA
tipográfico (“Começar com a socIA” → `/login`) e microtexto “Prévia interativa · nenhuma
mensagem é enviada.” À direita (desktop) / abaixo do CTA (mobile), um único iPhone
(moldura SVG + CSS original, proporções inspiradas no iPhone 15 Pro do Magic UI, MIT, sem
dependência instalada) com conversa animada autoral em estilo neutro/escuro: moldura prata,
tela quase preta, balões azul (lojista) e cinza (socIA), foto da peça em SVG inline; sequência
com framer-motion — foto/pergunta, indicador de digitação, Raio-X (custo R$ 63,50 → preço
R$ 142,70; margem R$ 64,21), legenda pronta, confirmação — com loop e botão Rever;
compositor visual com ícones de emoji/anexo/câmera/mic (nada clicável) e home bar sempre
dentro da moldura. Comportamento inspirado no Great UI Mobile Mockup (Saurabh Sharma, MIT,
21st.dev) e no estilo do Solace Chat Messages 2, sem dependência instalada de nenhum dos
dois. Com `prefers-reduced-motion`, a conversa aparece completa sem autoplay,
rotulada “Conversa simulada”. Sem formulário de telefone, preços,
FAQ, cards, seção “como funciona”, integrações ou âncoras.

Onboarding `/login`, `/login/verify`, `/onboarding/connect`: mesma contenção — largura de
leitura curta, marca pequena, título simples, um parágrafo, um controle, um CTA principal,
retorno textual. Progresso discreto (“simulação” perto do controle, sem dominar). Fluxo
local preservado: telefone BR → código de teste 123456 visível → QR conceitual não
escaneável / “Abrir conversa simulada” → `/conversa`. Acesso direto a cada rota mostra a
tela e orienta quando faltar etapa anterior, sem redireciono automático confuso.

## Movimento

Uma entrada GSAP sutil da coluna da landing, conteúdo visível por padrão,
`prefers-reduced-motion` respeitado. Sem motion em cascata de seções (não há mais seções).

## Acabamento

Contraste ≥4.5:1 no corpo, foco visível, labels em todos os campos, OTP operável por
teclado, alvos ≥48px, 390px e 1440px sem overflow horizontal (`overflow-x: clip` global,
grades com `minmax(0, 1fr)`). Toda simulação rotulada; nenhum botão decorativo ou link sem
destino. Simulador `/conversa` e workspace preservados com suas funções.
