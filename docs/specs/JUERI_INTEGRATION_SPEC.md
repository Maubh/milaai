# Conector Oficial Jueri Semijoias — mila.

Este documento formaliza a arquitetura de integração técnica entre a **mila.** e o **Jueri**, o ERP especialista em semijoias, joias e consignação mais utilizado do Brasil.

---

## 💎 O que essa integração resolve:
Enquanto Bling e Olist atendem lojistas tradicionais de e-commerce, o **Jueri** domina as marcas que trabalham com:
- Atacado de Semijoias
- Maletas de Consignado com Revendedoras
- Tabela Dupla de Preços (Atacado x Varejo)
- Termos de Entrega, Romaneios e Garantia Digital

A **mila.** passa a ser a **interface conversacional no WhatsApp** do Jueri.

---

## 🛠️ Especificação Técnica da API Jueri:
- **Base URL:** `https://jueri.com.br/sis/api/v1/{cliente_sistema}/`
- **Autenticação:** `Authorization: Bearer {AUTH_TOKEN}`
- **Formato:** JSON REST

### Endpoints Mapeados:
1. `GET /produto`: Consulta de estoque, fotos, peso e especificações.
2. `GET /tipo-preco`: Listagem de tabelas ativas (Varejo, Atacado, Consignado).
3. `GET /revendedor`: Consulta de saldo, nível de comissão e status da revendedora.
4. `GET /pedido/{id}/pdf/termo-entrega`: Emissão de romaneio de maleta em PDF direto no chat.
5. `GET /financeiro/contas_receber`: Acertos e promissórias de maletas.

---

## 🔗 Deep Link na Área Logada:
- Rota: `/integrations/jueri`
- Inputs: `Código de Cliente` e `Token de API`
- Callback no WhatsApp: Confirmação instantânea pós-validação de ping.
