const DEFAULT_BASE = "https://wa.milaai.com.br";

export function milaAuthBase(): string {
  return (process.env.MILA_AUTH_BASE || process.env.NEXT_PUBLIC_MILA_AUTH_BASE || DEFAULT_BASE).replace(
    /\/$/,
    "",
  );
}

export function milaAuthSecret(): string {
  return process.env.MILA_AUTH_SECRET || "";
}

export async function proxyMilaAuth(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const secret = milaAuthSecret();
  if (!secret) {
    return { status: 500, data: { ok: false, detail: "missing_auth_secret" } };
  }
  const url = `${milaAuthBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("X-Mila-Auth-Secret", secret);
  headers.set("User-Agent", "milaai-next-proxy/0.1");

  try {
    const res = await fetch(url, { ...init, headers, cache: "no-store" });
    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = { ok: false, detail: "invalid_upstream_json" };
    }
    return { status: res.status, data };
  } catch {
    return { status: 502, data: { ok: false, detail: "upstream_unreachable" } };
  }
}
