// Process liveness only: no auth, tenant data, provider calls or Eve dependency.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
