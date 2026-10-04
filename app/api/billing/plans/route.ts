import { NextResponse } from "next/server";
import { proxyMilaAuth } from "@/lib/server/mila-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Retorna o catálogo oficial de planos configurado no VPS. */
export async function GET() {
  const { status, data } = await proxyMilaAuth("/api/billing/plans");
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
