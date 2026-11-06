import { NextResponse } from "next/server";
import { readJsonBounded } from "@/lib/bounded-json";
import { CAMPOS_MARCA } from "@/lib/marca";
import { respostaMarca } from "@/lib/server/marca-resposta";
import { proxyOAuth } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY_MAX_LEN = 1_024;

/** Marca da loja da sessão (a loja vem do cookie, no serviço). */
export async function GET() {
  const { status, data } = await proxyOAuth("/api/workspace/marca");
  return respostaMarca(status, data);
}

/** Grava cores e fonte; o serviço valida. */
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
  const { status, data } = await proxyOAuth("/api/workspace/marca", { method: "POST", body: JSON.stringify(payload) });
  return respostaMarca(status, data);
}
