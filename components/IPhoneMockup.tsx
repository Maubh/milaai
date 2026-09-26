"use client";

/**
 * Interface do WhatsApp da mila
 * Demonstração e-commerce: argola frontal cravejada com Raio-X de Custos,
 * descrição pronta pro site e legenda pro Instagram, em mensagens animadas.
 */
import { useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

type Step =
  | { kind: "msg"; id: number }
  | { kind: "typing" }
  | { kind: "done" };

interface ChatMsg {
  id: number;
  from: "lojista" | "socia";
  time: string;
}

const SCRIPT: ChatMsg[] = [
  { id: 0, from: "lojista", time: "10:12" },
  { id: 1, from: "socia", time: "10:12" },
  { id: 2, from: "lojista", time: "10:13" },
  { id: 3, from: "socia", time: "10:13" },
  { id: 4, from: "lojista", time: "10:14" },
  { id: 5, from: "socia", time: "10:14" },
];

const INITIAL_DELAY = 600;
const STEP_DELAY = 1200;
const TYPING_MS = 1300;
const HOLD_MS = 7200;
const LOOP_GAP_MS = 1200;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onChange = () => setReduced(m.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export default function IPhoneMockup() {
  // Passos: vazio(-1), msg0(0), typing(1), msg1_raiox(2), typing(3), msg2_ecommerce(4),
  // msg3(5), typing(6), msg4_legenda(7), msg5(8), done(9)
  const MAX_STEP = 9;
  const [step, advance] = useReducer(
    (s: number, a: "next" | "reset" | "complete") => {
      if (a === "reset") return -1;
      if (a === "complete") return MAX_STEP;
      return Math.min(s + 1, MAX_STEP);
    },
    -1,
  );
  const chatRef = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      advance("complete");
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const last = step === MAX_STEP;
    const typingStep = step === 1 || step === 3 || step === 6;
    const delay = last
      ? HOLD_MS + LOOP_GAP_MS
      : typingStep
        ? TYPING_MS
        : step === -1
          ? INITIAL_DELAY
          : step === 2
            ? 3200 // Pausa após o Raio-X para leitura antes da descrição
            : step === 4
              ? 2400 // Pausa após a descrição e-commerce
              : STEP_DELAY;
    timer = setTimeout(() => advance(last ? "reset" : "next"), delay);
    return () => clearTimeout(timer);
  }, [step, reduced]);

  useEffect(() => {
    const el = chatRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [step]);

  const visible: Step[] = [];
  if (step >= 0) visible.push({ kind: "msg", id: 0 });
  if (step >= 1) {
    if (step === 1) visible.push({ kind: "typing" });
    else visible.push({ kind: "msg", id: 1 });
  }
  if (step >= 3) {
    if (step === 3) visible.push({ kind: "typing" });
    else visible.push({ kind: "msg", id: 2 });
  }
  if (step >= 5) visible.push({ kind: "msg", id: 3 });
  if (step >= 6) {
    if (step === 6) visible.push({ kind: "typing" });
    else visible.push({ kind: "msg", id: 4 });
  }
  if (step >= 8) visible.push({ kind: "msg", id: 5 });

  const done = step === MAX_STEP;
  const msgs = visible.filter((s): s is { kind: "msg"; id: number } => s.kind === "msg");
  const typing = visible.some((s) => s.kind === "typing");

  return (
    <MotionConfig reducedMotion={reduced ? "user" : "never"}>
      <figure className="iphone-figure">
        <div
          className="iphone15"
          role="img"
          aria-label="Demonstração da mila no WhatsApp: a empresária envia foto da argola frontal cravejada e recebe o Raio-X de custos transparente, descrição pronta para o e-commerce e legenda para o Instagram."
        >
          <svg
            className="iphone15-frame"
            viewBox="0 0 433 882"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="ip15-silver" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e8e8ec" />
                <stop offset="0.5" stopColor="#9a9aa2" />
                <stop offset="1" stopColor="#d5d5db" />
              </linearGradient>
              <linearGradient id="wa-photo-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2c2826" />
                <stop offset="1" stopColor="#1a1819" />
              </linearGradient>
              <linearGradient id="gold-ring-metal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f7e4b5" />
                <stop offset="35%" stopColor="#d8b26e" />
                <stop offset="70%" stopColor="#aa833e" />
                <stop offset="100%" stopColor="#e8cca0" />
              </linearGradient>
            </defs>
            <rect x="0.5" y="176" width="4" height="30" rx="2" fill="#8a8a92" />
            <rect x="0.5" y="228" width="4" height="54" rx="2" fill="#8a8a92" />
            <rect x="0.5" y="290" width="4" height="54" rx="2" fill="#8a8a92" />
            <rect x="428.5" y="248" width="4" height="78" rx="2" fill="#8a8a92" />
            <rect
              x="3"
              y="3"
              width="427"
              height="876"
              rx="88"
              fill="url(#ip15-silver)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.5"
            />
            <rect x="14" y="14" width="405" height="854" rx="77" fill="#000" />
            <rect x="156" y="32" width="121" height="33" rx="16.5" fill="#000" />
            <circle cx="252" cy="48.5" r="6" fill="#1a2333" />
            <circle cx="252" cy="48.5" r="2.4" fill="#0b1220" />
          </svg>

          <div className="iphone15-screen gx-screen" aria-hidden="true">
            <div className="gx-status">
              <span className="num">09:41</span>
              <span className="gx-status-icons">
                <svg viewBox="0 0 24 12" width="24" height="12" focusable="false">
                  <rect x="0" y="7" width="3" height="5" rx="0.8" fill="currentColor" />
                  <rect x="5" y="5" width="3" height="7" rx="0.8" fill="currentColor" />
                  <rect x="10" y="2.5" width="3" height="9.5" rx="0.8" fill="currentColor" />
                  <rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" opacity="0.35" />
                </svg>
              </span>
            </div>

            <div className="gx-head">
              <svg className="gx-icon" viewBox="0 0 24 24" width="16" height="16" focusable="false">
                <path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="gx-avatar">m</span>
              <span className="gx-id">
                <strong>mila.ai ✨</strong>
                <small>sua assistente de negócios</small>
              </span>
              <span className="gx-actions">
                <svg className="gx-icon" viewBox="0 0 24 24" width="16" height="16" focusable="false">
                  <rect x="2" y="7" width="12" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M14 10.5l7-3.5v10l-7-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                <svg className="gx-icon" viewBox="0 0 24 24" width="16" height="16" focusable="false">
                  <path d="M5 4h4l2 5-2.5 1.5c.8 2.2 2.6 4 4.8 4.8L14.8 13l5 2v4c0 .6-.4 1-1 1C10.6 20 4 13.4 4 5c0-.6.4-1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                <svg className="gx-icon" viewBox="0 0 24 24" width="14" height="14" focusable="false">
                  <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                </svg>
              </span>
            </div>

            <div className="gx-chat" data-testid="mockup-chat" ref={chatRef}>
              <p className="gx-date">Hoje</p>
              <AnimatePresence initial={false}>
                {msgs.map((s) => (
                  <motion.div
                    key={s.id}
                    className={
                      SCRIPT[s.id].from === "lojista"
                        ? "gx-bubble gx-out"
                        : "gx-bubble gx-in"
                    }
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    data-testid={done && s.id === 5 ? "mockup-final" : `mockup-msg-${s.id}`}
                  >
                    {s.id === 0 ? (
                      <>
                        <img
                          className="gx-photo"
                          src="/products/argola-frontal-cravejada.png"
                          alt="Argola frontal cravejada em zircônias, com pino e fecho click visíveis"
                        />
                        <span className="gx-text">
                          mila, chegou reposição da argola frontal cravejada ✨ Paguei R$&nbsp;22,00 na fábrica. Me passa o preço ideal e a descrição pro meu site?
                        </span>
                        <span className="gx-stamp num">
                          {SCRIPT[s.id].time}
                          <svg viewBox="0 0 18 12" width="15" height="10" focusable="false">
                            <path d="M1 6.5l3.2 3.2L10 3M7 6.8l3.2 3.2L16 3.5" fill="none" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </>
                    ) : s.id === 1 ? (
                      <div className="gx-raiox">
                        <div className="gx-raiox-header">
                          <span className="gx-raiox-badge">✨ Sugestão de preço: <strong>R$&nbsp;119,90</strong></span>
                          <span className="gx-raiox-sub">(Sua margem limpa no bolso: <strong>R$&nbsp;38,40 | 32%</strong>)</span>
                        </div>

                        <div className="gx-raiox-section">
                          <div className="gx-raiox-title">📋 Raio-X da sua conta:</div>
                          <ul className="gx-raiox-items">
                            <li><span>• Custo da peça:</span> <strong>R$&nbsp;22,00</strong></li>
                            <li><span>• Embalagem:</span> <strong>R$&nbsp;6,50</strong></li>
                            <li><span>• Rateio custos fixos:</span> <span><strong>R$&nbsp;10,00</strong> <small>(aluguel/luz diluído)</small></span></li>
                            <li><span>• Taxa cartão + impostos:</span> <strong>R$&nbsp;13,19</strong></li>
                            <li className="gx-raiox-line-cost"><span>• Custo total da operação:</span> <strong>R$&nbsp;51,69</strong></li>
                            <li className="gx-raiox-line-profit"><span>• Seu lucro real:</span> <strong>R$&nbsp;68,21</strong></li>
                          </ul>
                        </div>

                        <div className="gx-raiox-market">
                          <div className="gx-raiox-market-header">🔍 Concorrência na sua região: <strong>R$&nbsp;110 a R$&nbsp;139</strong></div>
                          <span className="gx-raiox-market-note">(Seu preço está perfeito e protege sua margem!)</span>
                        </div>

                        <div className="gx-raiox-commerce">
                          <div className="gx-raiox-title">🛍️ Descrição pronta para seu e-commerce:</div>
                          <p className="gx-raiox-commerce-text">
                            Argola frontal cravejada em zircônias (banho ouro 18k). Design frontal
                            anatômico que valoriza o visual, cravação delicada com microzircônias
                            cristal e fecho de encaixe seguro. Hipoalergênica, níquel-free e com
                            verniz protetor de alta durabilidade. Perfeita para protagonizar o
                            primeiro furo ou compor mix elegantes.
                          </p>
                        </div>

                        <span className="gx-raiox-insta">📱 (Se quiser, também tenho a legenda pronta para postar no Instagram dessa peça!)</span>

                        <span className="gx-stamp num">{SCRIPT[s.id].time}</span>
                      </div>
                    ) : s.id === 2 ? (
                      <>
                        <span className="gx-text">Amei a descrição! Manda a legenda do Instagram? 📱</span>
                        <span className="gx-stamp num">
                          {SCRIPT[s.id].time}
                          <svg viewBox="0 0 18 12" width="15" height="10" focusable="false">
                            <path d="M1 6.5l3.2 3.2L10 3M7 6.8l3.2 3.2L16 3.5" fill="none" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </>
                    ) : s.id === 3 ? (
                      <>
                        <span className="gx-text">
                          Tem sim ✨ “Brilho novo por aqui: argola frontal cravejada em zircônias, leve e elegante pro dia a dia. Chama na direct pra garantir a sua! 📲💛”
                        </span>
                        <span className="gx-stamp num">{SCRIPT[s.id].time}</span>
                      </>
                    ) : s.id === 4 ? (
                      <>
                        <span className="gx-text">Aprovado, vou publicar hoje! 👍💛</span>
                        <span className="gx-stamp num">
                          {SCRIPT[s.id].time}
                          <svg viewBox="0 0 18 12" width="15" height="10" focusable="false">
                            <path d="M1 6.5l3.2 3.2L10 3M7 6.8l3.2 3.2L16 3.5" fill="none" stroke="#53bdeb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="gx-text">
                          Combinado 💛 Quando chegar novidade, me chama que eu precifico na hora!
                        </span>
                        <span className="gx-stamp num">{SCRIPT[s.id].time}</span>
                      </>
                    )}
                  </motion.div>
                ))}
                {typing ? (
                  <motion.p
                    key="typing"
                    className="gx-bubble gx-in gx-typing"
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                    data-testid="mockup-typing"
                  >
                    <span className="gx-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            <p className="gx-system">🔒 Mensagens protegidas com criptografia de ponta a ponta</p>

            <div className="gx-composer" data-testid="mockup-composer">
              <svg className="gx-icon gx-emoji" viewBox="0 0 24 24" width="20" height="20" focusable="false">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="9" cy="10" r="1.2" fill="currentColor" />
                <circle cx="15" cy="10" r="1.2" fill="currentColor" />
                <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <div className="gx-field">
                <span className="gx-field-text">Mensagem</span>
                <svg className="gx-icon gx-dim" viewBox="0 0 24 24" width="17" height="17" focusable="false">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg className="gx-icon gx-dim" viewBox="0 0 24 24" width="17" height="17" focusable="false">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </div>
              <span className="gx-mic">
                <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
                  <rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5.5 11.5c0 3.4 2.6 6.2 6 6.5v2.5M12 20.5v-2.5M18.5 11.5c0 1.7-.7 3.2-1.8 4.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </div>
            <span className="gx-home" data-testid="mockup-homebar" />
          </div>
        </div>
        <figcaption className="iphone-caption">
          mila.ai no WhatsApp · Inteligência comercial em tempo real
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
