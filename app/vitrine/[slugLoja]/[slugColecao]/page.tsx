import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../../vitrine.css";
import VitrineView from "./VitrineView";

async function getShowcase(slugLoja: string, slugColecao: string): Promise<any | null> {
  const apiUrl = process.env.MILA_INTERNAL_API_URL || "https://wa.milaai.com.br";
  const token = process.env.MILA_INTERNAL_HMAC_SECRET || "mila_internal_hmac_secret_2026";

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

    if (res.status === 404 || res.status === 410) {
      return null;
    }

    if (!res.ok) {
      console.error(`Erro ao carregar vitrine: status ${res.status}`);
      return null;
    }

    return await res.json();
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
  const data = await getShowcase(slugLoja, slugColecao);

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
  const data = await getShowcase(slugLoja, slugColecao);

  if (!data || !data.ok || !data.loja || !data.vitrine) {
    notFound();
  }

  return <VitrineView loja={data.loja} vitrine={data.vitrine} />;
}
