import type { Metadata } from "next";
import { META_INDICE } from "@/lib/landing-proposals";
import "@/components/landing-proposals/proposals.css";
import "@/components/landing-proposals/landing-a.css";
import "@/components/landing-proposals/landing-b.css";

export const metadata: Metadata = META_INDICE;

/** Prévias fora do grupo (site): cada página traz o próprio topo e rodapé; o `main` vem do layout raiz. */
export default function PropostasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
