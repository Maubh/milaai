# Prévias da landing page — direção vigente

**Atualização mais recente:** `assistente-pessoal/navbar-meta-final/` mostra a faixa no mineral oficial `#173F3B` com marfim `#F6F3ED`, a Meta como sexto nó animado e a navbar sticky da A com menu hambúrguer no celular. `desktop.png`, `mobile-fechado.png`, `mobile-aberto.png` e `mapa-320.png` são as capturas desta rodada. As pastas `navbar-a/` e `navbar-meta/` são históricas e incluem o tom claro rejeitado; não usar esses prints como resultado final.

## Assistente pessoal da lojista, no WhatsApp

**O refinamento mais recente da proposta A está em `assistente-pessoal/refinamento-a/`.** A rotina passou a mencionar cadastro no Jueri, Olist ou Nuvemshop no Pro; a seção seguinte virou uma faixa mineral com três colunas, e "O que cada integração faz" saiu da A. As capturas anteriores de detalhes dessa proposta são históricas. B mantém sua composição; só recebeu a copy compartilhada corrigida. `final/` e `review/` também são históricas da direção anterior rejeitada (calculadora, painéis e fichas).

Implementação: Claude Opus 5.5. Revisão independente de fontes e visual: Claude Fable 5.1. Coordenação e testes no navegador: ZCode. São capturas reais de um build de produção local, não imagens conceituais. A home atual não foi substituída; não houve commit nem deploy.

### Comparação

| Proposta | Desktop | Mobile | Integrações |
| --- | --- | --- | --- |
| A — Perto de você, na loja | `assistente-pessoal/proposta-a-desktop.png` | `assistente-pessoal/proposta-a-mobile.png` | `proposta-a-integracoes-desktop.png` / `proposta-a-integracoes-mobile.png` |
| B — A rotina ganha uma assistente | `assistente-pessoal/proposta-b-desktop.png` | `assistente-pessoal/proposta-b-mobile.png` | `proposta-b-integracoes-desktop.png` / `proposta-b-integracoes-mobile.png` |

Na pasta também há prints do mapa original de integrações e do detalhe Google aberto. Os screenshots mobile são retratos longos para permitir comparação pelo celular. As imagens mostram estados diferentes da mesma animação do iPhone, preservada intacta por solicitação do usuário.

### O que foi preservado

- Mockup original do iPhone com interação animada nas duas versões.
- Mapa original animado de integrações com cinco ferramentas nas duas versões.
- Home, workspace e APIs originais.
- Oferta e limites comerciais.

### O que mudou

- Posicionamento como assistente pessoal de IA para a rotina da loja, não uma calculadora.
- Remoção de interfaces operacionais inexistentes fora do WhatsApp.
- Detalhes de integrações sem card branco gigante: logos reais, filetes minerais, respiro e expansões nativas com limites de Google/Notion.

### Evidências e acesso

`assistente-pessoal/evidencias.json`: modelos efetivos, revisão Fable, testes, build e preservação dos componentes. `docs/design/landing-review.md`: relatório completo.

- http://localhost:3232/propostas
- http://localhost:3232/propostas/a
- http://localhost:3232/propostas/b

A porta 3232 permanece ativa. É endereço local do computador, não um link público para outro aparelho.
