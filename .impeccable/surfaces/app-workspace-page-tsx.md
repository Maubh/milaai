---
version: 1
slug: "app-workspace-page-tsx"
primary_target: "app/workspace/page.tsx"
related_targets: ["app/workspace/layout.tsx","components/WorkspaceShell.tsx","app/workspace/integracoes/page.tsx","app/workspace/plano/page.tsx","app/workspace/novidades/page.tsx","app/integrations/[app]/page.tsx"]
---

Proposal: A — "A mesa da loja", branch `feat/workspace-opus-proposal`. Proposta independente, inspirada nos princípios visuais da Cadra. A proposta B ainda será feita em outra branch; este registro não a descreve nem autoriza merge.
Scope: área logada /workspace inteira (shell, visão geral, integrações, plano, atualizações) e as páginas de conexão /integrations/[app]. Visitor mode: Operate.
Audience/job: lojista de joias, semijoias e moda já autenticada; abre a conversa com a mila no WhatsApp e administra integrações e plano. Constraints: estado só da sessão/vault, allowlist Meta, restrição Pro, consentimentos Google/Notion, sessão HttpOnly, APIs intactas, marca mineral/marfim, Manrope.
Build path: code-led como fallback registrado pelo implementador: `buildPath comp` foi considerado, mas a ferramenta de geração de imagem estava ausente no harness usado para o build. A revisão documental não executou geração nem supõe que imagens foram geradas.
References (revisão 2, 2026-10-23, via orquestrador): demo Cadra (codeandchill) e sua imagem pública como referência principal de navegação e superfícies; Refero Superhuman/Ramp para hierarquia tonal; MagicUI/21st.dev como vocabulário de componentes; landing.love, motionsites, scroll-craft só para ritmo. Nada copiado: nem dados, gráficos, assets, código, paletas ou fontes.
History: V1 "livro da loja" (linhas pautadas, abas sublinhadas) aprovada como base; finish review V1 = fix (lede do plano condicional; painel Meta com menos caixas e rótulo em frase). Detector rodado uma vez na V1 (3 side-tab corrigidos); ajustes seguintes são revisados à mão.

## Direction contract

THESIS: A área logada é a mesa da loja: um canvas marfim onde painéis tonais de densidades diferentes guardam a conversa, o estado verificado da conta e as linhas de trabalho. Recusa a faixa de largura inteira seguida de lista e a grade de cartões iguais com métricas inventadas.
OWN-WORLD: Canvas marfim um tom abaixo dos painéis; painéis claros com raio grande e sombra curta, sem borda dupla; preenchimento verde mineral concentrado na cápsula ativa da navegação, na ação principal e no painel da conversa; texto mineral também em marca, links, contagens e pequenos destaques; areia para avatar e marcas de passo. Linhas pautadas dentro dos painéis; Manrope em escala fixa; números tabulares.
STORY: A lojista vê primeiro como conversar com a mila, ao lado lê quantas ferramentas estão conectadas e em que plano está, e abaixo o que mudou na última versão; cada painel leva direto à página que resolve.
FIRST VIEWPORT: Desktop: barra única com wordmark e nome da loja à esquerda, cápsula de navegação com quatro destinos ao centro, "Conversar com a mila" e avatar da conta à direita. Abaixo, saudação; painel mineral da conversa com QR ocupando dois terços, painel "Sua loja hoje" no terço restante; painel da última versão abaixo dele, ambos à direita da conversa. Celular: barra com marca, WhatsApp e conta; dock fixo inferior com os quatro destinos e rótulos reais.
FORM: Mesa da loja, evolução da posição 3 (livro da loja) da lista ordenada, seed 41e6aa52 (surface, operate), corroborado pelo stdout registrado pelo orquestrador; signature: indicador de navegação compartilhado que desliza entre destinos (framer-motion layoutId, transform/opacity, desligado em reduced-motion).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance


## Registro da revisão A — 2026-10-23

