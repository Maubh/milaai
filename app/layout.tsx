import type { Metadata } from "next";
import "./globals.css";
import "./site.css";

export const metadata: Metadata = {
  title: "mila.ai — A inteligência por trás da sua loja de joias ou semijoias",
  description:
    "Tenha a mila no seu WhatsApp. Precificação com margem real, descrições prontas para e-commerce, gestão de fornecedores e balanço financeiro mensal sem esforço.",
  metadataBase: new URL("https://milaai.com.br"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
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
