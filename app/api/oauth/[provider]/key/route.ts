import { NextResponse } from "next/server";
import { GUIDED_PROVIDERS, proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Teto da chave colada: acima disso é payload abusivo, não credencial. */
const KEY_MAX_LEN = 8_192;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
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
  const trimmed = key.trim();
  if (trimmed.length < 8) {
    return NextResponse.json({ ok: false, detail: "chave_curta" }, { status: 400 });
  }
  if (trimmed.length > KEY_MAX_LEN) {
    // Sem teto, um body gigante atravessa o proxy inteiro até o VPS.
    return NextResponse.json({ ok: false, detail: "chave_longa" }, { status: 413 });
  }
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/key`, {
    method: "POST",
    body: JSON.stringify({ key: trimmed }),
  });
  // A chave nunca volta para o browser; só o resultado da gravação.
  return NextResponse.json(sanitizeOAuthResponse(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
