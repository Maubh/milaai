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
          <li key={i.nome} className="card">
            <strong>{i.nome}</strong>
            <span style={{ fontSize: "0.92rem", color: "rgba(39,35,38,0.78)" }}>{i.desc}</span>
            <span style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              <span className="tag">{i.estado}</span>
              <Link
                href={`/integrations/${i.nome.toLowerCase()}`}
                className="btn btn-ghost btn-sm"
              >
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
