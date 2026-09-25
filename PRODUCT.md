# Produto socIA

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js com TypeScript, confirmado pelo usuário para esta versão.

## Users

Empreendedoras e lojistas de semijoias, joias e moda que precisam decidir preços e preparar a comunicação de cada peça sem depender de planilhas complexas.

## Product Purpose

A socIA é uma assistente de negócios **no WhatsApp e no Telegram**: a lojista envia foto, nota ou pergunta e recebe orientação de preço, leitura de custos e rascunhos de conteúdo na conversa. Nesta versão, a landing minimalista apresenta a proposta em um viewport (afirmação, dois parágrafos, um CTA para `/login`) com um mockup de iPhone mostrando uma troca simulada; o onboarding simulado (telefone → código 123456 → conexão) leva à **conversa simulada** navegável enquanto não há número oficial nem API. O workspace web é apoio: guarda custos base e mostra conectores em estado demonstrativo.

## Positioning

A conversa é o produto. Na landing, ela aparece como um iPhone estático com pergunta da lojista e resposta da socIA (custo, preço, margem de exemplo). No simulador `/conversa`, o Raio-X do Preço aparece como resposta da assistente: decomposição legível de custo da peça, embalagem, taxas, rateio e margem, com dados de exemplo. A calculadora web e o painel existem como apoio, nunca como centro da experiência.

## Operating Context

A lojista trabalha com fotos de peças, notas fiscais, estoque, custos de venda e Instagram. O WhatsApp é o canal da experiência final, mas ainda não há número oficial, API, OTP real, webhooks ou OAuth. Todo o fluxo — telefone, código 123456, conexão e conversa — é simulado localmente no navegador.

## Capabilities and Constraints

- Landing minimalista de um viewport, onboarding simulado em três rotas, simulador de conversa com roteiros úteis, workspace de apoio e transições de integração demonstrativas; tudo responsivo e em português do Brasil.
- Telefone, código, conversa, conectores e OAuth permanecem simulados. A interface identifica esses estados com rótulos sempre visíveis.
- Nenhuma chamada a APIs externas de WhatsApp, ERP, Google, Notion ou Instagram; nenhum link `wa.me`; QR apenas conceitual e não escaneável.
- Preços R$ 39, R$ 69 e R$ 119 constam dos documentos do repositório como planos previstos; a disponibilidade comercial não foi confirmada e os planos não aparecem mais na landing.
- Não afirmar testes gratuitos, resultados, tempo de ativação, criptografia específica, clientes ou métricas sem evidência. Sem Telegram: não consta dos documentos desta versão.

## Brand Commitments

Nome socIA; tom de sócia experiente, claro e próximo. Direção visual minimalista (revisão 2026-09): ameixa `#24191F`, papel `#F5F1EA`, vinho `#4D1F2D`, ouro discreto `#B99A62` só no detalhe. Títulos e corpo em Manrope legível. Header só com a palavra `socIA`; footer mínimo com estado de prévia. Ainda não há logotipo, fotos de produto ou número oficial de WhatsApp.

## Evidence on Hand

`README.md`, `SPEC_LANDING_PAGE.md`, `SPEC_ONBOARDING_WORKFLOW.md` e `ORCA_PROMPT.md` como referência original. `IMPLEMENTATION_BRIEF.md` e `PLAN_REVIEW.md` registram a correção WhatsApp-first. `MINIMAL_LANDING_BRIEF.md` (2026-09) é a direção vigente para landing e onboarding. Não há depoimentos, logos de clientes, credenciais de integração ou serviço ativo no repositório.

## Product Principles

1. A conversa vem primeiro; o cálculo é evidência dentro da resposta.
2. Distinguir simulação de funcionalidade ativa em toda tela.
3. Tornar claros os próximos passos da lojista em qualquer tela.
4. Dar prioridade ao uso em celular, sem perder a legibilidade no desktop.
