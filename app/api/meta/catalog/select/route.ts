import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { isValidMetaId, sanitizeMetaCatalogSelect } from "@/lib/meta-catalog";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_MAX_LEN = 1_024;

/** Grava o catálogo escolhido pela lojista. O VPS só aceita catálogo da própria conta dela. */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;

  const parsed = await readJsonBounded(req, BODY_MAX_LEN);
  if (!parsed.ok) {
    const detail = parsed.reason === "too_large" ? "body_too_large" : "invalid_body";
    const status = parsed.reason === "too_large" ? 413 : 400;
    return NextResponse.json({ ok: false, detail }, { status });
  }
  const { catalog_id } = parsed.data;
  if (!isValidMetaId(catalog_id)) {
    return NextResponse.json({ ok: false, detail: "invalid_catalog" }, { status: 400 });
  }

  const { status, data } = await proxyOAuth("/api/meta/catalog/select", {
    method: "POST",
    body: JSON.stringify({ catalog_id: catalog_id.trim() }),
  });

  return NextResponse.json(sanitizeMetaCatalogSelect(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
