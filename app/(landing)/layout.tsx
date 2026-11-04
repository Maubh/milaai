import type { Metadata } from "next";

const TITULO = "mila. · A assistente de bolso da sua loja";
const DESCRICAO =
  "A mila. é a assistente de IA para lojas de joias e semijoias. Vive no seu WhatsApp: precifica com margem, lê notas de compra, escreve descrições e cuida dos fornecedores.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: { title: TITULO, description: DESCRICAO, url: "https://milaai.com.br", siteName: "mila.", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
};

/** Home: a landing traz o próprio menu e rodapé, por isso fica fora do grupo (site). */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
