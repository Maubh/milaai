import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "../../../vitrine.css";
import "./galeria.css";
import GaleriaModelos from "./GaleriaModelos";
import { getShowcase, vitrineAtiva, type LojaVitrine } from "@/lib/server/vitrine-api";
import { templateDaVitrine } from "@/lib/vitrine";

/**
 * Galeria pública dos três layouts com a marca da loja e peças de exemplo.
 * Caminho público: vitrine.milaai.com.br/mila/modelos/{slugLoja}. "mila" é slug
 * reservado no Eve (RESERVED_SLUGS), então nunca colide com uma loja, e o
 * segmento fixo vence a rota /{loja}/{colecao}. Só lê a API interna; não grava.
 */

async function lojaDaGaleria(slugLoja: string): Promise<LojaVitrine | null> {
  // Sem coleção: a API devolve a mais recente da loja, com a marca completa.
  const resultado = await getShowcase(slugLoja);
  const ativa = vitrineAtiva(resultado);
  if (ativa) return ativa.loja;
  if (resultado?.tipo === "expirada" && resultado.loja.nomeExibicao) {
    // Vitrine vencida ainda traz os dados públicos da marca (sem fontes nem destaque).
    const l = resultado.loja;
    return {
      slug: slugLoja,
      nomeExibicao: l.nomeExibicao ?? "",
      whatsappContato: l.whatsappContato ?? "",
      corPrimaria: l.corPrimaria ?? "",
      corSecundaria: "",
      corDestaque: "",
      tipografiaHeading: "",
      tipografiaBody: "",
      logoUrl: l.logoUrl,
      plano: "",
      template: templateDaVitrine(null),
    };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slugLoja: string }> }): Promise<Metadata> {
  const { slugLoja } = await params;
  const loja = await lojaDaGaleria(slugLoja);
  return {
    title: loja ? `Layouts da vitrine — ${loja.nomeExibicao}` : "Layouts da vitrine | Mila",
    // Página por loja com peças de exemplo: não entra em buscador.
    robots: { index: false, follow: false },
  };
}

export default async function GaleriaPage({ params }: { params: Promise<{ slugLoja: string }> }) {
  const { slugLoja } = await params;
  const loja = await lojaDaGaleria(slugLoja);
  if (!loja) notFound();
  return <GaleriaModelos loja={loja} />;
}
