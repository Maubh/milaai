import Link from "next/link";
import "@/app/site.css";

export default function SiteHeader() {
  return (
    <header className="site-header site-header-minimal">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand brand-small" aria-label="socIA — início">
          socIA
        </Link>
        <nav className="site-header-nav" aria-label="Navegação principal">
          <Link href="#planos" className="site-header-link">
            Planos
          </Link>
          <Link href="/login" className="site-header-btn">
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}
