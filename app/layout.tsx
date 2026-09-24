import type { Metadata } from "next";
import "./globals.css";
import "./site.css";

export const metadata: Metadata = {
  title: "socIA — Sua peça vale mais quando você conhece cada número",
  description:
    "Demonstração navegável do Raio-X do Preço para lojistas de semijoias e moda. Calculadora local, prévia de conversa e workspace de exemplo.",
  metadataBase: new URL("https://socia.example"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="sr-only" href="#conteudo">
          Pular para o conteúdo
        </a>
        <main id="conteudo">{children}</main>
      </body>
    </html>
  );
}
