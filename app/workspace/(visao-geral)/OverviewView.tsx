"use client";

import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { TextBone } from "@/components/WorkspaceSkeleton";
import { INTEGRACOES } from "@/lib/demo-data";
import type { ProviderLive } from "@/lib/integration-catalog";
import { connectedTools, failureText, overviewSteps, STARTERS, withText, type Load } from "@/lib/overview-steps";
import { formatTrialLastDay, readPlanStatus, type PlanSession, type PlanStatus } from "@/lib/plan-status";
import { RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import "./overview.css";

export interface SessionSnapshot extends PlanSession {
  display_name: string | null;
}

export type SessionState = Load<SessionSnapshot>;
export type ProvidersState = Load<ProviderLive[]>;

const NAMES = new Map(INTEGRACOES.map((i) => [i.id, i.nome]));
const releaseDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Arrow() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

function planDetail(plan: PlanStatus) {
  if (plan.kind !== "trial") return plan.situation;
  return plan.trialEnd ? `${plan.situation} até ${formatTrialLastDay(plan.trialEnd)}` : `${plan.situation}. Data de fim não informada`;
}

/**
 * Cartão que leva a uma página: o cartão inteiro é o link, então seleção,
 * Ctrl/Cmd+clique, botão do meio e menu de contexto são os do navegador.
 */
function Tile({ href, label, id, action, meta, children }: { href: string; label: string; id: string; action: string; meta?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="desk-tile overview-tile">
      <h2 id={id} className="overview-tile-label">{label}</h2>
      {meta ? <p className="overview-tile-meta">{meta}</p> : null}
      {children}
      <span className="ledger-link desk-tile-action">{action} <Arrow /></span>
    </Link>
  );
}

/**
 * A visão geral como a lojista vê, em qualquer estado da leitura. A página e o
 * esqueleto da rota usam este mesmo markup: enquanto a sessão não chega, só as
 * regiões de dado viram blocos, dentro dos próprios elementos de texto.
 */
export default function OverviewView({ session, providers, waLink, onRetry }: { session: SessionState; providers: ProvidersState; waLink: string | null; onRetry?: () => void }) {
  const who = session.status === "ready" ? session.data : null;
  const titulo = who?.display_name ? `Olá, ${who.display_name}` : "Olá";
  const plan = who ? readPlanStatus(who) : null;
  // Contagem e sugestão de conectar saem da mesma lista do vault que a página de integrações lê.
  const reach = providers.status === "ready" ? connectedTools(providers.data) : null;
  const connectedNames = reach ? reach.ids.map((id) => NAMES.get(id) ?? id) : [];
  // Zero só é definitivo quando todas as ferramentas que voltaram dizem se estão conectadas.
  const unconfirmed = !!reach && !reach.complete && !connectedNames.length;
  const latest = RELEASES[0];
  const loading = session.status === "loading";
  const failed = session.status === "error";
  const toolsLoading = providers.status === "loading";
  const toolsFailed = providers.status === "error";
  const reading = overviewSteps(session, providers);
  const failure = failureText(reading.failed);

  return (
    <div className="ledger-page overview">
      {reading.loading ? <p className="sr-only" role="status">Carregando a visão geral…</p> : null}
      <header className="ledger-page-head">
        <div>
          <h1 className="ledger-title">{loading ? <>Olá, <TextBone w="7ch" /></> : titulo}</h1>
          {loading ? <p className="ledger-lede overview-store"><TextBone w="14ch" /></p> : who?.store_name ? <p className="ledger-lede overview-store">{who.store_name}</p> : null}
        </div>
      </header>

      <section className="overview-chat" aria-labelledby="overview-chat-title">
        <div className="overview-chat-copy">
          <h2 id="overview-chat-title">Conversar com a mila</h2>
          <p>Preço, descrição ou ajuda com uma peça. A mila responde no WhatsApp.</p>
          {waLink ? (
            <a href={waLink} className="overview-chat-action" target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp <Arrow />
            </a>
          ) : (
            <button className="overview-chat-action" type="button" disabled>Abrir WhatsApp <Arrow /></button>
          )}
        </div>
        <div className="overview-starters">
          <h3 id="overview-starters-title">Mensagens prontas</h3>
          {/* Sem o link verificado ainda, os atalhos ocupam o lugar sem levar a lugar nenhum. */}
          <ul aria-labelledby="overview-starters-title">
            {STARTERS.map((s) => {
              const body = <><span className="overview-starter-context">{s.context}</span> <span className="overview-starter-label">{s.label}</span></>;
              return <li key={s.id}>
                {waLink
                  ? <a href={withText(waLink, s.text)} className="overview-starter" target="_blank" rel="noopener noreferrer" aria-label={`${s.context}: ${s.label} (abre o WhatsApp)`}>{body}</a>
                  : <span className="overview-starter" aria-disabled="true">{body}</span>}
              </li>;
            })}
          </ul>
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

      {failure ? (
        <div className="ledger-notice overview-notice" data-tone="error" role="alert">
          <span>{failure}</span>
          <button type="button" className="ledger-button" onClick={onRetry}>Tentar de novo</button>
        </div>
      ) : null}

      <div className="overview-tiles" aria-busy={loading || toolsLoading}>
        <Tile href="/workspace/integracoes" label="Integrações" id="overview-integrations" action="Ver integrações">
          <p className="overview-tile-value">
            {toolsLoading ? <TextBone w="9ch" /> : toolsFailed ? <span className="overview-status-empty">Sem leitura</span> : unconfirmed ? <span className="overview-status-empty">Não verificado</span> : (
              <><span className="overview-figure">{connectedNames.length}</span> {connectedNames.length === 1 ? "conectada" : "conectadas"}</>
            )}
          </p>
          {toolsFailed || unconfirmed ? null : <p className="overview-tile-detail">
            {toolsLoading ? <TextBone w="16ch" /> : connectedNames.length ? connectedNames.join(", ") : "Conecte o sistema de gestão, a loja virtual ou a lista de fornecedores."}
          </p>}
        </Tile>
        <Tile href="/workspace/plano" label="Plano" id="overview-plan" action="Ver plano">
          <p className="overview-tile-value">
            {loading ? <TextBone w="12ch" /> : failed || !plan ? <span className="overview-status-empty">Sem leitura</span> : plan.title}
          </p>
          {loading ? <p className="overview-tile-detail"><TextBone /><TextBone w="40%" /></p>
            : !failed && plan && planDetail(plan) ? <p className="overview-tile-detail">{planDetail(plan)}</p> : null}
        </Tile>
        {latest ? (
          <Tile href="/workspace/novidades" label="Última versão" id="overview-release" action="Ver histórico" meta={`v${SYSTEM_VERSION} · ${releaseDate.format(new Date(`${latest.date}T12:00:00Z`))}`}>
            <p className="overview-tile-value overview-release-title">{latest.title}</p>
          </Tile>
        ) : null}
      </div>

      <section className="desk-panel overview-steps" aria-labelledby="overview-steps-title" aria-busy={reading.loading}>
        <h2 id="overview-steps-title" className="overview-steps-title">Próximos passos</h2>
        {reading.steps.length || reading.loading ? (
          <ul className="overview-steps-list">
            {reading.steps.map((s) => <li key={s.id} className="overview-step">
              <div className="overview-step-copy">
                <span className="overview-step-origin">{s.origin}</span>
                <span className="overview-step-text">{s.text}</span>
              </div>
              <Link href={s.href} className="ledger-link" aria-label={`${s.action}: ${s.origin}`}>{s.action} <Arrow /></Link>
            </li>)}
            {/* Um lugar por leitura que ainda não respondeu; o anúncio de espera é o da página. */}
            {reading.pending.map((key) => <li key={key} className="overview-step" aria-hidden="true">
              <div className="overview-step-copy"><span className="overview-step-origin"><TextBone w="18ch" /></span><span className="overview-step-text"><TextBone w="40ch" /></span></div>
              <span className="ledger-link"><TextBone w="9ch" /></span>
            </li>)}
          </ul>
        ) : (
          // O aviso de falha fica acima, uma vez só; aqui só o escopo do que foi lido.
          <p className="overview-steps-empty">{reading.failed.length === 2 ? "Sem dados para sugerir passos agora." : "Nenhum próximo passo identificado com os dados disponíveis."}</p>
        )}
      </section>
    </div>
  );
}
