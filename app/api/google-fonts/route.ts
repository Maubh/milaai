import { NextResponse } from "next/server";
import { FONTES_RESERVA, projetarFontesGoogle } from "@/lib/marca";

export const runtime = "nodejs";
// A lista do Google Fonts muda pouco: uma busca por dia basta.
export const revalidate = 86_400;

/** Famílias do Google Fonts para o seletor de fonte da marca (latinas, por popularidade). */
export async function GET() {
  try {
    const res = await fetch("https://fonts.google.com/metadata/fonts", { next: { revalidate: 86_400 } });
    if (res.ok) {
      const texto = await res.text();
      const fontes = projetarFontesGoogle(JSON.parse(texto.replace(/^\)\]\}'\s*/, "")));
      if (fontes.length) return NextResponse.json({ ok: true, fontes, origem: "google" });
    }
  } catch {
    // cai na lista reserva
  }
  return NextResponse.json({ ok: true, fontes: FONTES_RESERVA, origem: "reserva" });
}