Implementado e descrito a partir das fontes: cápsula desktop e dock mobile com indicador compartilhado; mesa tonal com conversa/QR e estado da conta; catálogo de integrações em cinco colunas compartilhadas por subgrid (marca · texto · nível · estado · ação); Meta em uma área de recuo com resumo, "Configurar" e "Detalhes da sincronização"; plano e situação apresentados separadamente; conectado oferece "Desconectar", sem "Reconectar".

A distribuição de nível e estado é uma decisão da revisão: um único selo Pro no eixo do nível; quando a integração está bloqueada pelo plano, a célula de estado fica vazia (`status: null`) e a ação escolhida pelo usuário é "Assinar plano Pro" → `/workspace/plano`. A separação evita repetir "Pro" como estado de conexão. Conferido na fonte: `IntegrationRow` aceita estado opcional/nulo e a página passa `null` no bloqueio por plano.

No catálogo da Meta, fonte e filtro alterados são uma seleção pendente até o salvamento. Fechar "Configurar" mantém esse fato visível: o resumo mostra a seleção atual, distingue pendência de configuração salva e informa que "Sincronizar" salva antes de enviar. Conferido na fonte: `fonteAlterada` e `filtroAlterado` distinguem as alterações; `linhaFonte` usa a seleção atual; a nota de salvamento aparece para fonte não salva ou alteração pendente quando o envio não está bloqueado. O fluxo salva fonte/filtro antes do sync e interrompe em falha. O container está no wrapper da área, permitindo a resposta da configuração à largura disponível.

## Revisão final: conectadas no topo

Requisito do usuário implementado após o lote anterior: uma seção "Conectadas" no topo da página de integrações; abaixo, as restantes agrupadas por finalidade, sem repetir linhas. A participação no topo depende de `connected === true` no vault e da allowlist existente; a mudança de posição não pode produzir estado conectado por inferência. A restrição Pro continua definida por ID da ferramenta, sem depender do grupo visual. `IntegrationRow` e o mesmo gerenciador da Meta são reutilizados.

O CTA bloqueado escolhido pelo usuário é "Assinar plano Pro", direcionado a `/workspace/plano`. O orquestrador e o reviewer conferiram a fonte final; as capturas de Meta e seções em 1440px, 375px e 320px confirmaram agrupamento sem duplicação e o CTA, conforme evidência reportada pelo orquestrador.

## Estado da documentação e revisão

`DESIGN.md` e `.impeccable/design.json` atualizados para a proposta A. Os ajustes de Pro e seleção Meta foram conferidos diretamente nas fontes; agrupamento final e CTA foram conferidos pelo orquestrador e reviewer. A revisão terminou com disposition `ship` no lote anterior e também no delta final (remaining clear), conforme reportado pelo orquestrador. A proposta B permanece futura e independente; este fechamento abrange somente A, sem concluir o objetivo global das duas propostas nem autorizar merge.

Checks finais reportados pelo implementador Claude e transmitidos pelo orquestrador: 87 testes aprovados, 1 skip, 0 falhas; TypeScript e build aprovados. O build usou uma cópia idêntica, isolando o `.next` do servidor na porta 3217. O skip é a paridade com o backend, cuja fixture estava indisponível. A verificação de UI usou APIs interceptadas; não é evidência de validação em produção. O detector citado no histórico pertence à V1, sem nova aprovação implícita do detector para A.

Evidência visual reportada: capturas finais de Meta e das seções em 1440px, 375px e 320px, conferidas pelo orquestrador após os ajustes. Repositório de evidência: `/private/tmp/claude-501/-Users-msvasconcelos-Code-personal-milaai/6feefd7e-805c-470b-8c13-3b65042316ad/scratchpad`. As capturas anteriores `a-final` das 09:14 e os estados das 09:15 pertencem à sequência de trabalho; o fechamento se apoia na conferência final reportada, sem inferir aprovação apenas do nome de arquivo.

Raster de interface: QR gerado localmente a partir do link de WhatsApp da sessão/fallback configurado; logos das ferramentas e vetores da marca preexistem em `public/integrations/` e `public/brand/vectors/`. Não houve geração de imagem nesta revisão documental.
