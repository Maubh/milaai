import WorkspaceSkeleton, { Bone } from "@/components/WorkspaceSkeleton";
import "./plano.css";

export default function PlanLoading() {
  return (
    <WorkspaceSkeleton label="Carregando seu plano…">
      <div className="ledger-page workspace-plan-page">
        <header className="ledger-page-head">
          <div className="skeleton-stack-loose"><Bone size="title" /><Bone size="line" /></div>
        </header>
        <div className="desk-stack">
          <section className="ledger-section desk-panel plan-sheet">
            <div className="ledger-section-head"><Bone size="heading" /></div>
            <div className="ledger-rows">
              {[0, 1, 2].map((i) => <div className="ledger-row plan-row" key={i}><Bone size="tiny" /><Bone size="short" /></div>)}
            </div>
          </section>
          <section className="ledger-section desk-panel">
            <div className="ledger-section-head"><Bone size="heading" /></div>
            <div className="plan-compare">
              {[0, 1].map((i) => (
                <div className="plan-column" key={i}>
                  <Bone size="heading" /><Bone size="short" /><Bone size="figure" />
                  <div className="skeleton-stack">{[0, 1, 2, 3, 4].map((f) => <Bone key={f} size="line" />)}</div>
                  <Bone size="button" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </WorkspaceSkeleton>
  );
}
