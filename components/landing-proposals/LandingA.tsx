import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import IntegrationsMarquee from "@/components/IntegrationsMarquee";
import {
  COMO_AJUDA,
  DUVIDAS,
  LEAD_A,
  NOTA_ACESSO,
  NOTA_COBRANCA,
  NOTA_META,
  NOTA_NAO_PRONTOS,
  NOTA_PAINEL,
  PLANOS,
  ROTINA,
  TITULO_A,
} from "@/lib/landing-proposals";
import CabecalhoFixo from "./CabecalhoFixo";
import { ArrowIcon, CheckIcon, PlusIcon } from "./Icons";
import PhoneDemo from "./PhoneDemo";
import PreviewSwitch from "./PreviewSwitch";

const SECOES = [
  { href: "#rotina", rotulo: "Rotina" },
  { href: "#integracoes", rotulo: "Integrações" },
  { href: "#planos", rotulo: "Planos" },
  { href: "#duvidas", rotulo: "Dúvidas" },
];

export default function LandingA() {
  return (
    <div className="lp-root lpa" id="topo">
      <CabecalhoFixo
        marca={
          <Link href="/propostas/a" className="lp-brand" aria-label="mila. — topo da proposta A">
            <BrandLogo height={24} alt="" className="lp-wordmark" />
          </Link>
        }
        secoes={SECOES}
        previa={<PreviewSwitch atual="a" />}
        entrar={
          <Link href="/login" className="lp-btn lp-btn-bar">
            Entrar
          </Link>
        }
      />

      <section className="lpa-hero lp-wrap" aria-labelledby="lpa-titulo">
        <div className="lpa-intro">
          <h1 id="lpa-titulo" className="lpa-title">
            {TITULO_A}
          </h1>
          <p className="lpa-lead">{LEAD_A}</p>
          <div className="lpa-ctas">
            <Link href="/login" className="lp-btn lp-btn-primary">
              Entrar com o WhatsApp
              <ArrowIcon size={18} />
            </Link>
            <a href="#rotina" className="lp-btn lp-btn-quiet">
              Ver como ela ajuda
            </a>
          </div>
          <p className="lpa-acesso">{NOTA_ACESSO}</p>
        </div>
        <PhoneDemo className="lpa-telefone" />
      </section>

      <section className="lpa-rotina lp-wrap" id="rotina" aria-labelledby="lpa-rotina-titulo">
        <div className="lpa-rotina-head">
          <h2 id="lpa-rotina-titulo" className="lp-h2">
            O dia a dia da loja, numa conversa.
          </h2>
          <p className="lp-body">
            Uma mão extra que conhece a loja: ajuda a pensar, organizar e preparar o que a rotina pede, sem você sair
            do WhatsApp.
          </p>
        </div>
        <ul className="lpa-rotina-lista">
          {ROTINA.map((t) => (
            <li key={t.id}>
              <h3 className="lpa-rotina-titulo">
                {t.titulo}
                {t.nivel === "pro" ? <span className="lp-tier lp-tier-pro">Pro</span> : null}
              </h3>
              <p>{t.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="lpa-ajuda lp-wrap" id="como-funciona" aria-labelledby="lpa-ajuda-titulo">
        <div className="lpa-ajuda-faixa">
          <h2 id="lpa-ajuda-titulo" className="lpa-ajuda-titulo">
            Uma conversa que já conhece a loja.
          </h2>
          <ul className="lpa-ajuda-colunas">
            {COMO_AJUDA.map((c) => (
              <li key={c.titulo}>
                <h3 className="lpa-ajuda-item">{c.titulo}</h3>
                <p>{c.texto}</p>
              </li>
            ))}
          </ul>
          <p className="lpa-painel">{NOTA_PAINEL}</p>
        </div>
      </section>

      <IntegrationsMarquee ctaHref="#planos" ctaLabel="Conhecer os planos" includeMeta />
      <p className="lp-wrap lpa-mapa-nota">
        {NOTA_META} {NOTA_NAO_PRONTOS}
      </p>

      <section className="lpa-planos lp-wrap" id="planos" aria-labelledby="lpa-planos-titulo">
        <div className="lpa-planos-head">
          <h2 id="lpa-planos-titulo" className="lp-h2">
            Dois planos, a mesma assistente.
          </h2>
          <p className="lp-body">
            {NOTA_ACESSO} {NOTA_COBRANCA}
          </p>
        </div>
        <div className="lpa-planos-grid">
          {PLANOS.map((p) => (
            <article key={p.id} className={`lpa-plano lp-glass lpa-plano-${p.id}`} aria-labelledby={`lpa-plano-${p.id}`}>
              <div className="lpa-plano-topo">
                <h3 id={`lpa-plano-${p.id}`} className="lp-h3">
                  {p.nome}
                </h3>
                <p className="lpa-plano-preco">
                  <span className="lpa-plano-moeda">R$</span>
                  <span className="lpa-plano-valor">{p.preco}</span>
                  <span className="lpa-plano-periodo">{p.periodo}</span>
                </p>
                <p className="lpa-plano-resumo">{p.resumo}</p>
              </div>
              <ul className="lpa-plano-lista">
                {p.recursos.map((r) => (
                  <li key={r}>
                    <CheckIcon size={16} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className={p.id === "pro" ? "lp-btn lp-btn-primary" : "lp-btn lp-btn-secondary"}>
                Entrar e conhecer o {p.nome}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="lpa-duvidas lp-wrap" id="duvidas" aria-labelledby="lpa-duvidas-titulo">
        <div className="lpa-duvidas-head">
          <h2 id="lpa-duvidas-titulo" className="lp-h2">
            Dúvidas frequentes
          </h2>
        </div>
        <div className="lpa-duvidas-lista lp-glass">
          {DUVIDAS.map((d) => (
            <details key={d.pergunta} className="lp-faq">
              <summary>
                <span>{d.pergunta}</span>
                <PlusIcon size={18} className="lp-faq-icone" />
              </summary>
              <p>{d.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lpa-final lp-wrap" aria-labelledby="lpa-final-titulo">
        <div className="lpa-final-faixa">
          <h2 id="lpa-final-titulo">Comece pela próxima tarefa da loja.</h2>
          <p>{NOTA_ACESSO}</p>
          <Link href="/login" className="lp-btn lp-btn-ivory">
            Entrar com o WhatsApp
            <ArrowIcon size={18} />
          </Link>
        </div>
      </section>

      <footer className="lp-footer lpa-footer lp-wrap">
        <div className="lp-footer-marca">
          <BrandLogo height={22} alt="mila." className="lp-wordmark" />
          <p>Assistente pessoal no WhatsApp para lojistas de joias e semijoias.</p>
        </div>
        <nav aria-label="Legal" className="lp-footer-nav">
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
          <Link href="/exclusao-de-dados">Exclusão de dados</Link>
          <Link href="/propostas">Comparar prévias</Link>
        </nav>
        <p className="lp-footer-copy">
          © 2026 mila. ·{" "}
          <a href="https://instagram.com/usemila.ai" target="_blank" rel="noopener noreferrer">
            @usemila.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
