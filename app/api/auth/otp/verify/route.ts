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

  const { status, data, setCookie } = await proxyMilaAuth("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code: digits }),
  });

  const { publicData } = splitSession(data as Record<string, unknown>);
  // sanitizeVerifyResponse descarta session_token/tenant_id: identidade da loja
  // não vai para o browser.
  const res = NextResponse.json(sanitizeVerifyResponse(publicData), { status });

  if (res.status === 200) {
    // ⚠️ O cookie de sessão vem PRONTO do serviço de auth e é repassado verbatim.
    //
    // Antes, o site montava o cookie aqui a partir de um `session_token` que
    // viajava no corpo do JSON — e isso anulava a proteção do HttpOnly: o token
    // passava pelo JS/edge antes de virar cookie, e um XSS o leria. Além disso
    // o valor vazado valia os 14 dias inteiros, porque o cookie nunca rotava.
    //
    // Agora o navegador recebe a sessão sem que este código jamais veja o valor:
    // as flags (`HttpOnly`, `Secure`, `SameSite`) e o `Domain` vêm decididos por
    // quem sabe o domínio (o auth, via `MILA_COOKIE_DOMAIN`).
    //
    // Fail-closed: sem `Set-Cookie` do upstream, não há cookie nenhum — o site
    // não inventa sessão a partir de um token no JSON.
    for (const raw of pickSessionSetCookie(setCookie)) {
      res.headers.append("Set-Cookie", raw);
      const parsed = parseSessionCookie(raw);
      if (parsed) {
        res.cookies.set(parsed.name, parsed.value, parsed.options);
      }
    }
  }
  return res;
}
