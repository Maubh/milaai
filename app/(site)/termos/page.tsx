import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — socIA",
  description: "Termos de Uso da prévia interativa da socIA.",
};

export default function TermosPage() {
  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Voltar ao login</Link>
      </p>
      <h1 className="auth-minimal-title">Termos de Uso</h1>
      <p className="auth-minimal-lede">
        Estes termos valem para a prévia interativa da socIA, em fase de demonstração.
      </p>
      <div className="legal-body">
        <h2>1. O que é esta prévia</h2>
        <p>
          A socIA é uma assistente de negócios para lojistas, em desenvolvimento. O site atual é
          uma demonstração navegável: onboarding, conversa e workspace funcionam com dados de
          exemplo, salvos apenas no seu navegador. Nenhuma mensagem é enviada de verdade.
        </p>
        <h2>2. Sem envio de SMS ou mensagens</h2>
        <p>
          O número de celular informado serve só para conduzir a simulação local. Não enviamos
          código por SMS, WhatsApp ou qualquer outro canal. O código exibido na tela é fictício.
        </p>
        <h2>3. Conteúdo de exemplo</h2>
        <p>
          Preços, margens, legendas e descrições mostrados são ilustrativos, com números
          fictícios. Não use esses valores como orientação real para o seu negócio.
        </p>
        <h2>4. Uso aceitável</h2>
        <p>
          Use a prévia para explorar a proposta. Não tente contornar a verificação anti-robô nem
          usar a demonstração para coletar dados de terceiros.
        </p>
        <h2>5. Mudanças</h2>
        <p>
          Estes termos podem mudar quando a socIA sair da fase de prévia. A versão vigente estará
          sempre nesta página.
        </p>
      </div>
    </div>
  );
}
