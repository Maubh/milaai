"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PriceCalculator from "@/components/PriceCalculator";
import { brl, calculatePrice, defaultInputs } from "@/lib/pricing";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HERO_DEFAULTS = defaultInputs();
const HERO_RESULT = calculatePrice(HERO_DEFAULTS);

const ROUTINE = [
  {
    title: "Fotografe a peça e anote os custos",
    text: "Na demonstração, escolha uma peça de exemplo e ajuste custo, embalagem e rateio. O fluxo previsto lê foto e nota fiscal — aqui você vê o mesmo raciocínio com campos editáveis.",
  },
  {
    title: "Leia o Raio-X antes de decidir",
    text: "O cálculo separa custo direto, taxas, imposto e margem em valores por peça. Nada de multiplicar por dois ou três no chute.",
  },
  {
    title: "Prepare a comunicação",
    text: "Com o preço definido, a área de conteúdo traz uma legenda de exemplo para adaptar ao seu tom. Texto demonstrativo, sem geração automática real.",
  },
];

const MODULES = [
  {
    fluxo: "Foto e nota fiscal",
    oQue: "Organizar custo da peça, embalagem e rateio a partir do que você já tem",
    estado: "Demonstração",
  },
  {
    fluxo: "Radar de mercado",
    oQue: "Comparar seu preço com referências de lojas parecidas",
    estado: "Previsto",
  },
  {
    fluxo: "Conteúdo da peça",
    oQue: "Rascunhos de legenda e argumentos de venda para adaptar",
    estado: "Demonstração",
  },
  {
    fluxo: "Conectores Bling · Olist · Google · Notion",
    oQue: "Trazer estoque e custos sem digitar tudo de novo",
    estado: "Previsto",
  },
];

const PLANS = [
  {
    nome: "Essencial",
    preco: "R$ 39/mês",
    desc: "Para organizar o preço das primeiras peças.",
    itens: ["Raio-X do Preço com dados de exemplo", "Resumo de margem por peça", "Prévia de legenda demonstrativa"],
  },
  {
    nome: "Sócia",
    preco: "R$ 69/mês",
    desc: "Para a rotina semanal de precificação e divulgação.",
    itens: ["Tudo do Essencial", "Comparativo entre peças de exemplo", "Rotina de conteúdo para adaptar"],
  },
  {
    nome: "Escala",
    preco: "R$ 119/mês",
    desc: "Para quem acompanha várias peças e canais.",
    itens: ["Tudo do Sócia", "Visão do conjunto de peças", "Organização por coleção"],
  },
];

const FAQ = [
  {
    q: "Isto já está conectado ao meu WhatsApp?",
    a: "Não. O que você vê aqui é uma demonstração navegável com dados de exemplo. A conversa do WhatsApp aparece como prévia ilustrativa e nenhuma mensagem é enviada.",
  },
  {
    q: "Os preços dos planos já valem?",
    a: "Os valores de R$ 39, R$ 69 e R$ 119 vêm do material de planejamento e são apresentados como planos previstos. Não há cobrança nem contratação nesta página — a ação disponível é explorar a demonstração.",
  },
  {
    q: "O cálculo usa meus dados reais?",
    a: "Não. A calculadora roda no seu navegador com valores de exemplo que você pode editar. Nada é enviado para servidores e nada é salvo fora desta sessão, exceto o nome de demonstração que você digitar no login.",
  },
  {
    q: "Preciso de computador para usar?",
    a: "Não. Todas as telas funcionam em telas de 390px e 1440px, com campos e botões em tamanho de toque adequado.",
  },
  {
    q: "Meus dados estão protegidos?",
    a: "Por ser um protótipo local, não afirmamos criptografia, isolamento ou qualquer medida específica de segurança. Não digite senhas ou dados sensíveis aqui.",
  },
];

