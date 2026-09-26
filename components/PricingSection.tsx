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

/** VIP/Escala fora da oferta atual. */
const PLANS: PlanItem[] = [
  {
    id: "essencial",
    name: "Essencial",
    tagline: "Essencial",
    price: "39",
    period: "/mês",
    description: "Precificação com lucro real desde a primeira peça",
    features: [
      "Precificação Ilimitada com Raio-X e Margem Real",
      "Radar de Concorrentes no Google Shopping",
      "Descrições Técnicas Prontas para Loja Virtual",
      "Caderno de Fornecedores Validados no WhatsApp",
      "Leitor de Notas Fiscais de Compra (XML e PDF)",
      "Google Workspace (Gmail, Calendar, Tasks, Drive, Docs, Sheets e Slides)",
      "Notion (catálogo e diretrizes de marca)",
    ],
    ctaLabel: "Começar no Essencial",
    ctaHref: "/login",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Destaque",
    badge: "Recomendado",
    price: "69",
    period: "/mês",
    description: "A parceira completa de vendas, estoque e marketing",
    features: [
      "Tudo do Essencial",
      "Balanço Mensal de Compras e Projeção de Faturamento no WhatsApp",
      "Alertas Ativos de Carência de Fornecedores (aviso antes de perder pedido sem mínimo)",
      "Integração Direta Jueri, Bling e Olist (entrada de notas e estoque)",
      "Suíte Completa de Marketing para Instagram (9 ferramentas)",
    ],
    ctaLabel: "Assinar o Pro",
    ctaHref: "/login",
    featured: true,
  },
];

export default function PricingSection() {
  return (
    <section id="planos" className="pricing-section" aria-label="Planos e Preços">
      <div className="wrap">
        <div className="pricing-header">
          <span className="pricing-eyebrow">Planos transparentes</span>
          <h2 className="pricing-title">
            Tenha a <span className="mila-highlight">mila</span> pelo valor de uma única peça.
          </h2>
          <p className="pricing-subtitle">
            Sem fidelidade ou custos ocultos. Ativação direta no seu WhatsApp em menos de 2 minutos.
          </p>
        </div>

        <div className="pricing-grid pricing-grid-2">
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
