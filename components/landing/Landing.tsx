"use client";

import { useEffect, useRef } from "react";
import { PLANS } from "@/components/PricingSection";
import { startLanding } from "./motion";
import "./landing.css";

/** Itens de um plano: os 5 primeiros no card, o resto na janela "Ver tudo o que inclui". */
function Feats({ features }: { features: readonly string[] }) {
  return (
    <ul className="feats">
      {features.map((f, i) => (
        <li key={f} className={[f === "Tudo do Essencial" ? "lead" : "", i >= 5 ? "more" : ""].join(" ").trim() || undefined}>
          <svg aria-hidden="true"><use href="#check" /></svg>
          {f}
        </li>
      ))}
    </ul>
  );
}

/**
 * Home do site (portada de output/landing-motion). A marcação é estática; o
 * comportamento (conversas, seta de rolagem, palavras que acendem, fios das
 * integrações, menu) roda em `motion.ts`, preso a este bloco.
 */
export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => (root.current ? startLanding(root.current) : undefined), []);

  return (
    <div className="lp" ref={root} suppressHydrationWarning>
      {/* marca o bloco antes da primeira pintura, para as entradas animadas não piscarem */}
      <script dangerouslySetInnerHTML={{ __html: "document.currentScript.parentElement.classList.add('js')" }} />
      <svg width="0" height="0" style={{"position": "absolute"} as React.CSSProperties} aria-hidden="true">
        <defs>
          <symbol id="wordmark" viewBox="0 0 614 224">
            <path d="M1 219 L1 143 C1 103 31 70 69 70 C113 70 147 104 147 148 L147 207 C126 211 112 198 112 182 L112 147 C112 123 93 105 70 105 C50 105 37 120 37 140 L37 190 C37 208 24 220 1 219 Z"/>
            <path d="M125 83 C138 74 152 70 168 70 C209 70 240.5 104 240.5 148 L240.5 218.5 C218 221 205.5 208 205.5 190.5 L205 148 C205 123 188 105 167 105 C159 105 152 107 146 110.5 C140 100 133 90 125 83 Z"/>
            <path d="M269 73 C286 66 302.5 77 302.5 95 L302.5 218 L269 218 Z"/>
            <path d="M331 2 C349 -3 365.5 10 365.5 29 L365.5 218 L331 218 Z"/>
            <path fillRule="evenodd" d="M548.5 148 C548.5 104 517 68.5 469 68.5 C425 68.5 390.5 101 390.5 145 C390.5 187 421 220.5 462 220.5 C484 220.5 503 210 516 192 L516 218 L548.5 218 Z M514.5 144.5 C514.5 118 494 98.5 468.5 98.5 C442.5 98.5 421.5 118 421.5 144.5 C421.5 171 442.5 190.5 468.5 190.5 C494 190.5 514.5 171 514.5 144.5 Z"/>
            <circle cx="284.5" cy="35" r="20.75"/>
            <circle cx="592.5" cy="198.5" r="20.75"/>
          </symbol>
          <symbol id="symbol" viewBox="0 68 308 156">
            <path d="M1 219 L1 143 C1 103 31 70 69 70 C113 70 147 104 147 148 L147 207 C126 211 112 198 112 182 L112 147 C112 123 93 105 70 105 C50 105 37 120 37 140 L37 190 C37 208 24 220 1 219 Z"/>
            <path d="M125 83 C138 74 152 70 168 70 C209 70 240.5 104 240.5 148 L240.5 218.5 C218 221 205.5 208 205.5 190.5 L205 148 C205 123 188 105 167 105 C159 105 152 107 146 110.5 C140 100 133 90 125 83 Z"/>
            <circle cx="284" cy="198.5" r="20.75"/>
          </symbol>
          <symbol id="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></symbol>
          <symbol id="check" viewBox="0 0 20 20"><path d="M16.5 5.5 7.8 14.2 3.5 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        </defs>
      </svg>

      <header className="nav" id="nav" data-open="false">
        <a className="nav-mark" href="#topo" aria-label="mila., início"><svg viewBox="0 0 614 224" aria-hidden="true"><use href="#wordmark"/></svg></a>
        <ul className="nav-links">
          <li><a href="#rotina">Rotina</a></li>
          <li><a href="#integracoes">Integrações</a></li>
          <li><a href="#planos">Planos</a></li>
          <li><a href="#duvidas">Dúvidas</a></li>
        </ul>
        <div className="nav-right">
          <a className="nav-cta" href="/login">Começar</a>
          <button className="nav-toggle" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Abrir menu"><span></span></button>
        </div>
        <nav className="nav-drawer" id="drawer" aria-label="Seções">
          <a href="#rotina">Rotina</a>
          <a href="#integracoes">Integrações</a>
          <a href="#planos">Planos</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
      </header>

      <div className="lp-main">
        {/* HERO */}
        <section className="hero dark grain" id="topo" aria-label="Apresentação">
          <div className="lp-wrap hero-grid">
            <div className="hero-copy">
              <span className="chip rise" style={{"--d": ".05s"} as React.CSSProperties}><b><i></i>WhatsApp</b> <span className="chip-long">Assistente de IA para lojas de joias e semijoias</span><span className="chip-short">IA para lojas de joias e semijoias</span></span>
              <h1 className="h1">
                <span className="line"><span style={{"--d": ".15s"} as React.CSSProperties}>Sua loja tem</span></span>
                <span className="line"><span style={{"--d": ".25s"} as React.CSSProperties}>uma assistente.</span></span>
                <span className="line"><span className="soft" style={{"--d": ".35s"} as React.CSSProperties}>E cabe no bolso.</span></span>
              </h1>
              <p className="hero-sub rise" style={{"--d": ".55s"} as React.CSSProperties}>
                A <strong>mila.</strong> vive no seu WhatsApp. Mande a foto da peça, a nota de compra ou a dúvida do dia: ela devolve o preço com margem, a descrição pronta e o próximo passo.
              </p>
              <div className="hero-actions rise" style={{"--d": ".7s"} as React.CSSProperties}>
                <a className="lp-btn btn-ivory" href="/login">Começar com a mila <span className="arrow"><svg aria-hidden="true"><use href="#arrow"/></svg></span></a>
                <a className="link-quiet" href="#rotina">Ver a rotina <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
              </div>
              <p className="hero-micro rise" style={{"--d": ".82s"} as React.CSSProperties}>Sem aplicativo novo: tudo no WhatsApp que você já usa.</p>
              <button className="cue rise" style={{"--d": ".95s"} as React.CSSProperties} type="button" aria-label="Ver a conversa">
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="phone-stage rise" style={{"--d": ".4s"} as React.CSSProperties}>
              <div>
                <div className="phone" role="img" aria-label="Conversa ilustrativa: a lojista manda a foto e o custo de uma argola, a mila responde com o preço sugerido e a margem, cadastra a peça no estoque e salva no Notion.">
                  <div className="screen" aria-hidden="true">
                    <div className="island"></div>
                    <div className="status"><span>09:41</span><svg viewBox="0 0 38 12"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="1" width="3" height="11" rx="1"/><rect x="23" y="1" width="13" height="10" rx="3" fill="none" stroke="#F6F3ED" strokeWidth="1.2"/><rect x="25" y="3" width="8" height="6" rx="1.5"/></svg></div>
                    <div className="chat-head">
                      <svg className="back" viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="#F6F3ED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="avatar"><svg viewBox="0 68 308 156"><use href="#symbol" y="68"/></svg></span>
                      <span><span className="chat-name">mila.</span><br /><span className="chat-state" data-state>online</span></span>
                    </div>
                    <div className="chat-body" id="hero-chat"></div>
                    <div className="chat-input"><span className="lp-field"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01"/></svg><span>Mensagem</span><svg viewBox="0 0 24 24"><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l8.6-8.6A4 4 0 1 1 18 8.8l-8.6 8.6a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span><span className="mic"><svg viewBox="0 0 16 16"><path d="M8 10a2.5 2.5 0 0 0 2.5-2.5v-4a2.5 2.5 0 0 0-5 0v4A2.5 2.5 0 0 0 8 10Zm4.5-2.5a.75.75 0 0 0-1.5 0 3 3 0 0 1-6 0 .75.75 0 0 0-1.5 0 4.5 4.5 0 0 0 3.75 4.43V13.5h1.5v-1.57A4.5 4.5 0 0 0 12.5 7.5Z"/></svg></span></div>
                  </div>
                </div>
                <p className="phone-caption">Conversa ilustrativa, em loop.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROTINA */}
        <section className="rotina light" id="rotina" aria-labelledby="rotina-title">
          <div className="lp-wrap">
            <div className="story" id="story">
              <div className="story-main">
                <div className="sec-head">
                  <div>
                    <span className="eyebrow label reveal">Um dia na loja</span>
                    <h2 className="h2 reveal" id="rotina-title" style={{"--d": ".08s"} as React.CSSProperties}>Seis momentos do dia <span className="soft" style={{"display": "block"} as React.CSSProperties}>em que a mila te ajuda.</span></h2>
                  </div>
                  <p className="lede reveal" style={{"--d": ".16s"} as React.CSSProperties}>Nada de painel novo para aprender. Você escreve como já escreve, e a mila trabalha com o que a loja já contou para ela.</p>
                </div>
                <ol className="chapters" id="chapters"></ol>
              </div>
              <div className="story-phone" aria-hidden="true">
                <div className="phone">
                  <div className="screen">
                    <div className="island"></div>
                    <div className="status"><span>09:41</span><svg viewBox="0 0 38 12"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="1" width="3" height="11" rx="1"/><rect x="23" y="1" width="13" height="10" rx="3" fill="none" stroke="#F6F3ED" strokeWidth="1.2"/><rect x="25" y="3" width="8" height="6" rx="1.5"/></svg></div>
                    <div className="chat-head">
                      <svg className="back" viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="#F6F3ED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="avatar"><svg viewBox="0 68 308 156"><use href="#symbol" y="68"/></svg></span>
                      <span><span className="chat-name">mila.</span><br /><span className="chat-state" data-state>online</span></span>
                    </div>
                    <div className="chat-body" id="story-chat"></div>
                    <div className="chat-input"><span className="lp-field"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01"/></svg><span>Mensagem</span><svg viewBox="0 0 24 24"><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l8.6-8.6A4 4 0 1 1 18 8.8l-8.6 8.6a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span><span className="mic"><svg viewBox="0 0 16 16"><path d="M8 10a2.5 2.5 0 0 0 2.5-2.5v-4a2.5 2.5 0 0 0-5 0v4A2.5 2.5 0 0 0 8 10Zm4.5-2.5a.75.75 0 0 0-1.5 0 3 3 0 0 1-6 0 .75.75 0 0 0-1.5 0 4.5 4.5 0 0 0 3.75 4.43V13.5h1.5v-1.57A4.5 4.5 0 0 0 12.5 7.5Z"/></svg></span></div>
                  </div>
                </div>
                <p className="phone-caption">Conversas ilustrativas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEMÓRIA */}
        <section className="memoria" aria-labelledby="memoria-label">
          <div className="lp-wrap">
            <span className="label" id="memoria-label">Ela lembra por você</span>
            <p className="manifest" id="manifest">Você conta uma vez a taxa da maquininha, o custo da embalagem e o seu markup. A mila guarda tudo, usa na próxima conta, e você ajusta quando quiser na sua área da loja.</p>
            <div className="memoria-foot">
              <span>Taxa da maquininha</span><span>Embalagem e banho</span><span>Markup padrão</span>
            </div>
          </div>
        </section>

        {/* INTEGRAÇÕES */}
        <section className="integra dark grain" id="integracoes" aria-labelledby="integra-title">
          <div className="lp-wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow label reveal">Integrações</span>
                <h2 className="h2 reveal" id="integra-title" style={{"--d": ".08s"} as React.CSSProperties}>As ferramentas da loja,<br /><span className="soft">na mesma conversa.</span></h2>
              </div>
              <p className="lede reveal" style={{"--d": ".16s"} as React.CSSProperties}>Você autoriza, a mila confere a credencial e passa a gravar nas ferramentas que a loja já usa, em nome da loja.</p>
            </div>
            <div className="graph" id="graph">
              <svg className="wires" id="wires" aria-hidden="true"></svg>
              <div className="nodes">
                <div className="node reveal"><span className="logo"><img src="/integrations/jueri.png" alt="Jueri" width="66" height="28" /></span><small>Estoque e custos</small></div>
                <div className="node reveal" style={{"--d": ".06s"} as React.CSSProperties}><span className="logo"><img src="/integrations/olist.svg" alt="Olist" width="60" height="28" /></span><small>Gestão da loja</small></div>
                <div className="node reveal" style={{"--d": ".12s"} as React.CSSProperties}><span className="logo"><svg viewBox="0 0 24 24" width="22" height="22" fill="#0052CC" aria-hidden="true"><path d="M21.5 0h-19A2.5 2.5 0 0 0 0 2.5v19A2.5 2.5 0 0 0 2.5 24h19a2.5 2.5 0 0 0 2.5-2.5v-19A2.5 2.5 0 0 0 21.5 0zM10.7 18.6c0 .5-.4.9-.9.9H4.6c-.5 0-.9-.4-.9-.9V5.4c0-.5.4-.9.9-.9h5.2c.5 0 .9.4.9.9v13.2zm9.6-5.1c0 .5-.4.9-.9.9h-5.2c-.5 0-.9-.4-.9-.9V5.4c0-.5.4-.9.9-.9h5.2c.5 0 .9.4.9.9v8.1z"/></svg>Trello</span><small>Quadros e rotina da loja</small></div>
              </div>
              <div className="hub reveal">
                <div className="hub-core"><svg viewBox="0 68 308 156" aria-hidden="true"><use href="#symbol" y="68"/></svg></div>
                <span>No seu WhatsApp</span>
              </div>
              <div className="nodes">
                <div className="node reveal"><span className="logo"><img src="/integrations/nuvemshop-wordmark.png" alt="Nuvemshop" width="104" height="25" style={{"height": "22px"} as React.CSSProperties} /></span><small>Sua loja virtual</small></div>
                <div className="node reveal" style={{"--d": ".06s"} as React.CSSProperties}><span className="logo"><img src="/integrations/google-workspace.svg" alt="Google Drive e Planilhas" width="120" height="22" style={{"height": "20px"} as React.CSSProperties} /></span><small>Lista de fornecedores</small></div>
                <div className="node reveal" style={{"--d": ".12s"} as React.CSSProperties}><span className="logo"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>Notion</span><small>Fornecedores e notas de compra</small></div>
              </div>
            </div>
            <p className="integra-note">As conexões dependem do seu plano e da autorização da sua loja. Estoque e vendas são do Pro.</p>
          </div>
        </section>

        {/* PLANOS */}
        <section className="planos light" id="planos" aria-labelledby="planos-title">
          <div className="lp-wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow label reveal">Planos</span>
                <h2 className="h2 reveal" id="planos-title" style={{"--d": ".08s"} as React.CSSProperties}>Essencial para começar.<br /><span className="soft">Pro para a loja toda.</span></h2>
              </div>
              <p className="lede reveal" style={{"--d": ".16s"} as React.CSSProperties}>O Essencial cuida do preço, da descrição e da nota de compra de cada peça. O Pro conecta estoque, loja virtual, balanço, fornecedores e Instagram.</p>
            </div>
            <div className="lp-plans">
              <article className="lp-plan reveal">
                <div className="plan-top"><h3>Essencial</h3></div>
                <p className="for">Precificação, margem e descrição de peças desde o primeiro dia.</p>
                <div className="lp-price"><span className="cur">R$</span><span className="amt lp-num">39</span><span className="per">/mês</span></div>
                <Feats features={PLANS[0].features} />
                <button className="feats-more" type="button" aria-haspopup="dialog">Ver tudo o que inclui</button>
                <a className="lp-btn btn-mineral" href="/login">Conhecer o Essencial <span className="arrow"><svg aria-hidden="true"><use href="#arrow"/></svg></span></a>
              </article>
              <article className="lp-plan pro-plan reveal" style={{"--d": ".1s"} as React.CSSProperties}>
                <div className="plan-top"><h3>Pro</h3><span className="label" style={{"color": "var(--sage)"} as React.CSSProperties}>Para a loja que cresce</span></div>
                <p className="for">Visão contínua de estoque, fornecedores, faturamento e conteúdo.</p>
                <div className="lp-price"><span className="cur">R$</span><span className="amt lp-num">69</span><span className="per">/mês</span></div>
                <Feats features={PLANS[1].features} />
                <button className="feats-more" type="button" aria-haspopup="dialog">Ver tudo o que inclui</button>
                <a className="lp-btn btn-ivory" href="/login">Conhecer o Pro <span className="arrow"><svg aria-hidden="true"><use href="#arrow"/></svg></span></a>
              </article>
            </div>

          </div>
        </section>

        {/* DÚVIDAS */}
        <section className="duvidas" id="duvidas" aria-labelledby="duvidas-title">
          <div className="lp-wrap faq-grid">
            <div className="faq-aside">
              <span className="eyebrow label">Dúvidas</span>
              <h2 className="h2" id="duvidas-title">Perguntas<br /><span className="soft" style={{"color": "#6F8A7D"} as React.CSSProperties}>de quem vende.</span></h2>
              <p>Não achou a sua? Pergunte para a própria mila no WhatsApp depois de entrar.</p>
            </div>
            <div className="lp-faq-list">
              <details><summary>Como a mila ajuda quem vende joias e semijoias no dia a dia?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">Ela calcula o preço de venda com margem real (Raio-X), considera custos de banho e pedraria, pesquisa preços da concorrência no Google Shopping, lê notas fiscais de compra (XML e PDF) e cria legendas para o Instagram. No Pro, também carrosséis, roteiros de Reels e o planejamento de posts.</p></details>
              <details><summary>Preciso repetir as taxas da maquininha ou meus custos a cada conversa?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">Não. A mila guarda as informações da sua loja conforme vocês conversam. Se você avisar a taxa média do cartão, os custos com embalagens ou o nome dos seus fornecedores, ela usa esses valores nos próximos cálculos.</p></details>
              <details><summary>Como funciona a publicação e consulta na Nuvemshop?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">No plano Pro, você conecta sua loja Nuvemshop com autorização segura. Pelo WhatsApp, consulta estoque e preços das peças e publica produtos novos com foto real, descrição técnica e preço de venda já calculado.</p></details>
              <details><summary>Como a mila ajuda quem usa Phibo, Jueri ou Olist?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">Para a Phibo, a mila entrega no WhatsApp uma planilha no layout oficial de importação do sistema. Para Jueri e Olist (Tiny), há conexão direta para gestão de estoque e notas, no Pro.</p></details>
              <details><summary>O que são as Vitrines Web?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">São links públicos montados com as fotos reais das suas peças, que funcionam como o catálogo da loja. A cliente navega pelas coleções no celular e chama você direto no WhatsApp para comprar, sem intermediário de pagamento nem taxa sobre as suas vendas.</p></details>
              <details><summary>Como funciona o caderno de fornecedores e o alerta de carência?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">Você registra os dados e prazos dos seus fabricantes de confiança e a mila avisa no WhatsApp antes de vencer o prazo de carência, para você não perder a reposição sem pedido mínimo.</p></details>
              <details><summary>Preciso instalar algum aplicativo?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">Não. A rotina com a mila acontece no aplicativo que você já usa o dia todo: o <strong>WhatsApp</strong>. Você manda mensagens, fotos de peças e notas fiscais e recebe as respostas e os arquivos ali mesmo.</p></details>
              <details><summary>Qual é a diferença entre o Essencial e o Pro?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">O <strong>Essencial (R$ 39/mês)</strong> cobre precificação com margem real, radar de concorrentes, leitor de notas, legenda de Instagram, caderno de fornecedores, PDF salvo no Google Drive ou no Notion e 1 vitrine web ativa. O <strong>Pro (R$ 69/mês)</strong> soma Nuvemshop no WhatsApp, vitrines ilimitadas, ERPs (Jueri, Olist e planilha para a Phibo), projeção de faturamento, pesquisa de fornecedores e marketing de Instagram.</p></details>
              <details><summary>Como faço para começar?<span className="plus" aria-hidden="true"></span></summary>
                <p className="a">Você entra com o seu número de WhatsApp, escolhe o Essencial ou o Pro e já começa a conversar com a mila no WhatsApp que você usa todo dia.</p></details>
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section className="final dark grain" aria-labelledby="final-title">
          <div className="lp-wrap">
            <h2 className="h2 reveal" id="final-title">Uma assistente para a loja toda, <span className="soft">no seu WhatsApp.</span></h2>
            <p className="reveal" style={{"--d": ".1s"} as React.CSSProperties}>Preço, descrição, estoque, fornecedores e Instagram. Entre com o seu número de WhatsApp e comece pelo que a loja precisa hoje.</p>
            <a className="lp-btn btn-ivory reveal" style={{"--d": ".18s"} as React.CSSProperties} href="/login">Começar com a mila <span className="arrow"><svg aria-hidden="true"><use href="#arrow"/></svg></span></a>
          </div>
        </section>
      </div>

      <dialog className="plan-dialog" id="plan-dialog" aria-labelledby="plan-dialog-title">
        <button className="dialog-close" type="button" aria-label="Fechar">×</button>
        <h3 id="plan-dialog-title"></h3>
        <ul className="feats"></ul>
      </dialog>
      <div className="scroll-fade" aria-hidden="true"></div>
      <button className="scroller nudge" id="scroller" type="button" aria-label="Ir para a próxima parte">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <svg className="foot-mark" viewBox="0 0 614 224" role="img" aria-label="mila."><use href="#wordmark"/></svg>
          <span className="foot-copy">© 2026 mila. · @usemila.ai</span>
          <nav aria-label="Legal">
            <a href="/privacidade">Política de privacidade</a>
            <a href="/termos">Termos de uso</a>
            <a href="/exclusao-de-dados">Exclusão de dados</a>
          </nav>
        </div>
      </footer>

    </div>
  );
}
