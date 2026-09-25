"use client";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Preciso instalar algum aplicativo no computador ou celular?",
    answer:
      "Não. A socIA funciona 100% dentro do seu WhatsApp (e Telegram), exatamente como conversar com uma sócia.",
  },
  {
    question: "Estou começando agora e ainda não tenho Instagram nem site. Serve para mim?",
    answer:
      "Com certeza! A socIA te ajuda a calcular seus custos desde a primeira peça, sugere preços justos e ainda te ajuda a criar o nome e a Bio do seu Instagram do zero.",
  },
  {
    question: "Preciso cadastrar cartão de crédito para começar?",
    answer:
      "Não. Você entra com seu número de WhatsApp e já começa a testar na hora sem compromisso.",
  },
  {
    question: "Como funciona o radar de concorrentes?",
    answer:
      "Toda vez que você envia uma foto ou descrição da peça, a socIA pesquisa em tempo real o preço médio praticado no Google Shopping e nas lojas virtuais da sua região.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="faq-section" aria-label="Perguntas Frequentes">
      <div className="wrap">
        <div className="faq-header">
          <span className="faq-eyebrow">Dúvidas frequentes</span>
          <h2 className="faq-title">
            Tudo o que você precisa saber antes de começar.
          </h2>
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
