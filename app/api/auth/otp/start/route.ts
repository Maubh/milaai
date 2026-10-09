import { NextResponse } from "next/server";
import {
  normalizePhoneE164,
  proxyMilaAuth,
  sanitizeStartResponse,
} from "@/lib/server/mila-auth";

export async function POST(req: Request) {
  let phoneRaw = "";
  try {
    const body = await req.json();
    phoneRaw = typeof body?.phone === "string" ? body.phone : "";
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  const phone = normalizePhoneE164(phoneRaw);
  if (!phone) {
    return NextResponse.json({ ok: false, detail: "invalid_phone" }, { status: 400 });
  }

  // Em desenvolvimento local: bypass para testes sem tocar no WhatsApp real
  if (process.env.NODE_ENV === "development" && (phone.includes("999990000") || phone.includes("123456789"))) {
    return NextResponse.json({ ok: true, dev_sandbox: true, test_code: "123456" });
  }

  const { status, data } = await proxyMilaAuth("/api/auth/otp/start", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  return NextResponse.json(sanitizeStartResponse(data), { status });
}
