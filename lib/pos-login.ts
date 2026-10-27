/**
 * Destino depois do login. O link de assinatura que a Mila manda no WhatsApp
 * (`/assinar`) leva à tela de plano; sem sessão, o workspace manda para o login,
 * e o login devolve a lojista para onde ela queria ir, não para o início.
 * O mesmo vale para o link de um conector (`/integrations/google`, que a Mila
 * manda quando a planilha precisa do Google): sem sessão, o botão de conectar
 * leva ao login, e o login volta para a tela do conector.
 *
 * Só destinos desta lista são aceitos: um valor arbitrário no storage viraria
 * redirecionamento aberto.
 */
const CHAVE = "mila_pos_login";
const CONECTORES = ["google", "nuvemshop", "olist", "meta", "jueri", "notion"];
const DESTINOS = new Set(["/workspace/plano", ...CONECTORES.map((c) => `/integrations/${c}`)]);
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
