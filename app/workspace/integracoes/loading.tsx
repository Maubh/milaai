import WorkspaceSkeleton, { Bone } from "@/components/WorkspaceSkeleton";
import { IntegrationList } from "@/components/IntegrationRow";
import "./integracoes.css";

/** Mesmas colunas da lista real: marca · ferramenta · nível · estado · ação. */
function RowBones() {
  return (
    <li className="integration-item">
      <div className="integration-item-mark"><Bone size="logo" /></div>
      <div className="integration-item-copy skeleton-stack"><Bone size="short" /><Bone size="line" /></div>
      <div className="integration-item-tier" />
      <div className="integration-item-status"><Bone size="tiny" /></div>
      <div className="integration-item-actions"><Bone size="button" /></div>
    </li>
  );
}

export default function IntegrationsLoading() {
  return (
    <WorkspaceSkeleton label="Carregando as integrações da loja…">
      <div className="ledger-page integrations-page">
        <header className="ledger-page-head">
          <div className="skeleton-stack-loose"><Bone size="title" /><Bone size="short" /></div>
        </header>
        <div className="desk-stack">
          {[2, 2].map((rows, i) => (
            <section className="ledger-section desk-panel" key={i}>
              <div className="ledger-section-head"><Bone size="heading" /></div>
              <IntegrationList>{Array.from({ length: rows }, (_, r) => <RowBones key={r} />)}</IntegrationList>
            </section>
          ))}
        </div>
      </div>
    </WorkspaceSkeleton>
  );
}
