/**
 * Decisão do gate do workspace — pura, para ser testável sem o runtime do Next.
 *
 * O critério é um só: existe crachá (cookie `mila_session`)? Note que é
 * presença, não validade — validar o token opaco exigiria uma ida ao serviço de
 * auth em toda navegação, e o dado real já é fail-closed (as rotas BFF
 * devolvem 401 sem sessão). A porta abre; o cofre continua fechado sozinho.
 */

import { destinoPermitido } from "./pos-login.ts";

/** Para onde vai quem não tem crachá. O `?erro=` faz a tela explicar por quê. */
export const WORKSPACE_LOGIN_REDIRECT = "/login?erro=sessao_necessaria";

/**
 * Mesmo login, com a tela pedida como destino quando ela está na lista fechada
 * de `pos-login` (ex.: o link de integrações que a Mila manda no WhatsApp).
 */
export function workspaceLoginRedirect(caminho: string | null | undefined): string {
  return destinoPermitido(caminho)
    ? `${WORKSPACE_LOGIN_REDIRECT}&destino=${encodeURIComponent(caminho)}`
    : WORKSPACE_LOGIN_REDIRECT;
}

export function shouldRedirectToLogin(token: string | null | undefined): boolean {
  // Cookie vazio (`mila_session=`) conta como ausente: um Set-Cookie de logout
  // pode deixar string vazia, e isso não é sessão.
  return !(typeof token === "string" && token.trim().length > 0);
}
