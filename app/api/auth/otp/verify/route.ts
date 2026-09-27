import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  cookieMaxAge,
  normalizePhoneE164,
  proxyMilaAuth,
  sanitizeVerifyResponse,
  sessionCookieOptions,
  splitSession,
} from "@/lib/server/mila-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let phoneRaw = "";
  let code = "";
  try {
    const body = await req.json();
    phoneRaw = typeof body?.phone === "string" ? body.phone : "";
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  const phone = normalizePhoneE164(phoneRaw);
  const digits = code.replace(/\D+/g, "");
  if (!phone || digits.length !== 6) {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }

  const { status, data } = await proxyMilaAuth("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code: digits }),
  });

  const { publicData, sessionToken, cookie } = splitSession(data as Record<string, unknown>);
  // sanitizeVerifyResponse descarta session_token/tenant_id: identidade da loja
  // não vai para o browser, só para o cookie HttpOnly abaixo.
  const res = NextResponse.json(sanitizeVerifyResponse(publicData), { status });

  if (res.status === 200 && sessionToken) {
    // Cookie HttpOnly com domínio compartilhado: o callback do OAuth acontece em
    // wa.milaai.com.br e precisa receber esta sessão.
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions(req, cookieMaxAge(cookie)));
  }
  return res;
}
