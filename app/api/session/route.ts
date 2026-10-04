import { NextResponse } from "next/server";
import { proxyOAuth, sanitizeOAuthResponse, sanitizeProviderList } from "@/lib/server/mila-oauth";

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
  const providers: ProviderStatus[] = sanitizeProviderList(data.providers);
  return NextResponse.json(
    {
      ok: true,
      logged: true,
      tenant: typeof data.tenant === "string" ? data.tenant : null,
      phone: typeof data.phone === "string" ? data.phone : null,
      plan: typeof data.plan === "string" ? data.plan : "pro",
      billing: typeof data.billing === "string" ? data.billing : "pilot",
      role: typeof data.role === "string" ? data.role : "user",
      trial_ends_at: typeof data.trial_ends_at === "string" ? data.trial_ends_at : null,
      connected: providers.filter((p) => p.connected).map((p) => p.id),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
