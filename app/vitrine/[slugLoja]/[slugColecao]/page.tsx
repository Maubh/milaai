import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../../vitrine.css";
import VitrineView from "./VitrineView";
import VitrineExpirada from "./VitrineExpirada";
import { vitrineExpirada, type ResultadoVitrine } from "@/lib/vitrine";

async function getShowcase(slugLoja: string, slugColecao: string): Promise<ResultadoVitrine | null> {
  const apiUrl = process.env.MILA_INTERNAL_API_URL || "https://wa.milaai.com.br";
  // Sem segredo configurado não há consulta: um valor padrão no código público
  // autenticaria qualquer um na API interna da vitrine.
  const token = (process.env.MILA_INTERNAL_HMAC_SECRET || "").trim();
  if (!token) {
    console.error("MILA_INTERNAL_HMAC_SECRET ausente: vitrine não consultada");
    return null;
  }

  try {
    const res = await fetch(
      `${apiUrl}/api/internal/showcase?slugLoja=${encodeURIComponent(slugLoja)}&slugColecao=${encodeURIComponent(slugColecao)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugLoja: string; slugColecao: string }>;
}): Promise<Metadata> {
  const { slugLoja, slugColecao } = await params;
  const resultado = await getShowcase(slugLoja, slugColecao);
  if (resultado?.tipo === "expirada") {
    return {
      title: resultado.loja.nomeExibicao ? `Catálogo expirado — ${resultado.loja.nomeExibicao}` : "Catálogo expirado | Mila",
      robots: { index: false },
    };
  }
  const data = resultado?.data;

  if (!data || !data.ok || !data.loja || !data.vitrine) {
    return {
      title: "Catálogo | Mila",
    };
  }

  const { loja, vitrine } = data;
  return {
    title: `${vitrine.tituloColecao} — ${loja.nomeExibicao}`,
    description: `Catálogo e seleção de peças da ${loja.nomeExibicao}. Escolha suas peças e converse diretamente pelo WhatsApp.`,
    openGraph: {
      title: `${vitrine.tituloColecao} | ${loja.nomeExibicao}`,
      description: `Seleção de peças da ${loja.nomeExibicao}.`,
      images: vitrine.itens[0]?.fotoUrl ? [vitrine.itens[0].fotoUrl] : [],
    },
  };
}

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ slugLoja: string; slugColecao: string }>;
}) {
  const { slugLoja, slugColecao } = await params;
  const resultado = await getShowcase(slugLoja, slugColecao);
  if (resultado?.tipo === "expirada") {
    return <VitrineExpirada loja={resultado.loja} tituloColecao={resultado.tituloColecao} />;
  }
  const data = resultado?.data;

  if (!data || !data.ok || !data.loja || !data.vitrine) {
    notFound();
  }

  return <VitrineView loja={data.loja} vitrine={data.vitrine} />;
}
