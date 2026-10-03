import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

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
        next: { revalidate: 60 }, // Cache ISR de 60s
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
      className="min-h-screen bg-stone-50 text-stone-900 pb-20 selection:bg-amber-100"
      style={{
        fontFamily: loja.tipografiaBody || "Inter, sans-serif",
      }}
    >
      {/* Cabeçalho Limpo e Focado (Sem banners gigantes) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-3.5 transition-all">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loja.logoUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                <Image
                  src={loja.logoUrl}
                  alt={loja.nomeExibicao}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                style={{ backgroundColor: loja.corPrimaria || "#1F2937" }}
              >
                {(loja.nomeExibicao || "LO").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-stone-900 leading-tight tracking-tight">
                {loja.nomeExibicao}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {vitrine.tituloColecao}
              </p>
            </div>
          </div>

          <Link
            href={`https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(
              `Olá, ${loja.nomeExibicao}! Vi sua vitrine (${vitrine.tituloColecao}) e gostaria de tirar uma dúvida.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <span>💬</span> Contato
          </Link>
        </div>
      </header>

      {/* Hero da Coleção */}
      <section className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        <div className="text-center space-y-1.5">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-200/60 px-2.5 py-0.5 rounded-full">
            Mostruário Digital
          </span>
          <h2
            className="text-2xl font-bold tracking-tight text-stone-900"
            style={{
              fontFamily: loja.tipografiaHeading || "inherit",
              color: loja.corPrimaria || "#1F2937",
            }}
          >
            {vitrine.tituloColecao}
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Selecione suas peças favoritas e finalize seu pedido diretamente no WhatsApp da loja com atendimento personalizado.
          </p>
        </div>
      </section>

      {/* Grid de Peças Mobile-First */}
      <main className="max-w-2xl mx-auto px-4 pt-2">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {vitrine.itens.map((item, idx) => {
            const mensagemWhatsApp = encodeURIComponent(
              `Olá, ${loja.nomeExibicao}! Gostaria de pedir a peça "${item.nome}" (${formatarPreco(
                item.precoVenda
              )}) que vi na sua vitrine.`
            );
            const linkPedido = `https://wa.me/${whatsappLimpo}?text=${mensagemWhatsApp}`;

            return (
              <div
                key={idx}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
              >
                {/* Foto Real Obrigatória */}
                <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={item.fotoUrl}
                    alt={item.nome}
                    fill
                    sizes="(max-width: 640px) 50vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Dados da Peça */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
                  <div className="space-y-1">
                    <h3 className="font-medium text-stone-800 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {item.nome}
                    </h3>
                    <p
                      className="text-sm sm:text-base font-bold tracking-tight"
                      style={{ color: loja.corDestaque || "#D97706" }}
                    >
                      {formatarPreco(item.precoVenda)}
                    </p>
                  </div>

                  {/* Botão de Fechamento Direto no WhatsApp (Zero Checkout) */}
                  <Link
                    href={linkPedido}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition-all text-center"
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

      {/* Rodapé Seguro e Neutro */}
      <footer className="max-w-2xl mx-auto px-4 mt-12 text-center space-y-2 border-t border-stone-200/60 pt-6">
        <p className="text-[11px] text-stone-400">
          Esta vitrine é um catálogo direto da loja <strong>{loja.nomeExibicao}</strong>. Sem intermediários ou taxas de pagamento.
        </p>
        <p className="text-[10px] text-stone-300 font-medium">
          Tecnologia Mila AI • Inteligência para Semijoias
        </p>
      </footer>
    </div>
  );
}
