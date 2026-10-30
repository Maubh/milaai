# Landing page × workspace A — direção vigente

Referência: workspace A, commit `0a6258a`. Coordenação e validação: ZCode. Implementação: Claude Opus 5.5 (`claude-opus-5-5`). Revisão independente de fontes e visual: Claude Fable 5.1 (`claude-fable-5-1`), conforme solicitado pelo usuário.

## Direção aprovada e invariantes

A mila. é uma assistente pessoal de IA para a rotina da lojista de joias e semijoias, exclusivamente no WhatsApp. Preço é uma ajuda entre várias, não a identidade do produto. O usuário aprovou seguir essa direção depois de rejeitar interfaces inexistentes. Foram removidas das duas prévias a calculadora, a folha de Raio-X, o chat com abas e as fichas de dados. Esses componentes não foram apenas movidos para baixo: os arquivos e o CSS sem uso foram retirados.

Dois elementos obrigatórios, expressamente pedidos pelo usuário, permanecem nas duas versões:

- O `IPhoneMockup.tsx` original, com conversa animada, sem qualquer alteração no componente ou em `app/site.css`.
- O `IntegrationsMarquee` original, com hub, cinco marcas, feixes pulsantes, ResizeObserver, IntersectionObserver e movimento reduzido. Seu CSS `integrations-beam.css` e algoritmo estão intactos. A única mudança no componente compartilhado são props opcionais `ctaHref`/`ctaLabel`, com os defaults da home preservados.

A identidade do workspace é herdada nas cores mineral/marfim, Manrope, filetes e acabamento. Não foi criada uma nova experiência de atendimento web. O workspace é mencionado só como apoio para dados, conexões e plano. A home atual `/`, o workspace e as APIs não foram alterados.

## Correção do bloco branco rejeitado

O usuário rejeitou a grande tabela branca de integrações, com nomes colados nas bordas. A correção não foi apenas acrescentar uma borda:

- **A — Perto de você, na loja:** a primeira correção usou linhas abertas; no refinamento posterior o usuário considerou a seção redundante e ela foi retirada por completo. Permanecem o mapa animado, os limites na oferta e na FAQ e uma nota curta sobre Meta e Bling. O CTA do mapa agora leva a `#planos`.
- **B — A rotina ganha uma assistente:** mantém dois grupos editoriais abertos, Fornecedores e compras / Estoque e vendas, com títulos, marcas e descrições em grade responsiva.
- Em B, as descrições completas de Google e Notion continuam vindo das fontes únicas e podem ser expandidas em elementos `details` nativos com alvo de 44px. A expansão do Google foi testada no navegador.

## Revisão independente Fable

A revisão de fontes confirmou posicionamento, remoção das interfaces falsas, oferta de R$39/R$69 e limites, preservação das animações, defaults do componente compartilhado, metadados noindex, semântica, âncoras e cobertura de render. Encontrou uma capacidade sem comprovação: áudio. A frase foi substituída por mensagem, foto ou nota de compra e ganhou teste de regressão. O próprio Fable marcou o achado como resolvido.

A revisão visual independente leu oito capturas atuais (heroes e detalhes de integrações, A/B, desktop/mobile). Resultado: `disposition: ship`, no escopo das capturas. Não encontrou overflow, sobreposição ou texto colado em bordas; confirmou que o bloco branco rejeitado foi eliminado e que os dois layouts mantêm composições distintas. Isso não certifica backend nem animação em movimento a partir de pixels.

## Validação executada

- `next build` em cópia isolada, sem `.env`, `.git` nem `.next` do servidor ativo: aprovado, incluindo a revisão de copy.
- Suíte completa com Node v24.21.0: **135 testes, 134 aprovados, 0 falhas, 1 ignorado** por backend OAuth ausente. O teste ignorado já existia antes deste trabalho. A suite das propostas cobre o novo posicionamento, UI falsa ausente, paridade da oferta, fontes de Google/Notion, render das três rotas, ids e âncoras, as duas animações originais, CSS e metadados.
- `git diff --check`: sem problemas.
- `tsc --noEmit` no diretório de desenvolvimento ainda acusa dois erros em `.next/types/app/workspace/page.ts`, tipos gerados antigos referentes ao caminho anterior da página do workspace. O build isolado não tem esses erros. Nenhum arquivo gerado foi apagado enquanto o servidor de outro trabalho estava ativo.
- Detector de design nesta revisão: 23 avisos consultivos de escala tipográfica; nenhum warning/error. Não equivale a aceite visual, realizado pelo navegador e pelo Fable.
- Navegador: heroes e detalhes A/B em desktop e celular; diagrama responsivo; telefone animando; expansão nativa do Google. Dimensões calculadas sem overflow nas larguras observadas. Mapa confirmado com **5 feixes em `animation-play-state: running` em A e B**, incluindo B em 320px. Fora da vista, o componente original pausa os feixes.
- Browser locators do ambiente tiveram timeouts em alguns controles, apesar de presentes e visíveis. A expansão de Google foi confirmada por clique normal de coordenadas a partir de screenshot. Sem injeção de eventos ou alteração do produto para forçar aprovação.
- Lock de fontes atualizado conscientemente após revisão Fable e navegador: retiradas só as 3 UIs rejeitadas criadas nesta sessão; adicionadas/atualizadas apenas as fontes das prévias e a prop opcional do Marquee. Sem modificar testes jurídicos ou hashes alheios ao escopo.

