import WorkspaceSkeleton, { Bone } from "@/components/WorkspaceSkeleton";
import "@/components/release-updates.css";
import "./novidades.css";

export default function UpdatesLoading() {
  return (
    <WorkspaceSkeleton label="Carregando as atualizações…">
      <div className="ledger-page releases-page">
        <header className="ledger-page-head">
          <div className="skeleton-stack-loose"><Bone size="title" /><Bone size="line" /></div>
        </header>
        <section className="desk-panel releases-ledger">
          <ol className="releases-timeline">
            {[0, 1].map((i) => (
              <li className="releases-timeline-entry" key={i}>
                <div className="releases-timeline-meta"><Bone size="tiny" /></div>
                <div className="skeleton-stack-loose"><Bone size="heading" /><Bone size="line" /><Bone size="line" /></div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </WorkspaceSkeleton>
  );
}
