"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { INTEGRACOES } from "@/lib/demo-data";
import { defaultWaLink, getVerifiedWaLink } from "@/lib/onboarding";
import { formatTrialEnd, readPlanStatus, type PlanSession } from "@/lib/plan-status";
import { RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import "./overview.css";

interface SessionSnapshot extends PlanSession {
  display_name: string | null;
  connected: string[];
}

type SessionState = { status: "loading" } | { status: "error" } | { status: "ready"; data: SessionSnapshot };

const NAMES = new Map(INTEGRACOES.map((i) => [i.id, i.nome]));
const releaseDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Arrow() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

function Pending() {
  return <span className="ledger-skeleton" aria-hidden="true" />;
}

export default function WorkspaceHome() {
  const [waLink, setWaLink] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  const load = useCallback(() => {
    setSession({ status: "loading" });
    fetch("/api/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || data.ok !== true) {
          setSession({ status: "error" });
          return;
        }
        setSession({
          status: "ready",
          data: {
            display_name: typeof data.display_name === "string" ? data.display_name : null,
            store_name: typeof data.store_name === "string" ? data.store_name : null,
            plan: typeof data.plan === "string" ? data.plan : null,
            billing: typeof data.billing === "string" ? data.billing : null,
            role: typeof data.role === "string" ? data.role : null,
            trial_ends_at: typeof data.trial_ends_at === "string" ? data.trial_ends_at : null,
            connected: Array.isArray(data.connected) ? data.connected.filter((id: unknown): id is string => typeof id === "string") : [],
          },
        });
      })
      .catch(() => setSession({ status: "error" }));
  }, []);

  useEffect(() => {
    setWaLink(getVerifiedWaLink() ?? defaultWaLink());
    load();
  }, [load]);

  const who = session.status === "ready" ? session.data : null;
  const titulo = who?.display_name ? `Olá, ${who.display_name}` : "Olá";
  const plan = who ? readPlanStatus(who) : null;
  const connectedNames = who ? who.connected.map((id) => NAMES.get(id) ?? id) : [];
  const latest = RELEASES[0];
  const loading = session.status === "loading";
  const failed = session.status === "error";

  return (
    <div className="ledger-page overview">
      <header className="ledger-page-head">
        <div>
          <h1 className="ledger-title">{titulo}</h1>
          {who?.store_name ? <p className="ledger-lede overview-store">{who.store_name}</p> : null}
        </div>
      </header>

      <div className="overview-desk">
        <section className="overview-chat" aria-labelledby="overview-chat-title">
          <div className="overview-chat-copy">
            <h2 id="overview-chat-title">Conversar com a mila</h2>
            <p>Preço, legenda ou ajuda com uma peça. A mila responde no WhatsApp.</p>
            {waLink ? (
              <a href={waLink} className="overview-chat-action" target="_blank" rel="noopener noreferrer">
                Abrir WhatsApp <Arrow />
              </a>
            ) : (
              <button className="overview-chat-action" type="button" disabled>Abrir WhatsApp <Arrow /></button>
            )}
            <p className="overview-chat-hint">A conversa já abre com “Oi, mila”.</p>
          </div>
          <figure className="overview-qr">
            <LocalQr className="overview-qr-code" value={waLink ?? ""} size={148} alt="QR code para conversar com a mila no WhatsApp" />
            <figcaption>
              <strong>Abra no celular</strong>
              <span>Aponte a câmera para o QR code.</span>
            </figcaption>
          </figure>
        </section>

        <section className="desk-panel overview-status" aria-labelledby="overview-status-title" aria-busy={loading}>
          <div className="ledger-section-head">
            <h2 id="overview-status-title">Sua loja hoje</h2>
          </div>
          {failed ? (
            <div className="ledger-notice" data-tone="error" role="alert">
              <span>Não deu para ler as conexões e o plano agora.</span>
              <button type="button" className="ledger-button" onClick={load}>Tentar de novo</button>
            </div>
          ) : null}
          <dl className="overview-status-list">
            <div className="overview-status-item">
              <dt>Integrações</dt>
              <dd className="overview-status-value">
                {loading ? <Pending /> : failed ? <span className="overview-status-empty">Sem leitura</span> : (
                  <><span className="overview-figure">{connectedNames.length}</span> {connectedNames.length === 1 ? "conectada" : "conectadas"}</>
                )}
              </dd>
              <dd className="overview-status-detail">
                {loading || failed ? null : connectedNames.length ? connectedNames.join(", ") : "Conecte o sistema de gestão, a loja virtual ou a lista de fornecedores."}
              </dd>
              <dd className="overview-status-action"><Link href="/workspace/integracoes" className="ledger-link">Ver integrações <Arrow /></Link></dd>
            </div>
            <div className="overview-status-item">
              <dt>Plano</dt>
              <dd className="overview-status-value">
                {loading ? <Pending /> : failed || !plan ? <span className="overview-status-empty">Sem leitura</span> : plan.title}
              </dd>
              <dd className="overview-status-detail">
                {loading || failed || !plan ? null : plan.kind === "trial"
                  ? (plan.trialEnd ? `${plan.situation} até ${formatTrialEnd(plan.trialEnd)}` : `${plan.situation}. Data de fim não informada`)
                  : plan.situation}
              </dd>
              <dd className="overview-status-action"><Link href="/workspace/plano" className="ledger-link">Ver plano <Arrow /></Link></dd>
            </div>
          </dl>
        </section>

        {latest ? (
          <section className="desk-panel overview-release" aria-labelledby="overview-release-title">
            <div className="ledger-section-head">
              <h2 id="overview-release-title">Última versão</h2>
              <p>v{SYSTEM_VERSION} · {releaseDate.format(new Date(`${latest.date}T12:00:00Z`))}</p>
            </div>
            <h3>{latest.title}</h3>
            <p>{latest.summary}</p>
            <Link href="/workspace/novidades" className="ledger-link">Ver histórico <Arrow /></Link>
          </section>
        ) : null}
      </div>
    </div>
  );
}
