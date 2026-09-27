import { NextResponse } from "next/server";
import { proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProviderStatus {
  id?: string;
  connected?: boolean;
}

/** Quem está logada (para o workspace/integrações). Nunca expõe token. */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/oauth/providers");
  if (status !== 200) {
    const safe = sanitizeOAuthResponse(data);
    return NextResponse.json(
      { ok: false, logged: false, detail: safe.detail ?? "no_session" },
      { status, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  const providers: ProviderStatus[] = Array.isArray(data.providers)
    ? (data.providers as ProviderStatus[])
    : [];
  return NextResponse.json(
    {
      ok: true,
      logged: true,
      tenant: data.tenant ?? null,
      connected: providers.filter((p) => p.connected).map((p) => p.id),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
