Parecer técnico formal — Mila AI / PR #31
Branch: feat/workspace-plano-assinatura
Commit revisado: 8d0ef776903f45981c04a43ab2dfb4e63d03cfdc

Escopo: conferi o PR no GitHub, o diff e os helpers de sessão/proxy. Executei sondas da lógica de expiração e conferi os hashes do entorno jurídico. Os checks Vercel estão verdes. Não executei build local, teste visual em navegador nem fluxo de pagamento Asaas; portanto, esses checks não comprovam a operação de billing de ponta a ponta.

1. Resumo Técnico das Mudanças

O PR aproxima corretamente a área logada da arquitetura WhatsApp-first:

- Restringe a navegação a Visão geral, Integrações e Meu plano.
- Remove ferramentas demonstrativas de precificação/conteúdo da área logada. O PR real também redireciona as rotas antigas à Visão geral.
- Acrescenta identidade da pessoa e da loja via /api/session.
- Implementa drawer mobile em tela cheia, fechamento por Escape/navegação e safe-area.
- Adiciona BFFs para catálogo de planos e criação de pedido.
- Isola ajustes visuais em arquivos CSS novos.

Preservação de workspace.css: confirmada. O SHA-256 é idêntico entre base e head e corresponde ao valor congelado no teste jurídico. Também conferi os demais arquivos de ENTORNO_REVISADO: todos correspondem aos hashes esperados.

Isso comprova a integridade desses arquivos, não a conformidade jurídica de toda nova promessa comercial.

2. Auditoria de Arquitetura e UX

WhatsApp-first — favorável

A remoção das ferramentas fictícias e a centralização do trabalho no WhatsApp são coerentes com o produto. Integrações e assinatura ficam no site; preço, legenda e operação ficam na conversa.

Identidade — favorável, com ressalva

Nome da pessoa e nome da loja são campos separados, renderizados pelo React sem HTML arbitrário. A separação é correta.

Entretanto, este PR apenas consome display_name/store_name: não comprova que o backend resolve o nome por telefone, em vez de reutilizar a identidade de outra pessoa do mesmo tenant.

Layout mobile — boa direção, validação incompleta

O código contempla tela cheia, botões com área de toque adequada e redução de movimento. Faltam:

- Gestão explícita de foco ao abrir/fechar o menu.
- Tratamento da transição para desktop com menu aberto: o bloqueio de scroll depende de menuOpen, não do breakpoint, e pode permanecer ativo acima de 900px.
- Evidência visual em viewport mobile, teclado e zoom.

Conformidade das promises — ajustes necessários

Há uma inconsistência objetiva de contrato: /api/billing/plans foi criado como catálogo oficial, mas a página não o utiliza. Preços, benefícios e datas continuam hardcoded.

Em particular:

- A expiração é calculada por trial_ends_at, mas os textos sempre mostram 04/11.
- A data exibida não informa UTC nem conversão para o horário da lojista.
- “30 dias de teste” não é demonstrado apenas pela presença de uma data final.
- “Plano entra na hora” e “mudar de plano quando quiser” exigem comprovação do webhook, propagação de permissões e fluxo de alteração de assinatura.

Também identifiquei uma divergência documental: o teste jurídico consultado ainda congela Olist como não disponível, enquanto esta página o anuncia como benefício ativo. Isso não prova que o conector esteja indisponível hoje; prova que a entrega e a documentação precisam ser reconciliadas antes da aprovação.

Os demais benefícios anunciados não foram comprovados nesta revisão. Não os classifico como entregues nem como inexistentes sem rastrear o backend correspondente.

3. Segurança e Robustez

Pontos positivos

- proxyOAuth lê a sessão no cookie HttpOnly, no servidor.
- Sem cookie, retorna 401.
- Token de sessão e segredo de serviço seguem server-to-server.
- /api/session projeta campos explícitos, sem expor token.
- Respostas e chamadas upstream utilizam no-store.
- O helper existente diferencia timeout e indisponibilidade com 504/502.

Achado bloqueante — estado de plano inventado após falha de sessão

