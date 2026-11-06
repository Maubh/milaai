import { NextResponse } from "next/server";
import { projetarMarca } from "@/lib/marca";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

/** Resposta do serviço projetada: nunca repassa campo que a tela não conhece. */
export function respostaMarca(status: number, data: Record<string, unknown>) {
  const out: Record<string, unknown> = { ok: data.ok === true };
  if (typeof data.detail === "string") out.detail = data.detail;
  if (typeof data.campo === "string") out.campo = data.campo;
  if (data.marca !== undefined) {
    const p = projetarMarca(data);
    out.marca = p.marca;
    out.fonte_no_plano = p.fonteNoPlano;
    out.armazenamento = p.armazenamento;
  }
  return NextResponse.json(out, { status, headers: SEM_CACHE });
}
