import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  proxyMilaAuth,
  sessionCookieOptions,
} from "@/lib/server/mila-auth";
import { currentSessionToken } from "@/lib/server/mila-oauth";
import { requireSameOrigin } from "@/lib/server/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Logout de verdade: revoga a sessão no serviço de auth E apaga o cookie
 * HttpOnly. Só limpar o localStorage deixava a sessão viva por 14 dias.
 */
export async function POST(req: Request) {
  const blocked = requireSameOrigin(req);
  if (blocked) return blocked;
  const token = await currentSessionToken();
  let revoked = false;
  let revokeOk = true;

  if (token) {
    // O serviço de auth lê o token pelo cookie (mesmo nome) — mandamos no header
    // Cookie da chamada server-to-server, sem expor nada ao browser. O header
    // X-Mila-Session vai junto para os dois lados ficarem alinhados.
    const { status, data } = await proxyMilaAuth("/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: `${SESSION_COOKIE}=${token}`,
        "X-Mila-Session": token,
      },
    });
    revoked = status === 200 && data.revoked === true;
    revokeOk = status === 200;
  }

  // O cookie sai de qualquer forma: deixar a sessão viva no browser é pior.
  // Mas não afirmamos que revogou no servidor se a chamada falhou.
  const res = NextResponse.json({ ok: true, revoked, server_revoked: revoked && revokeOk });
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(req, 0),
    maxAge: 0,
  });
  return res;
}
