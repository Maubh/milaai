import Link from "next/link";
import DisconnectButton from "@/components/DisconnectButton";
import IntegrationRow, { IntegrationList } from "@/components/IntegrationRow";
import IntegrationsNotice from "@/components/IntegrationsNotice";
import MetaCatalogManager, { type LastSyncSummary } from "@/components/MetaCatalogManager";
import { INTEGRACOES } from "@/lib/demo-data";
import { rowStatus } from "@/lib/integration-catalog";
import { integrationErrorText } from "@/lib/integration-errors";
import { SESSION_COOKIE } from "@/lib/server/mila-auth";
import { proxyOAuth, sanitizeOAuthResponse, sanitizeProviderList } from "@/lib/server/mila-oauth";
import "./integracoes.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProviderStatus {
  id: string;
  name: string;
  mode: string;
  connected: boolean;
  app_configured: boolean;
  catalog_id?: string | null;
  catalog_name?: string | null;
  business_id?: string | null;
  product_source?: string | null;
  sync_only_published?: boolean;
  last_sync_at?: number | null;
  last_sync_status?: string | null;
  last_sync_summary?: LastSyncSummary | null;
  suggested_source?: string | null;
}


const GROUPS = [
  { id: "vendas", title: "Estoque e vendas", description: "As peças da sua loja, do estoque à vitrine.", providers: ["jueri", "olist", "nuvemshop", "meta"] },
  { id: "fornecedores", title: "Fornecedores e compras", description: "Escolha onde organizar seus fornecedores e compras.", providers: ["google", "notion"] },
];

const PRESENTATION: Record<string, { detail: string; description: string; logo?: string }> = {
  jueri: { detail: "Gestão de joias e semijoias", description: "Organize peças, consignados, estoque e custos com seu sistema de gestão.", logo: "/integrations/jueri.png" },
  olist: { detail: "Gestão da loja", description: "Mantenha o estoque e os custos de cada peça organizados no seu sistema.", logo: "/integrations/olist.svg" },
  nuvemshop: { detail: "Loja virtual", description: "Cadastre produtos com foto, descrição e preço na loja virtual pelo WhatsApp.", logo: "/integrations/nuvemshop-wordmark.png" },
  meta: { detail: "Catálogo do Facebook e Instagram", description: "Sincronize as peças e fotos da loja diretamente com o seu catálogo de produtos na Meta." },
  google: { detail: "Drive e Planilhas", description: "Sua lista de fornecedores em uma planilha criada e mantida pela mila no seu Drive." },
  notion: { detail: "Bases de dados", description: "Sua lista de fornecedores e suas notas de compra na base que você indicar. A mila não cria a base." },
};

