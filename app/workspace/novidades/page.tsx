import { RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import ReleaseTimeline from "@/components/ReleaseTimeline";
import "@/components/release-updates.css";
import "./novidades.css";

export const metadata = { title: "Atualizações · mila." };

export default function UpdatesPage() {
  return <div className="workspace-releases-page">
    <header className="releases-header">
      <div>
        <h1 className="work-title">Atualizações</h1>
        <p className="work-lede">Histórico de melhorias, novas funcionalidades e correções de bugs da mila.</p>
      </div>
      <span className="releases-current-version"><span>Versão atual</span><strong>v{SYSTEM_VERSION}</strong></span>
    </header>
    <ReleaseTimeline releases={RELEASES} />
  </div>;
}
