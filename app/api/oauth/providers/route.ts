import { NextResponse } from "next/server";
import { proxyOAuth } from "@/lib/server/mila-oauth";

export async function GET() {
  const { status, data } = await proxyOAuth("/api/oauth/providers");
  return NextResponse.json(data, { status });
}
