"use client";

export interface OnboardingState {
  telefone: string;
  verificado: boolean;
  waLink?: string;
  plan?: string;
}

const KEY = "socia-onboarding";

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

export function getTelefone(): string {
  const t = read().telefone;
  return typeof t === "string" ? t : "";
}

export function saveTelefone(telefone: string) {
  write({ telefone, verificado: false, waLink: undefined, plan: undefined });
}

export function markVerified(extra?: { waLink?: string; plan?: string }) {
  write({
    verificado: true,
    waLink: extra?.waLink,
    plan: extra?.plan,
  });
}

export function getWaLink(): string {
  const link = read().waLink;
  if (typeof link === "string" && link) return link;
  const wa =
    process.env.NEXT_PUBLIC_MILA_WA_E164?.replace(/\D+/g, "") || "5531936187463";
  return `https://wa.me/${wa}?text=${encodeURIComponent("Oi, mila.")}`;
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
