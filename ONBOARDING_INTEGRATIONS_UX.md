# Arquitetura de Onboarding e Integrações Transparentes (Estilo Instinct) — mila.

Este documento define como a **mila.** conecta sistemas complexos (Bling, Olist, Jueri, Notion, Google) **sem que a lojista precise lidar com códigos, jargões técnicos ou tokens**.

---

## 🎯 Princípio Central de Design de UX
> *"A lojista de semijoias nunca deve ver a palavra 'Token', 'Endpoint' ou 'Chave Bearer'. Todo o processo deve ser resolvido em menos de 60 segundos por uma página intermediária minimalista inspirada no Instinct."*

---

## 📱 Fluxo 1: Provedores Modernos com OAuth Oficial (Bling, Olist, Notion, Google)
**Experiência 100% Zero-Code e Transparente:**

1. **No WhatsApp:**
   - Lojista diz: *"mila., quero conectar meu Bling"* (ou Olist / Notion / Google).
   - A `mila.` responde com um deep link direto assinado:
     > *"Perfeito! Para conectar seu Bling com segurança em 1 clique, acesse:*  
     > *👉 `https://app.milaai.com.br/integrations/bling?session=xyz789`"*

2. **Na Web (Tela Intermediária Estilo Instinct):**
   - A lojista vê uma tela minimalista com o logo da `mila.` e do Bling lado a lado:
     - Título: *"Conectar mila. ao seu Bling"*
     - Botão em destaque: **[ Continuar com Bling ]**
   - Ao clicar, abre o popup oficial de login do Bling.
   - A lojista coloca o e-mail/senha dela no próprio Bling e clica em **"Autorizar"**.

3. **Confirmação Automática no WhatsApp:**
   - A página web mostra um check verde: *"Conectado com sucesso! Pode voltar para o seu WhatsApp."*
   - No mesmo segundo, a `mila.` manda mensagem no WhatsApp:
     > *"🟢 Prontinho! Seu Bling já está conectado. A partir de agora, se você me mandar uma foto ou nota fiscal, eu já leio e consulto seu estoque automaticamente!"*

---

## 💎 Fluxo 2: Provedores Tradicionais Sem OAuth Público (Caso Jueri)
**Como transformar uma API baseada em chave em algo amigável para a lojista:**

1. **No WhatsApp:**
   - Lojista diz: *"mila., quero conectar com o Jueri"*.
   - A `mila.` responde com o link:
     > *"Maravilha! O Jueri cuida das suas peças e revendedoras. Para ativar a conexão guiada, abra aqui:*  
     > *👉 `https://app.milaai.com.br/integrations/jueri?session=xyz789`"*

2. **Na Web (Página Guiada com GIF Passo a Passo):**
   - A página mostra uma animação/GIF de 4 segundos gravada da tela do Jueri:
     - Passo 1: Acesse **Configurações > API** no seu Jueri.
     - Passo 2: Clique no botão azul **[ Copiar Chave ]**.
     - Passo 3: Cole no campo abaixo:
   - Um campo simples e amigável: **"Chave de Conexão do Jueri"** *(sem usar a palavra técnica Token ou Bearer)*.
   - Botão: **[ Conectar minha loja ]**.

3. **Validação Instantânea:**
   - O backend da `mila.` faz uma chamada de teste (`GET /api/v1/{cliente}/produto`).
   - Se for bem-sucedido, salva a credencial criptografada no banco SQLite da lojista.
   - Retorno imediato no WhatsApp:
     > *"✨ Conexão com o Jueri confirmada! Já encontrei seus produtos e maletas de revendedoras. O que você quer consultar primeiro?"*

---

## 🛠️ O que cabe a cada camada do sistema:

| Camada | Responsabilidade |
|---|---|
| **Profile Hermes (`mila`)** | **Instrução e Conversa:** Sabe quando enviar o link `/integrations/[app]`, entende comandos de áudio/texto e consulta a API após conectada. Nunca pede senha ou token no chat do WhatsApp. |
| **Frontend Web (`app.milaai.com.br`)** | **Interface Limpa:** Páginas Next.js minimalistas para `/integrations/bling`, `/integrations/olist`, `/integrations/jueri` e `/integrations/notion`. |
| **Backend / Webhook (`FastAPI`)** | **Segurança:** Recebe o callback OAuth ou a chave do Jueri, testa a conexão, criptografa a credencial no SQLite e dispara o webhook avisando a `mila.` no WhatsApp. |
