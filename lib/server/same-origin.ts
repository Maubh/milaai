import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/request-origin";

/**
 * Guarda de same-origin para os POSTs autenticados só por cookie
 * (key, revoke, logout). Junto com `SameSite=Lax`, fecha o caso de um
 * subdomínio same-site (`wa.`) tentando POST com o cookie da loja.
 *
 * Devolve a resposta 403 quando a origem não confere, ou `null` para seguir.
 */
export function requireSameOrigin(req: Request): NextResponse | null {
  if (isSameOriginRequest(req.headers.get("origin"), req.headers.get("host"))) {
    return null;
  }
  return NextResponse.json(
    { ok: false, detail: "origem_invalida" },
    { status: 403, headers: { "Cache-Control": "private, no-store" } },
  );
}
