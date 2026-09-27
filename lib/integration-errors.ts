/**
 * Vocabulário de erro das integrações — compartilhado entre servidor e cliente.
 * Sem import de servidor aqui: o client component lê este módulo direto.
 */

export const INTEGRATION_ERRORS: Record<string, string> = {
  // OAuth de app
  provider_not_configured:
    "Este conector ainda não foi habilitado pela mila. Nada foi conectado — avisamos quando liberar.",
  app_nao_configurado:
    "Este conector ainda não foi habilitado pela mila. Nada foi conectado — avisamos quando liberar.",
  app_not_configured:
    "Este conector ainda não foi habilitado pela mila. Nada foi conectado — avisamos quando liberar.",
  // Sessão
  no_session: "Entre com seu telefone antes de conectar uma integração.",
  sessao_expirada: "Sua sessão expirou. Entre novamente para conectar a integração.",
  // Mesma causa, outra porta: aqui a lojista bateu no workspace (link direto,
  // sessão que nunca existiu), não no meio de uma conexão de integração.
  sessao_necessaria: "Entre com seu telefone para abrir sua área.",
  loja_divergente: "A conta autorizada não é a desta loja. Nada foi conectado.",
  // State do OAuth
  estado_invalido: "A autorização não pôde ser validada. Tente conectar de novo.",
  bad_state: "A autorização não pôde ser validada. Tente conectar de novo.",
  state_reused: "Esta autorização já foi usada. Tente conectar de novo.",
  state_expired: "A autorização demorou demais para voltar. Tente conectar de novo.",
  state_provider_mismatch:
    "A autorização voltou de outro conector. Tente conectar de novo por esta tela.",
  // Fluxo / provedor
  callback_incompleto: "O provedor não devolveu a autorização completa. Tente de novo.",
  provedor_desconhecido: "Este conector não existe na mila. Nada foi conectado.",
  unknown_provider: "Este conector não existe na mila. Nada foi conectado.",
  not_a_guided_provider:
    "Este conector não usa chave colada. Use o botão de autorizar para conectar.",
  guided_key_provider:
    "Este conector usa chave colada em vez de login. Abra a tela do conector para colar a chave.",
  // Chave colada
  chave_curta: "A chave parece curta demais. Confira e cole novamente.",
  chave_longa: "A chave é longa demais para ser válida. Confira e cole novamente.",
  origem_invalida: "A solicitação veio de um endereço inesperado. Abra a mila em milaai.com.br e tente de novo.",
  invalid_body: "Não recebemos os dados da conexão. Tente de novo.",
  invalid_upstream_json: "A mila respondeu em um formato inesperado. Tente de novo.",
  upstream_timeout: "A mila demorou para responder. Tente de novo em instantes.",
  upstream_unreachable: "Não conseguimos falar com a mila agora. Tente de novo em instantes.",
  missing_auth_secret: "A conexão da mila não está configurada neste ambiente.",
  // Autorização do provedor
  access_denied: "Você cancelou a autorização. Nada foi conectado.",
  token_exchange_failed: "O provedor recusou a autorização. Tente conectar de novo.",
  token_exchange_error: "Não conseguimos concluir a autorização. Tente de novo.",
  unauthorized: "Não foi possível validar a sessão com a mila. Entre novamente.",
};

export function integrationErrorText(detail?: string | null): string {
  if (!detail) return "Não foi possível conectar. Tente novamente.";
  return (
    INTEGRATION_ERRORS[detail] ??
    "Não foi possível conectar. Tente novamente em instantes."
  );
}

/** Hosts oficiais onde o navegador pode ser mandado para autorizar. */
export const AUTHORIZE_HOSTS = [
  "accounts.tiny.com.br",
  "www.bling.com.br",
  "bling.com.br",
  "accounts.google.com",
  "api.notion.com",
];

/** Só deixamos o browser sair para um host de provedor conhecido, via https. */
export function isSafeAuthorizeUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return AUTHORIZE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}
