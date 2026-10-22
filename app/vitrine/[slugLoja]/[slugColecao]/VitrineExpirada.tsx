import type { LojaExpirada } from "@/lib/vitrine";

/**
 * Vitrine que passou da data de validade. A API devolve 410 com os dados
 * públicos da loja; em vez de "página não encontrada", a cliente vê de quem é
 * o catálogo e chama a loja no WhatsApp para pedir o atualizado.
 */
export default function VitrineExpirada({
  loja,
  tituloColecao,
}: {
  loja: LojaExpirada;
  tituloColecao: string | null;
}) {
  const nome = loja.nomeExibicao || "a loja";
  const whatsapp = (loja.whatsappContato || "").replace(/\D/g, "");
  const cor = loja.corPrimaria || "#1F2937";
  const mensagem = tituloColecao
    ? `Olá, ${nome}! Tentei abrir o catálogo "${tituloColecao}", mas ele expirou. Pode me mandar o catálogo atualizado?`
    : `Olá, ${nome}! Tentei abrir seu catálogo, mas ele expirou. Pode me mandar o catálogo atualizado?`;

  return (
    <div className="vitrine-container">
      <main className="vitrine-expirada">
        {loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={loja.logoUrl} alt={nome} className="vitrine-logo vitrine-expirada-logo" />
        ) : (
          <div className="vitrine-logo-placeholder vitrine-expirada-logo" style={{ backgroundColor: cor }}>
            {nome.substring(0, 2).toUpperCase()}
          </div>
        )}
        {loja.nomeExibicao ? <p className="vitrine-store-name">{loja.nomeExibicao}</p> : null}
        <h1 className="vitrine-expirada-titulo">Este catálogo expirou</h1>
        <p className="vitrine-expirada-texto">
          {tituloColecao ? <>A seleção &ldquo;{tituloColecao}&rdquo; não está mais disponível. </> : null}
          Peça o catálogo atualizado direto para a loja pelo WhatsApp.
        </p>
        {whatsapp ? (
          <a
            className="vitrine-expirada-botao"
            style={{ backgroundColor: cor }}
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir catálogo atualizado no WhatsApp
          </a>
        ) : null}
      </main>
    </div>
  );
}
