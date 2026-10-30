import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ArrowIcon } from "@/components/landing-proposals/Icons";
import { META_INDICE } from "@/lib/landing-proposals";

export const metadata: Metadata = META_INDICE;

const PROPOSTAS = [
  {
    href: "/propostas/a",
    letra: "A",
    nome: "Perto de você, na loja",
    resumo: "A mila como assistente pessoal da lojista no WhatsApp, com o mockup do iPhone da landing atual ao lado do título.",
    linhas: [
      ["Abertura", "Título e convite à esquerda, mockup do iPhone com a conversa em loop à direita."],
      ["Rotina", "Seis tarefas do dia a dia em linhas pautadas, com título e texto; Pro marcado onde vale."],
      ["Ritmo", "Rotina em lista aberta, faixa mineral com três colunas sobre a conversa, mapa animado de integrações, planos lado a lado e dúvidas."],
    ],
  },
  {
    href: "/propostas/b",
    letra: "B",
    nome: "A rotina ganha uma assistente",
    resumo: "A mesma tese numa composição mais aberta: o telefone à esquerda e a rotina contada em frases.",
    linhas: [
      ["Abertura", "Mockup do iPhone à esquerda e título editorial curto à direita, no computador."],
      ["Rotina", "Seis momentos da loja em frases grandes e pautadas, sem cartões."],
      ["Ritmo", "Uma frase sobre a conversa, mapa animado de integrações, grupos por plano, oferta em folha única e dúvidas em duas colunas."],
    ],
  },
] as const;

export default function PropostasIndice() {
  return (
    <div className="lp-root lpi">
      <header className="lp-bar lpi-bar">
        <Link href="/propostas" className="lp-brand" aria-label="mila. — prévias">
          <BrandLogo height={24} alt="" className="lp-wordmark" />
        </Link>
        <Link href="/" className="lp-link lpi-atual">
          Ver a página atual
        </Link>
      </header>

      <div className="lp-wrap lpi-corpo">
        <h1 className="lpi-titulo">Duas propostas para a página inicial</h1>
        <p className="lp-body lpi-lead">
          As duas posicionam a mila como assistente pessoal da lojista no WhatsApp, com o mesmo mockup, o mesmo mapa de integrações e a mesma oferta. Muda a composição. A página atual continua no
          ar até a escolha.
        </p>

        <ul className="lpi-lista">
          {PROPOSTAS.map((p) => (
            <li key={p.href} className="lpi-item lp-glass">
              <div className="lpi-item-topo">
                <span className="lpi-letra" aria-hidden="true">
                  {p.letra}
                </span>
                <div>
                  <h2 className="lp-h3">
                    <Link href={p.href} className="lpi-link">
                      <span className="sr-only">Proposta {p.letra}: </span>
                      {p.nome}
                    </Link>
                  </h2>
                  <p className="lp-body">{p.resumo}</p>
                </div>
              </div>
              <dl className="lp-ruled lpi-linhas">
                {p.linhas.map(([rotulo, texto]) => (
                  <div key={rotulo}>
                    <dt>{rotulo}</dt>
                    <dd>{texto}</dd>
                  </div>
                ))}
              </dl>
              <Link href={p.href} className="lp-btn lp-btn-primary lpi-abrir" aria-label={`Abrir a proposta ${p.letra}: ${p.nome}`}>
                Abrir a proposta {p.letra}
                <ArrowIcon size={18} />
              </Link>
            </li>
          ))}
        </ul>

        <p className="lp-caption lpi-nota">
          Prévias sem indexação. A conversa do mockup é uma demonstração ilustrativa.
        </p>
      </div>
    </div>
  );
}
