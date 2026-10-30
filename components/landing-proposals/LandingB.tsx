import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import IntegrationsMarquee from "@/components/IntegrationsMarquee";
import {
  COMO_AJUDA,
  DUVIDAS,
  GRUPOS_INTEGRACAO,
  INTEGRACOES_PUBLICAS,
  LEAD_B,
  NOTA_ACESSO,
  NOTA_COBRANCA,
  NOTA_CONEXAO,
  NOTA_META,
  NOTA_NAO_PRONTOS,
  NOTA_PAINEL,
  PLANOS,
  RECURSOS,
  ROTINA,
  ROTULO_NIVEL,
  TITULO_B,
} from "@/lib/landing-proposals";
import DetalheIntegracao from "./DetalheIntegracao";
import { ArrowIcon, PlusIcon } from "./Icons";
import IntegrationMark from "./IntegrationMark";
import PhoneDemo from "./PhoneDemo";
import PreviewSwitch from "./PreviewSwitch";

const SECOES = [
  { href: "#rotina", rotulo: "Rotina" },
  { href: "#integracoes", rotulo: "Integrações" },
  { href: "#planos", rotulo: "Planos" },
  { href: "#duvidas", rotulo: "Dúvidas" },
];

export default function LandingB() {
  return (
    <div className="lp-root lpb" id="topo">
      <header className="lp-bar lpb-bar">
        <Link href="/propostas/b" className="lp-brand" aria-label="mila. — topo da proposta B">
          <BrandLogo height={24} alt="" className="lp-wordmark" />
        </Link>
        <nav className="lpb-nav" aria-label="Seções">
          <ul>
            {SECOES.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="lpb-nav-item">
                  {s.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lp-bar-actions">
          <PreviewSwitch atual="b" />
          <Link href="/login" className="lp-btn lp-btn-bar">
            Entrar
          </Link>
        </div>
      </header>

      <section className="lpb-hero lp-wrap" aria-labelledby="lpb-titulo">
        <div className="lpb-hero-texto">
          <h1 id="lpb-titulo" className="lpb-title">
            {TITULO_B}
          </h1>
          <p className="lpb-lead">{LEAD_B}</p>
          <div className="lpb-ctas">
            <Link href="/login" className="lp-btn lp-btn-primary">
              Entrar com o WhatsApp
              <ArrowIcon size={18} />
            </Link>
          </div>
          <p className="lpb-acesso">{NOTA_ACESSO}</p>
        </div>
        <PhoneDemo className="lpb-telefone" />
      </section>

      <section className="lpb-rotina lp-wrap" id="rotina" aria-labelledby="lpb-rotina-titulo">
        <h2 id="lpb-rotina-titulo" className="lp-h2 lpb-rotina-titulo">
          Para os momentos comuns de uma loja de joias.
        </h2>
        <ul className="lpb-frases">
          {ROTINA.map((t) => (
            <li key={t.id}>
              <p className="lpb-frase">{t.frase}</p>
              {t.nivel === "pro" ? <span className="lp-tier lp-tier-pro">Pro</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="lpb-ajuda lp-wrap" id="como-funciona" aria-labelledby="lpb-ajuda-titulo">
        <h2 id="lpb-ajuda-titulo" className="lpb-ajuda-titulo">
          Você escreve como escreveria para alguém da equipe. Ela responde ali mesmo.
        </h2>
        <ul className="lpb-ajuda-colunas">
          {COMO_AJUDA.map((c) => (
            <li key={c.titulo}>
              <h3 className="lpb-ajuda-item">{c.titulo}</h3>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
        <p className="lpb-painel">{NOTA_PAINEL}</p>
      </section>

      <IntegrationsMarquee ctaHref="#sobre-integracoes" ctaLabel="Ver o que cada integração faz" includeMeta />

      <section className="lpb-sobre lp-wrap" id="sobre-integracoes" aria-labelledby="lpb-sobre-titulo">
        <div className="lpb-sobre-head">
          <h2 id="lpb-sobre-titulo" className="lp-h2">
            O que cada integração faz
          </h2>
          <p className="lp-body">{NOTA_CONEXAO}</p>
        </div>
        <div className="lpb-sobre-grupos">
          {GRUPOS_INTEGRACAO.map((g) => (
            <section key={g.id} className="lpb-sobre-grupo" aria-labelledby={`lpb-grupo-${g.id}`}>
              <div className="lpb-sobre-grupo-topo">
                <h3 id={`lpb-grupo-${g.id}`} className="lpb-sobre-grupo-titulo">
                  {g.titulo}
                </h3>
                <p className={g.nivel === "pro" ? "lpb-sobre-plano is-pro" : "lpb-sobre-plano"}>
                  <span className="sr-only">Plano: </span>
                  {ROTULO_NIVEL[g.nivel]}
                </p>
                <p className="lpb-sobre-grupo-texto">{g.texto}</p>
              </div>
              <ul className="lpb-sobre-itens">
                {INTEGRACOES_PUBLICAS.filter((i) => i.grupo === g.id).map((i) => (
                  <li key={i.id}>
                    <span className="lpb-sobre-logo">
                      <IntegrationMark id={i.id} />
                    </span>
                    <h4 className="lpb-sobre-nome">{i.nome}</h4>
                    <p>{i.resumo}</p>
                    <DetalheIntegracao id={i.id} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="lpb-sobre-nota">
          {NOTA_META} {NOTA_NAO_PRONTOS}
        </p>
      </section>

      <section className="lpb-planos lp-wrap" id="planos" aria-labelledby="lpb-planos-titulo">
        <h2 id="lpb-planos-titulo" className="lp-h2">
          A mesma assistente, em dois planos.
        </h2>
        <div className="lpb-planos-folha lp-glass">
          <div className="lpb-planos-cabeca">
            {PLANOS.map((p) => (
              <div key={p.id} className={`lpb-plano lpb-plano-${p.id}`}>
                <h3 className="lp-h3">{p.nome}</h3>
                <p className="lpb-plano-preco">
                  R$ <span className="lpb-plano-valor">{p.preco}</span>
                  {p.periodo}
                </p>
                <p className="lpb-plano-resumo">{p.resumo}</p>
                <Link href="/login" className={p.id === "pro" ? "lp-btn lp-btn-primary" : "lp-btn lp-btn-secondary"}>
                  Entrar e conhecer o {p.nome}
                </Link>
              </div>
            ))}
          </div>
          <ul className="lpb-recursos" aria-label="O que cada plano inclui">
            {RECURSOS.map((r) => (
              <li key={r.texto}>
                <span>{r.texto}</span>
                <span className={r.nivel === "pro" ? "lp-tier lp-tier-pro" : "lp-tier"}>{ROTULO_NIVEL[r.nivel]}</span>
              </li>
            ))}
          </ul>
          <p className="lp-caption lpb-planos-nota">
            {NOTA_ACESSO} {NOTA_COBRANCA}
          </p>
        </div>
      </section>

      <section className="lpb-duvidas lp-wrap" id="duvidas" aria-labelledby="lpb-duvidas-titulo">
        <h2 id="lpb-duvidas-titulo" className="lp-h2">
          Dúvidas frequentes
        </h2>
        <div className="lpb-duvidas-grade">
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

      <section className="lpb-final" aria-labelledby="lpb-final-titulo">
        <div className="lp-wrap lpb-final-inner">
          <h2 id="lpb-final-titulo">Conte para a mila a próxima tarefa da loja.</h2>
          <p>{NOTA_ACESSO}</p>
          <Link href="/login" className="lp-btn lp-btn-ivory">
            Entrar com o WhatsApp
            <ArrowIcon size={18} />
          </Link>
        </div>
      </section>

      <footer className="lp-footer lpb-footer lp-wrap">
        <BrandLogo height={22} alt="mila." className="lp-wordmark" />
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
