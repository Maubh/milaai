# Especificação Técnica — Onboarding OTP & Deep Links OAuth

Este documento define a engenharia do fluxo de ativação da **socIA**, reproduzindo a experiência de usuário fluida e minimalista observada no *Instinct*.

---

## 📱 Fluxo 1: Onboarding Web & Ativação no WhatsApp

### Etapa 1: Captura de Telefone (`/login`)
- Formulário simples: campo com máscara brasileira `+55 (DD) 9XXXX-XXXX`.
- Ao submeter, o backend dispara um código OTP de 6 dígitos via WhatsApp oficial.

### Etapa 2: Validação OTP (`/login/verify`)
- Interface com 6 caixas de dígito e contagem regressiva para reenvio.
- Ao validar o código, o usuário tem sua sessão iniciada (JWT salvo em cookies seguros `HttpOnly`).

### Etapa 3: Redirecionamento & Handshake WhatsApp (`/onboarding/connect`)
- **Se acessado via Desktop**: Exibe um QR Code elegante para escanear com a câmera do celular.
- **Se acessado via Mobile**: Exibe o botão principal `[ Abrir meu WhatsApp ]`.
- **Ação do Link / QR Code**: Abre o WhatsApp oficial da socIA com a mensagem pré-preenchida:  
  `https://wa.me/55XXXXXXXXXXX?text=Oi%20Sócia!`
- **Detecção em Tempo Real**: Assim que o webhook do WhatsApp recebe a mensagem daquele número, a tela web redireciona automaticamente para `/workspace`.

---

## 🔗 Fluxo 2: Deep Links de Conexão OAuth (`/integrations/[app]`)

Para evitar telas confusas ou exigir que a lojista procure onde conectar seus sistemas, a socIA opera com **Links Diretos de Integração**.

### A Mecânica Conversacional:
1. A lojista envia no WhatsApp: *"Como conecto meu Bling?"*
2. A socIA responde:  
   *"Perfeito! Clique aqui para autorizar o acesso ao seu Bling em 1 toque:*  
   **`app.socia.com.br/integrations/bling?token=<session_token>`**"

### Telas Dedicadas (Mobile-First):
Cada rota possui layout idêntico ao padrão de transição:
- Cabeçalho minimalista com botão `< Voltar`.
- Logo oficial da ferramenta centralizado (Bling, Olist, Google ou Notion).
- Título: **"Conectar [Nome da Ferramenta]"**.
- Subtexto: *"Redirecionando para autorização de [Nome da Lojista]..."*
- Spinner de carregamento suave.
- Redirecionamento automático para a URL oficial de OAuth da ferramenta.

### Callback & Confirmação:
- Após a usuária aprovar na tela oficial da ferramenta, o backend recebe o `code`, gera os tokens de acesso e atualiza a tabela da lojista.
- A tela web exibe mensagem de sucesso: *"Conectado com sucesso! Pode voltar para o WhatsApp."*
- O webhook da socIA envia mensagem imediata no WhatsApp:  
  *"Prontinho! Seu Bling já está 100% conectado. Pode me mandar notas fiscais ou consultar estoque quando quiser! 📦✨"*