Arquivo: app/workspace/plano/page.tsx — loadSession e cálculo de trialOpen.

Se /api/session retornar 401, 500 ou falhar na rede, loading termina, mas session permanece null. A página passa a mostrar um plano calculado por fallback, sem um estado de erro.

A sonda executada confirmou: com session=null antes do prazo, trialOpen=true e hiringLocked=true.

Correção: separar loading, authenticated, unauthenticated e error. Só renderizar situação contratual após resposta válida com ok/logged e campos de domínio validados. Ausência de dados não pode significar “Pro em teste”.

Achado bloqueante — gating temporal não confiável

Arquivo: app/workspace/plano/page.tsx — trialEndsDate/hiringLocked.

- O relógio usado é o do navegador.
- Uma data inválida faz as comparações retornarem falso, liberando os botões.
- A página aberta não reavalia automaticamente o prazo sem novo render.
- Uma expiração diferente recebida do backend diverge da data fixa mostrada na interface.

A sonda confirmou que trial_ends_at inválido produz hiringLocked=false.

Isso demonstra um defeito da UI, não comprova bypass de cobrança: a segurança depende do backend.

Correção: backend deve devolver estado contratual e ações permitidas e revalidar a elegibilidade no POST. A UI deve refletir essa decisão, sem decidir autorização pelo relógio local.

Pendência bloqueante — vínculo, autorização e idempotência de billing

Arquivo: app/api/billing/order/route.ts.

A rota encaminha o JSON inteiro, embora a interface envie somente plan. O vínculo seguro depende de o backend ignorar qualquer tenant/phone/role/preço fornecido pelo cliente e derivar tudo da sessão.

Não há, no código revisado, evidência de:

- Validação estrita do plano solicitado.
- Bloqueio server-side da contratação durante o teste.
- Deduplicação de pedidos após timeout, retry ou concorrência.
- Idempotência dos eventos de pagamento.
- Alteração de assinatura existente sem gerar cobranças concorrentes.

Desabilitar o botão durante a requisição não garante idempotência.

Não afirmo que essas proteções inexistam no VPS; afirmo que precisam ser demonstradas para aprovar este fluxo. O timeout de oito segundos torna especialmente importante testar “pedido criado, resposta perdida, tentativa repetida”.

Endurecimento adicional

- Validar checkout_url como HTTPS e destino permitido antes do redirecionamento.
- Projetar a resposta de billing por allowlist, em vez de repassar todo o JSON upstream ao navegador.
- Verificar defesa CSRF/Origin para a operação autenticada por cookie.
- Não devolver sucesso genérico de pedido sem checkout ou referência válida.
- Diferenciar founder de teste: uma cortesia permanente não deveria mostrar “No Pro até 04/11”.

Esses pontos devem ser tratados conforme o contrato real do backend, sem presumir uma vulnerabilidade já explorável.

4. Parecer Final

[REPROVADO / AJUSTES NECESSÁRIOS]

A direção arquitetural e visual é adequada, e a preservação de workspace.css foi comprovada. A reprovação decorre da modelagem de estado contratual e da falta de evidência suficiente para a operação financeira — não do conceito WhatsApp-first.

Condições para aprovação:

1. Falhas de sessão não podem renderizar um plano presumido.
2. Estado, prazo e elegibilidade devem vir do backend, com datas consistentes e fuso explícito.
3. Preços e benefícios devem consumir o catálogo oficial ou uma fonte única compartilhada.
4. Demonstrar autorização por sessão, bloqueio durante o teste e idempotência de pedido/webhook.
5. Validar contratação e mudança de plano em sandbox, incluindo retry após timeout e evento duplicado.
6. Reconciliar promises com funcionalidades efetivamente disponíveis e documentação jurídica.
7. Validar menu mobile, foco e transição de breakpoint.

Decisões pendentes: política de upgrade/downgrade — vigência, proporcionalidade e cobrança — e compromisso real de prazo para ativação após confirmação do pagamento.

Este é o parecer emitido aqui; não publiquei review nem alterei o PR no GitHub.