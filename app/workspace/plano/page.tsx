"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./plano.css";

interface SessionData {
  ok: boolean;
  logged: boolean;
  tenant: string | null;
  phone: string | null;
  plan: string;
  billing: string;
  role: string;
  trial_ends_at: string | null;
  store_name: string | null;
}

export default function WorkspacePlanoPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderingPlan, setOrderingPlan] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{
    ok: boolean;
    checkoutUrl?: string;
    orderRef?: string;
    msg?: string;
  } | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (err) {
        console.error("Falha ao carregar sessão:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const now = new Date();
  const trialEndsDate = session?.trial_ends_at
    ? new Date(session.trial_ends_at)
    : new Date("2026-11-04T23:14:28Z");

  const isFounder = session?.role === "founder" || session?.billing === "comped";
  const isPaid = session?.billing === "pago";
  const isTrialExpired =
    !isFounder &&
    !isPaid &&
    (session?.billing === "trial_expirado" ||
      (session?.billing === "pilot" && now > trialEndsDate) ||
      (!session?.billing && now > trialEndsDate));
  const trialOpen = now <= trialEndsDate && !isPaid && !isFounder && !isTrialExpired;
  const hiringLocked = isFounder || trialOpen;

  const currentPlan: "essencial" | "pro" =
    isTrialExpired ? "pro" : session?.plan === "essencial" ? "essencial" : "pro";
  const currentIsEssencial = !isTrialExpired && currentPlan === "essencial";
  const currentIsPro = !isTrialExpired && currentPlan === "pro";

  const statusTitle = isFounder
    ? "Plano Pro · founder"
    : isPaid
      ? currentPlan === "pro"
        ? "Plano Pro"
        : "Plano Essencial"
      : trialOpen
        ? "Plano Pro · 30 dias de teste"
        : isTrialExpired
          ? "Teste de 30 dias encerrado"
          : currentPlan === "essencial"
            ? "Plano Essencial"
            : "Plano Pro";

  async function handleAssinar(planToOrder: "essencial" | "pro") {
    setOrderingPlan(planToOrder);
    setOrderResult(null);
    try {
      const res = await fetch("/api/billing/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToOrder }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setOrderResult({
          ok: false,
          msg: data.detail || "Não foi possível gerar o pedido no momento. Tente novamente.",
        });
        return;
      }

      if (data.skip_checkout) {
        setOrderResult({
          ok: true,
          msg: "Sua conta já possui acesso liberado como cortesia/founder. Nenhuma cobrança é necessária.",
        });
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      setOrderResult({
        ok: true,
        orderRef: data.order_ref,
        msg: "Pedido gerado com sucesso! A ativação e liberação de uso ocorrem imediatamente após a confirmação do pagamento.",
      });
    } catch (err: unknown) {
      setOrderResult({
        ok: false,
        msg: "Erro de conexão ao processar assinatura.",
      });
    } finally {
      setOrderingPlan(null);
    }
  }

  return (
    <div className="work-wrap">
      <p className="work-back">
        <Link href="/workspace">← Visão geral</Link>
      </p>
        <h1 className="work-title">Meu plano</h1>
        <p className="work-lede">
          O plano que está valendo hoje. Quando o teste acabar, você escolhe se continua.
        </p>

        {loading ? (
          <div className="work-card">
            <p>Carregando...</p>
          </div>
        ) : (
          <>
            {/* Card de Status do Plano Atual */}
            <div className="plan-status-card">
              <div className="plan-status-header">
                <div>
                  <h2 className="plan-status-name">{statusTitle}</h2>
                  <p className="plan-status-meta">
                    {session?.phone && (
                      <>
                        WhatsApp <strong>{session.phone}</strong>
                      </>
                    )}
                    {session?.store_name && ` · ${session.store_name}`}
                  </p>
                </div>
                <div>
                  {isFounder && <span className="plan-status-badge">Sem cobrança</span>}
                  {isPaid && <span className="plan-status-badge">Em dia</span>}
                  {trialOpen && <span className="plan-status-badge">Em teste</span>}
                  {isTrialExpired && <span className="plan-status-badge is-ended">Teste encerrado</span>}
                </div>
              </div>

              {trialOpen && (
                <p className="plan-note">
                  Você está nos 30 dias de teste do Pro, sem cobrança, até{" "}
                  <strong>04/11/2026 às 23:14</strong>. Jueri, Olist, alerta de carência e
                  balanço no WhatsApp já valem. Os botões de contratar aparecem aqui depois
                  dessa data.
                </p>
              )}

              {isTrialExpired && (
                <p className="plan-note is-ended">
                  Os 30 dias de teste acabaram em 04/11/2026. Peças e cálculos continuam
                  guardados. Escolha Essencial ou Pro abaixo. Depois do pagamento, o WhatsApp
                  e este painel voltam na hora.
                </p>
              )}

              {isPaid && (
                <p className="plan-note">
                  Sua assinatura está em dia. Dá para mudar de plano quando quiser.
                </p>
              )}
            </div>

            {/* Feedback de pedido / checkout */}
            {orderResult && (
              <p className={`plan-note${orderResult.ok ? "" : " is-ended"}`} role="status">
                {orderResult.msg}
                {orderResult.orderRef ? ` Pedido ${orderResult.orderRef}.` : ""}
              </p>
            )}

            {/* Grade com os 2 Planos */}
            <div className="work-grid-2">
              {/* PLANO ESSENCIAL */}
              <div className={`card work-card plan-card${currentIsEssencial ? " plan-card-current" : ""}`}>
                <div>
                  {currentIsEssencial ? <p className="plan-card-flag">Seu plano</p> : null}
                  <h3 className="plan-card-name">
                    Plano Essencial
                  </h3>
                  <p className="plan-card-blurb">
                    Preço com margem, Raio-X e legendas para o Instagram.
                  </p>

                  <div className="plan-price-val">
                    R$&nbsp;39 <span>/mês</span>
                  </div>

                  <ul className="plan-feat-list">
                    <li>
                      Preço a partir da foto e do custo da peça
                    </li>
                    <li>
                      Raio-X de margem, taxas e impostos
                    </li>
                    <li>
                      Radar de concorrentes no Google Shopping
                    </li>
                    <li>
                      Legendas para Reels, posts e carrosséis
                    </li>
                    <li>
                      Leitura de notas de compra (XML e PDF)
                    </li>
                  </ul>
                </div>

                <div>
                  {currentIsEssencial ? (
                    <button className="plan-action-btn is-current" disabled>
                      Seu plano agora
                    </button>
                  ) : hiringLocked ? (
                    <button className="plan-action-btn" disabled>
                      No Pro até 04/11
                    </button>
                  ) : (
                    <button
                      className="btn plan-action-btn"
                      onClick={() => handleAssinar("essencial")}
                      disabled={orderingPlan !== null}
                    >
                      {orderingPlan === "essencial"
                        ? "Processando..."
                        : isPaid && currentPlan === "pro"
                        ? "Mudar para Essencial"
                        : "Contratar Plano Essencial"}
                    </button>
                  )}
                </div>
              </div>

              {/* PLANO PRO */}
              <div className={`card work-card plan-card${currentIsPro ? " plan-card-current" : ""}`}>
                <div>
                  {currentIsPro ? <p className="plan-card-flag">Seu plano</p> : null}
                  <h3 className="plan-card-name">
                    Plano Pro
                  </h3>
                  <p className="plan-card-blurb">
                    Estoque, ERP e fechamento no WhatsApp.
                  </p>

                  <div className="plan-price-val">
                    R$&nbsp;69 <span>/mês</span>
                  </div>

                  <ul className="plan-feat-list">
                    <li>
                      Tudo do Essencial, e ainda:
                    </li>
                    <li>
                      Jueri e Olist; planilha pronta para a Phibo
                    </li>
                    <li>
                      Notion e Google Planilhas
                    </li>
                    <li>
                      Balanço no WhatsApp nos dias 15 e 30
                    </li>
                    <li>
                      Aviso de carência de fornecedor
                    </li>
                  </ul>
                </div>

                <div>
                  {currentIsPro ? (
                    <button className="plan-action-btn is-current" disabled>
                      {trialOpen ? "Seu plano · até 04/11" : "Seu plano agora"}
                    </button>
                  ) : hiringLocked ? (
                    <button className="plan-action-btn" disabled>
                      No Essencial até 04/11
                    </button>
                  ) : (
                    <button
                      className="btn btn-plum plan-action-btn"
                      onClick={() => handleAssinar("pro")}
                      disabled={orderingPlan !== null}
                    >
                      {orderingPlan === "pro"
                        ? "Processando..."
                        : isPaid && currentPlan === "essencial"
                        ? "Mudar para Pro"
                        : "Contratar Plano Pro"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Informação sobre liberação imediata e segurança */}
            <p className="plan-pay-note">
              Pagamento no Asaas, Pix ou cartão. Quando cair, o plano entra na hora no WhatsApp e aqui.
            </p>
          </>
        )}
    </div>
  );
}
