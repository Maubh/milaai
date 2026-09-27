import { NextResponse } from "next/server";
import { proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { status, data } = await proxyOAuth("/api/oauth/providers");
  const safe = sanitizeOAuthResponse(data, ["tenant", "providers"]);
  return NextResponse.json(safe, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
