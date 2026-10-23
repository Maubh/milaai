import { RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import ReleaseTimeline from "@/components/ReleaseTimeline";
import "@/components/release-updates.css";
import "./novidades.css";

export const metadata = { title: "Atualizações · mila." };

export default function UpdatesPage() {
  return <div className="ledger-page releases-page">
    <header className="ledger-page-head">
      <div>
        <h1 className="ledger-title">Atualizações</h1>
        <p className="ledger-lede">Melhorias, novidades e correções da mila, da mais recente para a mais antiga.</p>
      </div>
      <p className="ledger-aside">Versão atual <strong>v{SYSTEM_VERSION}</strong></p>
    </header>
    <section className="desk-panel releases-ledger" aria-label="Histórico">
      <ReleaseTimeline releases={RELEASES} />
    </section>
  </div>;
}
