import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../../vitrine.css";
import VitrineView from "./VitrineView";
import VitrineExpirada from "./VitrineExpirada";
import { getShowcase, vitrineAtiva } from "@/lib/server/vitrine-api";

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
  const ativa = vitrineAtiva(resultado);

  if (!ativa) {
    return {
      title: "Catálogo | Mila",
    };
  }

  const { loja, vitrine } = ativa;
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
  const ativa = vitrineAtiva(resultado);
  if (!ativa) {
    notFound();
  }

  // O layout vem da marca da loja (`template`); a vitrine só o lê.
  return <VitrineView loja={ativa.loja} vitrine={ativa.vitrine} template={ativa.loja.template} />;
}
