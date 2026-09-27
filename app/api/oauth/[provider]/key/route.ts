import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
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
  const parsed = await readJsonBounded(req, KEY_MAX_LEN);
  if (!parsed.ok) {
    // Body acima do teto é recusado antes de parsear (o `req.json()` carregaria
    // o payload inteiro na memória à toa); JSON quebrado é 400.
    const detail = parsed.reason === "too_large" ? "chave_longa" : "invalid_body";
    const status = parsed.reason === "too_large" ? 413 : 400;
    return NextResponse.json({ ok: false, detail }, { status });
  }
  const key = typeof parsed.data.key === "string" ? parsed.data.key : "";
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
