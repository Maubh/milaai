import { RELEASES, RELEASE_CHANGE_LABELS, SYSTEM_VERSION } from "@/lib/releases";
import "./novidades.css";

export const metadata = { title: "Atualizações · mila." };

const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function UpdatesPage() {
  return <div className="workspace-releases-page">
    <header className="releases-header">
      <div>
        <h1 className="work-title">Atualizações</h1>
        <p className="work-lede">Histórico de melhorias, novas funcionalidades e correções de bugs da mila.</p>
      </div>
      <span className="releases-current-version"><span>Versão atual</span><strong>v{SYSTEM_VERSION}</strong></span>
    </header>
    <ol className="releases-list" aria-label="Histórico de atualizações">
      {RELEASES.map((release) => <li key={release.version}>
        <details className="release-entry" open={release.version === SYSTEM_VERSION}>
          <summary className="release-toggle">
            <div className="release-meta">
              <span className="release-version">v{release.version}</span>
              <time dateTime={release.date}>{dateFormat.format(new Date(`${release.date}T12:00:00Z`))}</time>
            </div>
            <div className="release-heading">
              <h2 id={`release-${release.version}`}>{release.title}</h2>
              <p className="release-summary">{release.summary}</p>
            </div>
            <svg className="release-chevron" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="release-body">
            <ul className="release-changes">
              {release.changes.map((change) => <li key={change.title}>
                <span className="release-change-type" data-type={change.type}>{RELEASE_CHANGE_LABELS[change.type]}</span>
                <h3>{change.title}</h3>
                <p>{change.description}</p>
              </li>)}
            </ul>
          </div>
        </details>
      </li>)}
    </ol>
  </div>;
}
