# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Lojistas de joias, semijoias e moda. Na área logada (`/workspace`), a lojista já entrou pelo código do WhatsApp e quer duas coisas: conversar com a mila e administrar as integrações e o plano da loja. Confirmado pelo usuário (via orquestrador) em 2026-10-23.

## Product Purpose

A mila. é uma assistente pessoal de IA para a rotina da lojista, no WhatsApp. A conversa é o produto: a lojista manda foto, nota ou pergunta e a mila responde ali, ajudando com mercadorias, peças, fornecedores, conteúdo e tarefas ligadas às ferramentas conectadas. Precificação é uma das ajudas, não a identidade do produto. O workspace web é somente o apoio administrativo: abre a conversa, mantém os dados da loja, conecta ferramentas e mostra o plano vigente.

## Positioning

Assistente que trabalha dentro do WhatsApp da lojista e grava nas ferramentas que a loja já usa (Jueri, Olist, Nuvemshop, catálogo da Meta, Google Drive e Planilhas, Notion), em nome da loja e só depois de conferir a credencial.

## Operating Context

Fotos de peças, notas de compra, estoque, consignados, fornecedores, catálogo do Instagram e Facebook. A lojista alterna entre celular (WhatsApp) e computador (workspace).

## Capabilities and Constraints

- Login real por código no WhatsApp; a sessão é um cookie HttpOnly (`mila_session`) conferido no servidor antes de qualquer HTML do workspace.
- Integrações reais via BFF (`/api/oauth/*`): OAuth para Olist, Nuvemshop, Google e Meta; chave colada e conferida para Jueri e Notion. "Conectado" só aparece quando o vault da loja tem a credencial.
- Meta aparece apenas quando o backend inclui o provedor na lista da loja (allowlist).
- Integrações de estoque e vendas são do Plano Pro.
- Plano, cobrança, papel e fim do teste vêm de `/api/session`; contratação gera pedido no Asaas (Pix ou cartão) via `/api/billing/order`.
- Histórico de versões em `lib/releases.ts`.
- Bling ainda não está disponível.

## Brand Commitments

Nome `mila.`; tom sóbrio e próximo, em português do Brasil natural. Identidade mineral vigente em `design/brand-mila/` e `public/brand/`: verde mineral `#173F3B`, marfim `#F6F3ED`, tinta `#1E2B28`, areia `#D9CBB8`, sálvia `#8FA89B`; Manrope. Sem vinho, roxo ou dourado como cor de marca. `docs/brand/PRODUCT.md` e `docs/brand/DESIGN.md` descrevem uma fase anterior (simulação, paleta ameixa) e não valem mais onde divergem disto.

## Evidence on Hand

Logos reais das ferramentas em `public/integrations/`, vetores da marca em `public/brand/vectors/`. Não há depoimentos, métricas de uso, contagem de clientes ou números de resultado: nada disso pode ser inventado em tela.

## Product Principles

1. A conversa vem primeiro; o painel serve para chegar nela e para administrar a loja.
2. Estado mostrado é estado verificado: conexão, plano e datas saem do servidor.
3. Cada tela deixa claro o próximo passo, inclusive quando algo falha.
4. Celular primeiro, sem perder leitura no computador.
