import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "5rem 1.5rem", maxWidth: "620px", margin: "0 auto", textAlign: "center" }}>
      <p className="tag" style={{ display: "inline-block", marginBottom: "0.8rem" }}>
        Página não encontrada
      </p>
      <h1 className="display" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", margin: "0.5rem 0 1rem", lineHeight: "1.2" }}>
        Não encontramos esta página
      </h1>
      <p style={{ marginBottom: "2rem", color: "rgba(39,35,38,0.78)", lineHeight: "1.6", fontSize: "1.05rem" }}>
        O endereço que você tentou acessar pode ter mudado, estar incorreto ou não estar mais disponível.
        Volte à página inicial ou acesse o seu painel da Mila.
      </p>
      <p style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-plum">
          Ir para o início
        </Link>
        <Link href="/workspace" className="btn btn-ghost">
          Acessar painel
        </Link>
      </p>
    </div>
  );
}
