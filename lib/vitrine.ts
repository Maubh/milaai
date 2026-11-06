/**
 * Leitura da resposta da API interna da vitrine (módulo puro, testável).
 * Uma vitrine expirada volta 410 com os dados públicos da loja; só eles, como
 * texto e com tamanho limitado, chegam à página.
 *
 * Aqui também moram o layout da vitrine (`template`), as regras de contraste
 * das cores da loja e as peças de exemplo da galeria de layouts.
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

/* --------------------------------------------------------------------------
   LAYOUTS (contrato com o Eve: os nomes não mudam)
   -------------------------------------------------------------------------- */

export const TEMPLATES_VITRINE = ["classico", "editorial", "minimalista"] as const;
export type TemplateVitrine = (typeof TEMPLATES_VITRINE)[number];
export const TEMPLATE_PADRAO: TemplateVitrine = "classico";

/** Nome e descrição curta de cada layout, na linguagem da lojista. */
export const DESCRICAO_TEMPLATE: Record<TemplateVitrine, { nome: string; descricao: string }> = {
  classico: { nome: "Clássico", descricao: "Cards com foto, nome, preço e botão. Direto ao ponto, duas peças por linha no celular." },
  editorial: { nome: "Editorial", descricao: "Jeito de revista: uma peça em destaque abre a coleção, texto com mais respiro e grade espaçada." },
  minimalista: { nome: "Minimalista", descricao: "Grade densa e limpa, muito branco e fotos grandes. Pouco texto: o foco é a peça." },
};

/** Layout a usar: o que a API devolveu, ou `classico` quando falta ou é desconhecido. */
export function templateDaVitrine(valor: unknown): TemplateVitrine {
  const v = typeof valor === "string" ? valor.trim().toLowerCase() : "";
  return (TEMPLATES_VITRINE as readonly string[]).includes(v) ? (v as TemplateVitrine) : TEMPLATE_PADRAO;
}

/* --------------------------------------------------------------------------
   PEÇAS E VARIAÇÕES (limites que o layout mostra bem)
   -------------------------------------------------------------------------- */

export const MAX_GRUPOS_VARIACAO = 3;
export const MAX_OPCOES_VARIACAO = 20;
export const MAX_NOME_VARIACAO = 30;
export const MAX_OPCAO_VARIACAO = 40;

export interface VariacaoVitrine {
  nome: string;
  opcoes: string[];
}

export interface ItemVitrine {
  nome: string;
  precoVenda: number;
  fotoUrl: string;
  fotos?: string[] | null;
  descricao?: string | null;
  sku?: string | null;
  variacoes?: VariacaoVitrine[] | null;
}

const urlDeFoto = (v: unknown): string | null => {
  const t = typeof v === "string" ? v.trim() : "";
  return /^(https:\/\/|data:image\/svg\+xml[,;])/.test(t) ? t : null;
};

/**
 * Peças como o layout espera: nome em texto, preço numérico, foto https, até
 * 3 grupos de variação com até 20 opções cada (nome até 30, opção até 40).
 * O Eve já recusa o que passa disso; aqui é a rede de segurança da página.
 */
export function normalizarItens(bruto: unknown): ItemVitrine[] {
  if (!Array.isArray(bruto)) return [];
  const itens: ItemVitrine[] = [];
  for (const item of bruto) {
    if (!item || typeof item !== "object") continue;
    const i = item as Record<string, unknown>;
    const nome = typeof i.nome === "string" ? i.nome.trim() : "";
    const fotoUrl = urlDeFoto(i.fotoUrl);
    const preco = typeof i.precoVenda === "number" && Number.isFinite(i.precoVenda) ? i.precoVenda : null;
    if (!nome || !fotoUrl || preco === null) continue;
    const fotos = Array.isArray(i.fotos) ? i.fotos.map(urlDeFoto).filter((f): f is string => f !== null).slice(0, 12) : [];
    const variacoes = normalizarVariacoes(i.variacoes);
    itens.push({
      nome,
      precoVenda: preco,
      fotoUrl,
      fotos: fotos.length ? fotos : null,
      descricao: textoOuNulo(i.descricao),
      sku: typeof i.sku === "string" && i.sku.trim() ? i.sku.trim().slice(0, 40) : null,
      variacoes: variacoes.length ? variacoes : null,
    });
  }
  return itens;
}

export function normalizarVariacoes(bruto: unknown): VariacaoVitrine[] {
  if (!Array.isArray(bruto)) return [];
  const grupos: VariacaoVitrine[] = [];
  for (const v of bruto) {
    if (grupos.length >= MAX_GRUPOS_VARIACAO) break;
    const nome = typeof v?.nome === "string" ? v.nome.trim().slice(0, MAX_NOME_VARIACAO) : "";
    const opcoes = [
      ...new Set(
        (Array.isArray(v?.opcoes) ? v.opcoes : [])
          .map((o: unknown) => (typeof o === "string" ? o.trim().slice(0, MAX_OPCAO_VARIACAO) : ""))
          .filter(Boolean),
      ),
    ].slice(0, MAX_OPCOES_VARIACAO) as string[];
    if (!nome || opcoes.length === 0 || grupos.some((g) => g.nome.toLowerCase() === nome.toLowerCase())) continue;
    grupos.push({ nome, opcoes });
  }
  return grupos;
}

