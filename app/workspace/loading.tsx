import WorkspaceSkeleton, { Bone } from "@/components/WorkspaceSkeleton";
import "./overview.css";

export default function OverviewLoading() {
  return (
    <WorkspaceSkeleton label="Carregando a visão geral…">
      <div className="ledger-page overview">
        <header className="ledger-page-head">
          <div className="skeleton-stack-loose"><Bone size="title" /><Bone size="short" /></div>
        </header>
        <div className="overview-desk">
          <section className="overview-chat">
            <div className="overview-chat-copy skeleton-stack-loose">
              <Bone size="heading" /><Bone size="line" /><Bone size="short" />
              <span className="skeleton-gap" /><Bone size="tiny" />
            </div>
            <div className="overview-qr"><Bone size="qr" /></div>
          </section>
          <section className="desk-panel overview-status">
            <div className="ledger-section-head"><Bone size="heading" /></div>
            <div className="overview-status-list">
              {[0, 1].map((i) => <div className="overview-status-item skeleton-stack" key={i}><Bone size="tiny" /><Bone size="figure" /><Bone size="short" /></div>)}
            </div>
          </section>
          <section className="desk-panel overview-release">
            <div className="ledger-section-head"><Bone size="heading" /></div>
            <div className="skeleton-stack"><Bone size="short" /><Bone size="line" /></div>
          </section>
        </div>
      </div>
    </WorkspaceSkeleton>
  );
}
