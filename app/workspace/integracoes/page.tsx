import Link from "next/link";
import { INTEGRACOES } from "@/lib/demo-data";

interface ProviderStatus {
  id: string;
  name: string;
  mode: string;
  connected: boolean;
  app_configured: boolean;
}

const BASE = process.env.MILA_AUTH_BASE || "https://wa.milaai.com.br";

async function fetchStatus(
  sessionToken: string,
): Promise<{ tenant: string | null; providers: ProviderStatus[] } | null> {
  try {
    const res = await fetch(`${BASE}/api/oauth/providers`, {
      headers: {
        "X-Mila-Auth-Secret": process.env.MILA_AUTH_SECRET || "",
        "X-Mila-Session": sessionToken,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tenant?: string;
      providers?: ProviderStatus[];
    };
    return { tenant: data.tenant ?? null, providers: data.providers ?? [] };
  } catch {
    return null;
  }
}

/**
 * Status real de conexão. Só mostra "conectado" quando o vault da loja
 * tem credencial — o catálogo estático do repo nunca afirma conexão.
 */
export default async function IntegracoesPage() {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const token = jar.get("mila_session")?.value ?? null;
  const status = token ? await fetchStatus(token) : null;

  const byId = new Map((status?.providers ?? []).map((p) => [p.id, p]));

  return (
    <div className="work-wrap">
      <p className="tag">Área logada · piloto</p>
      <h1 className="work-title">Integrações</h1>
      <p className="work-lede">
        Conecte as ferramentas que sua loja já usa e mantenha estoque, custos e informações das
        peças organizadas com a mila.
      </p>

      {!token ? (
        <p className="hint" role="status">
          Entre com seu telefone para ver e conectar as integrações desta loja.
        </p>
      ) : !status ? (
        <p className="hint" role="status">
          Não conseguimos consultar suas integrações agora. Tente de novo em instantes.
        </p>
      ) : null}

      <ul className="integra-list">
        {INTEGRACOES.map((i) => {
          const live = byId.get(i.id);
          const label = !token || !live ? i.status : live.connected ? "conectado" : live.app_configured ? "disponível" : "em breve";
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
