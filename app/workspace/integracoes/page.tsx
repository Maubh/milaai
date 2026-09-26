import Link from "next/link";
import { INTEGRACOES } from "@/lib/demo-data";

export default function IntegracoesPage() {
  return (
    <div className="work-wrap">
      <p className="tag">Área logada · piloto</p>
      <h1 className="work-title">Integrações</h1>
      <p className="work-lede">
        Conectores disponíveis no piloto. OAuth real ainda não está ligado — cada nome abre a tela de
        transição para você ver o fluxo.
      </p>
      <ul className="integra-list">
        {INTEGRACOES.map((i) => (
          <li key={i.id} className="card">
            <strong>
              {i.nome} <span className="integra-status">({i.status})</span>
            </strong>
            <span style={{ fontSize: "0.92rem", color: "rgba(30,43,40,0.78)" }}>{i.desc}</span>
            <span style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link href={`/integrations/${i.id}`} className="btn btn-ghost btn-sm">
                Ver fluxo
              </Link>
            </span>
          </li>
        ))}
      </ul>
      <div className="work-actions">
        <Link href="/workspace" className="btn btn-plum btn-sm">
          Voltar à visão geral
        </Link>
      </div>
    </div>
  );
}
