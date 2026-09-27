import Link from "next/link";
import { INTEGRACOES } from "@/lib/demo-data";
import { integrationErrorText } from "@/lib/integration-errors";
import { SESSION_COOKIE } from "@/lib/server/mila-auth";
import { proxyOAuth, sanitizeOAuthResponse } from "@/lib/server/mila-oauth";

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
      providers = Array.isArray(safe.providers) ? (safe.providers as ProviderStatus[]) : [];
    }
  }

  // O provedor volta com ?ok=<provider> ou ?erro=<detail> no redirect do callback.
  const sp = await searchParams;
  const okParam = typeof sp.ok === "string" ? sp.ok : null;
  const erroParam = typeof sp.erro === "string" ? sp.erro : null;

  const byId = new Map(providers.map((p) => [p.id, p]));

  return (
    <div className="work-wrap">
      <p className="tag">Área logada · piloto</p>
      <h1 className="work-title">Integrações</h1>
      <p className="work-lede">
        Conecte as ferramentas que sua loja já usa e mantenha estoque, custos e informações das
        peças organizadas com a mila.
      </p>

      {okParam ? (
        <p className="hint" role="status">
          <strong>{byId.get(okParam)?.name ?? okParam}</strong> conectado a esta loja.
        </p>
      ) : null}

      {erroParam ? (
        <p className="hint" role="alert" style={{ color: "#b3261e" }}>
          {integrationErrorText(erroParam)}
        </p>
      ) : null}

      {!token ? (
        <p className="hint" role="status">
          Entre com seu telefone para ver e conectar as integrações desta loja.
        </p>
      ) : !consultou ? (
        <p className="hint" role="status">
          Não conseguimos consultar suas integrações agora. Tente de novo em instantes.
        </p>
      ) : null}

      <ul className="integra-list">
        {INTEGRACOES.map((i) => {
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
            <li key={i.id} className="card">
              <strong>
                {i.nome} <span className="integra-status">({label})</span>
              </strong>
              <span style={{ fontSize: "0.92rem", color: "rgba(30,43,40,0.78)" }}>{i.desc}</span>
              <span style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                <Link href={`/integrations/${i.id}`} className="btn btn-ghost btn-sm">
                  {live?.connected ? "Reconectar" : "Conectar"}
                </Link>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="work-actions">
        <Link href="/workspace" className="btn btn-plum btn-sm">
          Voltar à visão geral
        </Link>
      </div>
    </div>
  );
}
