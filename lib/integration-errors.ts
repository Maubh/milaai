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
  // A tela do conector manda para cá quando falta sessão; depois do código, o
  // login volta para a tela do conector.
  sessao_integracao:
    "Entre com seu telefone para conectar a integração. Depois do código, você volta para a tela de conexão.",
  // Retorno do OAuth sem sessão e sessão vencida dentro das integrações; o
  // login devolve a lojista às integrações.
  sessao_expirada: "Sua sessão expirou. Entre de novo e você volta às integrações.",
  // Mesma causa, outra porta: aqui a lojista bateu no workspace (link direto,
  // sessão que nunca existiu), não no meio de uma conexão de integração.
  sessao_necessaria: "Entre com seu telefone para abrir sua área.",
  loja_divergente: "A conta autorizada não é a desta loja. Nada foi conectado.",
  // O Google deixa desmarcar cada permissão; sem a do Drive a mila não cria a
  // planilha. O Eve não grava a conexão e volta para cá com este código.
  permissao_drive_faltando:
    "Faltou a permissão do Drive. Conecte o Google de novo e, na tela do Google, deixe marcada a caixa que permite à mila criar arquivos no Drive. Nada foi conectado.",
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
  // Verificação contra o provedor (a mila CONFERE antes de dizer "conectado")
  credencial_invalida:
    "O provedor recusou esta credencial. Confira o token e tente de novo — nada foi conectado.",
  cliente_invalido:
    "O código de cliente não foi aceito pelo provedor. Confira o código e tente de novo.",
  cliente_obrigatorio:
    "Informe também o código de cliente do Jueri — só o token não basta.",
  nao_verificavel_agora:
    "Não conseguimos falar com o provedor para conferir sua credencial. Nada foi conectado — tente de novo em alguns minutos.",
  sem_verificador:
    "Este conector ainda não sabe conferir credenciais. Nada foi conectado — avisamos quando liberar.",
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
  plan_pro_required: "Este conector é exclusivo do Plano Pro. Acesse o menu Plano para fazer upgrade.",
  // Catálogo da Meta
  meta_not_connected: "A conta da Meta não está conectada. Conecte de novo para escolher o catálogo.",
  catalog_not_found: "Esse catálogo não está na sua conta da Meta. Atualize a página e escolha de novo.",
  invalid_catalog: "Catálogo inválido. Atualize a página e escolha de novo.",
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
  "www.tiendanube.com",
  "tiendanube.com",
  "www.nuvemshop.com.br",
  "nuvemshop.com.br",
  "www.facebook.com",
  "facebook.com",
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
