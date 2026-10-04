import { NextRequest, NextResponse } from "next/server";
import { proxyOAuth } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cria o pedido de assinatura vinculado à identidade da lojista autenticada. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { status, data } = await proxyOAuth("/api/billing/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, detail: "invalid_request" },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
