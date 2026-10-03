import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import "../../vitrine.css";

interface ItemVitrine {
  nome: string;
  precoVenda: number;
  fotoUrl: string;
  descricao?: string | null;
  sku?: string | null;
}

interface VitrineResponse {
  ok: boolean;
  loja: {
    slug: string;
    nomeExibicao: string;
    whatsappContato: string;
    corPrimaria: string;
    corSecundaria: string;
    corDestaque: string;
    tipografiaHeading: string;
    tipografiaBody: string;
    logoUrl?: string | null;
    plano: string;
  };
  vitrine: {
    id: string;
    slugColecao: string;
    tituloColecao: string;
    descricao?: string | null;
    expiraEm?: number | null;
    itens: ItemVitrine[];
  };
}

async function getShowcase(slugLoja: string, slugColecao: string): Promise<VitrineResponse | null> {
  const apiUrl = process.env.MILA_INTERNAL_API_URL || "https://wa.milaai.com.br";
  const token = process.env.MILA_INTERNAL_HMAC_SECRET || "mila_internal_hmac_secret_2026";

  try {
    const res = await fetch(
      `${apiUrl}/api/internal/showcase?slugLoja=${encodeURIComponent(slugLoja)}&slugColecao=${encodeURIComponent(slugColecao)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (res.status === 404 || res.status === 410) {
      return null;
    }

    if (!res.ok) {
      console.error(`Erro ao carregar vitrine: status ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("Falha de rede ao consultar API interna da vitrine:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugLoja: string; slugColecao: string }>;
}): Promise<Metadata> {
  const { slugLoja, slugColecao } = await params;
  const data = await getShowcase(slugLoja, slugColecao);

  if (!data || !data.ok || !data.loja || !data.vitrine) {
    return {
      title: "Vitrine não encontrada | Mila",
    };
  }

  const { loja, vitrine } = data;
  return {
    title: `${vitrine.tituloColecao} — ${loja.nomeExibicao}`,
    description: `Confira os lançamentos e novidades da ${loja.nomeExibicao}. Peça direto pelo WhatsApp!`,
    openGraph: {
      title: `${vitrine.tituloColecao} | ${loja.nomeExibicao}`,
      description: `Confira a nova seleção de peças exclusivas da ${loja.nomeExibicao}.`,
      images: vitrine.itens[0]?.fotoUrl ? [vitrine.itens[0].fotoUrl] : [],
    },
  };
}

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ slugLoja: string; slugColecao: string }>;
}) {
  const { slugLoja, slugColecao } = await params;
  const data = await getShowcase(slugLoja, slugColecao);

  if (!data || !data.ok || !data.loja || !data.vitrine) {
    notFound();
  }

  const { loja, vitrine } = data;
  const whatsappLimpo = (loja.whatsappContato || "").replace(/\D/g, "");

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <div
      className="vitrine-container"
      style={{
        fontFamily: loja.tipografiaBody || "inherit",
      }}
    >
      {/* Header Fixo */}
      <header className="vitrine-header">
        <div className="vitrine-header-inner">
          <div className="vitrine-brand">
            {loja.logoUrl ? (
              <img
                src={loja.logoUrl}
                alt={loja.nomeExibicao}
                className="vitrine-logo"
              />
            ) : (
              <div
                className="vitrine-logo-placeholder"
                style={{ backgroundColor: loja.corPrimaria || "#1F2937" }}
              >
                {(loja.nomeExibicao || "LO").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="vitrine-store-name">{loja.nomeExibicao}</h1>
              <p className="vitrine-collection-subtitle">{vitrine.tituloColecao}</p>
            </div>
          </div>

          <Link
            href={`https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(
              `Olá, ${loja.nomeExibicao}! Vi sua vitrine (${vitrine.tituloColecao}) e gostaria de tirar uma dúvida.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="vitrine-header-contact"
          >
            <span>💬</span> Contato
          </Link>
        </div>
      </header>

      {/* Hero da Coleção */}
      <section className="vitrine-hero">
        <span className="vitrine-badge">Mostruário Digital</span>
        <h2
          className="vitrine-title"
          style={{
            fontFamily: loja.tipografiaHeading || "inherit",
            color: loja.corPrimaria || "#1F2937",
          }}
        >
          {vitrine.tituloColecao}
        </h2>
        <p className="vitrine-description">
          Selecione suas peças favoritas e finalize seu pedido diretamente no WhatsApp da loja com atendimento personalizado.
        </p>
      </section>

      {/* Grid de Peças */}
      <main className="vitrine-main">
        <div className="vitrine-grid">
          {vitrine.itens.map((item, idx) => {
            const mensagemWhatsApp = encodeURIComponent(
              `Olá, ${loja.nomeExibicao}! Gostaria de pedir a peça "${item.nome}" (${formatarPreco(
                item.precoVenda
              )}) que vi na sua vitrine.`
            );
            const linkPedido = `https://wa.me/${whatsappLimpo}?text=${mensagemWhatsApp}`;

            return (
              <div key={idx} className="vitrine-card">
                {/* Imagem Proporcional 1:1 */}
                <div className="vitrine-card-image-wrap">
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    className="vitrine-card-image"
                    loading="lazy"
                  />
                </div>

                {/* Conteúdo do Card */}
                <div className="vitrine-card-body">
                  <div>
                    <h3 className="vitrine-card-title">{item.nome}</h3>
                    <p
                      className="vitrine-card-price"
                      style={{ color: loja.corDestaque || "#D97706" }}
                    >
                      {formatarPreco(item.precoVenda)}
                    </p>
                  </div>

                  {/* Botão de Fechamento no WhatsApp */}
                  <Link
                    href={linkPedido}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vitrine-card-btn"
                    style={{
                      backgroundColor: loja.corPrimaria || "#1F2937",
                    }}
                  >
                    <span>💬</span>
                    <span>Pedir no WhatsApp</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="vitrine-footer">
        <p className="vitrine-footer-disclaimer">
          Esta vitrine é um catálogo direto da loja <strong>{loja.nomeExibicao}</strong>. Sem intermediários ou taxas de pagamento.
        </p>
        <p className="vitrine-footer-brand">
          Tecnologia Mila AI • Inteligência para Semijoias
        </p>
      </footer>
    </div>
  );
}
