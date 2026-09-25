"use client";

import React from "react";

interface IntegrationItem {
  id: string;
  name?: string;
  showName?: boolean;
  color: string;
  icon: React.ReactNode;
}

/* Wordmarks do Bling e da Olist são os SVGs distribuídos pelas próprias marcas,
   mantidos localmente para não depender do carregamento de terceiros. */
const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "jueri",
    name: "Jueri",
    showName: false,
    color: "#EA580C",
    icon: (
      <img src="/integrations/jueri.png" alt="Jueri" />
    ),
  },
  {
    id: "bling",
    name: "Bling",
    showName: false,
    color: "#002726",
    icon: (
      <img src="/integrations/bling-ink.svg" alt="" />
    ),
  },
  {
    id: "olist",
    name: "Olist",
    showName: false,
    color: "#0A4EE4",
    icon: (
      <img src="/integrations/olist.svg" alt="" />
    ),
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    showName: false,
    color: "#5F6368",
    icon: (
      <img src="/integrations/google-workspace.svg" alt="" />
    ),
  },
  {
    id: "notion",
    name: "Notion",
    color: "#111111",
    icon: (
      /* Ícone oficial do Notion (cubo isométrico 3D com 'N' chanfrado do Simple Icons) */
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </svg>
    ),
  },
  {
    id: "outlook",
    name: "Outlook",
    color: "#0078D4",
    icon: (
      /* Ícone oficial do Microsoft Outlook (Fluent Design / Simple Icons v11) */
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" />
      </svg>
    ),
  },
];

function BrandMark({ item }: { item: IntegrationItem }) {
  const label = item.name ?? item.id;

  return (
    <div className={`marquee-mark integration-${item.id}`} aria-label={label}>
      <span className="marquee-mark-logo" style={{ color: item.color }}>{item.icon}</span>
      {item.showName !== false ? <span className="marquee-mark-name">{item.name}</span> : null}
    </div>
  );
}

function BrandGroup({ hidden = false }: { hidden?: boolean }) {
  // Lista duplicada dentro do grupo: garante cobertura total em telas ultrawide
  // sem quebrar o loop contínuo (grupos idênticos, deslocamento de -1/3).
  const items = [...INTEGRATIONS, ...INTEGRATIONS];
  return (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {items.map((item, i) => <BrandMark key={`${item.id}-${i}`} item={item} />)}
    </div>
  );
}

export default function IntegrationsMarquee() {
  return (
    <section className="marquee-section" aria-label="Integrações demonstrativas">
      <div className="marquee-viewport" tabIndex={0} aria-label="Marcas integradas à mila.">
        <div className="marquee-track">
          <BrandGroup />
          <BrandGroup hidden />
          <BrandGroup hidden />
        </div>
      </div>
    </section>
  );
}
