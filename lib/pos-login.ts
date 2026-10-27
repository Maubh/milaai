/**
 * Destino depois do login. O link de assinatura que a Mila manda no WhatsApp
 * (`/assinar`) leva à tela de plano; sem sessão, o workspace manda para o login,
 * e o login devolve a lojista para onde ela queria ir, não para o início.
 * O mesmo vale para o link de um conector (`/integrations/google`, que a Mila
 * manda quando a planilha precisa do Google): sem sessão, o botão de conectar
 * leva ao login, e o login volta para a tela do conector.
 * E vale para a área de integrações (`/workspace/integracoes`, o link que a
 * Mila mais manda): sem crachá, com sessão vencida ou quando o retorno do
 * provedor chega sem sessão, o login devolve a lojista às integrações.
 *
 * Só destinos desta lista são aceitos: um valor arbitrário no storage viraria
 * redirecionamento aberto.
 */
const CHAVE = "mila_pos_login";
const CONECTORES = ["google", "nuvemshop", "olist", "meta", "jueri", "notion"];
const DESTINOS = new Set([
  "/workspace/plano",
  "/workspace/integracoes",
  ...CONECTORES.map((c) => `/integrations/${c}`),
]);
const PADRAO = "/workspace";

type Armazenamento = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function armazenamento(alvo?: Armazenamento): Armazenamento | null {
  if (alvo) return alvo;
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function destinoPermitido(destino: string | null | undefined): destino is string {
  return typeof destino === "string" && DESTINOS.has(destino);
}

export function guardarDestinoPosLogin(destino: string, alvo?: Armazenamento): void {
  if (!DESTINOS.has(destino)) return;
  try {
    armazenamento(alvo)?.setItem(CHAVE, destino);
  } catch {
    // storage bloqueado: o login cai no início do workspace
  }
}

export function consumirDestinoPosLogin(alvo?: Armazenamento): string {
  try {
    const s = armazenamento(alvo);
    const destino = s?.getItem(CHAVE) ?? null;
    s?.removeItem(CHAVE);
    if (destino && DESTINOS.has(destino)) return destino;
  } catch {
    // storage bloqueado
  }
  return PADRAO;
}

/**
 * A mila respondeu sem sessão (cookie vencido ou ausente): guarda para onde a
 * lojista volta e leva ao login, que explica o motivo pelo `erro`.
 */
export function entrarDeNovo(destino: string, erro: string): void {
  guardarDestinoPosLogin(destino);
  window.location.assign(`/login?erro=${encodeURIComponent(erro)}`);
}
