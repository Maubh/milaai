"use client";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Preciso instalar algum aplicativo no computador ou celular?",
    answer:
      "Não. A mila. funciona 100% dentro do seu WhatsApp (e Telegram), exatamente como conversar com uma sócia.",
  },
  {
    question: "Estou começando agora e ainda não tenho Instagram nem site. Serve para mim?",
    answer:
      "Com certeza! A mila. te ajuda a calcular seus custos desde a primeira peça, sugere preços justos e ainda cria o nome e a Bio do seu Instagram do zero.",
  },
  {
    question: "A descrição serve para qual plataforma de e-commerce?",
    answer:
      "Serve para qualquer uma (Nuvemshop, Shopify, WooCommerce, catálogo do WhatsApp ou ERPs como Jueri, Bling e Olist). É só copiar e colar a ficha técnica já formatada.",
  },
  {
    question: "Como funciona o caderno de fornecedores e o alerta de carência?",
    answer:
      "Você registra seus fornecedores no chat e a mila. te avisa no WhatsApp antes de vencer o prazo para você não perder o benefício de comprar sem pedido mínimo.",
  },
  {
    question: "Preciso cadastrar cartão de crédito para começar?",
    answer:
      "Não. Você entra com seu número de WhatsApp e já começa a testar na hora sem compromisso.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="faq-section" aria-label="Dúvidas Frequentes">
      <div className="wrap">
        <div className="faq-header">
          <span className="faq-eyebrow">Dúvidas frequentes</span>
          <h2 className="faq-title">Dúvidas Frequentes</h2>
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
