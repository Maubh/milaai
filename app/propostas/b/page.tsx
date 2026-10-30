import type { Metadata } from "next";
import { META_B } from "@/lib/landing-proposals";
import LandingB from "@/components/landing-proposals/LandingB";

export const metadata: Metadata = META_B;

export default function PropostaB() {
  return <LandingB />;
}
