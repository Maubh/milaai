import { NextResponse } from "next/server";
import { isSafeAuthorizeUrl } from "@/lib/integration-errors";
import { isGuidedProvider, isKnownProvider, proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  // GET cria `state` no serviço de auth: exige same-origin para não virar
  // CSRF de início de fluxo a partir de outro site.
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const { provider } = await params;
  const slug = provider.toLowerCase();
  if (!isKnownProvider(slug)) {
    return NextResponse.json({ ok: false, detail: "unknown_provider" }, { status: 404 });
  }
  if (isGuidedProvider(slug)) {
    // Jueri/Notion não têm OAuth: a lojista cola a chave em /key.
    return NextResponse.json({ ok: false, detail: "guided_key_provider" }, { status: 400 });
  }
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/start`);
  const safe = sanitizeOAuthResponse(data);
  if (typeof safe.authorize_url === "string" && !isSafeAuthorizeUrl(safe.authorize_url)) {
    // host inesperado: não mandamos o browser para fora às cegas
    return NextResponse.json(
      { ok: false, detail: "provider_not_configured" },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  return NextResponse.json(safe, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
