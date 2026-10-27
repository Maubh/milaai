"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { integrationErrorText, isSafeAuthorizeUrl } from "@/lib/integration-errors";
import { FERRAMENTAS_GOOGLE, GOOGLE_DESC, GOOGLE_ESCOPO_NOTA, GOOGLE_PASSO_CAIXA, GOOGLE_TITULO } from "@/lib/google-workspace";
import { NOTION_DESC } from "@/lib/notion";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";
import { entrarDeNovo } from "@/lib/pos-login";
import NotionConnection from "@/components/NotionConnection";
import IntegrationConnectionLayout from "@/components/IntegrationConnectionLayout";
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
  /** O que a lojista precisa fazer na tela do provedor (Google: marcar a caixa do Drive). */
  passoNoProvedor?: string;
  /** Rótulo personalizado do botão de ação primária (ex.: 'Continuar com o Facebook'). */
  buttonLabel?: string;
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
  nuvemshop: {
    nome: "Nuvemshop",
    title: "Conectar Nuvemshop",
    desc: "Cadastre produtos com foto, descrição e preço na sua loja virtual em 1 clique pelo WhatsApp.",
    logo: "/integrations/nuvemshop-wordmark.png",
    escopoNota:
      "A mila sincroniza seus produtos e fotos criados a partir do WhatsApp diretamente no catálogo da sua Nuvemshop. Ela acessa apenas a sua loja, em seu nome.",
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
    passoNoProvedor: GOOGLE_PASSO_CAIXA,
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
  meta: {
    nome: "Meta",
    title: "Conectar com a Meta",
    desc: "Sincronize as peças e fotos da loja diretamente com o seu catálogo de produtos no Facebook e Instagram.",
    buttonLabel: "Continuar com o Facebook",
    escopoNota:
      "A mila sincroniza seus produtos e fotos diretamente no catálogo de produtos da Meta (Facebook e Instagram). Ela acessa apenas os catálogos do seu negócio, em seu nome.",
    isApiKeyGuided: false,
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
  const [waLink, setWaLink] = useState<string | null>(null);

  // Depois da montagem, como no workspace: o link verificado mora no storage.
  useEffect(() => { setWaLink(getVerifiedWaLink() ?? defaultWaLink()); }, []);

  /**
   * Sem sessão (link aberto direto do WhatsApp, num navegador onde ela nunca
   * entrou, ou sessão vencida): em vez de um erro sem saída, leva ao login e
   * guarda esta tela para o login devolver a lojista aqui.
   */
  function semSessao(status: number, detail?: string): boolean {
    if (status !== 401 && detail !== "no_session") return false;
    entrarDeNovo(`/integrations/${key}`, "sessao_integracao");
    return true;
  }

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
        setApiKey("");
        setConnected(true);
      } else if (semSessao(res.status, data.detail)) {
        return;
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
      if (semSessao(res.status, data.detail)) return;
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

  const back = (
    <Link href="/workspace/integracoes" className="connect-secondary">Voltar às integrações</Link>
  );

  if (!info) {
    return (
      <IntegrationConnectionLayout
        name="mila."
        title="Integração desconhecida"
        description={<>“{app}” não está entre as integrações da mila. Nada foi conectado.</>}
        brand={<span>mila.</span>}
      >
        <div className="notion-connect-panel">
          <h2>Escolha um caminho</h2>
          <div className="connect-actions">
            <Link href="/workspace/integracoes" className="notion-connect-submit">Ver integrações</Link>
            <Link href="/workspace" className="connect-secondary">Ir para a sua área</Link>
          </div>
        </div>
      </IntegrationConnectionLayout>
    );
  }

  if (key === "notion") {
    return <NotionConnection token={apiKey} onTokenChange={setApiKey} onSubmit={handleGuidedKey} connecting={connecting} connected={connected} error={erro} />;
  }

  return (
    <IntegrationConnectionLayout
      name={info.nome}
      title={key === "bling" ? "Bling, em breve na Mila" : info.title}
      description={info.desc}
      brand={info.logo ? <img src={info.logo} alt={info.nome} /> : <span>{info.nome}</span>}
    >
        <div className="notion-connect-panel" aria-label={`Conectar ${info.nome}`}>
          {key === "bling" ? (
            <>
              <h2>Estamos preparando essa conexão</h2>
              <p className="notion-connect-panel-intro">A integração estará disponível após a aprovação do app pela Bling.</p>
              <Link href="/workspace/integracoes" className="notion-connect-submit">Ver outras integrações</Link>
            </>
          ) : connected ? (
            <div className="notion-connect-success" role="status">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m7 12 3 3 7-7" /></svg>
              <h2>{info.nome} conectado</h2>
              <p>
                A mila conferiu o acesso com o {info.nome}. Volte ao WhatsApp para continuar a conversa.
              </p>
              {waLink ? (
                <a href={waLink} className="notion-connect-submit" target="_blank" rel="noopener noreferrer">
                  Abrir WhatsApp
                </a>
              ) : null}
              <Link href="/workspace/integracoes" className="connect-secondary">
                Ver todas as integrações no workspace
              </Link>
            </div>
          ) : info.isApiKeyGuided ? (
            /* Layout guiado (Jueri): passo a passo, código de cliente e token. */
            <form onSubmit={handleGuidedKey} aria-busy={connecting}>
              <h2>Passo a passo</h2>
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
                <p className="connect-where">
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
                    aria-describedby={info.oQueEClienteId ? "integration-cliente-id-hint" : undefined}
                    required
                  />
                  {info.oQueEClienteId ? (
                    <p id="integration-cliente-id-hint" className="connect-hint">
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
                  aria-describedby="integration-api-key-hint"
                  required
                />
                <p id="integration-api-key-hint" className="connect-hint">
                  A mila <strong>confere</strong> com o {info.nome} antes de dizer que conectou.
                </p>
              </div>

              {erro ? (
                <p className="connect-error" role="alert">
                  {erro}
                </p>
              ) : null}

              <div className="connect-actions">
                <button
                  type="submit"
                  className="notion-connect-submit"
                  disabled={connecting}
                >
                  {connecting ? "Testando conexão…" : "Conectar com a mila"}
                </button>
                {back}
              </div>
            </form>
          ) : (
            /* Conectores OAuth padrão (Olist, Nuvemshop, Google, Meta) */
            <form onSubmit={handleOAuth} aria-busy={connecting}>
              <h2>Autorização segura</h2>
              <p className="notion-connect-panel-intro">Você entra na conta do {info.nome} e autoriza por lá.</p>

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

              <p className="connect-scope">
                {info.escopoNota ? (
                  info.escopoNota
                ) : (
                  <>
                    Conecte sua conta {info.nome} para a mila gravar o que está
                    descrito acima. Ela acessa só o que é seu, em seu nome.
                  </>
                )}
              </p>

              {info.passoNoProvedor ? (
                <p className="connect-where">
                  <strong>Antes de continuar:</strong> {info.passoNoProvedor}
                </p>
              ) : null}

              {erro ? (
                <p className="connect-error" role="alert">
                  {erro}
                </p>
              ) : null}

              <div className="connect-actions">
                <button
                  type="submit"
                  className="notion-connect-submit"
                  disabled={connecting}
                >
                  {connecting ? "Conectando…" : info.buttonLabel ?? "Conectar com a mila"}
                </button>
                {back}
              </div>
            </form>
          )}
        </div>
    </IntegrationConnectionLayout>
  );
}
