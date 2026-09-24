"use client";

export interface DemoSession {
  nome: string;
  entrouEm: string;
}

const KEY = "socia-demo-session";

export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (!parsed || typeof parsed.nome !== "string" || !parsed.nome.trim()) return null;
    return {
      nome: parsed.nome.trim().slice(0, 60),
      entrouEm: typeof parsed.entrouEm === "string" ? parsed.entrouEm : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveSession(nome: string): DemoSession {
  const session: DemoSession = {
    nome: nome.trim().slice(0, 60) || "Lojista",
    entrouEm: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
}
