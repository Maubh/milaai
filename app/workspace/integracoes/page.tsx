import Link from "next/link";
import { INTEGRACOES } from "@/lib/demo-data";

export default function IntegracoesPage() {
  return (
    <div className="work-wrap">
      <p className="tag">Demonstração · sem conexão real</p>
      <h1 className="display work-title">Integrações</h1>
      <p className="work-lede">
        Como cada conector funcionaria quando existir — hoje, todos estão em demonstração. Nenhum botão
        abre OAuth, nenhuma conta é vinculada e nada sai deste navegador.
      </p>
      <ul className="integra-list">
        {INTEGRACOES.map((i) => (
          <li key={i.nome} className="card">
            <strong>{i.nome}</strong>
            <span style={{ fontSize: "0.92rem", color: "rgba(39,35,38,0.78)" }}>{i.desc}</span>
            <span>
              <span className="tag">{i.estado}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="work-actions">
        <Link href="/workspace" className="btn btn-plum btn-sm">
          Voltar à visão geral
        </Link>
        <Link href="/" className="btn btn-ghost btn-sm">
          Voltar à landing
        </Link>
      </div>
    </div>
  );
}
