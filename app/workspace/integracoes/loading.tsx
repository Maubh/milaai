import WorkspaceSkeleton, { TextBone } from "@/components/WorkspaceSkeleton";
import { IntegrationList, IntegrationRowPending } from "@/components/IntegrationRow";
import "./integracoes.css";

/**
 * Espera do vault: o desenho da página (uma área no topo para o que já está
 * conectado e as áreas abaixo), com linhas neutras. Sem a leitura não há como
 * saber quais ferramentas estão conectadas, quantas são nem se a Meta entra:
 * nada disso é afirmado. Com zero conexões a área do topo some na página.
 */
const SLOTS = [1, 2, 2];

export default function IntegrationsLoading() {
  return (
    <WorkspaceSkeleton label="Carregando as integrações da loja…">
      <div className="ledger-page integrations-page">
        <header className="ledger-page-head">
          <div>
            <h1 className="ledger-title">Integrações</h1>
            <p className="ledger-lede">Conecte as ferramentas da sua loja à mila.</p>
          </div>
          <p className="ledger-aside integrations-summary"><TextBone w="12ch" /></p>
        </header>
        <div className="desk-stack">
          {SLOTS.map((rows, i) => (
            <section className="ledger-section desk-panel" key={i}>
              <div className="ledger-section-head">
                <h2><TextBone w="12ch" /></h2>
                <p><TextBone w="28ch" /></p>
              </div>
              <IntegrationList>{Array.from({ length: rows }, (_, r) => <IntegrationRowPending key={r} />)}</IntegrationList>
            </section>
          ))}
        </div>
        <p className="integrations-footnote">Sem escolher um destino, sua lista de fornecedores continua salva e consultável no WhatsApp.</p>
      </div>
    </WorkspaceSkeleton>
  );
}
