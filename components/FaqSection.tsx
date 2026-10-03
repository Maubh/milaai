"use client";

import type { ReactNode } from "react";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Como a mila ajuda quem vende joias e semijoias no dia a dia?",
    answer: (
      <>
        A <span className="mila-highlight">mila</span> atua como o braço direito da empresária de semijoias: calcula o preço de venda com margem real (Raio-X), analisa custos de banho e pedraria, pesquisa preços da concorrência no Google Shopping, lê notas fiscais de compra (XML e PDF) e cria legendas e carrosséis magnéticos para o Instagram.
      </>
    ),
  },
  {
    question: "Preciso repetir as taxas da minha maquininha ou meus custos a cada conversa?",
    answer: (
      <>
        Não. A <span className="mila-highlight">mila</span> guarda as informações da sua loja conforme vocês conversam. Se você avisar a taxa média do cartão, os custos com embalagens ou o nome dos seus fornecedores, ela usa esses valores nos próximos cálculos. Quando você pedir para precificar outra peça semanas depois, a conta já sai com as suas regras.
      </>
    ),
  },
  {
    question: "Como funciona a publicação e consulta na Nuvemshop?",
    answer: (
      <>
        No plano Pro, você conecta sua loja Nuvemshop via OAuth seguro em 1 clique. Pelo WhatsApp, você pode consultar estoque e preços de qualquer peça em tempo real e publicar novos produtos com foto real, descrição técnica completa e preço de venda já calculado, sem precisar abrir o computador.
      </>
    ),
  },
  {
    question: "Como a mila ajuda quem usa Phibo, Jueri ou Olist?",
    answer: (
      <>
        Para a Phibo, a <span className="mila-highlight">mila</span> entrega no WhatsApp uma planilha formatada exatamente no layout oficial de importação do sistema (com NCM 71132000 de semijoias, códigos hexadecimais de banho, preços e categorias), pronta para você importar em segundos. Para Jueri e Olist (Tiny), você conta com conexão direta para gestão de estoque e notas.
      </>
    ),
  },
  {
    question: "O que são as Vitrines Web e Catálogos em PDF?",
    answer: (
      <>
        São páginas públicas interativas e catálogos elegantes em PDF gerados automaticamente com as fotos reais das suas peças. O cliente navega pelas coleções no celular e clica em um botão direto para comprar com você no WhatsApp, sem intermediários de pagamento nem taxas sobre as suas vendas.
      </>
    ),
  },
  {
    question: "Como funciona o caderno de fornecedores e o alerta de carência?",
    answer: (
      <>
        Você registra os dados e prazos dos seus fabricantes de confiança e a <span className="mila-highlight">mila</span> te avisa no WhatsApp antes de vencer o prazo de carência, evitando que você perca o benefício de comprar reposições sem exigência de pedido mínimo.
      </>
    ),
  },
  {
    question: "Preciso instalar algum aplicativo no computador ou celular?",
    answer: (
      <>
        Não. Toda a sua rotina com a <span className="mila-highlight">mila</span> acontece no aplicativo que você já usa o dia todo: o <strong>WhatsApp</strong>. Você envia áudios, fotos de peças e notas fiscais e recebe respostas e arquivos prontos na hora.
      </>
    ),
  },
  {
    question: "Qual é a diferença entre o Plano Essencial e o Plano Pro?",
    answer: (
      <>
        O <strong>Essencial (R$ 39/mês)</strong> é ideal para quem quer precificação precisa com margem real, radar de concorrentes, leitor de notas fiscais, caderno sincronizado no Google Planilhas e 1 vitrine web ativa. O <strong>Pro (R$ 69/mês)</strong> desbloqueia a automação completa da loja: integração com Nuvemshop no WhatsApp, vitrines e catálogos PDF ilimitados, conexões com ERPs (Jueri, Olist e planilha pronta para Phibo), projeção de faturamento e criação de conteúdo para Instagram.
      </>
    ),
  },
  {
    question: "Preciso cadastrar cartão de crédito para começar?",
    answer: (
      <>
        Não. Você entra com seu número de WhatsApp e já começa a testar a experiência na hora, sem compromisso e sem precisar cadastrar cartão.
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
