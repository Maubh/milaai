/**
 * Marca da loja em Dados da loja (seção "Marca"): cores, fonte do Google
 * Fonts, logo e arquivos de identidade visual. O mesmo cadastro que a mila usa
 * pelo WhatsApp e na vitrine. O nome é o nome da loja e o WhatsApp dos pedidos
 * é o da própria lojista: a tela não pede nenhum dos dois.
 *
 * Módulo puro (sem `next/*`): projeção do que vem do serviço, leitura do que
 * a lojista digita e mensagens de erro, testados fora do Next.
 */

import { templateDaVitrine, type TemplateVitrine } from "./vitrine.ts";

export interface ArquivoMarca {
  id: number;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
}

export interface FonteEnviada {
  id: number;
  /** Valor para escolher a fonte num papel: `arquivo:<id>`. */
  valor: string;
  familia: string;
  url: string;
  formato: string;
}

export const PAPEIS_FONTE = [
  { campo: "fonte_titulo", rotulo: "Título", ajuda: "Nome da coleção e títulos." },
  { campo: "fonte_subtitulo", rotulo: "Subtítulo", ajuda: "Nome da loja e nome de cada peça." },
  { campo: "fonte_corpo", rotulo: "Corpo", ajuda: "Textos, preços e botões." },
] as const;
export type CampoFonte = (typeof PAPEIS_FONTE)[number]["campo"];

/** Fonte da vitrine quando a lojista não escolhe nenhuma (e sempre no Essencial). */
export const FONTE_PADRAO = "Montserrat";

export interface Marca {
  cadastrada: boolean;
  nome_loja: string | null;
  whatsapp: string | null;
  cor_primaria: string | null;
  cor_destaque: string | null;
  /** Google Fonts (nome da família) ou `arquivo:<id>`; null = padrão. */
  fonte_titulo: string | null;
  fonte_subtitulo: string | null;
  fonte_corpo: string | null;
  fontes_enviadas: FonteEnviada[];
  logo_url: string | null;
  identidade: ArquivoMarca[];
  link_vitrine: string | null;
  /** Layout da vitrine (`classico`, `editorial`, `minimalista`); `classico` quando o serviço ainda não manda. */
  template: TemplateVitrine;
}

export interface LeituraMarca {
  marca: Marca;
  fonteNoPlano: boolean;
  /** O serviço tem onde guardar arquivos: sem isso, o envio fica desligado. */
  armazenamento: boolean;
}

export const CAMPOS_MARCA = ["cor_primaria", "cor_destaque", "fonte_titulo", "fonte_subtitulo", "fonte_corpo", "template"] as const;
export type CampoMarca = (typeof CAMPOS_MARCA)[number];

/** Limites do serviço (cabem no corpo de uma requisição do site). */
export const LIMITES_ARQUIVO = {
  logo: { bytes: 1.5 * 1024 * 1024, aceita: "image/png,image/jpeg,image/webp" },
  identidade: { bytes: 3 * 1024 * 1024, aceita: "application/pdf,image/png,image/jpeg,image/webp", maximo: 5 },
  fonte: { bytes: 2 * 1024 * 1024, aceita: ".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf", maximo: 6 },
} as const;

/** Valor de fonte aceito: família do Google Fonts ou `arquivo:<id>`. */
export function valorFonte(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return /^arquivo:\d{1,12}$/.test(t) ? t : fonteGoogle(t);
}

/** Como a tela mostra a fonte de um papel. */
export function rotuloFonte(valor: string | null, enviadas: readonly FonteEnviada[]): string {
  if (!valor) return `Padrão (${FONTE_PADRAO})`;
  const enviada = enviadas.find((f) => f.valor === valor);
  return enviada ? `${enviada.familia} (sua fonte)` : valor;
}

/** Nome de família de uma fonte enviada (mesma regra do serviço). */
export function familiaValida(v: string): string | null {
  const limpo = v.normalize("NFC").trim().replace(/\s+/g, " ");
  return /^[\p{L}\p{N}][\p{L}\p{N} -]{0,39}$/u.test(limpo) ? limpo : null;
}

/** Marcas técnicas do nome do arquivo que não fazem parte do nome da fonte. */
const RUIDO_NOME_FONTE = new Set(["variablefont", "variable", "vf", "wght", "wdth", "opsz", "slnt", "ital", "webfont", "web"]);

/**
 * Nome da fonte a partir do nome do arquivo, sem a lojista digitar nada:
 * "CormorantGaramond-Italic-VariableFont_wght.ttf" vira "Cormorant Garamond Italic".
 * Não repete o nome de outra fonte já enviada (ganha " 2", " 3"…).
 */
