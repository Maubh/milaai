import Link from "next/link";

/** Rodapé das páginas internas: o mesmo da home. */
export default function SiteFooter() {
  return (
    <footer className="sf">
      <div className="sf-inner">
        <img className="sf-mark" src="/brand/vectors/wordmark-ivory.svg" alt="mila." width="72" height="26" />
        <p>
          © 2026 mila. Todos os direitos reservados. ·{" "}
          <a href="https://instagram.com/usemila.ai" target="_blank" rel="noopener noreferrer">
            @usemila.ai
          </a>
        </p>
        <nav aria-label="Legal">
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
          <Link href="/exclusao-de-dados">Exclusão de dados</Link>
        </nav>
      </div>
    </footer>
  );
}
