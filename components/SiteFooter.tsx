import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer-minimal">
      <div className="wrap footer-minimal-inner">
        <p>@socIA</p>
        <nav aria-label="Legal">
          <Link href="/privacidade">Política de Privacidade</Link>
          <Link href="/termos">Termos de Uso</Link>
        </nav>
      </div>
    </footer>
  );
}
