# Prompt Master para o Orca (Next.js 15 + Tailwind + Shadcn)

Copie e cole o prompt abaixo no **Orca** para gerar a aplicação completa da **socIA**:

---

```markdown
Você é um Engenheiro de Software Fullstack e Designer Especialista em Next.js 15, Tailwind CSS, Shadcn/ui e Lucide Icons.

Sua missão é construir a aplicação completa da **socIA** (plataforma de inteligência e precificação para lojistas de semijoias e moda), com base nos arquivos README.md, SPEC_LANDING_PAGE.md e SPEC_ONBOARDING_WORKFLOW.md presentes neste repositório.

### Diretrizes de Design & Estética:
1. Siga uma estética de "Quiet Luxury" e joalheria moderna (tons neutros, alabaster/creme suave #FBFBF9, tipografia refinada e toques dourados champagne no logo socIA e botões principais).
2. O logotipo é composto por "soc" em fonte elegante grafite e "IA" destacado em tom dourado/ouro nobre.
3. Todas as interfaces devem ser mobile-first, fluidas, com transições suaves (Framer Motion) e componentes Shadcn/ui.

### Estrutura de Telas e Rotas a serem implementadas:

1. **Landing Page (`app/page.tsx`)**:
   - Navbar minimalista com logo "socIA", links para seções e botão "Testar no WhatsApp".
   - Hero Section com formulário rápido para digitar o número de WhatsApp e botão "Começar Teste Grátis".
   - Card interativo simulando a conversa no WhatsApp mostrando o "Raio-X do Preço" de uma semijoia (custo, taxa, embalagem, aluguel rateado e lucro real).
   - Seção interativa dos 4 Conectores Principais (Bling, Olist, Google Workspace, Notion).
   - Tabela de Preços completa com os 3 planos: Essencial (R$ 39), Pro / Sócia (R$ 69) [Em destaque] e VIP (R$ 119).
   - Seção de FAQ interativa com accordion (Shadcn) e Footer institucional.

2. **Fluxo de Onboarding Estilo Instinct (`app/(auth)/login/page.tsx`)**:
   - Tela 1: Entrada do número de telefone brasileiro com máscara.
   - Tela 2: Digitação do código OTP de 6 dígitos com temporizador de reenvio.
   - Tela 3: Exibição do QR Code (se desktop) ou botão "Abrir WhatsApp" com mensagem "Oi, Sócia!".

3. **Telas de Deep Link OAuth (`app/integrations/[provider]/page.tsx`)**:
   - Suporte dinâmico para os provedores: `bling`, `olist`, `google`, `notion`.
   - Layout idêntico ao padrão de transição: logo da ferramenta, texto "Conectar [App] - Redirecionando para autorização...", spinner animado e tratamento de sucesso.

4. **Painel Workspace Resumido (`app/workspace/page.tsx`)**:
   - Dashboard limpo com status das conexões ativas, custos base configurados (taxa de cartão, embalagem e rateio fixo por peças vendidas) e botão de acesso direto ao WhatsApp.

Gere código limpo, modular, tipado com TypeScript, utilizando o App Router do Next.js e Tailwind CSS.
```
