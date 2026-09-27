import { NextResponse } from "next/server";
import { sameOriginDenial } from "@/lib/request-origin";

/**
 * Guarda de same-origin para as rotas autenticadas só por cookie
 * (key, revoke, logout, start).
 *
 * Junto com `SameSite=Lax`, fecha o caso de um subdomínio same-site (`wa.`, o
 * VPS) chamando a rota com o cookie da loja: o browser manda `Origin`, que não
 * confere com o host do site, e a chamada morre em 403.
 *
 * A decisão fica em `@/lib/request-origin` (testável, sem Next); aqui só vira
 * resposta HTTP.
 */
export function requireSameOrigin(req: Request): NextResponse | null {
  const denial = sameOriginDenial(req);
  if (!denial) return null;
  return NextResponse.json(denial.body, {
    status: denial.status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
