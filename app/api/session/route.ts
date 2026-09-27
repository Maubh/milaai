import { NextResponse } from "next/server";
import { proxyOAuth } from "@/lib/server/mila-oauth";

/** Quem está logada (para o workspace/integrações). */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/oauth/providers");
  if (status !== 200) {
    return NextResponse.json({ ok: false, logged: false }, { status });
  }
  const providers = Array.isArray(data.providers) ? data.providers : [];
  return NextResponse.json({
    ok: true,
    logged: true,
    tenant: data.tenant ?? null,
    connected: providers
      .filter((p) => (p as { connected?: boolean }).connected)
      .map((p) => (p as { id: string }).id),
  });
}
