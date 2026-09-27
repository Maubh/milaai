import { cookies } from "next/headers";
import { SESSION_COOKIE, proxyMilaAuth } from "@/lib/server/mila-auth";

/** Lê o cookie HttpOnly da sessão (server-only). */
export async function currentSessionToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export const GUIDED_PROVIDERS = ["jueri", "notion"] as const;

/** Repassa a chamada de integração para o VPS com a identidade da loja. */
export async function proxyOAuth(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const token = await currentSessionToken();
  if (!token) {
    return { status: 401, data: { ok: false, detail: "no_session" } };
  }
  return proxyMilaAuth(path, { ...init, sessionToken: token });
}
