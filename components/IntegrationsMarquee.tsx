"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FERRAMENTAS_GOOGLE } from "@/lib/google-workspace";
import "./integrations-beam.css";

interface IntegrationItem {
  id: string;
  name?: string;
  showName?: boolean;
  icon: React.ReactNode;
}

function GoogleWorkspaceIcons() {
  return (
    <span className="google-workspace-icons" aria-hidden="true">
      {FERRAMENTAS_GOOGLE.map((tool) => (
        <img key={tool.slug} src={tool.icone} alt="" width={22} height={22} />
      ))}
    </span>
  );
}

function GoogleWorkspaceBrand() {
  return (
    <span className="google-workspace-brand">
      <img src="/integrations/google-workspace.svg" alt="" width={130} height={24} />
      <GoogleWorkspaceIcons />
    </span>
  );
}

/* Wordmarks são os assets das próprias marcas,
   mantidos localmente para não depender do carregamento de terceiros. */
const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "jueri",
    name: "Jueri",
    showName: false,
    icon: (
      <img src="/integrations/jueri.png" alt="" width={80} height={26} />
    ),
  },
  {
    id: "olist",
    name: "Olist",
    showName: false,
    icon: (
      <img src="/integrations/olist.svg" alt="" width={80} height={28} />
    ),
  },
  {
    id: "nuvemshop",
    name: "Nuvemshop",
    showName: false,
    icon: <img src="/integrations/nuvemshop-wordmark.png" alt="" width={110} height={28} />,
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    showName: false,
    icon: <GoogleWorkspaceBrand />,
  },
  {
    id: "notion",
    name: "Notion",
    icon: (
      /* Ícone oficial do Notion (cubo isométrico 3D com 'N' chanfrado do Simple Icons) */
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </svg>
    ),
  },

  {
    id: "trello",
    name: "Trello",
    icon: (
      /* Ícone oficial do Trello (Simple Icons), no azul da marca. */
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#0052CC" aria-hidden="true">
        <path d="M21.5 0h-19A2.5 2.5 0 0 0 0 2.5v19A2.5 2.5 0 0 0 2.5 24h19a2.5 2.5 0 0 0 2.5-2.5v-19A2.5 2.5 0 0 0 21.5 0zM10.7 18.6c0 .5-.4.9-.9.9H4.6c-.5 0-.9-.4-.9-.9V5.4c0-.5.4-.9.9-.9h5.2c.5 0 .9.4.9.9v13.2zm9.6-5.1c0 .5-.4.9-.9.9h-5.2c-.5 0-.9-.4-.9-.9V5.4c0-.5.4-.9.9-.9h5.2c.5 0 .9.4.9.9v8.1z" />
      </svg>
    ),
  },

];

const PURPOSES: Record<string, string> = {
  jueri: "Estoque e custos",
  olist: "Gestão da loja",
  nuvemshop: "Sua loja virtual",
  "google-workspace": "Lista de fornecedores",
  notion: "Fornecedores e notas de compra",
  trello: "Quadros e rotina da loja",
};

export default function IntegrationsMarquee() {
  const graphRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const center = graph.querySelector<HTMLElement>(".integrations-hub");
    const nodes = Array.from(graph.querySelectorAll<HTMLElement>(".integrations-node"));
    if (!center) return;

    function measure() {
      const bounds = graph!.getBoundingClientRect();
      const hub = center!.getBoundingClientRect();
      const targetY = hub.top + hub.height / 2 - bounds.top;
      setPaths(nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        const left = rect.left < hub.left;
        const x1 = (left ? rect.right : rect.left) - bounds.left;
        const y1 = rect.top + rect.height / 2 - bounds.top;
        const x2 = (left ? hub.left : hub.right) - bounds.left;
        const bend = (x1 + x2) / 2;
        return `M ${x1} ${y1} C ${bend} ${y1}, ${bend} ${targetY}, ${x2} ${targetY}`;
      }));
    }

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(graph);
    resize.observe(center);
    nodes.forEach((node) => resize.observe(node));
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    intersection.observe(graph);
    return () => { resize.disconnect(); intersection.disconnect(); };
  }, []);

  return (
    <section id="integracoes" className="integrations-section" aria-labelledby="integrations-title">
      <div className="wrap integrations-layout">
        <div className="integrations-copy">
          <h2 id="integrations-title">As ferramentas da sua loja, na mesma conversa.</h2>
          <p>Conecte seus sistemas à Mila e acompanhe sua operação pelo WhatsApp.</p>
          <Link href="/workspace/integracoes" className="integrations-link">Conhecer as integrações</Link>
          <p className="integrations-note">As conexões dependem do seu plano e da autorização da sua loja.</p>
        </div>
        <div className={`integrations-graph${visible ? " is-visible" : ""}`} ref={graphRef}>
          <svg className="integrations-paths" aria-hidden="true" focusable="false">
            {paths.map((path, index) => (
              <g key={index}>
                <path d={path} className="integrations-path" />
                <path d={path} pathLength={1} className="integrations-pulse" style={{ animationDelay: `${index * 1.6}s` }} />
              </g>
            ))}
          </svg>
          <div className="integrations-hub" role="img" aria-label="mila. no WhatsApp">
            <img src="/brand/vectors/symbol-ivory.svg" width={48} height={48} alt="" />
            <span className="integrations-hub-caption">No seu WhatsApp</span>
          </div>
          <ul className="integrations-nodes" aria-label="Ferramentas que você pode conectar">
            {INTEGRATIONS.map((item) => (
              <li key={item.id} className={`integrations-node integrations-node-${item.id}`}>
                <span className="integrations-node-brand" role="img" aria-label={item.name}>
                  {item.icon}
                  {item.showName !== false ? <span>{item.name}</span> : null}
                </span>
                <span className="integrations-node-purpose">{PURPOSES[item.id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
