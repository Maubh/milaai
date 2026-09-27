import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  normalizePhoneE164,
  proxyMilaAuth,
  sanitizeVerifyResponse,
  splitSession,
} from "@/lib/server/mila-auth";

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

  const { publicData, sessionToken } = splitSession(data as Record<string, unknown>);
  const res = NextResponse.json(sanitizeVerifyResponse(publicData), { status });

  if (res.status === 200 && sessionToken) {
    // Cookie HttpOnly: o browser nunca lê a identidade da loja.
    res.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  return res;
}
