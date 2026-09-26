"use client";

import Link from "next/link";
import { use, useState } from "react";
import "../../workspace/workspace.css";

interface IntegrationConfig {
  nome: string;
  title: string;
  desc: string;
  logo?: string;
  isApiKeyGuided?: boolean;
}

const KNOWN: Record<string, IntegrationConfig> = {
  jueri: {
    nome: "Jueri",
    title: "Conectar Jueri",
    desc: "Sincronize seu estoque, tabelas de atacado/varejo e maletas de consignado com a mila.",
    logo: "/integrations/jueri.png",
    isApiKeyGuided: true,
  },
  bling: {
    nome: "Bling",
    title: "Conectar Bling ERP",
    desc: "Notas fiscais, estoque e custos organizados por peça com a mila.",
    logo: "/integrations/bling-ink.svg",
    isApiKeyGuided: false,
  },
  olist: {
    nome: "Olist",
    title: "Conectar Olist",
    desc: "Estoque e custos organizados por peça com a mila.",
    logo: "/integrations/olist.svg",
    isApiKeyGuided: false,
  },
  google: {
    nome: "Google Workspace",
    title: "Conectar Google Workspace",
    desc: "Gmail, Agenda, Tarefas, Drive, Documentos, Planilhas e Apresentações — a suíte que você já usa, lado a lado com a mila.",
    logo: "/integrations/google-workspace.svg",
    isApiKeyGuided: false,
  },
  notion: {
    nome: "Notion",
    title: "Conectar Notion",
    desc: "Documentos, Wiki, Páginas e Bancos de dados — o espaço da marca com a mila.",
    isApiKeyGuided: false,
  },
};

export default function IntegrationTransition({ params }: { params: Promise<{ app: string }> }) {
  const { app } = use(params);
  const key = app.toLowerCase();
  const info = KNOWN[key];

  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  if (!info) {
    return (
      <div className="wrap auth-wrap">
        <p className="tag">Transição simulada</p>
        <h1 className="auth-title">Integração desconhecida</h1>
        <p className="auth-lede">
          “{app}” não está entre os conectores previstos (Bling, Olist, Jueri, Google, Notion). Nada foi
          conectado. Escolha um caminho válido abaixo.
        </p>
        <p style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
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

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 600);
  }

  return (
    <div className="wrap auth-wrap">
      <div className="auth-grid">
        <div>
          <p className="tag">Conector Oficial · mila.ai</p>
          <h1 className="auth-title">{info.title}</h1>
          <p className="auth-lede">{info.desc}</p>
          <p className="hint">
            Integração segura com a <span className="mila-highlight">mila</span>. Seus dados permanecem criptografados e protegidos.
          </p>
        </div>

        <div className="integration-card-guided" aria-label={`Conectar ${info.nome}`}>
          {connected ? (
            <div className="integration-success-card">
              <div className="integration-success-icon" aria-hidden="true">
                ✓
              </div>
              <h2 className="integration-success-title">Conectado com sucesso!</h2>
              <p className="integration-success-text">
                Pronto! Conexão realizada com sucesso. Pode voltar para sua conversa com a <span className="mila-highlight">mila</span> no WhatsApp.
              </p>
              <Link href="/conversa" className="btn btn-whatsapp" style={{ width: "100%", textDecoration: "none" }}>
                Voltar para o WhatsApp
              </Link>
              <Link href="/workspace/integracoes" className="hint" style={{ textDecoration: "underline" }}>
                ← Ver todas as integrações no workspace
              </Link>
            </div>
          ) : info.isApiKeyGuided ? (
            /* Layout Guiado Específico do Jueri */
            <form onSubmit={handleConnect}>
              <div className="integration-brand-badge">
                {info.logo ? (
                  <img src={info.logo} alt={info.nome} />
                ) : (
                  <span style={{ fontWeight: 700 }}>{info.nome}</span>
                )}
                <span className="integration-badge-tag">Passo a Passo</span>
              </div>

              <ol className="integration-steps">
                <li>
                  <span className="step-num">1</span>
                  <span>No seu Jueri, acesse o menu <strong>Configurações &gt; API</strong>.</span>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <span>Clique no botão <strong>&ldquo;Gerar / Copiar Chave&rdquo;</strong>.</span>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <span>Cole a sua chave no campo abaixo:</span>
                </li>
              </ol>

              <div className="integration-field">
                <label htmlFor="jueri-api-key">Chave de Conexão do Jueri</label>
                <input
                  id="jueri-api-key"
                  type="text"
                  placeholder="Cole sua chave do Jueri aqui..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button
                  type="submit"
                  className="btn btn-plum"
                  disabled={connecting}
                  style={{ width: "100%" }}
                >
                  {connecting ? "Testando conexão…" : "Conectar com a mila"}
                </button>
                <Link
                  href="/workspace/integracoes"
                  className="btn btn-ghost"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  ← Voltar às integrações
                </Link>
              </div>
            </form>
          ) : (
            /* Conectores OAuth padrão (Bling, Olist, Google, Notion) */
            <form onSubmit={handleConnect}>
              <div className="integration-brand-badge">
                {info.logo ? (
                  <img src={info.logo} alt={info.nome} />
                ) : (
                  <span style={{ fontWeight: 700 }}>{info.nome}</span>
                )}
                <span className="integration-badge-tag">OAuth Seguro</span>
              </div>

              <p style={{ fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                Autorize a <strong className="mila-highlight">mila</strong> a sincronizar pedidos, notas fiscais e estoque da sua conta {info.nome}.
              </p>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <button
                  type="submit"
                  className="btn btn-plum"
                  disabled={connecting}
                  style={{ width: "100%" }}
                >
                  {connecting ? "Conectando…" : "Conectar com a mila"}
                </button>
                <Link
                  href="/workspace/integracoes"
                  className="btn btn-ghost"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  ← Voltar às integrações
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
