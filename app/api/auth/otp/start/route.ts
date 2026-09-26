import { NextResponse } from "next/server";
import { proxyMilaAuth } from "@/lib/server/mila-auth";

export async function POST(req: Request) {
  let phone = "";
  try {
    const body = await req.json();
    phone = typeof body?.phone === "string" ? body.phone : "";
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  if (!phone.trim()) {
    return NextResponse.json({ ok: false, detail: "invalid_phone" }, { status: 400 });
  }

  const { status, data } = await proxyMilaAuth("/api/auth/otp/start", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  return NextResponse.json(data, { status });
}
