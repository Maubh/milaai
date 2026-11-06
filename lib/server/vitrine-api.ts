import "server-only";
import { normalizarItens, templateDaVitrine, vitrineExpirada, type ItemVitrine, type ResultadoVitrine, type TemplateVitrine } from "@/lib/vitrine";
import type { FonteVitrineEnviada } from "@/lib/marca";

/** A loja como a vitrine pública a recebe (resposta de `getPublicShowcase`). */
export interface LojaVitrine {
  slug: string;
  nomeExibicao: string;
  whatsappContato: string;
  corPrimaria: string;
  corSecundaria: string;
  corDestaque: string;
  tipografiaHeading: string;
  tipografiaBody: string;
  tipografiaSubtitulo?: string | null;
  fontesEnviadas?: FonteVitrineEnviada[] | null;
  logoUrl?: string | null;
  plano: string;
  /** Layout escolhido pela lojista; `classico` quando a API ainda não manda. */
  template: TemplateVitrine;
}

export interface ColecaoVitrine {
  id: string;
  slugColecao: string;
  tituloColecao: string;
  descricao?: string | null;
  itens: ItemVitrine[];
}

export interface VitrineAtiva {
  loja: LojaVitrine;
  vitrine: ColecaoVitrine;
}

/**
 * Consulta a API interna da vitrine. Sem `slugColecao`, a API devolve a
 * coleção ativa mais recente da loja. `null` quando não existe (404) ou falha.
 */
export async function getShowcase(slugLoja: string, slugColecao?: string | null): Promise<ResultadoVitrine | null> {
  const apiUrl = process.env.MILA_INTERNAL_API_URL || "https://wa.milaai.com.br";
  // Sem segredo configurado não há consulta: um valor padrão no código público
  // autenticaria qualquer um na API interna da vitrine.
  const token = (process.env.MILA_INTERNAL_HMAC_SECRET || "").trim();
  if (!token) {
    console.error("MILA_INTERNAL_HMAC_SECRET ausente: vitrine não consultada");
    return null;
  }

  const url = new URL(`${apiUrl}/api/internal/showcase`);
  url.searchParams.set("slugLoja", slugLoja);
  if (slugColecao) url.searchParams.set("slugColecao", slugColecao);

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });

    if (res.status === 410) {
      return vitrineExpirada(await res.json().catch(() => ({})));
    }
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      console.error(`Erro ao carregar vitrine: status ${res.status}`);
      return null;
    }
    return { tipo: "ativa", data: await res.json() };
  } catch (err) {
    console.error("Falha de rede ao consultar API interna da vitrine:", err);
    return null;
  }
}

/** Projeta a resposta ativa: loja com layout resolvido e peças dentro dos limites. */
export function vitrineAtiva(resultado: ResultadoVitrine | null): VitrineAtiva | null {
  if (!resultado || resultado.tipo !== "ativa") return null;
  const data = resultado.data;
  if (!data || !data.ok || !data.loja || !data.vitrine) return null;
  return {
    loja: { ...data.loja, template: templateDaVitrine(data.loja.template) },
    vitrine: { ...data.vitrine, itens: normalizarItens(data.vitrine.itens) },
  };
}
