import { NextResponse } from "next/server";
import { proxyMilaAuth } from "@/lib/server/mila-auth";

export async function POST(req: Request) {
  let phone = "";
  let code = "";
  try {
    const body = await req.json();
    phone = typeof body?.phone === "string" ? body.phone : "";
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  if (!phone.trim() || !code.trim()) {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }

  const { status, data } = await proxyMilaAuth("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
  return NextResponse.json(data, { status });
}
