"use client";

import Link from "next/link";
import { use, useState } from "react";
import { integrationErrorText, isSafeAuthorizeUrl } from "@/lib/integration-errors";
import { FERRAMENTAS_GOOGLE, GOOGLE_DESC, GOOGLE_ESCOPO_NOTA, GOOGLE_TITULO } from "@/lib/google-workspace";
import { NOTION_DESC } from "@/lib/notion";
import "../../workspace/workspace.css";

interface IntegrationConfig {
  nome: string;
  title: string;
  desc: string;
  logo?: string;
  /**
   * Ferramentas da suíte que a mila usa, com o ícone oficial, exibidas SOB o
   * nome da marca. Hoje só o Google usa isto (Drive e Planilhas) — no fluxo
   * OAuth (`isApiKeyGuided: false`). O Notion, que usa chave colada, tem o
   * `desc` + o passo a passo no lugar.
   */
  tools?: typeof FERRAMENTAS_GOOGLE;
  /** O que a mila faz e o que ela NÃO faz — a lojista autoriza sabendo. */
  escopoNota?: string;
  isApiKeyGuided?: boolean;
  /** Conectores que exigem DOIS valores (Jueri: código de cliente + token). */
  precisaClienteId?: boolean;
  clienteIdLabel?: string;
  chaveLabel?: string;
  /** Onde a lojista gera a credencial (texto literal da doc do provedor). */
  ondeGerar?: string;
  /** O que é o código de cliente, em uma frase. */
  oQueEClienteId?: string;
}

const KNOWN: Record<string, IntegrationConfig> = {
  jueri: {
    nome: "Jueri",
    title: "Conectar Jueri",
    desc: "Sincronize seu estoque, tabelas de atacado/varejo e maletas de consignado com a mila.",
    logo: "/integrations/jueri.png",
    isApiKeyGuided: true,
    // Jueri exige os DOIS valores (Código de Cliente + Token). Com um campo só
    // não há como conferir a credencial contra a API — e conferir é o ponto.
    precisaClienteId: true,
    clienteIdLabel: "Código de Cliente Jueri",
    chaveLabel: "Token de API",
    // Caminho literal da doc oficial (jueri.com.br/sis/docs → Autenticação).
    ondeGerar:
      'No Jueri, menu lateral → "Configurações" → "API" → botão "Gerar token".',
    oQueEClienteId:
      "É o ID da sua empresa no Jueri (o mesmo número que aparece na doc da API).",
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
    // "Conectar Google Workspace" sugeria a suíte inteira (e a pasta do Drive).
    // O que se conecta é o Drive + Planilhas da mila, e é isso que a tela diz.
    title: GOOGLE_TITULO,
    desc: GOOGLE_DESC,
    logo: "/integrations/google-workspace.svg",
    // Ícones das ferramentas que a mila REALMENTE usa, exibidos sob o nome.
    tools: FERRAMENTAS_GOOGLE,
    // O que a mila faz e o que ela NÃO faz — a lojista autoriza sabendo.
    escopoNota: GOOGLE_ESCOPO_NOTA,
    isApiKeyGuided: false,
  },
  notion: {
    nome: "Notion",
    title: "Conectar Notion",
    desc: NOTION_DESC,
    // Enquanto a integração usa token de conexão no vault, ela segue o mesmo
    // fluxo protegido de chave colada do Jueri (não inicia OAuth inválido).
    isApiKeyGuided: true,
  },
};

