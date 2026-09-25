# Revisão do plano original — socIA

## Centro da solução (correção WhatsApp-first)

O README e os specs descrevem uma assistente de negócios **no WhatsApp**. A lojista envia foto, nota ou pergunta; a socIA devolve orientação de preço, leitura de custos e conteúdo na conversa. O site é porta de entrada e onboarding. O workspace é apoio para custos base e integrações. A primeira implementação errou ao transformar a calculadora e o painel web no produto principal e ao substituir o onboarding de telefone/OTP por entrada de nome. A correção desta entrega recoloca a conversa no centro: landing com conversa no hero, onboarding Instinct simulado em três rotas, simulador `/conversa` com roteiros e workspace reposicionado como apoio.

## O que manter

- Público definido: lojistas de semijoias e moda.
- Raio-X do preço como resposta forte da assistente, com cálculo transparente — agora dentro da conversa.
- Onboarding inspirado no Instinct: telefone → código → conexão, com código de teste 123456 local.
- Integrações por telas de transição demonstrativas a partir da conversa.
- Linguagem visual editorial ligada a joalheria contemporânea, sem foto de hero e com títulos em sans legível.

## O que foi corrigido no plano e no protótipo

1. **Promessa e realidade:** API do WhatsApp, número oficial, OTP, webhooks e OAuth ainda não existem. Telas e simulador de conversa com estado explícito, sem fingir envio ou conexão.
2. **Ordem da narrativa:** a assistente respondendo dentro de uma conversa aparece primeiro. O cálculo é evidência dessa resposta, não ferramenta web protagonista.
3. **Onboarding visível:** três URLs próprias (`/login`, `/login/verify`, `/onboarding/connect`) e links claros desde a landing. Código de teste local para navegar pelo fluxo.
4. **Workspace com papel correto:** custos base, resumo de preço e retorno à conversa; preço e conteúdo como apoio.
5. **Alegações sem evidência:** retirados “30 segundos”, “tempo real”, “criptografia ponta a ponta”, “mais escolhido”, “teste grátis” e plano ativo.
6. **Telegram:** não consta nos quatro documentos originais desta branch. Decisão futura; sem disponibilidade atual.
7. **Visual:** foto do hero e Bodoni Moda rejeitadas pelo usuário; a conversa ocupa o palco principal com títulos em Manrope.

## Recorte desta entrega

Landing centrada no WhatsApp, onboarding navegável e simulado, conversa com roteiros úteis, workspace de configuração e transições de integração demonstrativas. Nenhuma dependência de API, backend, banco de dados ou credenciais.
