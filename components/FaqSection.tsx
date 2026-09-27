"use client";

import type { ReactNode } from "react";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "A mila serve para quem vende joias e semijoias?",
    answer: (
      <>
        Sim. A proposta considera os dois segmentos. Ao analisar uma peça, informe a categoria,
        os materiais e os custos reais: uma joia e uma semijoia podem exigir composições de custo
        e descrições diferentes.
      </>
    ),
  },
  {
    question: "Qual plano combina com a minha loja?",
    answer: (
      <>
        O Essencial começa pela peça: custos, margem, pesquisa de mercado e descrição. No Pro,
        você amplia esse apoio para a rotina da loja, com visão de compras e faturamento, alertas
        de fornecedores, integrações de estoque e notas, além de ferramentas de conteúdo.
      </>
    ),
  },
  {
    question: "Preciso instalar algum aplicativo no computador ou celular?",
    answer: (
      <>
        Não para explorar a prévia no site. A proposta da <span className="mila-highlight">mila</span> é conversar com você pelo WhatsApp, sem exigir outro aplicativo.
      </>
    ),
  },
  {
    question: "Estou começando agora e ainda não tenho Instagram nem site. Serve para mim?",
    answer: (
      <>
        Com certeza! A <span className="mila-highlight">mila</span> te ajuda a calcular seus custos desde a primeira peça, sugere preços justos e ainda cria o nome e a Bio do seu Instagram do zero.
      </>
    ),
  },
  {
    question: "A descrição serve para qual plataforma de e-commerce?",
    answer: (
      <>
        Serve para qualquer uma (Nuvemshop, Shopify, WooCommerce, catálogo do WhatsApp ou ERPs como Jueri, Bling e Olist). É só copiar e colar a ficha técnica já formatada.
      </>
    ),
  },
  {
    question: "Como funciona o caderno de fornecedores e o alerta de carência?",
    answer: (
      <>
        Você registra seus fornecedores no chat e a <span className="mila-highlight">mila</span> te avisa no WhatsApp antes de vencer o prazo para você não perder o benefício de comprar sem pedido mínimo.
      </>
    ),
  },
  {
    question: "Preciso cadastrar cartão de crédito para começar?",
    answer: (
      <>
        Não. Você entra com seu número de WhatsApp e já começa a testar na hora sem compromisso.
      </>
    ),
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="faq-section" aria-label="Dúvidas frequentes">
      <div className="wrap">
        <div className="faq-header">
          <span className="faq-eyebrow">Dúvidas frequentes</span>
          <h2 className="faq-title">Dúvidas frequentes</h2>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx} className="faq-item">
              <summary className="faq-summary">
                <span className="faq-question">{item.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </summary>
              <div className="faq-content">
                <p className="faq-answer">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
