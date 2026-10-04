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
    <div className="work-main">
      <div className="work-wrap">
        <p className="tag">Área logada · assinatura</p>
        <h1 className="work-title">Meu plano &amp; Assinatura</h1>
        <p className="work-lede">
          Acompanhe seu status de acesso, conheça os recursos disponíveis e escolha o plano
          ideal para a rotina da sua loja de semijoias.
        </p>

        {loading ? (
          <div className="work-card">
            <p>Carregando dados da sua conta...</p>
          </div>
        ) : (
          <>
            {/* Card de Status do Plano Atual */}
            <div className="plan-status-card">
              <div className="plan-status-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--plum)" }}>
                    {isFounder && "Plano Pro · Acesso Vitalício (Founder)"}
                    {isPaid && (currentPlan === "pro" ? "Plano Pro · Ativo" : "Plano Essencial · Ativo")}
                    {isTrialActive && "Plano Pro · Piloto 30 dias (Ativo)"}
                    {isTrialExpired && "Piloto de 30 dias encerrado"}
                  </h2>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", color: "rgba(30,43,40,0.65)" }}>
                    {session?.phone && (
                      <>
                        WhatsApp vinculado: <strong>{session.phone}</strong>
                      </>
                    )}
                    {session?.tenant && ` · Loja: ${session.tenant}`}
                  </p>
                </div>

                <div>
                  {isFounder && <span className="plan-status-badge active">Vitalício</span>}
                  {isPaid && <span className="plan-status-badge active">Assinatura Ativa</span>}
                  {isTrialActive && <span className="plan-status-badge pilot">Piloto em Andamento</span>}
                  {isTrialExpired && <span className="plan-status-badge expired">Piloto Expirado</span>}
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
                  🎉 <strong>Você está no período de piloto oficial de 30 dias com o Plano Pro liberado.</strong>
                  <br />
                  Seu acesso completo com integrações de ERP (Jueri e Olist), alertas de carência e balanços
                  automáticos está ativo sem custo até <strong>02/11/2026 às 23:14</strong>. Durante este período,
                  o plano Pro já está fixado para você. A partir do encerramento do piloto, a contratação dos planos
                  estará liberada aqui para você manter o serviço sem interrupções.
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
                  ⚠️ <strong>Seus 30 dias de piloto da mila. foram concluídos em 02/11/2026.</strong>
                  <br />
                  Seus dados, histórico de peças e cálculos continuam 100% seguros. Escolha abaixo entre o{" "}
                  <strong>Plano Essencial</strong> ou <strong>Plano Pro</strong> para reativar seu acesso. A liberação
                  para uso no WhatsApp e aqui no painel ocorre de forma <strong>imediata</strong> após a confirmação do pagamento.
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
                  ✅ <strong>Sua assinatura está ativa e regular.</strong>
                  <br />
                  Você pode alternar entre os planos ou gerenciar sua forma de pagamento a qualquer momento.
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
                    Ideal para precificação ágil, raio-x de margem e legendas para Instagram.
                  </p>

                  <div className="plan-price-val">
                    R$&nbsp;39 <span>/mês</span>
                  </div>

                  <ul className="plan-feat-list">
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Precificação inteligente com foto e custo real
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Raio-X de margem líquida, taxas e impostos
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Radar de preços médios de mercado
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
                      Leitura de notas fiscais de compra (XML/DANFE)
                    </li>
                  </ul>
                </div>

                <div>
                  {isTrialActive ? (
                    <button className="plan-action-btn" disabled>
                      Incluso no seu Piloto Pro
                    </button>
                  ) : isPaid && currentPlan === "essencial" ? (
                    <button className="plan-action-btn" disabled>
                      Seu Plano Atual
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
                    Automação comercial completa, ERPs, estoque e fechamentos proativos no WhatsApp.
                  </p>

                  <div className="plan-price-val">
                    R$&nbsp;69 <span>/mês</span>
                  </div>

                  <ul className="plan-feat-list">
                    <li style={{ fontWeight: 600 }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Tudo o que o Plano Essencial oferece +
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Integração com ERP Jueri e Olist (planilha pronta para Phibo)
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sincronização com Notion e Google Planilhas
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Fechamentos automáticos no WhatsApp (dia 15 e dia 30)
                    </li>
                    <li>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="#173F3B">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Alertas automáticos de carência de fornecedores
                    </li>
                  </ul>
                </div>

                <div>
                  {isTrialActive ? (
                    <button className="plan-action-btn" disabled style={{ background: "rgba(23,63,59,0.12)", color: "var(--plum)", fontWeight: 700 }}>
                      Plano Ativo (Piloto 30 dias até 02/11)
                    </button>
                  ) : isPaid && currentPlan === "pro" ? (
                    <button className="plan-action-btn" disabled style={{ background: "rgba(37,211,102,0.15)", color: "#177a3d" }}>
                      Seu Plano Atual (Ativo)
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
            <div style={{ marginTop: "2rem", padding: "1.2rem", background: "var(--warm-white)", border: "1px solid var(--line)", borderRadius: "12px", display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ fontSize: "1.8rem" }}>⚡</div>
              <div style={{ fontSize: "0.88rem", color: "rgba(30,43,40,0.8)", lineHeight: 1.5 }}>
                <strong>Liberação imediata para uso:</strong> Os pagamentos são processados com segurança via Asaas (Pix e Cartão de Crédito). Assim que o pagamento for aprovado, seu plano é atualizado instantaneamente e todos os recursos no WhatsApp da Mila são liberados no mesmo segundo.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
