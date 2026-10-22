/**
 * Leitura da resposta da API interna da vitrine (módulo puro, testável).
 * Uma vitrine expirada volta 410 com os dados públicos da loja; só eles, como
 * texto e com tamanho limitado, chegam à página.
 */
export interface LojaExpirada {
  nomeExibicao: string | null;
  whatsappContato: string | null;
  corPrimaria: string | null;
  logoUrl: string | null;
}

export type ResultadoVitrine =
  | { tipo: "ativa"; data: any }
  | { tipo: "expirada"; loja: LojaExpirada; tituloColecao: string | null };

function textoOuNulo(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 300) : null;
}

/** Só campos públicos e de texto do 410: o resto da resposta não chega à página. */
export function vitrineExpirada(body: any): ResultadoVitrine {
  const loja = body && typeof body.loja === "object" && body.loja ? body.loja : {};
  const logo = textoOuNulo(loja.logoUrl);
  return {
    tipo: "expirada",
    loja: {
      nomeExibicao: textoOuNulo(loja.nomeExibicao),
      whatsappContato: textoOuNulo(loja.whatsappContato),
      corPrimaria: textoOuNulo(loja.corPrimaria),
      logoUrl: logo && logo.startsWith("https://") ? logo : null,
    },
    tituloColecao: textoOuNulo(body?.tituloColecao),
  };
}

