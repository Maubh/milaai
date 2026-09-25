"use client";

import React from "react";

interface IntegrationItem {
  id: string;
  name: string;
  sub?: string;
  badge?: string;
  icon: React.ReactNode;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "bling",
    name: "Bling ERP",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M4 4h9a5 5 0 0 1 4.5 7.2A5.5 5.5 0 0 1 14 20H4V4zm3.8 3.3v3.7h4.8a1.85 1.85 0 0 0 0-3.7H7.8zm0 5.9v4.2h5.6a2.1 2.1 0 0 0 0-4.2H7.8z" />
      </svg>
    ),
  },
  {
    id: "tiny",
    name: "Olist / Tiny",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    sub: "Drive & Sheets",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z" opacity="0.4" />
        <path d="M4 19.5h16c.8 0 1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5H4C3.2 4.5 2.5 5.2 2.5 6v12c0 .8.7 1.5 1.5 1.5z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 9h10M7 13h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "notion",
    name: "Notion",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M4.5 4.8l11.4-1.2c1.2-.1 1.7.5 2.2 1.4l2.4 4.5c.3.6.1 1.1-.5 1.2l-.7.1v9.6c0 1.1-.6 1.8-1.8 1.9l-13 1.2c-.8.1-1.3-.3-1.6-.9L2.1 16c-.3-.6-.1-1.2.6-1.3l.8-.1V6.6c0-.9.4-1.7 1-1.8zm3 2.8v10.5l8.7-.8V6.8l-8.7.8zm2.2 2.4h1.7l3.8 5.6V9.3h1.8v6.7h-1.6L9.7 10.3v5.7H7.7V10z" />
      </svg>
    ),
  },
  {
    id: "outlook",
    name: "Outlook",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "nuvemshop",
    name: "Nuvemshop",
    badge: "Em breve",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.6.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
      </svg>
    ),
  },
];

export default function IntegrationsMarquee() {
  return (
    <section className="marquee-section" aria-label="Integrações e conexões do negócio">
      <div className="wrap">
        <p className="marquee-title">
          Conecte em 1 clique com as ferramentas do seu negócio:
        </p>
      </div>

      <div className="marquee-viewport" tabIndex={0} aria-label="Lista contínua de conectores">
        <div className="marquee-track">
          {/* Primeira cópia */}
          <div className="marquee-group">
            {INTEGRATIONS.map((item) => (
              <div key={`g1-${item.id}`} className="marquee-card">
                <span className="marquee-card-icon">{item.icon}</span>
                <span className="marquee-card-text">
                  <strong className="marquee-card-name">{item.name}</strong>
                  {item.sub ? (
                    <small className="marquee-card-sub">{item.sub}</small>
                  ) : null}
                </span>
                {item.badge ? (
                  <span className="marquee-card-badge">{item.badge}</span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Segunda cópia para loop contínuo sem quebras */}
          <div className="marquee-group" aria-hidden="true">
            {INTEGRATIONS.map((item) => (
              <div key={`g2-${item.id}`} className="marquee-card">
                <span className="marquee-card-icon">{item.icon}</span>
                <span className="marquee-card-text">
                  <strong className="marquee-card-name">{item.name}</strong>
                  {item.sub ? (
                    <small className="marquee-card-sub">{item.sub}</small>
                  ) : null}
                </span>
                {item.badge ? (
                  <span className="marquee-card-badge">{item.badge}</span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Terceira cópia para telas ultra-wide */}
          <div className="marquee-group" aria-hidden="true">
            {INTEGRATIONS.map((item) => (
              <div key={`g3-${item.id}`} className="marquee-card">
                <span className="marquee-card-icon">{item.icon}</span>
                <span className="marquee-card-text">
                  <strong className="marquee-card-name">{item.name}</strong>
                  {item.sub ? (
                    <small className="marquee-card-sub">{item.sub}</small>
                  ) : null}
                </span>
                {item.badge ? (
                  <span className="marquee-card-badge">{item.badge}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
