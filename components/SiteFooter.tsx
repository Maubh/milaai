import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer on-dark">
      <div className="wrap footer-grid">
        <div>
          <p className="brand">
            soc<span className="brand-ia">IA</span>
          </p>
          <p className="footer-note">
            Demonstração navegável para lojistas de semijoias e moda. Valores e conversas são exemplos
            ilustrativos, não resultados reais.
          </p>
        </div>
        <nav aria-label="Links da demonstração">
          <p className="footer-title">Demonstração</p>
          <Link href="/login">Entrar na demonstração</Link>
          <Link href="/workspace">Visão geral</Link>
          <Link href="/workspace/precificacao">Precificação</Link>
          <Link href="/workspace/conteudo">Conteúdo</Link>
          <Link href="/workspace/integracoes">Integrações</Link>
        </nav>
        <nav aria-label="Seções da página inicial">
          <p className="footer-title">Nesta página</p>
          <a href="/#raio-x">Raio-X da peça</a>
          <a href="/#conversa">Prévia de conversa</a>
          <a href="/#rotina">Rotina</a>
          <a href="/#planos">Planos previstos</a>
          <a href="/#faq">Perguntas</a>
        </nav>
      </div>
      <div className="wrap footer-base">
        <p>Feito para empreendedoras de joias e semijoias · Protótipo sem integrações reais</p>
      </div>
    </footer>
  );
}
