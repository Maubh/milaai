"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import IPhoneMockup from "@/components/IPhoneMockup";
import IntegrationsMarquee from "@/components/IntegrationsMarquee";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";

export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ".minimal-anim",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.08 },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="minimal">
      {/* Hero com a cópia e o mockup de alta fidelidade */}
      <section className="wrap minimal-grid" aria-label="Apresentação da mila.">
        <div className="minimal-copy">
          <h1 className="minimal-anim minimal-title">
            A inteligência por trás da sua loja de semijoias.
          </h1>
          <div className="minimal-anim minimal-body">
            <p className="minimal-text">
              Tenha a mila. no seu WhatsApp. Precificação com margem real, descrições prontas para
              e-commerce, gestão de fornecedores e balanço financeiro mensal sem esforço.
            </p>
            <p className="minimal-cta-row">
              <Link href="/login" className="minimal-cta">
                Começar com a mila. <span aria-hidden="true">→</span>
              </Link>
            </p>
            <p className="minimal-micro">
              Disponível direto no WhatsApp · Configuração guiada em 2 minutos.
            </p>
          </div>
        </div>
        <div className="minimal-anim minimal-phone">
          <IPhoneMockup />
        </div>
      </section>

      {/* Marquee infinito de integrações e conectores */}
      <IntegrationsMarquee />

      {/* Tabela de Preços Minimalista */}
      <PricingSection />

      {/* Seção minimalista de Perguntas Frequentes (FAQ) */}
      <FaqSection />
    </div>
  );
}
