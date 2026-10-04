"use client";

import { useState } from "react";
import Link from "next/link";

export interface ItemVitrine {
  nome: string;
  precoVenda: number;
  fotoUrl: string;
  fotos?: string[] | null;
  descricao?: string | null;
  sku?: string | null;
}

export interface LojaVitrine {
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
}

interface VitrineViewProps {
  loja: LojaVitrine;
  vitrine: {
    id: string;
    slugColecao: string;
    tituloColecao: string;
    descricao?: string | null;
    itens: ItemVitrine[];
  };
}

export default function VitrineView({ loja, vitrine }: VitrineViewProps) {
  const [itemSelecionado, setItemSelecionado] = useState<ItemVitrine | null>(null);
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState<number>(0);

  const whatsappLimpo = (loja.whatsappContato || "").replace(/\D/g, "");

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const abrirModalItem = (item: ItemVitrine) => {
    setItemSelecionado(item);
    setFotoAtivaIndex(0);
  };

  const fecharModalItem = () => {
    setItemSelecionado(null);
    setFotoAtivaIndex(0);
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
              `Olá, ${loja.nomeExibicao}! Estava vendo seu catálogo (${vitrine.tituloColecao}) e gostaria de tirar uma dúvida.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="vitrine-header-contact"
          >
            <span>💬</span> Conversar
          </Link>
        </div>
      </header>

      {/* Hero da Coleção */}
      <section className="vitrine-hero">
        <span className="vitrine-badge">Catálogo</span>
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
          Peças disponíveis à pronta-entrega. Toque em qualquer peça para ver fotos de perto e detalhes.
        </p>
      </section>

      {/* Grid de Peças */}
      <main className="vitrine-main">
        <div className="vitrine-grid">
          {vitrine.itens.map((item, idx) => {
            const mensagemWhatsApp = encodeURIComponent(
              `Olá! Vi a peça "${item.nome}" (${formatarPreco(
                item.precoVenda
              )}) no catálogo e gostaria de saber se está disponível.`
            );
            const linkPedido = `https://wa.me/${whatsappLimpo}?text=${mensagemWhatsApp}`;

            return (
              <div
                key={idx}
                className="vitrine-card"
                onClick={() => abrirModalItem(item)}
              >
                {/* Imagem Proporcional 1:1 Clicável */}
                <div className="vitrine-card-image-wrap">
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    className="vitrine-card-image"
                    loading="lazy"
                  />
                  <div className="vitrine-card-badge-zoom">
                    🔍 Ver detalhes
                  </div>
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
                    onClick={(e) => e.stopPropagation()}
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
          Catálogo exclusivo da loja <strong>{loja.nomeExibicao}</strong>. O atendimento e a entrega são feitos diretamente pela lojista.
        </p>
        <div className="vitrine-footer-brand-wrap">
          <Link
            href="https://milaai.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="vitrine-footer-brand-link"
          >
            <span>Criado por</span>
            <strong>mila.</strong>
            <span className="vitrine-footer-brand-arrow">↗</span>
          </Link>
        </div>
      </footer>

      {/* Modal / Gaveta de Detalhes da Peça com Galeria de Fotos */}
      {itemSelecionado && (
        <div className="vitrine-modal-overlay" onClick={fecharModalItem}>
          <div
            className="vitrine-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="vitrine-modal-close"
              onClick={fecharModalItem}
              aria-label="Fechar"
            >
              ✕
            </button>

            {/* Galeria de Fotos em Alta Definição */}
            <div className="vitrine-modal-gallery">
              {(() => {
                const todasFotos = itemSelecionado.fotos && itemSelecionado.fotos.length > 0
                  ? itemSelecionado.fotos
                  : [itemSelecionado.fotoUrl];
                const fotoPrincipal = todasFotos[fotoAtivaIndex] || itemSelecionado.fotoUrl;

                return (
                  <>
                    <div className="vitrine-modal-main-image-wrap">
                      <img
                        src={fotoPrincipal}
                        alt={itemSelecionado.nome}
                        className="vitrine-modal-main-image"
                      />
                    </div>

                    {todasFotos.length > 1 && (
                      <div className="vitrine-modal-thumbs">
                        {todasFotos.map((f, fIdx) => (
                          <button
                            key={fIdx}
                            className={`vitrine-modal-thumb-btn ${
                              fIdx === fotoAtivaIndex ? "active" : ""
                            }`}
                            onClick={() => setFotoAtivaIndex(fIdx)}
                          >
                            <img src={f} alt="" className="vitrine-modal-thumb-img" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Informações da Peça no Modal */}
            <div className="vitrine-modal-info">
              <span className="vitrine-modal-sku">
                {itemSelecionado.sku ? `REF: ${itemSelecionado.sku}` : "PEÇA EXCLUSIVA"}
              </span>
              <h2 className="vitrine-modal-title">{itemSelecionado.nome}</h2>
              <p
                className="vitrine-modal-price"
                style={{ color: loja.corDestaque || "#D97706" }}
              >
                {formatarPreco(itemSelecionado.precoVenda)}
              </p>

              {itemSelecionado.descricao && (
                <p className="vitrine-modal-desc">
                  {itemSelecionado.descricao}
                </p>
              )}

              {/* Botão de Fechamento Direto no Modal */}
              <Link
                href={`https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(
                  `Olá! Vi a peça "${itemSelecionado.nome}" (${formatarPreco(
                    itemSelecionado.precoVenda
                  )}) no catálogo e gostaria de tirar uma dúvida ou pedir agora.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="vitrine-modal-cta"
                style={{
                  backgroundColor: loja.corPrimaria || "#1F2937",
                }}
              >
                <span>💬</span>
                <span>Pedir esta peça pelo WhatsApp</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
