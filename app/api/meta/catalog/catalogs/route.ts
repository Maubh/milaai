import { NextResponse } from "next/server";
import { sanitizeMetaCatalogList } from "@/lib/meta-catalog";
import { proxyOAuth } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Catálogos da conta Meta da lojista, para ela escolher qual a Mila usa. */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/meta/catalog/catalogs", { method: "GET" });
  return NextResponse.json(sanitizeMetaCatalogList(data), {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
