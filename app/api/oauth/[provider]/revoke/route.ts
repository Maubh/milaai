import { NextResponse } from "next/server";
import { proxyOAuth } from "@/lib/server/mila-oauth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const slug = provider.toLowerCase();
  const { status, data } = await proxyOAuth(`/api/oauth/${slug}/revoke`, { method: "POST" });
  return NextResponse.json(data, { status });
}
