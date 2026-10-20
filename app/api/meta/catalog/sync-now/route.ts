import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { isValidProductSource, sanitizeMetaCatalogResponse } from "@/lib/meta-catalog";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_MAX_LEN = 8_192;

export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;

  const parsed = await readJsonBounded(req, BODY_MAX_LEN);
  if (!parsed.ok) {
    // POST com efeito colateral não dispara sem corpo válido.
    const detail = parsed.reason === "too_large" ? "body_too_large" : "invalid_body";
    const status = parsed.reason === "too_large" ? 413 : 400;
    return NextResponse.json({ ok: false, detail }, { status });
  }

  const { confirm_duplication, source_override, sync_only_published } = parsed.data;
  const payload: Record<string, unknown> = {};
  if (confirm_duplication !== undefined) {
    // Comparação estrita: Boolean("false") seria true e confirmaria
    // a duplicação sem intenção via POST artesanal.
    payload.confirm_duplication = confirm_duplication === true;
  }
  if (source_override !== undefined) {
    if (!isValidProductSource(source_override)) {
      return NextResponse.json({ ok: false, detail: "invalid_source" }, { status: 400 });
    }
    payload.source_override = String(source_override).trim();
  }
  if (sync_only_published !== undefined) {
    payload.sync_only_published = Boolean(sync_only_published);
  }

  const { status, data } = await proxyOAuth("/api/meta/catalog/sync-now", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 30_000,
  });

  return NextResponse.json(sanitizeMetaCatalogResponse(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
