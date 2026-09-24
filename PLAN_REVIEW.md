# Revisão do plano original — socIA

## O que manter

- Público e cenário claros: uma lojista de semijoias ou moda que precisa precificar e divulgar uma peça.
- O Raio-X do Preço é o centro mais forte da proposta. Ele dá ao produto uma demonstração concreta.
- A experiência no celular e a linguagem próxima são coerentes com o uso pretendido no WhatsApp.

## O que corrigir nesta etapa

1. **Escopo mistura produto final e protótipo.** OTP oficial, webhook, JWT, OAuth, ERP, Google Shopping, leitura de NF-e e IA real exigem serviços e credenciais ausentes. A primeira versão deve ser uma demonstração navegável com estados mockados, sem telas que afirmem conexão real.
2. **A landing promete demais antes de provar.** O texto atual enumera muitos módulos e integrações; o visitante precisa primeiro entender o custo invisível de uma peça e ver o cálculo em uso.
3. **Há afirmações sem evidência.** “30 segundos”, “tempo real”, “mais escolhido”, “criptografia ponta a ponta”, “sem cartão”, logos e sucesso de conexão não podem aparecer como fatos confirmados. Preços vêm do material de planejamento e devem ser identificados como previstos.
4. **O design prescrito é genérico.** Creme, serifada clássica, cartões brancos e dourado em cada CTA criariam uma landing previsível. A direção nova usa uma fotografia de joia com presença, ameixa profundo, papel mineral e dourado apenas como detalhe de precisão.
5. **A área logada está subespecificada.** Apenas status de conexões e custos base não mostram uma rotina. O workspace precisa conter visão geral, calculadora utilizável, prévia de conteúdo e conectores em estado demonstrativo.
6. **Falta uma passagem honesta entre landing e workspace.** Sem WhatsApp oficial, a CTA deve convidar a explorar a demonstração. Um login demonstrativo curto substitui o OTP, identificado como simulação.

## Recorte de entrega

- Landing completa, responsiva, com narrativa e interação no Raio-X do Preço.
- Login de demonstração e workspace navegável com dados locais de exemplo.
- Integrações em estado demonstrativo, sem redirecionamentos OAuth ou chamadas externas.
- Nenhuma dependência de API de WhatsApp, backend, banco de dados ou credenciais.

## Fora desta entrega

Autenticação real, cobrança, sincronização de estoque, leitura de NF-e, pesquisa de concorrentes, geração por IA e mensagens WhatsApp. Esses módulos pedem especificação de dados, segurança e provedores antes da implementação.
