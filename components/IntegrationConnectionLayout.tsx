import Link from "next/link";
import type { ReactNode } from "react";
import "./notion-connection.css";

interface Props {
  name: string;
  brand: ReactNode;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Template aprovado para conectar serviços à Mila: identidade, contexto e uma ação. */
export default function IntegrationConnectionLayout({ name, brand, title, description, children, footer }: Props) {
  return (
    <div className="notion-connect-page">
      <header className="notion-connect-header">
        <Link href="/" aria-label="Mila — início">
          <img src="/brand/vectors/wordmark-mineral.svg" alt="mila." width="88" height="32" />
        </Link>
        <Link href="/workspace/integracoes">Voltar às integrações</Link>
      </header>
      <section className="notion-connect" aria-labelledby="integration-connect-title">
        <div className="notion-connect-brand" aria-label={name}>{brand}</div>
        <h1 id="integration-connect-title">{title}</h1>
        <p className="notion-connect-intro">{description}</p>
        {children}
        {footer ? <p className="notion-connect-footer">{footer}</p> : null}
      </section>
    </div>
  );
}