export default function LandingPage() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Primitive 1: choreographed hero entrance
      gsap.fromTo(
        ".hero-anim",
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.09, delay: 0.1 },
      );
      // Primitive 2: single important reveal on the Raio-X section
      gsap.fromTo(
        ".raio-reveal",
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: ".raio-reveal", start: "top 85%" },
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <section className="hero" aria-label="Apresentação">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="display hero-anim">Sua peça vale mais quando você conhece cada número.</h1>
            <p className="hero-sub hero-anim">
              A socIA é a sua parceira de precificação. Mais clareza para decisões mais lucrativas.
            </p>
            <div className="hero-cta-row hero-anim">
              <Link href="/login" className="btn btn-rect">
                Explorar demonstração <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <a href="#raio-x" className="btn btn-ghost">
                Ver o Raio-X
              </a>
            </div>
            <figure className="hero-photo-inline hero-anim">
              <Image
                src="/images/socia-jewelry-hero.png"
                alt="Brinco dourado e corrente sobre veludo vinho — imagem ilustrativa de produto"
                width={1672}
                height={941}
                priority
                sizes="100vw"
              />
              <figcaption>Peças que contam histórias também merecem números fortes.</figcaption>
            </figure>
            <div className="receipt hero-anim" aria-label="Simulação de preço de exemplo">
              <div className="receipt-top">
                <strong>Simulação de preço</strong>
                <time dateTime="2025-04-22">22/04/2025</time>
              </div>
              <dl>
                <div className="row">
                  <dt>Custo</dt>
                  <dd className="num">{brl(HERO_DEFAULTS.custoPeca + HERO_DEFAULTS.embalagem + HERO_DEFAULTS.rateio)}</dd>
                </div>
                <div className="row">
                  <dt>Preço sugerido</dt>
                  <dd className="num">{brl(HERO_RESULT.precoSugerido)}</dd>
                </div>
                <div className="row">
                  <dt>Margem</dt>
                  <dd className="num">{Math.round(HERO_DEFAULTS.margemDesejada)}%</dd>
                </div>
              </dl>
              <p className="receipt-foot">MAIS VALOR PARA O SEU TALENTO</p>
            </div>
            <p className="hero-motto hero-anim">ESTRATÉGIA TAMBÉM É PARTE DA BELEZA.</p>
          </div>
          <figure className="hero-photo hero-anim">
            <Image
              src="/images/socia-jewelry-hero.png"
              alt="Brinco dourado e corrente sobre veludo vinho — imagem ilustrativa de produto"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
            />
            <figcaption>
              PEÇAS
              <br />
              QUE CONTAM
              <br />
              HISTÓRIAS
              <br />
              TAMBÉM MERECEM
              <br />
              NÚMEROS FORTES.
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="raio-x" className="section section-paper" aria-labelledby="raio-x-title">
        <div className="wrap raio-reveal">
          <div className="measure" aria-hidden="true">
            <div className="measure-ticks">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
          <h2 id="raio-x-title" className="display section-title" style={{ marginTop: "1.5rem" }}>
            Raio-X da peça
          </h2>
          <p className="section-lede">
            Ajuste os custos e veja o preço sugerido se recompor na hora. É uma simulação local com dados
            de exemplo — o mesmo raciocínio que o workspace usa como ferramenta de trabalho.
          </p>
          <PriceCalculator variant="landing" />
        </div>
      </section>

      <section id="conversa" className="section section-paper" aria-labelledby="conversa-title">
        <div className="wrap chat-grid">
          <div>
            <h2 id="conversa-title" className="display section-title">
              O mesmo Raio-X, explicado como conversa
            </h2>
            <p className="section-lede">
              Prévia ilustrativa de como essa decomposição apareceria numa conversa de WhatsApp. Autoria
              própria, sem copiar a interface oficial e sem nenhuma API conectada.
            </p>
            <p>
              <span className="tag">Prévia ilustrativa · demonstração</span>
            </p>
            <p style={{ marginTop: "1.2rem" }}>
              <Link href="/login" className="btn btn-plum">
                Entrar na demonstração
              </Link>
            </p>
          </div>
          <div className="chat-mock" role="img" aria-label="Prévia ilustrativa de conversa sobre o Raio-X do Preço">
            <div className="chat-mock-head">
              <span>socIA · demonstração</span>
              <small>prévia</small>
            </div>
            <div className="chat-body">
              <p className="bubble out">Oi, sócia! Quanto devo cobrar nesse brinco?</p>
              <p className="bubble in">
                Vamos ao Raio-X, com <strong>números de exemplo</strong>: custo{" "}
                <span className="num">{brl(HERO_DEFAULTS.custoPeca)}</span>, embalagem{" "}
                <span className="num">{brl(HERO_DEFAULTS.embalagem)}</span>, rateio{" "}
                <span className="num">{brl(HERO_DEFAULTS.rateio)}</span>.
              </p>
              <p className="bubble in">
                Com taxas e a margem de exemplo, o preço sugerido fica{" "}
                <span className="num">{brl(HERO_RESULT.precoSugerido)}</span> — e você mantém{" "}
                <span className="num">{brl(HERO_RESULT.margemReais)}</span> por peça.
              </p>
              <p className="bubble in">
                Quer ver esse cálculo com seus próprios números? Abre a demonstração e ajusta os campos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="rotina" className="section section-ink on-dark" aria-labelledby="rotina-title">
        <div className="wrap">
          <h2 id="rotina-title" className="display section-title">
            Da bancada à vitrine
          </h2>
          <p className="section-lede">
            Três passos que a demonstração cobre de ponta a ponta — sem prometer automação real.
          </p>
          <ol className="routine-list">
            {ROUTINE.map((step, i) => (
              <li key={step.title}>
                <span className="routine-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="module-scroll">
            <table className="module-table">
              <caption className="sr-only">Módulos e conectores com estado de disponibilidade</caption>
              <thead>
                <tr>
                  <th scope="col">Fluxo</th>
                  <th scope="col">O que cobre</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr key={m.fluxo}>
                    <td>
                      <strong>{m.fluxo}</strong>
                    </td>
                    <td>{m.oQue}</td>
                    <td>
                      <span className="pill">{m.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.88rem", color: "rgba(252,250,246,0.7)" }}>
            Bling, Olist, Google e Notion aparecem como nomes de referência, sem logotipos oficiais e sem
            conexão real.
          </p>
        </div>
      </section>

      <section id="planos" className="section section-paper" aria-labelledby="planos-title">
        <div className="wrap">
          <h2 id="planos-title" className="display section-title">
            Planos previstos
          </h2>
          <p className="section-lede">
            Valores do material de planejamento, apresentados como proposta — sem destaque de favorito,
            sem ciclo anual e sem cobrança.
          </p>
          <div className="plans">
            {PLANS.map((plan) => (
              <article className="plan card" key={plan.nome}>
                <h3>{plan.nome}</h3>
                <p className="price num">{plan.preco}</p>
                <p>{plan.desc}</p>
                <ul>
                  {plan.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href="/login" className="btn btn-plum">
                  Explorar demonstração
                </Link>
              </article>
            ))}
          </div>
          <p className="plans-note">
            Planos previstos, sujeitos a confirmação comercial. A demonstração é gratuita e não pede
            pagamento nem cartão.
          </p>
        </div>
      </section>

      <section id="faq" className="section section-paper" aria-labelledby="faq-title">
        <div className="wrap">
          <h2 id="faq-title" className="display section-title">
            Perguntas honestas
          </h2>
          <div className="faq" style={{ marginTop: "1.5rem" }}>
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p style={{ marginTop: "1.8rem" }}>
            <Link href="/login" className="btn btn-plum">
              Explorar demonstração <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
