import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { MAX_CONCORRENTES, projetarConcorrentes } from "@/lib/dados-loja";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_MAX_LEN = 4_096;
const SEM_CACHE = { "Cache-Control": "private, no-store" };

function resposta(status: number, data: Record<string, unknown>) {
  const out: Record<string, unknown> = { ok: data.ok === true };
  if (typeof data.detail === "string") out.detail = data.detail;
  if (data.concorrentes !== undefined) out.concorrentes = projetarConcorrentes(data.concorrentes);
  if (typeof data.analise_no_plano === "boolean") out.analise_no_plano = data.analise_no_plano;
  return NextResponse.json(out, { status, headers: SEM_CACHE });
}

/** Concorrentes no Instagram que a loja da sessão mapeou. */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/workspace/concorrentes");
  return resposta(status, data);
}

/** Troca a lista inteira (lista vazia apaga); o serviço valida cada @. */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const parsed = await readJsonBounded(req, BODY_MAX_LEN);
  if (!parsed.ok) {
    const tooLarge = parsed.reason === "too_large";
    return NextResponse.json({ ok: false, detail: tooLarge ? "body_too_large" : "invalid_body" }, { status: tooLarge ? 413 : 400 });
  }
  const lista = parsed.data.concorrentes;
  if (!Array.isArray(lista) || lista.length > MAX_CONCORRENTES || lista.some((c) => typeof c !== "string")) {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400, headers: SEM_CACHE });
  }
  const { status, data } = await proxyOAuth("/api/workspace/concorrentes", {
    method: "POST",
    body: JSON.stringify({ concorrentes: lista }),
  });
  return resposta(status, data);
}
