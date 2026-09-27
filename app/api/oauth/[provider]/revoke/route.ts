import { NextResponse } from "next/server";
import { isKnownProvider, proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const slug = provider.toLowerCase();
  // Allowlist também no revoke: o slug vai interpolado no path do VPS.
  if (!isKnownProvider(slug)) {
    return NextResponse.json({ ok: false, detail: "unknown_provider" }, { status: 404 });
  }
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/revoke`, { method: "POST" });
  return NextResponse.json(sanitizeOAuthResponse(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
