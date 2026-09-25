"use client";

import Link from "next/link";

interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

const PLANS: PlanItem[] = [
  {
    id: "essencial",
    name: "Plano Essencial",
    tagline: "Essencial",
    price: "39",
    period: "/mês",
    description: "Para precificar sem erro e vigiar a concorrência",
    features: [
      "Precificação determinística ilimitada",
      "Radar de preços de concorrentes no Google",
      "Leitura de notas fiscais (XML/PDF) avulsas",
      "Legenda anti-robô nativa (gancho nos primeiros 125 chars)",
      "Diagnóstico inicial de perfil do Instagram (1x)",
    ],
    ctaLabel: "Começar no Essencial",
    ctaHref: "/login?plano=essencial",
    featured: false,
  },
  {
    id: "pro",
    name: "Plano Pro / Sócia",
    tagline: "Destaque",
    badge: "Recomendado",
    price: "69",
    period: "/mês",
    description: "A sua sócia completa de vendas, estoque e marketing",
    features: [
      "Tudo do Essencial",
      "Conexão Direta Bling ou Olist (entrada de NF-e e estoque no zap)",
      "Suíte Completa de Instagram (carrosséis, ganchos 2026, calendário)",
      "Consultoria de Perfil & Bio (diagnóstico + nova bio pronta + roteiro de destaques)",
      "Ajuda para criar o perfil do zero (para quem está começando)",
      "Integração Google Workspace + Notion",
    ],
    ctaLabel: "Assinar o Pro",
    ctaHref: "/login?plano=pro",
    featured: true,
  },
  {
    id: "vip",
    name: "Plano VIP / Escala",
    tagline: "Escala",
    price: "119",
    period: "/mês",
    description: "Para operações consolidadas com múltiplos estoques",
    features: [
      "Tudo do Pro",
      "Múltiplos CNPJs/contas ERP conectadas",
      "Alertas ativos de peças paradas no estoque",
      "Revisão contínua de perfil para datas comemorativas",
    ],
    ctaLabel: "Falar com o VIP",
    ctaHref: "/login?plano=vip",
    featured: false,
  },
];

export default function PricingSection() {
  return (
    <section id="planos" className="pricing-section" aria-label="Planos e Preços">
      <div className="wrap">
        <div className="pricing-header">
          <span className="pricing-eyebrow">Planos transparentes</span>
          <h2 className="pricing-title">
            Tenha uma sócia dedicada pelo valor de uma única peça.
          </h2>
          <p className="pricing-subtitle">
            Sem fidelidade ou custos ocultos. Ativação direta no seu WhatsApp em menos de 2 minutos.
          </p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}
            >
              {plan.badge ? (
                <div className="pricing-card-badge-wrap">
                  <span className="pricing-card-badge">{plan.badge}</span>
                </div>
              ) : null}

              <div className="pricing-card-top">
                <span className="pricing-plan-name">{plan.name}</span>
                <p className="pricing-plan-desc">“{plan.description}”</p>
                <div className="pricing-plan-price-row">
                  <span className="pricing-currency">R$</span>
                  <span className="pricing-amount num">{plan.price}</span>
                  <span className="pricing-period">{plan.period}</span>
                </div>
              </div>

              <div className="pricing-card-divider" />

              <ul className="pricing-features">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="pricing-feature-item">
                    <svg
                      className="pricing-check-icon"
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M16.5 5.5L7.8 14.2L3.5 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="pricing-card-bottom">
                <Link
                  href={plan.ctaHref}
                  className={`pricing-cta ${
                    plan.featured ? "pricing-cta-featured" : "pricing-cta-default"
                  }`}
                >
                  {plan.ctaLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="pricing-guarantee">
          <p>
            🔒 Teste sem risco por 7 dias · Cancele quando quiser com 1 clique · Ativação imediata no WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
}
