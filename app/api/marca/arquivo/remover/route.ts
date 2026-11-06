import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { respostaMarca } from "@/lib/server/marca-resposta";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tira o logo, um arquivo de identidade visual ou uma fonte da loja da sessão. */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const parsed = await readJsonBounded(req, 256);
  if (!parsed.ok) return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  const { tipo, id } = parsed.data;
  if (tipo !== "logo" && !((tipo === "identidade" || tipo === "fonte") && typeof id === "number")) {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  const { status, data } = await proxyOAuth("/api/workspace/marca/arquivo/remover", {
    method: "POST",
    body: JSON.stringify(tipo === "logo" ? { tipo } : { tipo, id }),
  });
  return respostaMarca(status, data);
}
