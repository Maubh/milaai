import { RELEASE_CHANGE_LABELS, RELEASE_PLAN_LABELS, type Release } from "@/lib/releases";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

export default function ReleaseTimeline({ releases, compact = false }: {
  releases: readonly Release[];
  compact?: boolean;
}) {
  if (!releases.length) return <p className="releases-empty">As próximas novidades da Mila vão aparecer aqui.</p>;

  return (
    <ol className={`releases-timeline${compact ? " releases-timeline-compact" : ""}`} aria-label="Histórico de atualizações">
      {releases.map((release) => (
        <li className="releases-timeline-entry" key={release.version}>
          <div className="releases-timeline-meta">
            <time dateTime={release.date}>{dateFormat.format(new Date(`${release.date}T12:00:00Z`))}</time>
            <span className="release-version">v{release.version}</span>
          </div>
          <article className="releases-timeline-article" aria-labelledby={`${compact ? "recent" : "release"}-${release.version}`}>
            <h2 id={`${compact ? "recent" : "release"}-${release.version}`}>{release.title}</h2>
            <p className="release-summary">{release.summary}</p>
            <ul className="release-changes">
              {(compact ? release.changes.slice(0, 2) : release.changes).map((change) => (
                <li key={change.title}>
                  <span className="release-change-tags">
                    <span className="release-change-type" data-type={change.type}>{RELEASE_CHANGE_LABELS[change.type]}</span>
                    <span className="release-change-plan" data-plan={change.plan}>{RELEASE_PLAN_LABELS[change.plan]}</span>
                  </span>
                  <h3>{change.title}</h3>
                  {!compact ? <p>{change.description}</p> : null}
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}
