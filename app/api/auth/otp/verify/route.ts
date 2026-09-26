import { NextResponse } from "next/server";
import {
  normalizePhoneE164,
  proxyMilaAuth,
  sanitizeVerifyResponse,
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
  return NextResponse.json(sanitizeVerifyResponse(data), { status });
}
