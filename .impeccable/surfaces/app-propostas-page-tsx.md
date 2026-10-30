---
version: 1
slug: "app-propostas-page-tsx"
primary_target: "app/propostas/page.tsx"
related_targets: ["app/propostas/a/page.tsx", "app/propostas/b/page.tsx", "components/landing-proposals/LandingA.tsx", "components/landing-proposals/LandingB.tsx", "components/IntegrationsMarquee.tsx", "lib/landing-proposals.ts"]
---

Mode: Persuade. Duas composições de landing para comparação; nenhuma substitui a home antes de escolha explícita. Mundo visual existente: mineral/marfim/Manrope do workspace A, sem reproduzir a navegação ou criar funcionalidades administrativas.

## Direction contract

THESIS: A mila é a assistente pessoal da lojista na rotina diária, exclusivamente no WhatsApp. Preço é uma tarefa entre várias. Usuário aprovou essa direção após rejeitar calculadora, folha Raio-X e painéis de conversa fora do WhatsApp.

OWN-WORLD: Preservar a identidade mineral e marfim, Manrope, filetes claros e superfícies delicadas do workspace. A demonstração de produto é somente o IPhoneMockup original com conversa animada, intacto. O diagrama original IntegrationsMarquee com conexões pulsantes permanece em ambas as páginas. Não substituir essas animações por conteúdo estático.

STORY: A lojista reconhece situações do seu dia, entende como conversar com uma assistente ajuda com mercadorias, peças, preço, fornecedores e conteúdo e descobre as integrações com seus limites. Depois escolhe conhecer o acesso e o plano. Workspace citado apenas como apoio administrativo, não como produto principal.

FIRST VIEWPORT: Nomear assistente pessoal e WhatsApp, CTA inequívoco e iPhone animado em escala legível; A e B diferem na composição editorial. Não colocar calculadora, dashboards, abas de conversa, fichas de dados ou interfaces fictícias dentro ou fora do hero. Abaixo, rotina em conteúdo editorial e o diagrama original de integrações.

FORM: Direção explicitamente escolhida pelo usuário: "siga nessa proposta". Invariantes adicionais: "O mockup do iPhone com a interação deve permanecer" e "a animação das integrações ... permaneça nas duas versões". Trata-se de revisão em código dentro da identidade existente; não há comp gerado ou nova escolha de mundo visual.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Limites e entrega

Home, workspace, APIs e IPhoneMockup intactos. IntegrationsMarquee admite apenas configuração opcional de CTA com default da home preservado. Sem nova capacidade comercial. Revisão Fable, testes de copy/render/semântica/animações, build isolado, navegador desktop/mobile, novos prints que substituem os da direção rejeitada. Servidor local em 3232 permanece acessível.
