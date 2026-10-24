import { PUBLIC_RELEASES, SYSTEM_VERSION } from "@/lib/releases";
import ReleaseTimeline from "@/components/ReleaseTimeline";
import { TextMask } from "@/components/WorkspaceSkeleton";
import "@/components/release-updates.css";
import "./novidades.css";

/**
 * Atualizações, pronta ou como esqueleto da rota. O histórico é fixo: no
 * esqueleto os mesmos textos ficam cobertos, com as quebras e a altura reais.
 */
export default function UpdatesView({ loading = false }: { loading?: boolean }) {
  const t = (node: React.ReactNode) => (loading ? <TextMask>{node}</TextMask> : node);
  return <div className="ledger-page releases-page">
    <header className="ledger-page-head">
      <div>
        <h1 className="ledger-title">Atualizações</h1>
        <p className="ledger-lede">{t("Melhorias, novidades e correções da mila, da mais recente para a mais antiga.")}</p>
      </div>
      <p className="ledger-aside">{t(<>Versão atual <strong>v{SYSTEM_VERSION}</strong></>)}</p>
    </header>
    <section className="desk-panel releases-ledger" aria-label="Histórico">
      <ReleaseTimeline releases={PUBLIC_RELEASES} loading={loading} />
    </section>
  </div>;
}
