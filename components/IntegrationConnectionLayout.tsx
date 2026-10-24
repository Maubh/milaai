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

/** Template para conectar serviços à Mila: identidade e contexto à esquerda, uma ação à direita. */
export default function IntegrationConnectionLayout({ name, brand, title, description, children, footer }: Props) {
  return (
    <div className="notion-connect-page">
      <header className="notion-connect-header">
        <Link href="/" className="notion-connect-home" aria-label="Mila — início">
          <img src="/brand/vectors/wordmark-mineral.svg" alt="mila." width="88" height="32" />
        </Link>
        <Link href="/workspace/integracoes" className="notion-connect-back">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6" /></svg>
          Voltar às integrações
        </Link>
      </header>
      <section className="notion-connect" aria-labelledby="integration-connect-title">
        <div className="notion-connect-context">
          <div className="notion-connect-brand" aria-label={name}>{brand}</div>
          <h1 id="integration-connect-title">{title}</h1>
          <p className="notion-connect-intro">{description}</p>
          {footer ? <p className="notion-connect-footer">{footer}</p> : null}
        </div>
        <div className="notion-connect-action">{children}</div>
      </section>
    </div>
  );
}