export function nomeDaFonteDoArquivo(nomeArquivo: string, existentes: readonly string[] = []): string {
  // Tira o ruído antes de separar CamelCase ("VariableFont" sai inteiro, não vira "Variable Font").
  const palavras = nomeArquivo
    .replace(/\.[a-z0-9]+$/i, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((p) => p && !RUIDO_NOME_FONTE.has(p.toLowerCase()))
    .flatMap((p) => p.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2").split(" "));
  let nome = "";
  for (const p of palavras) {
    const proximo = nome ? `${nome} ${p}` : p;
    if (proximo.length > 34) break;
    nome = proximo;
  }
  const base = familiaValida(nome) ?? "Fonte enviada";
  const usados = new Set(existentes.map((e) => e.toLowerCase()));
  if (!usados.has(base.toLowerCase())) return base;
  for (let i = 2; i < 100; i++) if (!usados.has(`${base} ${i}`.toLowerCase())) return `${base} ${i}`;
  return base;
}

/** Mesma regra do serviço: "#B76E79", "b76e79" ou "#FA0" viram "#RRGGBB". */
export function normalizarCorHex(valor: string): string | null {
  const m = valor.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const hex = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return `#${hex.toUpperCase()}`;
}

/** Mesma regra do serviço para o nome de família do Google Fonts. */
export function fonteGoogle(nome: string | null | undefined): string | null {
  const limpo = (nome ?? "").trim().replace(/\s+/g, " ");
  return /^[A-Za-z0-9][A-Za-z0-9 ]{0,39}$/.test(limpo) ? limpo : null;
}

/** Folha de estilo do Google Fonts para uma família (só se o nome for válido). */
export function urlFonteGoogle(familia: string | null | undefined, texto?: string): string | null {
  const f = fonteGoogle(familia);
  if (!f) return null;
  const url = new URL("https://fonts.googleapis.com/css2");
  url.searchParams.set("family", `${f}:wght@400;600;700`);
  url.searchParams.set("display", "swap");
  if (texto) url.searchParams.set("text", texto);
  return url.toString().replace(/%3A/g, ":").replace(/%3B/g, ";").replace(/%40/g, "@");
}

const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const cor = (v: unknown) => (typeof v === "string" ? normalizarCorHex(v) : null);
const httpsOuNada = (v: unknown) => {
  const t = texto(v);
  return t && /^https:\/\/[^\s"'<>]+$/.test(t) ? t : null;
};
const linkVitrine = (v: unknown) => {
  const t = texto(v);
  return t && /^https:\/\/vitrine\.milaai\.com\.br\/[a-z0-9-]+$/.test(t) ? t : null;
};

function fonteEnviada(v: unknown): FonteEnviada | null {
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const url = httpsOuNada(a.url);
  const id = typeof a.id === "number" && Number.isSafeInteger(a.id) ? a.id : null;
  const familia = typeof a.familia === "string" ? familiaValida(a.familia) : null;
  if (!url || id === null || !familia) return null;
  const formato = texto(a.formato);
  return { id, valor: `arquivo:${id}`, familia, url, formato: formato && /^(woff2|woff|ttf|otf)$/.test(formato) ? formato : "woff2" };
}

function arquivo(v: unknown): ArquivoMarca | null {
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const url = httpsOuNada(a.url);
  const id = typeof a.id === "number" && Number.isSafeInteger(a.id) ? a.id : null;
  if (!url || id === null) return null;
  return {
    id,
    nome: texto(a.nome)?.slice(0, 80) ?? "arquivo",
    url,
    tipo: texto(a.tipo) ?? "",
    tamanho: typeof a.tamanho === "number" && a.tamanho >= 0 ? a.tamanho : 0,
  };
}

/** Projeta a resposta do serviço: só campos conhecidos, com o tipo certo. */
export function projetarMarca(bruto: unknown): LeituraMarca {
  const d = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? (bruto as Record<string, unknown>) : {};
  const m = d.marca && typeof d.marca === "object" ? (d.marca as Record<string, unknown>) : {};
  return {
    marca: {
      cadastrada: m.cadastrada === true,
      nome_loja: texto(m.nome_loja),
      whatsapp: texto(m.whatsapp)?.replace(/\D/g, "") || null,
      cor_primaria: cor(m.cor_primaria),
      cor_destaque: cor(m.cor_destaque),
      fonte_titulo: valorFonte(m.fonte_titulo),
      fonte_subtitulo: valorFonte(m.fonte_subtitulo),
      fonte_corpo: valorFonte(m.fonte_corpo),
      fontes_enviadas: Array.isArray(m.fontes_enviadas) ? m.fontes_enviadas.map(fonteEnviada).filter((f): f is FonteEnviada => f !== null) : [],
      logo_url: httpsOuNada(m.logo_url),
      identidade: Array.isArray(m.identidade) ? m.identidade.map(arquivo).filter((a): a is ArquivoMarca => a !== null) : [],
      link_vitrine: linkVitrine(m.link_vitrine),
      template: templateDaVitrine(m.template),
    },
    fonteNoPlano: d.fonte_no_plano === true,
    armazenamento: d.armazenamento === true,
  };
}

/** "5531999990000" -> "(31) 99999-0000"; outro formato fica como veio. */
export function formatarWhatsapp(v: string | null): string | null {
  if (!v) return null;
  const local = v.startsWith("55") && v.length >= 12 ? v.slice(2) : v;
  const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : v;
}

/** "1572864" -> "1,5 MB". */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Lê um arquivo do navegador em base64 (sem o prefixo data:). */
export function base64DeBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const NOMES: Record<string, string> = {
  cor_primaria: "a cor principal",
  cor_destaque: "a cor de destaque",
  fonte_titulo: "a fonte do título",
  fonte_subtitulo: "a fonte do subtítulo",
  fonte_corpo: "a fonte do corpo",
  familia: "o nome da fonte",
  fonte: "a fonte",
  logo: "o logo",
  identidade: "o arquivo",
};

/** Texto para a lojista a partir do `detail` (e do `campo`) do serviço. */
export function mensagemDaMarca(detail: unknown, campo?: unknown): string {
  const nome = typeof campo === "string" ? NOMES[campo] ?? null : null;
  switch (detail) {
    case "store_name_required":
      return "Informe primeiro o nome da loja, em Sobre a loja: a marca usa esse nome.";
    case "phone_required":
      return "Não encontramos o seu WhatsApp nesta sessão. Entre de novo e tente outra vez.";
    case "invalid_field":
      if (campo === "cor_primaria" || campo === "cor_destaque") return `Confira ${nome}: use um código de cor como #B76E79.`;
      if (typeof campo === "string" && campo.startsWith("fonte_")) return `Escolha ${nome} na lista do Google Fonts ou entre as suas fontes.`;
      if (campo === "familia") return "Dê um nome à fonte só com letras, números, espaço e hífen (até 40 caracteres).";
      return nome ? `Confira ${nome}.` : "Confira os dados e tente de novo.";
    case "invalid_file_type":
      if (campo === "fonte") return "A fonte precisa ser um arquivo WOFF2, WOFF, TTF ou OTF.";
      return campo === "logo" ? "O logo precisa ser uma imagem PNG, JPG ou WebP." : "Envie PDF, PNG, JPG ou WebP.";
    case "file_too_large":
      if (campo === "fonte") return "Cada fonte pode ter até 2 MB.";
      return campo === "logo" ? "O logo pode ter até 1,5 MB." : "Cada arquivo pode ter até 3 MB.";
    case "too_many_files":
      return campo === "fonte"
        ? `Você já enviou ${LIMITES_ARQUIVO.fonte.maximo} fontes. Tire uma para enviar outra.`
        : `Você já enviou ${LIMITES_ARQUIVO.identidade.maximo} arquivos. Tire um para enviar outro.`;
    case "storage_unavailable":
      return "O envio de arquivos ainda não está ligado. Tente mais tarde.";
    case "body_too_large":
      return "O arquivo é grande demais para enviar daqui.";
    case "plan_pro_required":
      return "As fontes da marca são do Plano Pro.";
    case "nothing_to_update":
      // Só o layout enviado e o serviço não o reconheceu: ele ainda não grava esse campo.
      if (campo === "template") return "O serviço ainda não grava o layout da vitrine. Tente de novo mais tarde.";
      return "Nada mudou.";
    case "no_session":
      return "Sua sessão expirou. Entre de novo para salvar.";
    default:
      return "Não deu para salvar agora. Tente de novo em instantes.";
  }
}

export interface FonteGoogle {
  familia: string;
  categoria: string;
}

/** Busca na lista do Google Fonts: começa com o termo primeiro, depois contém. */
export function filtrarFontes(fontes: readonly FonteGoogle[], termo: string, limite = 30): FonteGoogle[] {
  const t = termo.trim().toLowerCase();
  if (!t) return fontes.slice(0, limite);
  const comeca = fontes.filter((f) => f.familia.toLowerCase().startsWith(t));
  const contem = fontes.filter((f) => !f.familia.toLowerCase().startsWith(t) && f.familia.toLowerCase().includes(t));
  return [...comeca, ...contem].slice(0, limite);
}

/** Se a lista do Google Fonts não responder, estas continuam disponíveis. */
export const FONTES_RESERVA: readonly FonteGoogle[] = [
  { familia: "Inter", categoria: "Sans Serif" },
  { familia: "Montserrat", categoria: "Sans Serif" },
  { familia: "Poppins", categoria: "Sans Serif" },
  { familia: "Lato", categoria: "Sans Serif" },
  { familia: "DM Sans", categoria: "Sans Serif" },
  { familia: "Playfair Display", categoria: "Serif" },
  { familia: "Cormorant Garamond", categoria: "Serif" },
  { familia: "Lora", categoria: "Serif" },
  { familia: "DM Serif Text", categoria: "Serif" },
  { familia: "Cinzel", categoria: "Serif" },
  { familia: "Great Vibes", categoria: "Handwriting" },
  { familia: "Dancing Script", categoria: "Handwriting" },
];

/** Projeta a lista do Google Fonts (metadata) para o seletor: só latinas, por popularidade. */
export function projetarFontesGoogle(bruto: unknown): FonteGoogle[] {
  const lista = bruto && typeof bruto === "object" ? (bruto as { familyMetadataList?: unknown }).familyMetadataList : null;
  if (!Array.isArray(lista)) return [];
  return lista
    // Fora: fontes exclusivas do Google (isBrandFont), que não ficam disponíveis para uso.
    .filter((f) => f && typeof f.family === "string" && f.isBrandFont !== true && Array.isArray(f.subsets) && f.subsets.includes("latin") && fonteGoogle(f.family) === f.family)
    .sort((a, b) => (Number(a.popularity) || 1e9) - (Number(b.popularity) || 1e9))
    .map((f) => ({ familia: f.family as string, categoria: typeof f.category === "string" ? f.category : "" }));
}

export interface FonteVitrineEnviada {
  familia: string;
  url: string;
  formato: string;
}

/**
 * Fontes da vitrine pública: folhas do Google Fonts a carregar, regras
 * @font-face das fontes enviadas e a pilha CSS de cada papel. Nomes e links
 * passam pelas mesmas regras do serviço antes de entrar no CSS.
 */
export function fontesDaVitrine(loja: {
  tipografiaHeading?: string | null;
  tipografiaSubtitulo?: string | null;
  tipografiaBody?: string | null;
  fontesEnviadas?: readonly FonteVitrineEnviada[] | null;
}): { links: string[]; fontFace: string; titulo: string; subtitulo: string; corpo: string } {
  const enviadas = (loja.fontesEnviadas ?? []).flatMap((f) => {
    const familia = typeof f?.familia === "string" ? familiaValida(f.familia) : null;
    const url = typeof f?.url === "string" && /^https:\/\/[^\s"'()<>\\]+$/.test(f.url) ? f.url : null;
    const formato = f?.formato === "ttf" ? "truetype" : f?.formato === "otf" ? "opentype" : f?.formato === "woff" ? "woff" : "woff2";
    return familia && url ? [{ familia, url, formato }] : [];
  });
  const nomesEnviados = new Set(enviadas.map((f) => f.familia));
  const familia = (v: string | null | undefined) => {
    const t = (v ?? "").trim();
    if (nomesEnviados.has(t)) return t;
    return fonteGoogle(t) ?? FONTE_PADRAO;
  };
  const papeis = {
    titulo: familia(loja.tipografiaHeading),
    subtitulo: familia(loja.tipografiaSubtitulo ?? loja.tipografiaHeading),
    corpo: familia(loja.tipografiaBody),
  };
  const google = [...new Set([...Object.values(papeis), FONTE_PADRAO])].filter((f) => !nomesEnviados.has(f));
  const pilha = (f: string) => `${JSON.stringify(f)}, ${JSON.stringify(FONTE_PADRAO)}, system-ui, sans-serif`;
  return {
    links: google.map((f) => urlFonteGoogle(f)).filter((u): u is string => u !== null),
    fontFace: enviadas
      .filter((f) => Object.values(papeis).includes(f.familia))
      .map((f) => `@font-face{font-family:${JSON.stringify(f.familia)};src:url(${JSON.stringify(f.url)}) format(${JSON.stringify(f.formato)});font-display:swap}`)
      .join("\n"),
    titulo: pilha(papeis.titulo),
    subtitulo: pilha(papeis.subtitulo),
    corpo: pilha(papeis.corpo),
  };
}
