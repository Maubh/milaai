/**
 * "Marca da vitrine" em Dados da loja: nome, WhatsApp que recebe os pedidos,
 * cores e fonte da vitrine web. O mesmo cadastro que a mila usa e edita pelo
 * WhatsApp; a gravação e as regras finais são do serviço (Eve).
 *
 * Módulo puro (sem `next/*`): projeção do que vem do serviço, leitura do que
 * a lojista digita e mensagens de erro, testados fora do Next.
 */

export interface MarcaVitrine {
  cadastrada: boolean;
  nome_exibicao: string | null;
  whatsapp: string | null;
  cor_primaria: string | null;
  cor_destaque: string | null;
  fonte: string | null;
  link_vitrine: string | null;
}

export interface LeituraMarca {
  marca: MarcaVitrine;
  fontes: string[];
  fonteNoPlano: boolean;
}

export const CAMPOS_MARCA = ["nome_exibicao", "whatsapp", "cor_primaria", "cor_destaque", "fonte"] as const;
export type CampoMarca = (typeof CAMPOS_MARCA)[number];

/** Mesma regra do serviço: "#B76E79", "b76e79" ou "#FA0" viram "#RRGGBB". */
export function normalizarCorHex(valor: string): string | null {
  const m = valor.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const hex = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return `#${hex.toUpperCase()}`;
}

const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const cor = (v: unknown) => (typeof v === "string" ? normalizarCorHex(v) : null);
const link = (v: unknown) => {
  const t = texto(v);
  return t && /^https:\/\/vitrine\.milaai\.com\.br\/[a-z0-9-]+$/.test(t) ? t : null;
};

/** Projeta a resposta do serviço: só campos conhecidos, com o tipo certo. */
export function projetarMarca(bruto: unknown): LeituraMarca {
  const d = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? (bruto as Record<string, unknown>) : {};
  const m = d.marca && typeof d.marca === "object" ? (d.marca as Record<string, unknown>) : {};
  const fontes = Array.isArray(d.fontes) ? d.fontes.filter((f): f is string => typeof f === "string" && f.length <= 40) : [];
  return {
    marca: {
      cadastrada: m.cadastrada === true,
      nome_exibicao: texto(m.nome_exibicao),
      whatsapp: texto(m.whatsapp)?.replace(/\D/g, "") || null,
      cor_primaria: cor(m.cor_primaria),
      cor_destaque: cor(m.cor_destaque),
      fonte: texto(m.fonte),
      link_vitrine: link(m.link_vitrine),
    },
    fontes,
    fonteNoPlano: d.fonte_no_plano === true,
  };
}

/** "5531999990000" -> "(31) 99999-0000"; outro formato fica como veio. */
export function formatarWhatsapp(v: string | null): string | null {
  if (!v) return null;
  const local = v.startsWith("55") && v.length >= 12 ? v.slice(2) : v;
  const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : v;
}

const NOMES: Record<CampoMarca, string> = {
  nome_exibicao: "o nome na vitrine",
  whatsapp: "o WhatsApp que recebe os pedidos",
  cor_primaria: "a cor principal",
  cor_destaque: "a cor de destaque",
  fonte: "a fonte",
};

/** Texto para a lojista a partir do `detail` (e do `campo`) do serviço. */
export function mensagemDaMarca(detail: unknown, campo?: unknown): string {
  const nome = typeof campo === "string" && campo in NOMES ? NOMES[campo as CampoMarca] : null;
  switch (detail) {
    case "first_setup_requires":
      return `Para a primeira vez, informe ${nome ?? "o nome e o WhatsApp"}: a vitrine precisa dos dois.`;
    case "invalid_field":
      if (campo === "cor_primaria" || campo === "cor_destaque") return `Confira ${nome}: use um código de cor como #B76E79.`;
      if (campo === "whatsapp") return "Confira o WhatsApp: use DDD e número, como (31) 99999-0000.";
      return nome ? `Confira ${nome}.` : "Confira os dados e tente de novo.";
    case "plan_pro_required":
      return "A fonte da marca é do Plano Pro.";
    case "nothing_to_update":
      return "Nada mudou.";
    case "no_session":
      return "Sua sessão expirou. Entre de novo para salvar.";
    default:
      return "Não deu para salvar agora. Tente de novo em instantes.";
  }
}
