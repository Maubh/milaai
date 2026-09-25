# Prompt para o Orca: Suporte ao Conector Jueri e Telas de Integração

Copie e cole este prompt no **Orca** para habilitar a rota do **Jueri** e o fluxo guiado para a lojista:

---

```markdown
Atualize as rotas de integração (`/integrations/[app]`) para incluir o conector oficial do **Jueri** e o branding da **mila.**:

### 1. Habilitar a Rota `/integrations/jueri`
- Atualmente a rota `/integrations/jueri` exibe "Integração desconhecida".
- Atualize a lista de conectores válidos para: **Bling, Olist, Jueri, Google, Notion**.
- Título da página: **"Conectar Jueri Semijoias"**
- Subtítulo: "Sincronize seu estoque, tabelas de atacado/varejo e maletas de consignado com a mila."

### 2. Layout Guiado Específico do Jueri (Passo a Passo Visual)
Como o Jueri utiliza chave de conexão direta gerada no painel, crie um card minimalista e acolhedor (estilo Instinct):
- **Card Passo a Passo:**
  1. No seu Jueri, acesse o menu **Configurações > API**.
  2. Clique no botão **"Gerar / Copiar Chave"**.
  3. Cole a sua chave no campo abaixo:
- **Campo de Input:**
  - Label: *"Chave de Conexão do Jueri"*
  - Placeholder: *"Cole sua chave do Jueri aqui..."*
- **Botão de Ação:**
  - `[ Conectar com a mila. ]` (ao clicar, simula o teste de conexão bem-sucedido e exibe o botão verde *"Voltar para o WhatsApp"*).

### 3. Unificar Branding nas Telas de Integração
- Substituir qualquer menção residual a "socIA" nas telas de `/integrations/*` e `/workspace/*` por **mila.**.
- Mensagem de sucesso após conectar qualquer app:
  *"Pronto! Conexão realizada com sucesso. Pode voltar para sua conversa com a mila. no WhatsApp."*
```
