import { NextResponse } from "next/server";
import { proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickTenant(data: Record<string, unknown>): string | null {
  // `tenant` é identidade da loja: só string não-vazia passa, nunca objeto cru.
  return typeof data.tenant === "string" && data.tenant ? data.tenant : null;
}

export async function GET() {
  const { status, data } = await proxyOAuth("/api/oauth/providers");
  const safe = sanitizeOAuthResponse(data, ["providers"]);
  // Mesmo filtro do /api/session: tenant só como string, providers projetados.
  return NextResponse.json(
    { ...safe, tenant: pickTenant(data) },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
