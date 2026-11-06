import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { respostaMarca } from "@/lib/server/marca-resposta";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 3 MB em base64 + nome: abaixo do limite de corpo da Vercel (~4,5 MB).
const BODY_MAX_LEN = 4_300_000;

/** Envia o logo, um arquivo de identidade visual ou uma fonte (base64); o serviço confere o tipo pelos bytes. */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const parsed = await readJsonBounded(req, BODY_MAX_LEN);
  if (!parsed.ok) {
    const tooLarge = parsed.reason === "too_large";
    return NextResponse.json({ ok: false, detail: tooLarge ? "body_too_large" : "invalid_body" }, { status: tooLarge ? 413 : 400 });
  }
  const { tipo, conteudo, nome, familia } = parsed.data;
  if ((tipo !== "logo" && tipo !== "identidade" && tipo !== "fonte") || typeof conteudo !== "string") {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  const { status, data } = await proxyOAuth("/api/workspace/marca/arquivo", {
    method: "POST",
    body: JSON.stringify({
      tipo,
      conteudo,
      ...(typeof nome === "string" ? { nome: nome.slice(0, 120) } : {}),
      ...(tipo === "fonte" && typeof familia === "string" ? { familia: familia.slice(0, 60) } : {}),
    }),
    timeoutMs: 30_000,
  });
  return respostaMarca(status, data);
}
