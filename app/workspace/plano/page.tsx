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
    : new Date("2026-11-02T23:14:28Z");

  const isFounder = session?.role === "founder" || session?.billing === "comped";
  const isPaid = session?.billing === "pago";
  const isTrialActive =
    !isFounder && !isPaid && session?.billing === "pilot" && now <= trialEndsDate;
  const isTrialExpired =
    !isFounder &&
    !isPaid &&
    (session?.billing === "trial_expirado" ||
      (session?.billing === "pilot" && now > trialEndsDate));

  const currentPlan = session?.plan === "essencial" ? "essencial" : "pro";

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
      <p className="work-back" style={{ margin: "0 0 0.85rem" }}>
        <Link href="/workspace">← Visão geral</Link>
      </p>
        <p className="tag">Área logada</p>
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
                  <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--plum)" }}>
                    {isFounder && "Plano Pro · founder"}
                    {isPaid && (currentPlan === "pro" ? "Plano Pro" : "Plano Essencial")}
                    {isTrialActive && "Plano Pro · 30 dias de teste"}
                    {isTrialExpired && "Teste de 30 dias encerrado"}
                  </h2>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", color: "rgba(30,43,40,0.65)" }}>
                    {session?.phone && (
                      <>
                        WhatsApp <strong>{session.phone}</strong>
                      </>
                    )}
                    {session?.store_name && ` · ${session.store_name}`}
                  </p>
                </div>

                <div>
                  {isFounder && <span className="plan-status-badge active">Sem cobrança</span>}
                  {isPaid && <span className="plan-status-badge active">Em dia</span>}
                  {isTrialActive && <span className="plan-status-badge pilot">Em teste</span>}
                  {isTrialExpired && <span className="plan-status-badge expired">Teste encerrado</span>}
                </div>
              </div>

              {/* Mensagem contextual da situação do usuário */}
              {isTrialActive && (
                <div
                  style={{
                    background: "rgba(23,63,59,0.06)",
                    border: "1px solid var(--line)",
                    borderRadius: "10px",
                    padding: "0.9rem 1.1rem",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                  }}
                >
                  Você está nos 30 dias de teste do Pro, sem cobrança, até{" "}
                  <strong>02/11/2026 às 23:14</strong>. Jueri, Olist, alerta de carência e
                  balanço no WhatsApp já valem. Os botões de contratar aparecem aqui depois
                  dessa data.
                </div>
              )}

              {isTrialExpired && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "10px",
                    padding: "0.9rem 1.1rem",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                  }}
                >
                  Os 30 dias de teste acabaram em 02/11/2026. Peças e cálculos continuam
                  guardados. Escolha Essencial ou Pro abaixo. Depois do pagamento, o WhatsApp
                  e este painel voltam na hora.
                </div>
              )}

              {isPaid && (
                <div
                  style={{
                    background: "rgba(37,211,102,0.1)",
                    border: "1px solid rgba(37,211,102,0.25)",
                    borderRadius: "10px",
                    padding: "0.9rem 1.1rem",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                  }}
                >
                  Sua assinatura está em dia. Dá para mudar de plano quando quiser.
                </div>
              )}
            </div>

            {/* Feedback de pedido / checkout */}
            {orderResult && (
              <div
                style={{
                  background: orderResult.ok ? "rgba(37,211,102,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1px solid ${orderResult.ok ? "#25D366" : "#EF4444"}`,
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: orderResult.ok ? "#177a3d" : "#b91c1c" }}>
                  {orderResult.msg}
                </p>
                {orderResult.orderRef && (
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "var(--plum)" }}>
                    Referência do pedido: <code>{orderResult.orderRef}</code>
                  </p>
                )}
              </div>
            )}

            {/* Grade com os 2 Planos */}
            <div className="work-grid-2">
              {/* PLANO ESSENCIAL */}
              <div
                className="work-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "var(--warm-white)",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.4rem", margin: "0 0 0.4rem", color: "var(--plum)" }}>
                    Plano Essencial
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(30,43,40,0.7)" }}>
                    Preço com margem, Raio-X e legendas para o Instagram.
                  </p>

                  <div className="plan-price-val">
                    R$&nbsp;39 <span>/mês</span>
                  </div>

                  <ul className="plan-feat-list">
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Preço a partir da foto e do custo da peça
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Raio-X de margem, taxas e impostos
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Radar de concorrentes no Google Shopping
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Legendas para Reels, posts e carrosséis
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Leitura de notas de compra (XML e PDF)
                    </li>
                  </ul>
                </div>

                <div>
                  {isTrialActive ? (
                    <button className="plan-action-btn" disabled>
                      Já no teste Pro
                    </button>
                  ) : isPaid && currentPlan === "essencial" ? (
                    <button className="plan-action-btn" disabled>
                      Seu plano agora
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
                        ? "Downgrade para Essencial"
                        : "Contratar Plano Essencial"}
                    </button>
                  )}
                </div>
              </div>

              {/* PLANO PRO */}
              <div
                className="work-card plan-card-featured"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "var(--warm-white)",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.4rem", margin: "0 0 0.4rem", color: "var(--plum)" }}>
                    Plano Pro
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(30,43,40,0.7)" }}>
                    Estoque, ERP e fechamento no WhatsApp.
                  </p>

                  <div className="plan-price-val">
                    R$&nbsp;69 <span>/mês</span>
                  </div>

                  <ul className="plan-feat-list">
                    <li style={{ fontWeight: 600 }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Tudo do Essencial, e ainda:
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Jueri e Olist; planilha pronta para a Phibo
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Notion e Google Planilhas
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Balanço no WhatsApp nos dias 15 e 30
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Aviso de carência de fornecedor
                    </li>
                  </ul>
                </div>

                <div>
                  {isTrialActive ? (
                    <button className="plan-action-btn" disabled style={{ background: "rgba(23,63,59,0.12)", color: "var(--plum)", fontWeight: 700 }}>
                      Pro até 02/11
                    </button>
                  ) : isPaid && currentPlan === "pro" ? (
                    <button className="plan-action-btn" disabled style={{ background: "rgba(37,211,102,0.15)", color: "#177a3d" }}>
                      Seu plano agora
                    </button>
                  ) : (
                    <button
                      className="btn plan-action-btn"
                      style={{ background: "var(--plum)", color: "var(--warm-white)" }}
                      onClick={() => handleAssinar("pro")}
                      disabled={orderingPlan !== null}
                    >
                      {orderingPlan === "pro"
                        ? "Processando..."
                        : isPaid && currentPlan === "essencial"
                        ? "Upgrade para Plano Pro"
                        : "Contratar Plano Pro"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Informação sobre liberação imediata e segurança */}
            <div className="plan-pay-note">
              <div style={{ fontSize: "0.88rem", color: "rgba(30,43,40,0.8)", lineHeight: 1.5 }}>
                Pagamento no Asaas, Pix ou cartão. Quando cair, o plano entra na hora no WhatsApp e aqui.
              </div>
            </div>
          </>
        )}
    </div>
  );
}
