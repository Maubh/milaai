"use client";

import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { TextBone } from "@/components/WorkspaceSkeleton";
import { INTEGRACOES } from "@/lib/demo-data";
import { formatTrialEnd, readPlanStatus, type PlanSession } from "@/lib/plan-status";
import { RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import "./overview.css";

export interface SessionSnapshot extends PlanSession {
  display_name: string | null;
  connected: string[];
}

export type SessionState = { status: "loading" } | { status: "error" } | { status: "ready"; data: SessionSnapshot };

const NAMES = new Map(INTEGRACOES.map((i) => [i.id, i.nome]));
const releaseDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Arrow() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}


/**
 * A visão geral como a lojista vê, em qualquer estado da leitura. A página e o
 * esqueleto da rota usam este mesmo markup: enquanto a sessão não chega, só as
 * regiões de dado viram blocos, dentro dos próprios elementos de texto.
 */
export default function OverviewView({ session, waLink, onRetry }: { session: SessionState; waLink: string | null; onRetry?: () => void }) {
  const who = session.status === "ready" ? session.data : null;
  const titulo = who?.display_name ? `Olá, ${who.display_name}` : "Olá";
  const plan = who ? readPlanStatus(who) : null;
  const connectedNames = who ? who.connected.map((id) => NAMES.get(id) ?? id) : [];
  const latest = RELEASES[0];
  const loading = session.status === "loading";
  const failed = session.status === "error";

  return (
    <div className="ledger-page overview">
      {loading ? <p className="sr-only" role="status">Carregando a visão geral…</p> : null}
      <header className="ledger-page-head">
        <div>
          <h1 className="ledger-title">{loading ? <>Olá, <TextBone w="7ch" /></> : titulo}</h1>
          {loading ? <p className="ledger-lede overview-store"><TextBone w="14ch" /></p> : who?.store_name ? <p className="ledger-lede overview-store">{who.store_name}</p> : null}
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
            {waLink
              ? <LocalQr className="overview-qr-code" value={waLink} size={148} alt="QR code para conversar com a mila no WhatsApp" />
              : <div className="overview-qr-code" data-pending="" aria-hidden="true" />}
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
              <button type="button" className="ledger-button" onClick={onRetry}>Tentar de novo</button>
            </div>
          ) : null}
          <dl className="overview-status-list">
            <div className="overview-status-item">
              <dt>Integrações</dt>
              <dd className="overview-status-value">
                {loading ? <TextBone w="9ch" /> : failed ? <span className="overview-status-empty">Sem leitura</span> : (
                  <><span className="overview-figure">{connectedNames.length}</span> {connectedNames.length === 1 ? "conectada" : "conectadas"}</>
                )}
              </dd>
              <dd className="overview-status-detail">
                {loading ? <TextBone w="16ch" /> : failed ? null : connectedNames.length ? connectedNames.join(", ") : "Conecte o sistema de gestão, a loja virtual ou a lista de fornecedores."}
              </dd>
              <dd className="overview-status-action"><Link href="/workspace/integracoes" className="ledger-link">Ver integrações <Arrow /></Link></dd>
            </div>
            <div className="overview-status-item">
              <dt>Plano</dt>
              <dd className="overview-status-value">
                {loading ? <TextBone w="12ch" /> : failed || !plan ? <span className="overview-status-empty">Sem leitura</span> : plan.title}
              </dd>
              <dd className="overview-status-detail">
                {loading ? <><TextBone /><TextBone w="40%" /></> : failed || !plan ? null : plan.kind === "trial"
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
