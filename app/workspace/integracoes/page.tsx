import Link from "next/link";
import DisconnectButton from "@/components/DisconnectButton";
import { INTEGRACOES } from "@/lib/demo-data";
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
}


const GROUPS = [
  { id: "vendas", title: "Estoque e vendas", description: "As peças da sua loja, do estoque à vitrine.", providers: ["jueri", "olist", "nuvemshop"] },
  { id: "fornecedores", title: "Fornecedores e compras", description: "Escolha onde organizar seus fornecedores e compras.", providers: ["google", "notion"] },
];

const PRESENTATION: Record<string, { detail: string; description: string; logo?: string }> = {
  jueri: { detail: "Gestão de joias e semijoias", description: "Organize peças, consignados, estoque e custos com seu sistema de gestão.", logo: "/integrations/jueri.png" },
  olist: { detail: "Gestão da loja", description: "Mantenha o estoque e os custos de cada peça organizados no seu sistema.", logo: "/integrations/olist.svg" },
  nuvemshop: { detail: "Loja virtual", description: "Cadastre produtos com foto, descrição e preço na loja virtual pelo WhatsApp.", logo: "/integrations/nuvemshop-wordmark.png" },
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
  const logo = PRESENTATION[provider]?.logo;
  return logo ? <img src={logo} alt="" className={`integrations-logo integrations-logo-${provider}`} /> : null;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
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
  if (token) {
    const { status, data } = await proxyOAuth("/api/oauth/providers");
    if (status === 200) {
      consultou = true;
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

  const catalog = INTEGRACOES.filter((i) => i.id !== "bling");
  const connectedCount = catalog.filter((i) => byId.get(i.id)?.connected).length;

  return (
    <div className="work-wrap integrations-page">
      <header className="integrations-header">
        <div>
          <h1 className="integrations-title">Integrações</h1>
          <p className="integrations-intro">Conecte as ferramentas da sua loja à mila.</p>
        </div>
        {consultou ? <span className="integrations-summary">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4" /></svg>
          <span><strong>{connectedCount}</strong> de {catalog.length} conectadas</span>
        </span> : null}
      </header>

      {okConectado ? (
        <p className="integrations-notice integrations-notice-success" role="status">
          <strong>{byId.get(okParam as string)?.name ?? okParam}</strong> conectado a esta loja.
        </p>
      ) : null}
      {okPendente ? (
        <p className="integrations-notice" role="status">
          O {byId.get(okParam as string)?.name ?? okParam} voltou, mas a chave ainda não
          aparece nesta loja. Conecte de novo ou fale com a mila.
        </p>
      ) : null}
      {erroParam ? (
        <p className="integrations-notice integrations-notice-error" role="alert">
          {integrationErrorText(erroParam)}
        </p>
      ) : null}
      {!token ? (
        <p className="integrations-notice" role="status">Entre com o WhatsApp para ver as conexões desta loja.</p>
      ) : !consultou ? (
        <p className="integrations-notice" role="status">Não deu para ler as conexões agora. Tente de novo daqui a pouco.</p>
      ) : null}

      {GROUPS.map((group) => (
        <section className="integrations-section" key={group.id} aria-labelledby={`integrations-${group.id}`}>
          <div className="integrations-section-heading">
            <h2 id={`integrations-${group.id}`}>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <ul className={`integrations-grid integrations-grid-${group.id}`}>
            {catalog.filter((i) => group.providers.includes(i.id)).map((i) => {
              const live = byId.get(i.id);
              const state = live?.connected ? "connected" : live ? live.app_configured ? "available" : "soon" : "unknown";
              const label = { connected: "Conectado", available: "Disponível", soon: "Em breve", unknown: "Não verificado" }[state];
              const presentation = PRESENTATION[i.id];
              return (
                <li key={i.id} className="integrations-card" data-state={state}>
                  <div className="integrations-card-top">
                    <div className="integrations-mark"><ToolMark provider={i.id} /></div>
                    <span className="integrations-status">
                      {state === "connected" ? <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg> : <span className="integrations-status-dot" aria-hidden="true" />}
                      {label}
                    </span>
                  </div>
                  <div className="integrations-card-copy">
                    <h3>{i.nome}</h3>
                    <p className="integrations-tool-detail">{presentation.detail}</p>
                    <p className="integrations-description">{presentation.description}</p>
                  </div>
                  {(i.id === "google" || i.id === "notion") ? (
                    <details className="integrations-access">
                      <summary>Como seus dados são usados</summary>
                      <p>{i.desc.replaceAll("caderno de fornecedores", "caderno").replaceAll("o caderno", "a lista de fornecedores").replaceAll("O caderno", "A lista de fornecedores").replaceAll("fica salvo", "fica salva")}</p>
                    </details>
                  ) : null}
                  <div className="integrations-card-footer">
                    {state === "soon" ? <span className="integrations-unavailable">Conexão ainda não disponível</span> : (
                      <Link href={`/integrations/${i.id}`} className="integrations-connect" aria-label={`${live?.connected ? "Reconectar" : "Conectar"} ${i.nome}`}>
                        {live?.connected ? "Reconectar" : "Conectar"}<Arrow />
                      </Link>
                    )}
                    {live?.connected ? <DisconnectButton provider={i.id} providerName={i.nome} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <footer className="integrations-footnote">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-3.5-.8L4 20l1.3-4.5a9 9 0 0 1-.8-3.5 8 8 0 0 1 8-8H13a8 8 0 0 1 7 7v.5Z" /><path d="M8 11h8m-8 4h5" /></svg>
        <p>Sem escolher um destino, sua lista de fornecedores continua salva e consultável no WhatsApp.</p>
      </footer>
    </div>
  );
}
