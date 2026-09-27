import { NextResponse } from "next/server";
import { GUIDED_PROVIDERS, proxyOAuth } from "@/lib/server/mila-oauth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const slug = provider.toLowerCase();
  if (!GUIDED_PROVIDERS.includes(slug as (typeof GUIDED_PROVIDERS)[number])) {
    return NextResponse.json({ ok: false, detail: "not_a_guided_provider" }, { status: 404 });
  }
  let key = "";
  try {
    const body = await req.json();
    key = typeof body?.key === "string" ? body.key : "";
  } catch {
    return NextResponse.json({ ok: false, detail: "invalid_body" }, { status: 400 });
  }
  if (key.trim().length < 8) {
    return NextResponse.json({ ok: false, detail: "chave_curta" }, { status: 400 });
  }
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/key`, {
    method: "POST",
    body: JSON.stringify({ key: key.trim() }),
  });
  return NextResponse.json(data, { status });
}
