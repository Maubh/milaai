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

  return (
    <div className="work-wrap">
      <p className="work-back" style={{ margin: "0 0 0.85rem" }}>
        <Link href="/workspace">← Visão geral</Link>
      </p>
      <p className="tag">Área logada</p>
      <h1 className="work-title">Integrações</h1>
      <p className="work-lede">
        Ligue o que a loja já usa: Jueri, Olist, Nuvemshop, Notion, Google.
      </p>

      {okConectado ? (
        <p className="hint" role="status">
          <strong>{byId.get(okParam as string)?.name ?? okParam}</strong> conectado a esta loja.
        </p>
      ) : null}

      {okPendente ? (
        <p className="hint" role="status">
          O {byId.get(okParam as string)?.name ?? okParam} voltou, mas a chave ainda não
          aparece nesta loja. Conecte de novo ou fale com a mila.
        </p>
      ) : null}

      {erroParam ? (
        <p className="hint" role="alert" style={{ color: "#b3261e" }}>
          {integrationErrorText(erroParam)}
        </p>
      ) : null}

      {!token ? (
        <p className="hint" role="status">
          Entre com o WhatsApp para ver as conexões desta loja.
        </p>
      ) : !consultou ? (
        <p className="hint" role="status">
          Não deu para ler as conexões agora. Tente de novo daqui a pouco.
        </p>
      ) : null}

      <ul className="integra-list">
        {/* Bling ainda não está habilitado — não listar na área logada. */}
        {INTEGRACOES.filter((i) => i.id !== "bling").map((i) => {
          const live = byId.get(i.id);
          // Sem status real do servidor não afirmamos nada sobre a conexão.
          const label = live
            ? live.connected
              ? "conectado"
              : live.app_configured
                ? "disponível"
                : "em breve"
            : "—";
          return (
            <li key={i.id} className="card integra-row">
              <span className="integra-row-copy">
                <strong>
                  {i.nome} <span className="integra-status">({label})</span>
                </strong>
                <p>{i.desc}</p>
              </span>
              <span className="integra-row-action">
                <Link href={`/integrations/${i.id}`} className="btn btn-ghost btn-sm">
                  {live?.connected ? "Reconectar" : "Conectar"}
                </Link>
                {live?.connected ? (
                  <DisconnectButton provider={i.id} providerName={i.nome} />
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
