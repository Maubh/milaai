"use client";

import Link from "next/link";
import { use } from "react";
import "../../workspace/workspace.css";

const KNOWN: Record<string, { nome: string; desc: string }> = {
  jueri: { nome: "Jueri", desc: "Gestão completa de semijoias, consignados, estoque e custos." },
  bling: { nome: "Bling", desc: "Notas, estoque e custos organizados por peça." },
  olist: { nome: "Olist", desc: "Estoque e custos organizados por peça." },
  google: { nome: "Google", desc: "Fotos e planilhas que você já usa, lado a lado com o preço." },
  notion: { nome: "Notion", desc: "Catálogo e diretrizes de marca num só lugar." },
};

export default function IntegrationTransition({ params }: { params: Promise<{ app: string }> }) {
  const { app } = use(params);
  const key = app.toLowerCase();
  const info = KNOWN[key];

  if (!info) {
    return (
      <div className="wrap auth-wrap">
        <p className="tag">Transição simulada</p>
        <h1 className="auth-title">Integração desconhecida</h1>
        <p className="auth-lede">
          “{app}” não está entre os conectores previstos (Bling, Olist, Google, Notion). Nada foi
          conectado. Escolha um caminho válido abaixo.
        </p>
        <p style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <Link href="/conversa" className="btn btn-plum">
            Voltar à conversa
          </Link>
          <Link href="/workspace/integracoes" className="btn btn-ghost">
            Ver integrações
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="wrap auth-wrap">
      <div className="auth-grid">
        <div>
          <p className="tag">Transição simulada · sem OAuth real</p>
          <h1 className="auth-title">Conectar {info.nome}</h1>
          <p className="auth-lede">
            {info.desc} Na versão final, esta tela redirecionaria para a autorização oficial. Aqui, nada
            é autorizado de verdade: é uma passagem demonstrativa com retorno à conversa.
          </p>
          <p className="hint">
            Estado: demonstração. Nenhuma conta vinculada, nenhum token gerado, nada sai deste navegador.
          </p>
        </div>
        <div className="card auth-card" aria-label={`Transição simulada para ${info.nome}`}>
          <div className="provider-mark" aria-hidden="true">
            {info.nome.slice(0, 1)}
          </div>
          <p style={{ textAlign: "center", fontWeight: 650 }}>Autorização simulada de {info.nome}</p>
          <p className="hint" style={{ textAlign: "center" }}>
            Demonstração. O botão abaixo não abre o provedor real.
          </p>
          <Link href="/conversa" className="btn btn-plum" style={{ width: "100%" }}>
            Simular autorização e voltar à conversa
          </Link>
          <Link href="/workspace/integracoes" className="btn btn-ghost" style={{ width: "100%" }}>
            ← Voltar às integrações
          </Link>
        </div>
      </div>
    </div>
  );
}
