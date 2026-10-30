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
  purpose?: string;
  note?: string;
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

];

const PURPOSES: Record<string, string> = {
  jueri: "Estoque e custos",
  olist: "Gestão da loja",
  nuvemshop: "Sua loja virtual",
  "google-workspace": "Lista de fornecedores",
  notion: "Fornecedores e notas de compra",
};

/* Meta só entra quando pedida (prévias): depende de liberação por loja e da autorização da lojista. */
const META: IntegrationItem = {
  id: "meta",
  name: "Meta",
  purpose: "Catálogo do Instagram e Facebook",
  note: "Sujeito à liberação",
  icon: (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="#0081FB" aria-hidden="true">
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
    </svg>
  ),
};

/** CTA e Meta opcionais: os defaults mantêm a home exatamente como está. */
interface IntegrationsMarqueeProps {
  ctaHref?: string;
  ctaLabel?: string;
  includeMeta?: boolean;
}

export default function IntegrationsMarquee({
  ctaHref = "/workspace/integracoes",
  ctaLabel = "Conhecer as integrações",
  includeMeta = false,
}: IntegrationsMarqueeProps = {}) {
  const items = includeMeta ? [...INTEGRATIONS, META] : INTEGRATIONS;
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
          <Link href={ctaHref} className="integrations-link">{ctaLabel}</Link>
          <p className="integrations-note">As conexões dependem do seu plano e da autorização da sua loja.</p>
        </div>
        <div className={`integrations-graph${includeMeta ? " has-meta" : ""}${visible ? " is-visible" : ""}`} ref={graphRef}>
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
            {items.map((item) => (
              <li key={item.id} className={`integrations-node integrations-node-${item.id}`}>
                <span className="integrations-node-brand" role="img" aria-label={item.name}>
                  {item.icon}
                  {item.showName !== false ? <span>{item.name}</span> : null}
                </span>
                <span className="integrations-node-purpose">{item.purpose ?? PURPOSES[item.id]}</span>
                {item.note ? <span className="integrations-node-note">{item.note}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