function ToolMark({ provider }: { provider: string }) {
  if (provider === "google") {
    return <span className="integrations-google-icons" aria-hidden="true">
      <img src="/integrations/google-drive.png" alt="" width="32" height="32" />
      <img src="/integrations/google-sheets.png" alt="" width="32" height="32" />
    </span>;
  }
  if (provider === "notion") {
    return <svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor" aria-hidden="true"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" /></svg>;
  }
  if (provider === "meta") {
    return (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="#0081FB" aria-hidden="true">
        <path d="M6.502 6.5C3.766 6.5 2 8.653 2 11.53c0 2.984 1.838 5.758 4.414 7.644 1.58.156 3.167-.32 4.457-1.34 1.13 1.02 2.717 1.496 4.297 1.34C17.744 17.288 19.582 14.514 19.582 11.53c0-2.877-1.766-5.03-4.502-5.03-2.035 0-3.864 1.2-4.83 2.977C9.284 7.7 7.455 6.5 5.42 6.5h1.082zm.006 2.378c1.633 0 3.09 1.19 3.65 2.766-.455 1.545-1.42 2.87-2.695 3.738-1.72-1.272-2.92-3.18-2.92-5.074 0-1.848 1.066-2.99 2.457-2.99l-.492.56zm7.986 0c1.39 0 2.456 1.142 2.456 2.99 0 1.894-1.2 3.802-2.92 5.074-1.275-.868-2.24-2.193-2.695-3.738.56-1.576 2.017-2.766 3.65-2.766l-.491-.56z" />
      </svg>
    );
  }
  const logo = PRESENTATION[provider]?.logo;
  return logo ? <img src={logo} alt="" className={`integrations-logo integrations-logo-${provider}`} /> : null;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

/**
 * Status real de conexão. Só mostra "conectado" quando o vault da loja tem
 * credencial — o catálogo estático do repo nunca afirma conexão.
 */
export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? null;

  let providers: ProviderStatus[] = [];
  let consultou = false;
  // Sem plano na resposta do vault a página não presume Pro.
  let userPlan: string | null = null;
  let storeName: string | null = null;
  if (token) {
    const { status, data } = await proxyOAuth("/api/oauth/providers");
    if (status === 200) {
      consultou = true;
      if (typeof data?.plan === "string") {
        userPlan = data.plan.toLowerCase();
      }
      if (typeof data?.store_name === "string" && data.store_name) {
        storeName = data.store_name;
      }
      const safe = sanitizeOAuthResponse(data, ["providers"]);
      providers = sanitizeProviderList(safe.providers) as unknown as ProviderStatus[];
    }
  }

  // O provedor volta com ?ok=<provider> ou ?erro=<detail> no redirect do callback.
  const sp = await searchParams;
  const okParam = typeof sp.ok === "string" ? sp.ok : null;
  const erroParam = typeof sp.erro === "string" ? sp.erro : null;

  const byId = new Map(providers.map((p) => [p.id, p]));
  // ?ok= só vira recado de sucesso se o vault da loja confirmar a conexão:
  // um parâmetro na URL não é prova de credencial gravada.
  const okConectado = okParam ? byId.get(okParam)?.connected === true : false;
  const okPendente = !!okParam && !okConectado && consultou;

  // Meta fica condicionado à allowlist do backend (byId.has("meta")): fora da
  // allowlist o card não aparece no catálogo visível nem soma na contagem.
  const catalog = INTEGRACOES.filter((i) => i.id !== "bling" && (i.id !== "meta" || byId.has("meta")));
  const connectedCount = catalog.filter((i) => byId.get(i.id)?.connected).length;

  // Uma regra só para cada linha, onde quer que ela apareça. O plano exigido
  // depende da categoria original da ferramenta, nunca da seção em que está.
  const renderRow = (i: (typeof catalog)[number]) => {
    const live = byId.get(i.id);
    const row = rowStatus(i.id, live, userPlan);
    const presentation = PRESENTATION[i.id];
    return (
      <IntegrationRow
        key={i.id}
        anchor={i.id === "meta" ? "integracao-meta" : undefined}
        state={row.state}
        mark={<ToolMark provider={i.id} />}
        name={i.nome}
        detail={presentation.detail}
        description={presentation.description}
        tier={row.requiresPro ? "Pro" : null}
        status={row.status}
        details={(i.id === "google" || i.id === "notion") ? (
          <details className="integrations-access">
            <summary>Como seus dados são usados</summary>
            <p>{i.desc.replaceAll("caderno de fornecedores", "caderno").replaceAll("o caderno", "a lista de fornecedores").replaceAll("O caderno", "A lista de fornecedores").replaceAll("fica salvo", "fica salva")}</p>
          </details>
        ) : null}
        actions={row.state === "connected" ? (
          <DisconnectButton provider={i.id} providerName={i.nome} />
        ) : row.state === "locked" ? (
          <Link href="/workspace/plano" className="ledger-button" aria-label={`Assinar plano Pro para conectar ${i.nome}`}>
            Assinar plano Pro <Arrow />
          </Link>
        ) : row.state === "soon" ? (
          <span className="integrations-unavailable">Ainda não disponível</span>
        ) : (
          <Link href={`/integrations/${i.id}`} className="ledger-button ledger-button-primary" aria-label={`Conectar ${i.nome}`}>
            Conectar <Arrow />
          </Link>
        )}
        expansion={i.id === "meta" && live?.connected ? (
          <MetaCatalogManager
            meta={live}
            connectedProviders={providers}
            storeName={storeName}
          />
        ) : null}
      />
    );
  };
  const order = GROUPS.flatMap((g) => g.providers);
  const conectadas = catalog.filter((i) => byId.get(i.id)?.connected === true).sort((x, y) => order.indexOf(x.id) - order.indexOf(y.id));

  return (
    <div className="ledger-page integrations-page">
      <header className="ledger-page-head">
        <div>
          <h1 className="ledger-title">Integrações</h1>
          <p className="ledger-lede">Conecte as ferramentas da sua loja à mila.</p>
        </div>
        {consultou ? <p className="ledger-aside integrations-summary"><strong>{connectedCount}</strong> de {catalog.length} conectadas</p> : null}
      </header>

      <div className="desk-stack">
      <IntegrationsNotice
        okParam={okParam}
        okConectado={okConectado}
        okPendente={okPendente}
        providerName={okParam ? byId.get(okParam)?.name ?? null : null}
        erroParam={erroParam}
      />
      {!token ? (
        <p className="ledger-notice" role="status">Entre com o WhatsApp para ver as conexões desta loja.</p>
      ) : !consultou ? (
        <p className="ledger-notice" data-tone="error" role="status">Não deu para ler as conexões agora. Tente de novo daqui a pouco.</p>
      ) : null}

      {conectadas.length ? (
        <section className="ledger-section desk-panel" aria-labelledby="integrations-conectadas">
          <div className="ledger-section-head">
            <h2 id="integrations-conectadas">Conectadas</h2>
            <p>Ferramentas que a mila já usa nesta loja.</p>
          </div>
          <IntegrationList>{conectadas.map(renderRow)}</IntegrationList>
        </section>
      ) : null}

      {GROUPS.map((group) => {
        const pendentes = catalog.filter((i) => group.providers.includes(i.id) && byId.get(i.id)?.connected !== true);
        if (!pendentes.length) return null;
        return (
          <section className="ledger-section desk-panel" key={group.id} aria-labelledby={`integrations-${group.id}`}>
            <div className="ledger-section-head">
              <h2 id={`integrations-${group.id}`}>{group.title}</h2>
              <p>{group.description}</p>
            </div>
            <IntegrationList>{pendentes.map(renderRow)}</IntegrationList>
          </section>
        );
      })}
      </div>
      <p className="integrations-footnote">Sem escolher um destino, sua lista de fornecedores continua salva e consultável no WhatsApp.</p>
    </div>
  );
}
