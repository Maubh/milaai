import type { ReactNode } from "react";
import { PlanTag } from "@/components/PlanTag";
import { TextMask } from "@/components/WorkspaceSkeleton";
import { RELEASE_CHANGE_LABELS, RELEASE_PLAN_LABELS, type Release } from "@/lib/releases";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

/** `loading`: os mesmos textos e quebras, cobertos por blocos (esqueleto da rota). */
export default function ReleaseTimeline({ releases, compact = false, loading = false }: {
  releases: readonly Release[];
  compact?: boolean;
  loading?: boolean;
}) {
  const t = (node: ReactNode) => (loading ? <TextMask>{node}</TextMask> : node);
  if (!releases.length) return <p className="releases-empty">As próximas novidades da Mila vão aparecer aqui.</p>;

  return (
    <ol className={`releases-timeline${compact ? " releases-timeline-compact" : ""}`} aria-label="Histórico de atualizações">
      {releases.map((release) => (
        <li className="releases-timeline-entry" key={release.version}>
          <div className="releases-timeline-meta">
            <time dateTime={release.date}>{t(dateFormat.format(new Date(`${release.date}T12:00:00Z`)))}</time>
            <span className="release-version">{t(`v${release.version}`)}</span>
          </div>
          <article className="releases-timeline-article" aria-labelledby={`${compact ? "recent" : "release"}-${release.version}`}>
            <h2 id={`${compact ? "recent" : "release"}-${release.version}`}>{t(release.title)}</h2>
            <p className="release-summary">{t(release.summary)}</p>
            <ul className="release-changes">
              {(compact ? release.changes.slice(0, 2) : release.changes).map((change) => (
                <li key={change.title}>
                  <span className="release-change-tags">
                    <span className="release-change-type" data-type={change.type}>{t(RELEASE_CHANGE_LABELS[change.type])}</span>
                    <PlanTag>{t(RELEASE_PLAN_LABELS[change.plan])}</PlanTag>
                  </span>
                  <h3>{t(change.title)}</h3>
                  {!compact ? <p>{t(change.description)}</p> : null}
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}
