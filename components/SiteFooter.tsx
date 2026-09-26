import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer-minimal">
      <div className="wrap footer-minimal-inner">
        <p>© 2026 mila.ai. Todos os direitos reservados. · @usemila.ai</p>
        <nav aria-label="Legal">
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
        </nav>
      </div>
    </footer>
  );
}
