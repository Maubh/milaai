import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { CAMPOS_MARCA, projetarMarca } from "@/lib/marca-vitrine";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_MAX_LEN = 2_048;
const SEM_CACHE = { "Cache-Control": "private, no-store" };

/** Resposta do serviço projetada: nunca repassa campo que a tela não conhece. */
function resposta(status: number, data: Record<string, unknown>) {
  const out: Record<string, unknown> = { ok: data.ok === true };
  if (typeof data.detail === "string") out.detail = data.detail;
  if (typeof data.campo === "string") out.campo = data.campo;
  if (data.marca !== undefined) {
    const p = projetarMarca(data);
    out.marca = p.marca;
    out.fontes = p.fontes;
    out.fonte_no_plano = p.fonteNoPlano;
  }
  return NextResponse.json(out, { status, headers: SEM_CACHE });
}

/** Marca da vitrine da loja da sessão (a loja vem do cookie, no serviço). */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/workspace/marca-vitrine");
  return resposta(status, data);
}

/** Grava só os campos conhecidos que vierem no corpo; o serviço valida. */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const parsed = await readJsonBounded(req, BODY_MAX_LEN);
  if (!parsed.ok) {
    const tooLarge = parsed.reason === "too_large";
    return NextResponse.json({ ok: false, detail: tooLarge ? "body_too_large" : "invalid_body" }, { status: tooLarge ? 413 : 400 });
  }
  const payload: Record<string, string> = {};
  for (const k of CAMPOS_MARCA) if (typeof parsed.data[k] === "string") payload[k] = parsed.data[k] as string;
  const { status, data } = await proxyOAuth("/api/workspace/marca-vitrine", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return resposta(status, data);
}
