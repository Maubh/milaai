import { NextResponse } from "next/server";
import {
  normalizePhoneE164,
  parseSessionCookie,
  pickSessionSetCookie,
  proxyMilaAuth,
  sanitizeVerifyResponse,
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

  // Em desenvolvimento local: código 123456 ou telefone de teste emite sessão de sandbox isolada
  if (process.env.NODE_ENV === "development" && (digits === "123456" || phone.includes("999990000"))) {
    const res = NextResponse.json({
      ok: true,
      phone,
      plan: "pro",
      billing: "pilot",
      role: "founder",
    });
    res.cookies.set("mila_session", "sandbox_dev_session", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  const { status, data, setCookie } = await proxyMilaAuth("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code: digits }),
  });

  const { publicData } = splitSession(data as Record<string, unknown>);
  // sanitizeVerifyResponse descarta session_token/tenant_id: identidade da loja
  // não vai para o browser.
  const res = NextResponse.json(sanitizeVerifyResponse(publicData), { status });

  if (res.status === 200) {
    // ⚠️ O cookie de sessão vem PRONTO do serviço de auth e é repassado.
    //
    // Imposições de segurança (revisão Grok 4.7):
    // 1. Usar apenas `res.cookies.set(...)` (evita duplicar headers e garante
    //    que o adapter Serverless da Vercel emita o Set-Cookie).
    // 2. Forçar HttpOnly, Secure, SameSite=Lax e Path=/ em código.
    // 3. Rejeitar domain injection (Domain derivado estritamente do host da req).
    // 4. Max-Age com teto de 14 dias.
    const hostHeader = req.headers.get("host");
    for (const raw of pickSessionSetCookie(setCookie)) {
      const parsed = parseSessionCookie(raw, hostHeader);
      if (parsed) {
        res.cookies.set(parsed.name, parsed.value, parsed.options);
      }
    }
  }
  return res;
}
