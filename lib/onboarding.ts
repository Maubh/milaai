"use client";

export interface OnboardingState {
  telefone: string;
  verificado: boolean;
  waLink?: string;
  plan?: string;
}

const KEY = "socia-onboarding";
const DEFAULT_WA = "5531936187463";

function read(): Partial<OnboardingState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Partial<OnboardingState>;
  } catch {
    return {};
  }
}

function write(next: Partial<OnboardingState>) {
  window.localStorage.setItem(KEY, JSON.stringify({ ...read(), ...next }));
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

export function defaultWaLink(): string {
  const wa = process.env.NEXT_PUBLIC_MILA_WA_E164?.replace(/\D+/g, "") || DEFAULT_WA;
  return `https://wa.me/${wa}?text=${encodeURIComponent("Oi, mila.")}`;
}

export function getTelefone(): string {
  const t = read().telefone;
  return typeof t === "string" ? t : "";
}

export function saveTelefone(telefone: string) {
  write({ telefone, verificado: false, waLink: undefined, plan: undefined });
}

export function markVerified(extra?: { waLink?: string; plan?: string }) {
  const waLink = isSafeWaLink(extra?.waLink) ? extra?.waLink : defaultWaLink();
  write({
    verificado: true,
    waLink,
    plan: extra?.plan,
  });
}

/** Only returns a link when the user is verified. No unverified fallback. */
export function getVerifiedWaLink(): string | null {
  if (!isVerified()) return null;
  const link = read().waLink;
  if (isSafeWaLink(link)) return link;
  return defaultWaLink();
}

export function isVerified(): boolean {
  return read().verificado === true;
}

export function clearOnboarding() {
  window.localStorage.removeItem(KEY);
}

export function formatTelefoneBR(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidTelefoneBR(value: string): boolean {
  const d = value.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}