## Entrega e acesso

Prévias em `/propostas/a`, `/propostas/b` e índice `/propostas`. Porta habitual `http://localhost:3232` segue ativa, encaminhando ao servidor de desenvolvimento existente. A porta 3233 mantém o build isolado utilizado para os prints. Não houve commit, push nem deploy.

**Capturas vigentes:** `output/landing-proposals/assistente-pessoal/`. Evidências de modelo, revisão e invariantes em `evidencias.json`. As pastas `final/` e `review/` são históricas da direção rejeitada e não representam a entrega vigente.

## Refinamento da proposta A: cadastro, contraste e simplificação

O pedido seguinte ampliou a copy de cadastro para os três conectores documentados na release 0.2.0 (`lib/releases.ts:55–57`), diferenciou os blocos consecutivos e retirou a seção detalhada de integrações da A.

- A tarefa da peça nova agora informa cadastro no **Jueri, Olist ou Nuvemshop**, no Pro, com a ferramenta conectada e autorizada e pedido pela conversa. Texto e frase são compartilhados por A e B; não houve execução de cadastro no backend real.
- Rotina permanece clara e pautada. "Uma conversa que já conhece a loja" virou uma faixa mineral, título no topo, três colunas no desktop e pontos empilhados no celular. A nota do painel fica no rodapé. Nenhuma interface operacional foi criada.
- A não renderiza mais `#sobre-integracoes` nem "O que cada integração faz". O CTA do mapa é "Conhecer os planos", com destino `#planos`. B mantém sua composição e seção de detalhes; seus arquivos de componente e CSS não foram alterados.
- IPhoneMockup, IntegrationsMarquee, CSS dos feixes e home foram conferidos por hash contra o estado anterior e continuam intactos nesta rodada.
- Claude Opus 5.5 implementou. Fable 5.1 revisou fonte e cinco capturas reais (desktop, 390px e 320px): `disposition: ship`, sem achados materiais. O comentário CSS defasado apontado como cosmético foi retirado.
- Build isolado aprovado; detector com 7 avisos consultivos e nenhum warning/error; `git diff --check` limpo; **136 testes, 135 aprovados, 0 falhas e 1 ignorado** por backend OAuth ausente. Somente quatro hashes de aplicação foram atualizados no lock após revisão.
- No navegador, `scrollWidth === clientWidth` em 1440, 390 e 320px; cinco pulsos em `running`; CTA navega a `#planos`.

Capturas e evidências desta rodada: `output/landing-proposals/assistente-pessoal/refinamento-a/`, inclusive `desktop-conversa.png`, `mobile-conversa.png` e `revisao.json`. A prévia habitual na porta3232 segue ativa. Sem commit, push ou deploy.

## Navbar A, menu hambúrguer e Meta — estado atual

Pedidos adicionais do usuário: navbar acompanhar a rolagem; no celular usar menu hambúrguer; incluir o quadradinho Meta na animação; retirar a faixa branca e respeitar a paleta exata da marca. O gradiente verde-claro tentado na primeira versão foi rejeitado e não faz parte da entrega final.

- A navbar da A é sticky, com altura real publicada por ResizeObserver. Seções e foco recebem offsets; o título sticky da Rotina também respeita o cabeçalho. No celular há botão de 44px e gaveta fora do fluxo, com âncoras nativas. Tab após o botão entra nos links; Escape retorna o foco; clique fora ou seleção de seção fecha. Desktop mantém a cápsula; B mantém sua navbar anterior.
- A faixa de integrações das duas prévias usa **mineral oficial #173F3B** e **marfim oficial #F6F3ED**, sem gradiente ou tom novo. Cores computadas verificadas no navegador: `rgb(23, 63, 59)`, `rgb(246, 243, 237)` e `background-image: none`.
- A Meta aparece como sexto nó, "Catálogo do Instagram e Facebook", com "Sujeito à liberação". Há seis conexões e seis pulsos em execução. O algoritmo original de medição/observação e os keyframes de animação foram preservados. A variante 3+3 mantém Meta inteira dentro do diagrama em320px (base do nó aproximadamente912px contra base do diagrama920px na captura). `includeMeta` é falso por padrão: o render da home continua idêntico, com cinco nós.
- Foi encontrado em teste de teclado um salto do botão para o CTA fora do menu. A ordem DOM foi corrigida (ações antes da gaveta) e reconferida. O Fable aprovou a versão final, não a anterior de cor rejeitada, lendo fonte e quatro capturas (`disposition: ship`).
- Build de produção isolado aprovado; **139 testes, 138 aprovados, 0 falhas e 1 ignorado** por backend OAuth ausente; somente oito hashes de aplicação atualizados após review. IPhoneMockup, home, oferta e CSS globais foram conferidos intactos.

Capturas e evidências vigentes desta rodada: `output/landing-proposals/assistente-pessoal/navbar-meta-final/`. As pastas `navbar-a/` e `navbar-meta/` são históricas da tentativa anterior; não representam a cor nem o menu finais. Localhost3232 permanece ativo. Sem commit, push ou deploy.

## Limitação preservada por instrução explícita

O roteiro original do iPhone ainda contém texto e conta antigos (margem de 46% e referência a estoque no Notion). O usuário mandou preservar o mockup intacto; não foi alterado nem sua copy repetida fora dele. A revisão de backend de produção não faz parte desta validação.
