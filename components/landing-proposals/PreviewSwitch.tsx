import Link from "next/link";

/** Troca de prévia: fica no canto do topo, fora da narrativa da página. */
export default function PreviewSwitch({ atual }: { atual: "a" | "b" }) {
  return (
    <nav className="lp-switch" aria-label="Trocar prévia">
      <Link href="/propostas" className="lp-switch-index">
        Prévias
      </Link>
      <span className="lp-switch-track">
        <Link
          href="/propostas/a"
          className="lp-switch-item"
          aria-current={atual === "a" ? "page" : undefined}
        >
          <span className="sr-only">Proposta </span>A
        </Link>
        <Link
          href="/propostas/b"
          className="lp-switch-item"
          aria-current={atual === "b" ? "page" : undefined}
        >
          <span className="sr-only">Proposta </span>B
        </Link>
      </span>
    </nav>
  );
}
