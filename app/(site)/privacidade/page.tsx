import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — mila",
  description: "Política de Privacidade da prévia interativa da mila.",
};

export default function PrivacidadePage() {
  return (
    <div className="wrap auth-minimal">
      <p className="auth-minimal-back auth-minimal-back-top">
        <Link href="/login">← Voltar</Link>
      </p>
      <h1 className="auth-minimal-title">Política de Privacidade</h1>
      <p className="auth-minimal-lede">
        Como tratamos seus dados na prévia interativa da mila.
      </p>
      <div className="legal-body">
        <h2>1. O que coletamos</h2>
        <p>
          O número de celular digitado fica salvo apenas no seu navegador (armazenamento local).
          Não enviamos esse dado para nenhum servidor nosso ou de terceiros.
        </p>
        <h2>2. Verificação anti-robô</h2>
        <p>
          Usamos o Cloudflare Turnstile para confirmar que você não é um robô. Ao passar pela
          verificação, o Cloudflare pode coletar sinais técnicos do navegador, conforme a política
          de privacidade dele.
        </p>
        <h2>3. O que não fazemos</h2>
        <p>
          Não vendemos dados, não enviamos mensagens de marketing e não compartilhamos seu número
          com ninguém, porque ele nem chega até nós.
        </p>
        <h2>4. Seus direitos</h2>
        <p>
          Para apagar tudo, limpe os dados do site no seu navegador. Isso remove o número e o
          estado da simulação de uma vez.
        </p>
      </div>
    </div>
  );
}
