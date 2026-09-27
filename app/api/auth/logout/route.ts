import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  proxyMilaAuth,
  sessionCookieOptions,
} from "@/lib/server/mila-auth";
import { currentSessionToken } from "@/lib/server/mila-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Logout de verdade: revoga a sessão no serviço de auth E apaga o cookie
 * HttpOnly. Só limpar o localStorage deixava a sessão viva por 14 dias.
 */
export async function POST(req: Request) {
  const token = await currentSessionToken();
  let revoked = false;

  if (token) {
    // O serviço de auth lê o token pelo cookie (mesmo nome) — mandamos no header
    // Cookie da chamada server-to-server, sem expor nada ao browser.
    const { status, data } = await proxyMilaAuth("/api/auth/logout", {
      method: "POST",
      headers: { Cookie: `${SESSION_COOKIE}=${token}` },
    });
    revoked = status === 200 && data.revoked === true;
  }

  const res = NextResponse.json({ ok: true, revoked });
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(req, 0),
    maxAge: 0,
  });
  return res;
}
