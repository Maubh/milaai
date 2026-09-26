const DEFAULT_BASE = "https://wa.milaai.com.br";

const ALLOWED_START_KEYS = [
  "ok",
  "detail",
  "phone",
  "ttl_seconds",
  "plan",
  "billing",
  "role",
  "skip_checkout",
  "wa_number",
] as const;

const ALLOWED_VERIFY_KEYS = [
  "ok",
  "detail",
  "phone",
  "plan",
  "billing",
  "role",
  "skip_checkout",
  "wa_number",
  "wa_link",
  "wa_prefill",
] as const;

export function milaAuthBase(): string {
  // Server-only. Do NOT fall back to NEXT_PUBLIC_*.
  return (process.env.MILA_AUTH_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

export function milaAuthSecret(): string {
  return process.env.MILA_AUTH_SECRET || "";
}

/** Normalize to digits-only E.164-ish BR (+55…) when possible. */
export function normalizePhoneE164(raw: string): string | null {
  const digits = String(raw || "").replace(/\D+/g, "");
  if (!digits) return null;
  let phone = digits;
  if (!phone.startsWith("55") && (phone.length === 10 || phone.length === 11)) {
    phone = `55${phone}`;
  }
  if (phone.length < 12 || phone.length > 15) return null;
  return phone;
}

export function isSafeWaLink(link: unknown): link is string {
  if (typeof link !== "string" || !link) return false;
  try {
    const u = new URL(link);
    if (u.protocol !== "https:") return false;
    if (u.hostname !== "wa.me" && u.hostname !== "api.whatsapp.com") return false;
    return true;
  } catch {
    return false;
  }
}

function pick<T extends readonly string[]>(
  data: Record<string, unknown>,
  keys: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (k in data) out[k] = data[k];
  }
  return out;
}

export function sanitizeStartResponse(data: Record<string, unknown>): Record<string, unknown> {
  return pick(data, ALLOWED_START_KEYS);
}

export function sanitizeVerifyResponse(data: Record<string, unknown>): Record<string, unknown> {
  const out = pick(data, ALLOWED_VERIFY_KEYS);
  if ("wa_link" in out && !isSafeWaLink(out.wa_link)) {
    delete out.wa_link;
  }
  return out;
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
    const res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = { ok: false, detail: "invalid_upstream_json" };
    }
    const status = res.status === 0 ? 504 : res.status;
    return { status, data };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return { status: 504, data: { ok: false, detail: "upstream_timeout" } };
    }
    return { status: 502, data: { ok: false, detail: "upstream_unreachable" } };
  }
}
