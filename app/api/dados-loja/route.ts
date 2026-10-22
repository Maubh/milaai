import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { CAMPOS_NUMERO, CAMPOS_TEXTO, projetarDadosLoja } from "@/lib/dados-loja";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_MAX_LEN = 8_192;
const SEM_CACHE = { "Cache-Control": "private, no-store" };

/** Resposta do serviço projetada: nunca repassa campo que a tela não conhece. */
function resposta(status: number, data: Record<string, unknown>) {
  const out: Record<string, unknown> = { ok: data.ok === true };
  if (typeof data.detail === "string") out.detail = data.detail;
  if (typeof data.campo === "string") out.campo = data.campo;
  if (data.dados !== undefined) out.dados = projetarDadosLoja(data.dados);
  return NextResponse.json(out, { status, headers: SEM_CACHE });
}

/** Dados da loja da sessão (a loja vem do cookie, no serviço). */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/workspace/dados-loja");
  return resposta(status, data);
}

/** Grava só os campos conhecidos que vierem no corpo; o serviço valida os limites. */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const parsed = await readJsonBounded(req, BODY_MAX_LEN);
  if (!parsed.ok) {
    const tooLarge = parsed.reason === "too_large";
    return NextResponse.json({ ok: false, detail: tooLarge ? "body_too_large" : "invalid_body" }, { status: tooLarge ? 413 : 400 });
  }
  const payload: Record<string, unknown> = {};
  for (const k of CAMPOS_TEXTO) if (typeof parsed.data[k] === "string") payload[k] = parsed.data[k];
  for (const k of CAMPOS_NUMERO) if (typeof parsed.data[k] === "number") payload[k] = parsed.data[k];
  const { status, data } = await proxyOAuth("/api/workspace/dados-loja", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return resposta(status, data);
}
