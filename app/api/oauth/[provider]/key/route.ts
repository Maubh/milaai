import { NextResponse } from "next/server";
import { GUIDED_PROVIDERS, proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const slug = provider.toLowerCase();
  if (!(GUIDED_PROVIDERS as readonly string[]).includes(slug)) {
    return NextResponse.json({ ok: false, detail: "not_a_guided_provider" }, { status: 404 });
  }
  let key = "";
  try {
    const body = await req.json();
    key = typeof body?.key === "string" ? body.key : "";
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  if (key.trim().length < 8) {
    return NextResponse.json({ ok: false, detail: "chave_curta" }, { status: 400 });
  }
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/key`, {
    method: "POST",
    body: JSON.stringify({ key: key.trim() }),
  });
  // A chave nunca volta para o browser; só o resultado da gravação.
  return NextResponse.json(sanitizeOAuthResponse(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
