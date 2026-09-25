# Direção final — socIA minimalista

Revisão do usuário em 24/09/2026. Referência estrutural: https://instinct.com/ (visitada pela coordenadora). Usar apenas a disciplina de conteúdo e espaço: marca discreta, uma afirmação clara sobre o produto, dois parágrafos curtos e um CTA. Não copiar logo, tipografia, copy, layout pixel a pixel ou detalhes decorativos do Instinct.

## Decisão de produto

A socIA é uma assistente para lojistas de semijoias e moda que será usada no WhatsApp. A landing deve dizer o que ela é e o que ajuda a fazer. O CTA inicia o onboarding local. Não existe API/número oficial; o fluxo de telefone, OTP e conversa continua mockado e explicitamente identificado como prévia. O simulador `/conversa`, as três telas de onboarding e o workspace de apoio continuam acessíveis; apenas a landing perde as seções e controles promocionais.

## Landing `/`

- Uma página curta, idealmente um viewport em desktop e uma rolagem curta no mobile. Sem fotografia, formulário de telefone, tabela de preços, FAQ, cards, seção “como funciona”, lista de integrações ou nav de âncoras.
- Palavra `socIA` pequena no topo esquerdo. Conteúdo principal numa coluna legível, alinhada à esquerda, com espaço generoso. H1 proposto: “A sua sócia de negócios no WhatsApp.”
- Dois parágrafos de produto em português natural. Primeiro: ajuda a entender custos, chegar a um preço com margem e preparar a divulgação de cada peça. Segundo: a lojista poderá enviar foto, nota fiscal ou pergunta e receber orientação na mesma conversa. Não prometer automação ativa nem resultados ainda inexistentes.
- Um CTA principal, em tratamento tipográfico elegante (link com sublinhado autoral ou botão muito contido): “Começar com a socIA” → `/login`. Abaixo, microtexto discreto: “Prévia interativa · nenhuma mensagem é enviada.”
- Um único mockup de iPhone à direita do texto no desktop e depois do CTA no mobile. Referência de forma: https://inspira-ui.com/docs/en/components/device-mocks/iphone-mockup. A referência é Vue/Nuxt; construir a moldura de modo leve em React/CSS ou SVG, sem incorporar Vue ou uma biblioteca só para isso. Dentro, mostrar uma troca curta de mensagens sobre uma peça de semijoia: pergunta da lojista, resposta da socIA com custo, preço e margem de exemplo. Rotular “Conversa simulada” dentro ou junto do telefone. O mockup serve de evidência visual, sem virá-lo uma demonstração interativa na landing. Não mostrar controles falsos de câmera, teclado ou envio.
- Footer mínimo com marca/copyright e estado de prévia. Nenhum link morto. Não usar o nome Instinct no produto.
- Paleta clara, papel quente e tinta ameixa; ouro apenas no detalhe da marca ou traço do CTA. Títulos em Manrope, legíveis. Evitar grandes gradientes, pílulas, labels em caixa alta, card boxes e sombras decorativas.
- A moldura do telefone pode ter grafite/ameixa escuro, com dimensão realista e cantos contidos. O telefone é a única peça de profundidade da página; preservar grandes áreas de respiro ao redor.
- Uma entrada GSAP sutil da coluna, com conteúdo visível por padrão e `prefers-reduced-motion` respeitado. Sem motion em cascata de seções.

## Onboarding `/login`, `/login/verify`, `/onboarding/connect`

- Mesmo vocabulário minimalista: largura de leitura contida, marca pequena, fundo claro, título simples, um parágrafo, campo/OTP/estado, um CTA principal e retorno textual.
- Mostrar o progresso com discrição, sem split hero, painel promocional ou passos repetidos em texto e lista. A palavra “simulação” deve continuar clara perto do controle relevante, sem dominar a composição.
- `/login`: número brasileiro, validação, CTA “Continuar para o código”; dizer que nada foi enviado.
- `/login/verify`: seis dígitos e código de teste 123456 visível; contador/reenvio simulado; CTA de verificação.
- `/onboarding/connect`: manter o QR conceitual previsto para desktop, rotulado como não escaneável; no mobile priorizar “Abrir conversa simulada”. Um CTA principal; link secundário para workspace pode ficar discreto ou ser movido para a conversa.
- Acesso direto a cada rota deve mostrar a tela e um caminho compreensível quando faltar etapa anterior; não redirecionar automaticamente antes que a pessoa entenda onde está.

## Escopo da implementação

Worker OpenCode Muse Spark 1.3 edita UI e docs de design neste worktree; coordenadora revisa. Preserve a lógica da conversa e do workspace, sem refazer suas funções. Ajuste SiteHeader/SiteFooter ou layout para que a landing e onboarding recebam a nova simplicidade sem links a seções removidas. Atualize DESIGN.md, PRODUCT.md e IMPLEMENTATION_BRIEF.md para registrar a direção atual. A imagem rejeitada pode continuar no repositório como arquivo histórico sem renderização.

## Aceite observável

`npm run build` passa; `/`, `/login`, `/login/verify`, `/onboarding/connect`, `/conversa`, `/workspace` servem em localhost:3107. Em 1440px e 390px, landing e onboarding têm leitura clara, CTA visível, nenhum overflow horizontal; o fluxo telefone → 123456 → conversa funciona. A primeira dobra da landing tem apenas a proposta, o CTA e o mockup de conversa. Nenhum link `wa.me` ou chamada externa.
