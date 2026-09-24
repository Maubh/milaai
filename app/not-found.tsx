import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "4rem 0" }}>
      <p className="tag">Página não encontrada</p>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: "0.8rem 0" }}>
        Essa bancada não existe.
      </h1>
      <p style={{ marginBottom: "1.5rem", maxWidth: "52ch" }}>
        A demonstração cobre a landing, o login e as quatro telas do workspace. Siga por um desses
        caminhos — todos funcionam.
      </p>
      <p style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-plum">
          Voltar à landing
        </Link>
        <Link href="/login" className="btn btn-ghost">
          Entrar na demonstração
        </Link>
      </p>
    </div>
  );
}
