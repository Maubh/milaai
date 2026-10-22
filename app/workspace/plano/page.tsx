"use client";

import { useEffect, useState } from "react";
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
  // trial_ends_at é o instante em que o teste acaba (00:00 do dia seguinte ao
  // último dia, em Brasília); o último dia de uso é o anterior a esse instante.
  const trialEndsDate = session?.trial_ends_at ? new Date(session.trial_ends_at) : null;
  const ultimoDiaTeste = trialEndsDate
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }).format(
        new Date(trialEndsDate.getTime() - 1),
      )
    : null;

  const billing = session?.billing ?? "";
  const isFounder = session?.role === "founder" || billing === "comped" || billing === "cortesia";
  const isPaid = billing === "pago" || billing === "atrasado";
  const isPilot = billing === "pilot" || billing === "piloto";
  const isTrialExpired =
    !isFounder && (billing === "trial_expirado" || (isPilot && trialEndsDate !== null && now >= trialEndsDate));
  const isCanceled = !isFounder && (billing === "cancelado" || billing === "expired");
  const trialOpen = isPilot && !isTrialExpired;
  // Durante o teste já dá para contratar: o pagamento confirmado vira `pago`
  // e o fim do teste não corta quem pagou.
  const hiringLocked = isFounder;
  const [contratando, setContratando] = useState<"essencial" | "pro" | null>(null);
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");

  const currentPlan: "essencial" | "pro" =
    isTrialExpired ? "pro" : session?.plan === "essencial" ? "essencial" : "pro";
  const semPlano = isTrialExpired || isCanceled;
  const currentIsEssencial = !semPlano && currentPlan === "essencial";
  const currentIsPro = !semPlano && currentPlan === "pro";

  const statusTitle = isFounder
    ? "Plano Pro · founder"
    : isPaid
      ? currentPlan === "pro"
        ? "Plano Pro"
        : "Plano Essencial"
      : trialOpen
        ? "Plano Pro · período de teste"
        : isTrialExpired
          ? "Período de teste encerrado"
          : isCanceled
            ? "Assinatura inativa"
            : currentPlan === "essencial"
            ? "Plano Essencial"
            : "Plano Pro";

  const ERROS_PEDIDO: Record<string, string> = {
    cpf_cnpj_invalido: "Confira o CPF ou CNPJ: os números não batem.",
    nome_obrigatorio: "Informe o nome completo ou a razão social.",
    assinatura_ativa: "Sua assinatura já está ativa. A troca de plano ainda não é feita por aqui.",
    asaas_indisponivel: "O sistema de pagamento não respondeu agora. Tente de novo em alguns minutos.",
    pagamento_indisponivel: "O pagamento pelo site ainda não está disponível. Tente de novo mais tarde.",
  };

  async function handleAssinar(planToOrder: "essencial" | "pro") {
    setOrderingPlan(planToOrder);
    setOrderResult(null);
    try {
      const res = await fetch("/api/billing/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToOrder, nome: nome.trim(), cpf_cnpj: documento }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setOrderResult({
          ok: false,
          msg: ERROS_PEDIDO[data.detail] || "Não foi possível gerar o pedido no momento. Tente novamente.",
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
    <div className="work-wrap workspace-plan-page">
              <h1 className="work-title">Meu plano</h1>
        <p className="work-lede">
          O plano que está valendo hoje. Quando o teste acabar, você escolhe se continua.
        </p>

        {loading ? (
          <div className="work-card">
            <p>Carregando…</p>
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
                    {session?.store_name && `${session.phone ? " · " : ""}${session.store_name}`}
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
                  Você está no período de teste do Pro, sem cobrança
                  {ultimoDiaTeste ? (
                    <>
                      , até <strong>{ultimoDiaTeste}</strong>
                    </>
                  ) : null}
                  . Jueri, Olist, alerta de carência e balanço no WhatsApp já valem. Se quiser, já
                  pode contratar abaixo: a primeira cobrança vence no dia da contratação e o
                  WhatsApp segue sem pausa quando o teste acabar.
                </p>
              )}

              {isTrialExpired && (
                <p className="plan-note is-ended">
                  O período de teste acabou{ultimoDiaTeste ? ` em ${ultimoDiaTeste}` : ""}. Peças e
                  cálculos continuam guardados. Escolha Essencial ou Pro abaixo. Depois do
                  pagamento, o WhatsApp e este painel voltam na hora.
                </p>
              )}

              {isCanceled && (
                <p className="plan-note is-ended">
                  Sua assinatura não está ativa. Peças e cálculos continuam guardados. Escolha
                  Essencial ou Pro abaixo para voltar.
                </p>
              )}

              {isPaid && (
                <p className="plan-note">
                  Sua assinatura está em dia. Dá para mudar de plano quando quiser.
                </p>
              )}
            </div>

            {/* Dados de quem paga: o Asaas exige nome e CPF/CNPJ na cobrança */}
            {contratando && (
              <form
                className="work-card plan-status-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAssinar(contratando);
                }}
              >
                <p className="plan-note">
                  Plano {contratando === "pro" ? "Pro" : "Essencial"}: para gerar a cobrança no Asaas,
                  informe quem paga. O CPF ou CNPJ vai só para o Asaas.
                </p>
                <div className="integration-field">
                  <label htmlFor="plano-nome">Nome completo ou razão social</label>
                  <input
                    id="plano-nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    required
                    minLength={3}
                    maxLength={120}
                  />
                </div>
                <div className="integration-field">
                  <label htmlFor="plano-documento">CPF ou CNPJ</label>
                  <input
                    id="plano-documento"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    inputMode="numeric"
                    required
                    maxLength={18}
                  />
                </div>
                <div>
                  <button className="btn btn-plum plan-action-btn" type="submit" disabled={orderingPlan !== null}>
                    {orderingPlan ? "Gerando cobrança…" : "Ir para o pagamento"}
                  </button>
                </div>
              </form>
            )}

            {/* Feedback de pedido / checkout */}
            {orderResult && (
              <p className={`plan-note${orderResult.ok ? "" : " is-ended"}`} role="status">
                {orderResult.msg}
                {orderResult.orderRef ? ` Pedido ${orderResult.orderRef}.` : ""}
              </p>
            )}

            {/* Grade com os 2 Planos */}
            <div className="work-grid-2 plan-grid">
              {/* PLANO ESSENCIAL */}
              <div className={`card work-card plan-card${currentIsEssencial ? " plan-card-current" : ""}`}>
                <div>
                  <p className={`plan-card-flag${currentIsEssencial ? "" : " is-placeholder"}`} aria-hidden={!currentIsEssencial}>Seu plano</p>
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
                      Raio-X da margem, com a taxa da maquininha e a embalagem
                    </li>
                    <li>
                      Custo da peça comprada no bruto: peso, milésimos de banho e perdas
                    </li>
                    <li>
                      Radar de preços dos concorrentes no Google Shopping
                    </li>
                    <li>
                      Descrições prontas para a loja virtual
                    </li>
                    <li>
                      Legenda de Instagram para cada peça
                    </li>
                    <li>
                      Leitura de notas de compra (XML e PDF)
                    </li>
                    <li>
                      Caderno de fornecedores no WhatsApp, no Notion ou no Google Planilhas
                    </li>
                    <li>
                      1 vitrine web ativa por vez, com fotos reais
                    </li>
                  </ul>
                </div>

                <div>
                  {currentIsEssencial && !trialOpen ? (
                    <button className="plan-action-btn is-current" disabled>
                      Seu plano agora
                    </button>
                  ) : hiringLocked ? (
                    <button className="plan-action-btn" disabled>
                      Sem cobrança
                    </button>
                  ) : isPaid ? (
                    <button className="plan-action-btn" disabled>
                      Troca de plano em breve
                    </button>
                  ) : (
                    <button
                      className="btn plan-action-btn"
                      onClick={() => setContratando("essencial")}
                      disabled={orderingPlan !== null}
                    >
                      Contratar Essencial
                    </button>
                  )}
                </div>
              </div>

              {/* PLANO PRO */}
              <div className={`card work-card plan-card${currentIsPro ? " plan-card-current" : ""}`}>
                <div>
                  <p className={`plan-card-flag${currentIsPro ? "" : " is-placeholder"}`} aria-hidden={!currentIsPro}>Seu plano</p>
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
                      Nuvemshop (produtos e pedidos), Jueri e Olist; planilha pronta para a Phibo
                    </li>
                    <li>
                      Vitrines web ilimitadas
                    </li>
                    <li>
                      Carrosséis, roteiros de Reels e planejamento semanal para o Instagram
                    </li>
                    <li>
                      Leitura do nicho e dos concorrentes no Instagram (4 análises por mês)
                    </li>
                    <li>
                      Pesquisa de fornecedores pelo site, catálogo ou Instagram
                    </li>
                    <li>
                      Balanço no WhatsApp no dia 15 e no último dia do mês
                    </li>
                    <li>
                      Aviso de carência de fornecedor
                    </li>
                  </ul>
                </div>

                <div>
                  {currentIsPro && !trialOpen ? (
                    <button className="plan-action-btn is-current" disabled>
                      Seu plano agora
                    </button>
                  ) : hiringLocked ? (
                    <button className="plan-action-btn" disabled>
                      Sem cobrança
                    </button>
                  ) : isPaid ? (
                    <button className="plan-action-btn" disabled>
                      Troca de plano em breve
                    </button>
                  ) : (
                    <button
                      className="btn btn-plum plan-action-btn"
                      onClick={() => setContratando("pro")}
                      disabled={orderingPlan !== null}
                    >
                      Contratar Pro
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Informação sobre liberação imediata e segurança */}
            <p className="plan-pay-note">
              Pagamento no Asaas, por Pix, boleto ou cartão. Quando cair, o plano entra na hora no WhatsApp e aqui.
            </p>
          </>
        )}
    </div>
  );
}
