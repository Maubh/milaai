import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "4rem 0" }}>
      <p className="tag">Página não encontrada</p>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: "0.8rem 0" }}>
        Essa bancada não existe.
      </h1>
      <p style={{ marginBottom: "1.5rem", maxWidth: "52ch" }}>
        A simulação cobre a landing, o onboarding, a conversa simulada e o workspace de apoio. Siga por
        um desses caminhos. Todos funcionam.
      </p>
      <p style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-plum">
          Voltar à landing
        </Link>
        <Link href="/conversa" className="btn btn-ghost">
          Abrir conversa simulada
        </Link>
      </p>
    </div>
  );
}
