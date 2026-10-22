/**
 * Dados da loja (`/workspace/dados-loja`): o mesmo perfil que a mila usa e
 * edita pelo WhatsApp (taxa de cartão, markup, embalagem, banho, nome,
 * Instagram, observações) e os concorrentes no Instagram.
 *
 * Módulo puro (sem `next/*`): a projeção do que vem do serviço, a leitura dos
 * campos digitados e as mensagens de erro são testadas fora do Next.
 */

export interface DadosLoja {
  nome_loja: string | null;
  instagram: string | null;
  custo_embalagem: number | null;
  taxa_cartao_percent: number | null;
  markup_padrao: number | null;
  tipo_banho: string | null;
  observacoes: string | null;
}

export const CAMPOS_TEXTO = ["nome_loja", "instagram", "tipo_banho", "observacoes"] as const;
export const CAMPOS_NUMERO = ["custo_embalagem", "taxa_cartao_percent", "markup_padrao"] as const;
export type CampoDadosLoja = (typeof CAMPOS_TEXTO)[number] | (typeof CAMPOS_NUMERO)[number];

/** Até quantos concorrentes a loja mapeia (o serviço confirma o número). */
export const MAX_CONCORRENTES = 3;

function texto(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function numero(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Projeta o perfil vindo do serviço: só campos conhecidos, com o tipo certo. */
export function projetarDadosLoja(bruto: unknown): DadosLoja {
  const d = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? (bruto as Record<string, unknown>) : {};
  return {
    nome_loja: texto(d.nome_loja),
    instagram: texto(d.instagram),
    custo_embalagem: numero(d.custo_embalagem),
    taxa_cartao_percent: numero(d.taxa_cartao_percent),
    markup_padrao: numero(d.markup_padrao),
    tipo_banho: texto(d.tipo_banho),
    observacoes: texto(d.observacoes),
  };
}

/** "@Loja.X", "instagram.com/loja.x/" → "loja.x". Null se não for um @ válido. */
export function contaDoInstagram(entrada: string): string | null {
  let u = String(entrada || "").trim();
  u = u.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").split("?")[0].split("/")[0].replace(/^@+/, "");
  const conta = u.trim().toLowerCase();
  return /^[a-z0-9._]{1,30}$/.test(conta) ? conta : null;
}

/** Lista de concorrentes vinda do serviço: só @ válidos, sem repetir, até o máximo. */
export function projetarConcorrentes(bruto: unknown): string[] {
  if (!Array.isArray(bruto)) return [];
  const contas = bruto.map((c) => (typeof c === "string" ? contaDoInstagram(c) : null)).filter((c): c is string => c !== null);
  return [...new Set(contas)].slice(0, MAX_CONCORRENTES);
}

/**
 * Número digitado pela lojista: aceita vírgula ("3,99"), "R$", "%" e "x".
 * Vazio ou ilegível volta null.
 */
export function lerNumeroDigitado(entrada: string): number | null {
  const limpo = String(entrada || "")
    .replace(/r\$|%|x/gi, "")
    .replace(/\s/g, "")
    .trim();
  if (!limpo) return null;
  // "1.234,56" → 1234.56; "3,99" → 3.99; "3.99" → 3.99
  const normal = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  if (!/^\d+(\.\d+)?$/.test(normal)) return null;
  return Number(normal);
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const DECIMAL = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function formatarReais(v: number | null): string | null {
  return v === null ? null : BRL.format(v);
}

export function formatarPercentual(v: number | null): string | null {
  return v === null ? null : `${DECIMAL.format(v)}%`;
}

export function formatarMarkup(v: number | null): string | null {
  return v === null ? null : `${DECIMAL.format(v)}x`;
}

const NOMES_CAMPOS: Record<CampoDadosLoja, string> = {
  nome_loja: "Nome da loja",
  instagram: "Instagram da loja",
  custo_embalagem: "Custo de embalagem",
  taxa_cartao_percent: "Taxa da maquininha",
  markup_padrao: "Markup padrão",
  tipo_banho: "Banho padrão",
  observacoes: "Observações",
};

const LIMITES: Partial<Record<CampoDadosLoja, string>> = {
  custo_embalagem: "entre R$ 0 e R$ 1.000",
  taxa_cartao_percent: "entre 0% e 30%",
  markup_padrao: "entre 1x e 20x",
  nome_loja: "com até 80 caracteres",
  tipo_banho: "com até 120 caracteres",
  observacoes: "com até 1.000 caracteres",
  instagram: "um @ válido do Instagram",
};

/** Mensagem para a lojista a partir do `detail` (e do `campo`) que o serviço devolveu. */
export function mensagemDeErro(detail: unknown, campo?: unknown): string {
  if (detail === "no_session") return "Sua sessão expirou. Entre de novo para salvar.";
  if (detail === "invalid_field" && typeof campo === "string" && campo in NOMES_CAMPOS) {
    const c = campo as CampoDadosLoja;
    return `Confira ${NOMES_CAMPOS[c].toLowerCase()}: precisa ser ${LIMITES[c] ?? "um valor válido"}.`;
  }
  if (detail === "invalid_username") return "Algum @ não é válido. Use só letras, números, ponto e _.";
  if (detail === "too_many") return `São até ${MAX_CONCORRENTES} concorrentes.`;
  if (detail === "nothing_to_update") return "Nada mudou para salvar.";
  return "Não foi possível salvar agora. Tente de novo em alguns minutos.";
}