export default function IntegrationTransition({ params }: { params: Promise<{ app: string }> }) {
  const { app } = use(params);
  const key = app.toLowerCase();
  const info = KNOWN[key];

  const [apiKey, setApiKey] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [erro, setErro] = useState("");

  /** Conectores sem OAuth (Jueri, Notion): a lojista cola a chave. */
  async function handleGuidedKey(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setConnecting(true);
    try {
      const res = await fetch(`/api/oauth/${key}/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey.trim(), cliente_id: clienteId.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; detail?: string };
      if (res.ok && data.ok) {
        setConnected(true);
      } else {
        setErro(integrationErrorText(data.detail));
      }
    } catch {
      setErro("Não foi possível falar com a mila agora. Tente novamente.");
    } finally {
      setConnecting(false);
    }
  }

  /** Conectores OAuth: pede a URL de autorização e sai para o provedor. */
  async function handleOAuth(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setConnecting(true);
    try {
      const res = await fetch(`/api/oauth/${key}/start`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; authorize_url?: string; detail?: string };
      if (res.ok && data.ok && isSafeAuthorizeUrl(data.authorize_url)) {
        window.location.assign(data.authorize_url);
        return;
      }
      setErro(
        res.ok && data.ok
          ? "Não foi possível validar o endereço de autorização. Tente novamente."
          : integrationErrorText(data.detail),
      );
    } catch {
      setErro("Não foi possível falar com a mila agora. Tente novamente.");
    } finally {
      setConnecting(false);
    }
  }

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

  return (
    <div className="wrap auth-wrap">
      <div className="auth-grid">
        <div>
          <p className="tag">Conector oficial · mila.</p>
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
            <form onSubmit={handleGuidedKey}>
              <div className="integration-brand-badge">
                {info.logo ? (
                  <img src={info.logo} alt={info.nome} />
                ) : (
                  <span style={{ fontWeight: 700 }}>{info.nome}</span>
                )}
                <span className="integration-badge-tag">Passo a passo</span>
              </div>

              <ol className="integration-steps">
                <li>
                  <span className="step-num">1</span>
                  <span>No {info.nome}, acesse as configurações de <strong>Integrações / API</strong>.</span>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <span>
                    {info.precisaClienteId
                      ? "Copie o seu código de cliente e o token de API."
                      : "Crie ou copie a chave de conexão da integração."}
                  </span>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <span>Cole {info.precisaClienteId ? "os dois" : "a sua chave"} no campo abaixo:</span>
                </li>
              </ol>

              {info.ondeGerar ? (
                <p className="hint" style={{ marginBottom: "0.9rem" }}>
                  <strong>Onde gerar:</strong> {info.ondeGerar}
                </p>
              ) : null}

              {info.precisaClienteId ? (
                <div className="integration-field">
                  <label htmlFor="integration-cliente-id">
                    {info.clienteIdLabel ?? "Código de cliente"}
                  </label>
                  <input
                    id="integration-cliente-id"
                    type="text"
                    autoComplete="off"
                    placeholder="Ex.: 1"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                  />
                  {info.oQueEClienteId ? (
                    <p className="hint" style={{ marginTop: "0.4rem" }}>
                      {info.oQueEClienteId}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="integration-field">
                <label htmlFor="integration-api-key">
                  {info.chaveLabel ?? `Chave de conexão do ${info.nome}`}
                </label>
                <input
                  id="integration-api-key"
                  type="password"
                  autoComplete="off"
                  placeholder={
                    info.precisaClienteId
                      ? `Cole seu ${info.chaveLabel ?? "token"} aqui...`
                      : `Cole sua chave do ${info.nome} aqui...`
                  }
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
                <p className="hint" style={{ marginTop: "0.4rem" }}>
                  A mila <strong>confere</strong> com o {info.nome} antes de dizer que conectou.
                </p>
              </div>

              {erro ? (
                <p className="hint" role="alert" style={{ color: "#b3261e" }}>
                  {erro}
                </p>
              ) : null}

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
            /* Conectores OAuth padrão (Bling, Olist, Google) */
            <form onSubmit={handleOAuth}>
              <div className="integration-brand-badge">
                {info.logo ? (
                  <img src={info.logo} alt={info.nome} />
                ) : (
                  <span style={{ fontWeight: 700 }}>{info.nome}</span>
                )}
                <span className="integration-badge-tag">OAuth seguro</span>
              </div>

              {info.tools && info.tools.length > 0 ? (
                <div className="integration-tools" aria-label={`O que a mila faz no ${info.nome}`}>
                  {info.tools.map((t) => (
                    <div key={t.nome} className="integration-tool">
                      {t.icone ? <img src={t.icone} alt="" aria-hidden="true" /> : null}
                      <strong>{t.nome}</strong>
                      <span>{t.uso}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <p style={{ fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                {info.escopoNota ? (
                  info.escopoNota
                ) : (
                  <>
                    Conecte sua conta {info.nome} para a{" "}
                    <strong className="mila-highlight">mila</strong> gravar o que está
                    descrito acima. Ela acessa só o que é seu, em seu nome.
                  </>
                )}
              </p>

              {erro ? (
                <p className="hint" role="alert" style={{ color: "#b3261e" }}>
                  {erro}
                </p>
              ) : null}

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
