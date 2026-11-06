import { NextResponse } from "next/server";
import { projetarMarca } from "@/lib/marca";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { getShowcase, vitrineAtiva } from "@/lib/server/vitrine-api";
import { templateDaVitrine } from "@/lib/vitrine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

/**
 * Prévia da vitrine da loja da sessão: a marca (pela mesma leitura da seção
 * Marca) e a coleção ativa mais recente, lida na API interna pelo slug que a
 * própria marca informa (`link_vitrine`). Nunca recebe slug do navegador: a
 * loja vem só do cookie. Sem coleção, `vitrine` é null e a tela usa exemplo.
 */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/workspace/marca");
  if (status !== 200 || data.ok !== true) {
    return NextResponse.json({ ok: false, detail: typeof data.detail === "string" ? data.detail : "marca_indisponivel" }, { status: status === 200 ? 502 : status, headers: SEM_CACHE });
  }
  const { marca } = projetarMarca(data);
  const slug = marca.link_vitrine ? marca.link_vitrine.split("/").pop() ?? null : null;
  const ativa = slug ? vitrineAtiva(await getShowcase(slug)) : null;

  return NextResponse.json(
    {
      ok: true,
      template: marca.template,
      slug,
      // Com vitrine publicada, a marca completa vem de lá (fontes resolvidas pelo plano).
      loja: ativa
        ? { ...ativa.loja, template: templateDaVitrine(marca.template) }
        : {
            slug: slug ?? "",
            nomeExibicao: marca.nome_loja ?? "Sua loja",
            whatsappContato: marca.whatsapp ?? "",
            corPrimaria: marca.cor_primaria ?? "",
            corSecundaria: "",
            corDestaque: marca.cor_destaque ?? "",
            tipografiaHeading: marca.fonte_titulo ?? "",
            tipografiaSubtitulo: marca.fonte_subtitulo ?? "",
            tipografiaBody: marca.fonte_corpo ?? "",
            fontesEnviadas: marca.fontes_enviadas.map((f) => ({ familia: f.familia, url: f.url, formato: f.formato })),
            logoUrl: marca.logo_url,
            plano: "",
            template: marca.template,
          },
      vitrine: ativa ? ativa.vitrine : null,
    },
    { headers: SEM_CACHE },
  );
}
