"use client";

import { useCallback, useEffect, useState } from "react";
import { orderErrorText } from "@/lib/plan-status";
import PlanView, { type OrderResult, type SessionData } from "./PlanView";

export default function WorkspacePlanoPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [orderingPlan, setOrderingPlan] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/session");
      const data = res.ok ? await res.json() : null;
      if (data && data.ok === true) {
        setSession(data);
      } else {
        setSession(null);
        setFailed(true);
      }
    } catch (err) {
      console.error("Falha ao carregar sessão:", err);
      setSession(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);

  // Erros do pedido como a produção mostra; o resto cai na mensagem geral.
  const ERROS_PEDIDO: Record<string, string> = {
    cpf_cnpj_invalido: "Confira o CPF ou CNPJ: os números não batem.",
    nome_obrigatorio: "Informe o nome completo ou a razão social.",
    assinatura_ativa: "Sua assinatura já está ativa. A troca de plano ainda não é feita por aqui.",
    asaas_indisponivel: "O sistema de pagamento não respondeu agora. Tente de novo em alguns minutos.",
    pagamento_indisponivel: "O pagamento pelo site ainda não está disponível. Tente de novo mais tarde.",
  };

  async function handleAssinar(planToOrder: "essencial" | "pro", pagador: { nome: string; documento: string }) {
    setOrderingPlan(planToOrder);
    setOrderResult(null);
    try {
      const res = await fetch("/api/billing/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToOrder, nome: pagador.nome, cpf_cnpj: pagador.documento }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setOrderResult({
          ok: false,
          msg: (typeof data.detail === "string" && ERROS_PEDIDO[data.detail]) || orderErrorText(res.status, data.detail),
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
        msg: orderErrorText(0),
      });
    } finally {
      setOrderingPlan(null);
    }
  }

  return <PlanView session={session} loading={loading} failed={failed} orderingPlan={orderingPlan} orderResult={orderResult} onRetry={loadSession} onOrder={handleAssinar} />;
}
