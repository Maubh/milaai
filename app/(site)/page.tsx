"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import IPhoneMockup from "@/components/IPhoneMockup";

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
      <section className="wrap minimal-grid" aria-label="Apresentação da socIA">
        <div className="minimal-copy">
          <h1 className="minimal-anim minimal-title">A sua sócia de negócios no seu bolso.</h1>
          <div className="minimal-anim minimal-body">
          <p className="minimal-text">
            A socIA ajuda você a entender os custos de cada peça, chegar a um preço com margem e
            de olho no mercado. Tudo em uma conversa, no ritmo da sua loja.
          </p>
          <p className="minimal-text">
            Envie foto, nota fiscal ou pergunta e receba orientação na mesma conversa: custo, preço
            sugerido e os dois textos prontos, legenda para o Instagram e descrição para o site.
          </p>
          <p className="minimal-cta-row">
            <Link href="/login" className="minimal-cta">
              Começar com a socIA <span aria-hidden="true">→</span>
            </Link>
          </p>
          <p className="minimal-micro">Prévia interativa · nenhuma mensagem é enviada.</p>
          </div>
        </div>
        <div className="minimal-anim minimal-phone">
          <IPhoneMockup />
        </div>
      </section>
    </div>
  );
}
