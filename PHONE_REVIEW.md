# Revisão dirigida do mockup de telefone

O usuário rejeitou o telefone da primeira versão; captura em `.impeccable/review/user-iphone-feedback.png`. Problemas observados: borda preta muito espessa e arredondada, proporção/largura de brinquedo, cabeçalho sem detalhes reconhecíveis de conversa, bolhas grandes com texto longo e metade inferior vazia. Corrigir o componente, não apenas reduzir seu tamanho.

Referência pesquisada: [Magic UI — iPhone 15 Pro](https://v3.magicui.design/docs/components/iphone-15-pro), componente React/SVG de código aberto sob licença MIT. Inspira UI é uma referência visual válida, mas a implementação fornecida pelo usuário é Vue/Nuxt. A forma do Magic UI tem bezel fino, cantos e ilha dinâmica proporcionais, contorno com detalhe sutil. Usar uma moldura desse nível de qualidade, portando/recriando apenas o necessário no projeto Next.js, sem instalar uma biblioteca de dispositivos inteira. Creditar a inspiração na documentação do componente se reutilizar código.

Tela interna: conversa demonstrativa reconhecível como mensageria no WhatsApp, mas autoral. Cabeçalho compacto com socIA, avatar textual ou símbolo simples, etiqueta pequena de simulação. Uma pergunta curta da lojista e uma resposta concisa: custo R$ 63,50, preço R$ 142,70, margem R$ 64,21. Numerais tabulares. Bolhas menores com leitura em 13-14px dentro de um telefone ~280-310px de largura desktop, sem paredes de texto. Timestamps discretos e distribuição vertical deliberada; evitar grande área vazia. Pode mostrar recorte parcial do aparelho abaixo da dobra, desde que conteúdo principal e valor apareçam. Não criar controles de envio clicáveis que não funcionem. Legenda externa curta `Conversa simulada · nenhuma mensagem enviada`.

O telefone deve apoiar a landing minimalista com um CTA; não torná-lo protagonista maior que o texto. Em 390px, headline e CTA aparecem antes do telefone, e o aparelho cabe sem corte lateral. Em 1440px, a proporção não parece um cartão arredondado gigante. Fazer uma rodada de capturas desktop/mobile, corrigir o que a captura do usuário apontou e manter o localhost 3107 estável após build.

## Implementação (2026-09, follow-up)

Moldura SVG + CSS original em `components/IPhoneMockup.tsx`, proporções inspiradas no iPhone 15 Pro do Magic UI (MIT, sem dependência instalada). Conversa interna com os números fixos acima e compositor não clicável. Capturas `/tmp/socia-1440.png` e `/tmp/socia-390.png`: telefone fino e proporcional, sem overflow horizontal, sem erros de página.

Ajustes de onboarding incluídos a pedido da coordenadora: removida a marca socIA duplicada em `/login` e `/login/verify` (o header compartilhado já a mostra); `/login/verify` não redireciona mais visitantes verificados — mostra a tela com nota de etapa concluída; `/onboarding/connect` exibe estados de pré-requisito inline (sem telefone / sem verificação) em vez de redirecionar.

## Refinamento Great UI (2026-09, rodada atual)

Tela do telefone refeita com detalhes inspirados no Great UI Mobile Mockup (Saurabh Sharma, MIT, 21st.dev — sem dependência instalada, sem Tailwind/shadcn/Framer): cabeçalho verde WhatsApp com voltar, avatar, status e ícones de chamada/vídeo/menu; foto da peça em SVG inline (sem URL externa); Raio-X com custo R$ 63,50 → preço R$ 142,70 e margem R$ 64,21; legenda pronta para publicar; confirmação da lojista; compositor visual com emoji/anexo/câmera/mic (nada clicável). Metade inferior vazia eliminada — a conversa preenche a tela até o compositor.

Guardas de onboarding removidos a pedido da revisão visual: `/login/verify` e `/onboarding/connect` renderizam sempre o conteúdo principal com aviso inline `.auth-prereq` quando faltar etapa anterior. Fluxo mockado telefone → 123456 → conversa preservado e verificado por automação.

## Animação Great UI + neutro Solace (2026-09, rodada atual, a pedido do usuário)

Telefone refeito como sequência animada com framer-motion 13.4.3 (dependência real, permitida pelo usuário; GSAP da landing preservado): foto/pergunta da lojista → indicador de digitação → Raio-X (R$ 63,50 → R$ 142,70; margem R$ 64,21) → legenda pronta → confirmação → pausa → loop, mais botão Rever. Estilo neutro/escuro do Solace Chat Messages 2: moldura prata, tela quase preta, balões azul/cinza — sem verde WhatsApp dominante, sem simular Telegram ativo. Compositor e home bar verificados dentro da moldura em 1440 e 390 (bounding-box por automação). `prefers-reduced-motion` mostra a conversa completa sem autoplay. Evidência: `/tmp/gx-1440-initial.png`, `/tmp/gx-1440-typing.png`, `/tmp/gx-1440-final.png` (+ equivalentes 390).
