# socIA — A sua Sócia de Negócios no WhatsApp

**socIA** é a assistente inteligente e analítica de negócios desenvolvida sob medida para empresárias e founders de semijoias, joias e moda.

Operando primariamente onde a lojista já vive — no **WhatsApp** — a socIA une **precificação determinística**, **radar ativo de concorrência em tempo real**, **leitura inteligente de notas fiscais (XML/PDF)** e **marketing humanizado de alto impacto** baseado na suíte de inteligência de Instagram.

---

## 🎯 Proposta de Valor
- **Sem Fricção Técnica**: Onboarding em 30 segundos com Login por Telefone e código OTP direto no WhatsApp (estilo *Instinct*).
- **Adeus Planilhas Complexas**: Em vez de digitar 25 campos no Excel, a lojista envia uma foto da peça ou o arquivo da NF-e para receber o cálculo de margem real em milissegundos.
- **Transparência Absoluta**: A socIA sempre entrega o "Raio-X do Preço" (custo da peça, taxa de cartão, embalagem, rateio de custos fixos por volume de vendas e margem de lucro líquida).
- **Radar de Mercado**: Pesquisa de mercado automatizada via Google Shopping e concorrentes locais (sempre com links diretos e regras anti-distorção).
- **Copy Humanizada Anti-Robô**: O motor `ig-humanizer` é padrão obrigatório em todos os planos, entregando legendas prontas com ganchos 2026, styling e quebra de objeções.

---

## 🏗️ Arquitetura & UX (Padrão Instinct)

```
[ Usuária no Site ] ➔ Digita o WhatsApp ➔ Recebe código OTP oficial
       │
       ▼
[ Digita OTP ] ➔ Tela com QR Code / Botão para abrir o WhatsApp ("Oi, Sócia!")
       │
       ▼
[ WhatsApp ] ➔ socIA inicia a consultoria imediatamente e apresenta os conectores
       │
       ▼
[ Deep Link OAuth ] ➔ Ao pedir integração, a socIA envia link direto para a tela específica:
                      app.socia.com.br/integrations/bling
                      app.socia.com.br/integrations/olist
                      app.socia.com.br/integrations/google
                      app.socia.com.br/integrations/notion
```

---

## 📦 Grade de Planos & Monetização

| Recurso / Módulo | Plano Essencial (R$ 39/mês) | Plano Pro / Sócia (R$ 69/mês) ⭐ | Plano VIP / Escala (R$ 119/mês) |
| :--- | :---: | :---: | :---: |
| **Precificação Determinística & Margem Real** | ✅ Ilimitada | ✅ Ilimitada | ✅ Ilimitada |
| **Radar de Concorrentes (Google Shopping & Local)** | ✅ Sim | ✅ Sim | ✅ Sim |
| **Copy Humanizada Nativa (Anti-Robô)** | ✅ Sim (por peça) | ✅ Sim (por peça) | ✅ Sim (por peça) |
| **Leitura de Notas Fiscais (XML / PDF)** | ✅ Sim (avulso) | ✅ Sim (avulso) | ✅ Sim (avulso) |
| **Conexão ERP (Bling ou Olist - Paridade Total)** | ❌ | 🟢 **Conexão Completa**<br>• Entrada de estoque com 1 clique<br>• Cadastro automático de custos<br>• Consulta de estoque no zap | 🟢 **Conexão Avançada**<br>• Múltiplos CNPJs/contas<br>• Alertas de estoque parado |
| **Instagram Suite (9 Skills Especializadas)** | ❌ | 🟢 Carrosséis, ganchos 2026, calendário e análise de virais | 🟢 Completa |
| **Consultoria de Perfil & Bio (`ig-profile-optimizer`)** | 🟡 Diagnóstico Inicial (1x) | 🟢 Otimização completa + Nova Bio pronta + Apoio para criar perfil do zero | 🟢 Revisão contínua para datas comemorativas |
| **Suíte de Produtividade** | Google Sheets/Drive básico | Google Workspace + Outlook + Notion | Suíte Completa |

---

## 🛠️ Stack Tecnológica Recomendada
- **Frontend / Landing Page**: Next.js 15 (App Router), Tailwind CSS, Shadcn/ui, Lucide Icons, Framer Motion.
- **Backend / Webhook**: FastAPI (Python), SQLite (MVP) / PostgreSQL, Celery/Redis para filas assíncronas.
- **IA Engine**: Hermes Agent, Serper API (Radar de Mercado), Vision Models (identificação de peças), Apify (Instagram Insights).