/* --------------------------------------------------------------------------
   CONTRASTE (AA): a cor da marca só vira texto se der para ler
   -------------------------------------------------------------------------- */

/** Tinta escura e clara da vitrine (as mesmas de `vitrine.css`). */
export const TINTA_ESCURA = "#18181B";
export const TINTA_CLARA = "#FCFBF9";

function hexParaRgb(cor: string): [number, number, number] | null {
  const m = cor.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const hex = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function luminancia(cor: string): number | null {
  const rgb = hexParaRgb(cor);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores hex (0 se alguma não for cor). */
export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  if (la === null || lb === null) return 0;
  const [claro, escuro] = la >= lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (escuro + 0.05);
}

/** Cor hex válida, normalizada em maiúsculas; senão a reserva. */
export function corOuReserva(cor: unknown, reserva: string): string {
  const rgb = typeof cor === "string" ? hexParaRgb(cor) : null;
  if (!rgb) return reserva;
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** Texto que se lê sobre um fundo na cor da marca: claro ou escuro, o de maior contraste. */
export function tintaSobre(fundo: string): string {
  return contraste(fundo, TINTA_CLARA) >= contraste(fundo, TINTA_ESCURA) ? TINTA_CLARA : TINTA_ESCURA;
}

/**
 * Cor da marca usada como texto (título, preço) sobre o fundo da página: só
 * se tiver contraste AA (4,5:1); senão a tinta da página, não a cor da marca.
 */
export function corDeTextoLegivel(corDaMarca: string, fundo: string, tinta: string = TINTA_ESCURA): string {
  return contraste(corDaMarca, fundo) >= 4.5 ? corDaMarca : tinta;
}

/* --------------------------------------------------------------------------
   PEÇAS DE EXEMPLO (galeria de layouts e prévia)
   -------------------------------------------------------------------------- */

/** Nome fixo da coleção de exemplo; nunca o de uma coleção real. */
export const COLECAO_DE_EXEMPLO = "Coleção de exemplo";

/**
 * Imagem neutra desenhada em SVG (uma forma geométrica no tom da loja): nunca
 * a foto de outra loja. `data:` é aceito por `normalizarItens` só com SVG.
 */
export function imagemDeExemplo(cor: string, forma: number): string {
  const tom = corOuReserva(cor, "#9A8C7C");
  const formas = [
    `<circle cx="300" cy="300" r="150" fill="${tom}" opacity=".85"/>`,
    `<rect x="170" y="170" width="260" height="260" rx="36" fill="${tom}" opacity=".85"/>`,
    `<path d="M300 130 470 430H130Z" fill="${tom}" opacity=".85"/>`,
    `<ellipse cx="300" cy="300" rx="190" ry="110" fill="${tom}" opacity=".85"/>`,
    `<path d="M300 150a150 150 0 1 1 0 300 150 150 0 0 1 0-300zm0 70a80 80 0 1 0 0 160 80 80 0 0 0 0-160z" fill="${tom}" opacity=".85"/>`,
    `<rect x="150" y="250" width="300" height="100" rx="50" fill="${tom}" opacity=".85"/>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#F1EDE6"/>${formas[forma % formas.length]}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Peças fixas e claramente de exemplo: nomes genéricos, sem preço real (o
 * layout mostra "Exemplo" no lugar do valor), sem cliente, sem foto
 * de loja. Cobrem peça sem variação, com variações e com nome longo.
 */
export function pecasDeExemplo(cor: string): ItemVitrine[] {
  return [
    { nome: "Peça de exemplo 1", precoVenda: 0, fotoUrl: imagemDeExemplo(cor, 0), descricao: "Descrição de exemplo da peça, como a sua apareceria aqui." },
    { nome: "Peça de exemplo 2", precoVenda: 0, fotoUrl: imagemDeExemplo(cor, 1), variacoes: [{ nome: "Tamanho", opcoes: ["P", "M", "G"] }] },
    { nome: "Peça de exemplo 3", precoVenda: 0, fotoUrl: imagemDeExemplo(cor, 2) },
    {
      nome: "Peça de exemplo com um nome bem mais longo, para ver a quebra de linha",
      precoVenda: 0,
      fotoUrl: imagemDeExemplo(cor, 3),
      variacoes: [
        { nome: "Cor", opcoes: ["Dourado", "Prata", "Rosé"] },
        { nome: "Tamanho", opcoes: ["Único"] },
      ],
    },
    { nome: "Peça de exemplo 5", precoVenda: 0, fotoUrl: imagemDeExemplo(cor, 4) },
    { nome: "Peça de exemplo 6", precoVenda: 0, fotoUrl: imagemDeExemplo(cor, 5) },
  ];
}
