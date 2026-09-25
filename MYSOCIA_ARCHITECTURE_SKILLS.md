# mySocIA — Especificação de Arquitetura, Skills e Planos

Este documento detalha o ecossistema oficial da **mySocIA** (Sócia), desenvolvido para apoiar lojistas e empresárias de semijoias, joias e moda.

---

## 🏗️ 1. O Profile Oficial (`mysocia`)
- **Profile no Hermes**: `mysocia`
- **Diretório**: `/opt/data/profiles/mysocia/`
- **Ambiente**: 100% isolado de dados pessoais (Maurício/Keu/Casal) e da operação interna da Ritrovarsi.

---

## ⚡ 2. As 3 Novas Skills Criadas e Instaladas

### 1️⃣ `gestao-fornecedores`
- **Propósito**: Cadastrar e consultar fornecedores com a ficha prática definida por quem vive a rotina de compras.
- **Campos da Ficha**:
  1. Nome do Fornecedor / Fábrica
  2. Contato / WhatsApp
  3. Pedido Mínimo (R$)
  4. Condições de Pagamento (Pix, parcelamento, etc.)
  5. O que comprou
  6. Status de Validação (Validado / Em teste / Reprovado)
  7. Nota de Qualidade (1 a 10)
  8. Peças Favoritas
  9. Prazo de Carência de Recompra (dias)
- **Modo de Consulta**: No WhatsApp da Sócia ou sincronizado com Google Sheets / Notion.

### 2️⃣ `balanco-compras`
- **Propósito**: Fechamento financeiro mensal automático enviado no dia 30/31 no WhatsApp da lojista.
- **Métricas Apresentadas**:
  - Total Investido em Estoque (R$)
  - Total de Peças Novas adquiridas
  - Custo Médio por Peça
  - Ranking dos Fornecedores onde mais comprou
  - **Projeção de Faturamento e Lucro Líquido Real** caso venda o lote pelo preço sugerido.

### 3️⃣ `alerta-carencia`
- **Propósito**: Guardião do fluxo de caixa e reposição.
- **Funcionamento**: Avisa ativamente a lojista no WhatsApp **10 dias** e **3 dias** antes de expirar o prazo do fornecedor, para que ela possa repor peças avulsas sem precisar atingir o pedido mínimo cheio de novo.

---

## 📦 3. Matriz Oficial de Planos

| Recurso | Plano Essencial (R$ 39/mês) | Plano Pro / Sócia (R$ 69/mês) ⭐ |
| :--- | :---: | :---: |
| **Precificação Determinística & Margem Real** | ✅ Ilimitada | ✅ Ilimitada |
| **Radar de Concorrentes (Google Shopping & Local)** | ✅ Sim | ✅ Sim |
| **Descrição Pronta para E-commerce / Catálogo** | ✅ Sim | ✅ Sim |
| **Caderno de Fornecedores Validados** | ✅ No WhatsApp (memória segura) | ✅ No WhatsApp + Sincronização Sheets/Notion |
| **Leitura de Notas Fiscais (XML / PDF)** | ✅ Avulso | ✅ Avulso |
| **Alertas Proativos de Carência de Fornecedores** | ❌ | 🟢 Avisos no zap 10 e 3 dias antes |
| **Balanço Mensal de Compras & Projeção de Lucro** | ❌ | 🟢 Fechamento automático no fim do mês |
| **Conexão Direta ERP (Bling ou Olist)** | ❌ | 🟢 Entrada de NF-e e saldo de estoque |
| **Suíte de Instagram (9 Skills)** | ❌ | 🟢 Carrosséis, ganchos 2026, calendário |
| **Consultoria de Perfil & Bio (`ig-profile-optimizer`)** | 🟡 Diagnóstico Inicial (1x) | 🟢 Otimização completa + Nova Bio pronta |
