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
    const detail = parsed.reason === "too_large" ? "body_too_large" : "invalid_body";
    const status = parsed.reason === "too_large" ? 413 : 400;
    return NextResponse.json({ ok: false, detail }, { status });
  }

  const { product_source, sync_only_published } = parsed.data;
  let safeSource: string | undefined;
  if (product_source !== undefined) {
    if (!isValidProductSource(product_source)) {
      return NextResponse.json({ ok: false, detail: "invalid_source" }, { status: 400 });
    }
    safeSource = String(product_source).trim();
  }

  const payload: Record<string, unknown> = {};
  if (safeSource !== undefined) payload.product_source = safeSource;
  if (sync_only_published !== undefined) payload.sync_only_published = Boolean(sync_only_published);

  const { status, data } = await proxyOAuth("/api/meta/catalog/source", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return NextResponse.json(sanitizeMetaCatalogResponse(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
