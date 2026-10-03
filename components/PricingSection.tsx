
import Link from "next/link";

import { PLANO_GOOGLE } from "@/lib/google-workspace";
import { CONECTORES_NAO_PRONTOs } from "@/lib/legal";

/** Linha do plano que fala de ERP. Fonte única: `lib/legal.ts` diz QUAIS
 *  conectores não estão prontos — antes o texto era digitado aqui à mão, e foi
 *  assim que "Integração direta Jueri, Bling e Olist" ficou no ar prometendo o
 *  que devolve 501 (achado pelo guard `tests/legal.test.ts`). */
export const PLANO_ERP =
  "Integração direta com ERP (Jueri disponível; " +
  CONECTORES_NAO_PRONTOs.join(" e ") +
  " ainda não)";

export const PLANO_VITRINE_ESSENCIAL =
  "Vitrine web interativa (1 ativa por vez) e até 2 catálogos em PDF/mês com fotos reais";

export const PLANO_VITRINE_PRO =
  "Vitrines web ilimitadas e catálogos em PDF ilimitados com fotos reais";

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
    description: "Precificação, margem e descrição de peças desde o primeiro dia",
    features: [
      "Precificação ilimitada com Raio-X e margem real",
      "Radar de concorrentes no Google Shopping",
      "Descrições técnicas prontas para loja virtual",
      "Caderno de fornecedores validados no WhatsApp",
      "Leitor de notas fiscais de compra (XML e PDF)",
      PLANO_VITRINE_ESSENCIAL,
      // Fonte única (lib/google-workspace.ts): a mesma frase vale para o plano,
      // a lista da área logada e a tela de conexão. Antes cada tela repetia o
      // texto à mão e as versões divergiam — foi assim que a promessa de Gmail
      // e Agenda sobreviveu aqui depois de já ter saído do resto do site.
      PLANO_GOOGLE,
    ],
    ctaLabel: "Conhecer o Essencial",
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
    description: "Visão contínua de estoque, fornecedores, faturamento e conteúdo",
    features: [
      "Tudo do Essencial",
      PLANO_VITRINE_PRO,
      "Balanço mensal de compras e projeção de faturamento no WhatsApp",
      "Alertas ativos de carência de fornecedores (aviso antes de perder pedido sem mínimo)",
      PLANO_ERP,
      "Marketing de Instagram: legenda, carrossel, hashtags, bio, plano de conteúdo e reaproveitamento",
    ],
    ctaLabel: "Conhecer o Pro",
    ctaHref: "/login",
    featured: true,
  },
];

export default function PricingSection() {
  return (
    <section id="planos" className="pricing-section" aria-label="Planos e preços">
      <div className="wrap">
        <div className="pricing-header">
          <span className="pricing-eyebrow">Planos transparentes</span>
          <h2 className="pricing-title">
            Planos para o momento da sua loja.
          </h2>
          <p className="pricing-subtitle">
            Comece com o que sua operação precisa hoje. A Mila acompanha o próximo passo.
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
            A Mila começa na peça e acompanha a operação conforme sua loja cresce.
          </p>
        </div>
      </div>
    </section>
  );
}
