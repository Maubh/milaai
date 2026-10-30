import type { Metadata } from "next";
import { META_A } from "@/lib/landing-proposals";
import LandingA from "@/components/landing-proposals/LandingA";

export const metadata: Metadata = META_A;

export default function PropostaA() {
  return <LandingA />;
}
