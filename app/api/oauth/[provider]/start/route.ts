import { NextResponse } from "next/server";
import { proxyOAuth } from "@/lib/server/mila-oauth";

const ALLOWED = new Set(["olist", "bling", "google", "notion", "jueri"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const slug = provider.toLowerCase();
  if (!ALLOWED.has(slug)) {
    return NextResponse.json({ ok: false, detail: "unknown_provider" }, { status: 404 });
  }
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/start`);
  return NextResponse.json(data, { status });
}
