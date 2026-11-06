"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ROTULO_ENTREGA,
  gerarCodigoPedido,
  montarMensagemPedido,
  quantidadeSacola,
  totalSacola,
  type ItemSacola,
  type ModoEntrega,
} from "../../../../lib/pedido_vitrine";

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

  // Sacola: quantidade por índice da peça em vitrine.itens (só na sessão da página).
  const [sacola, setSacola] = useState<Record<number, number>>({});
  const [sacolaAberta, setSacolaAberta] = useState(false);
  const [codigoPedido, setCodigoPedido] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [entrega, setEntrega] = useState<ModoEntrega>("combinar");
  const [observacao, setObservacao] = useState("");
  const [copiado, setCopiado] = useState(false);

  const whatsappLimpo = (loja.whatsappContato || "").replace(/\D/g, "");

  const itensSacola: ItemSacola[] = Object.entries(sacola).flatMap(([idx, qtd]) => {
    const item = vitrine.itens[Number(idx)];
    return item ? [{ nome: item.nome, precoVenda: item.precoVenda, sku: item.sku ?? null, qtd }] : [];
  });
  const qtdSacola = quantidadeSacola(itensSacola);

  const mudarQtdSacola = (idx: number, delta: number) => {
    setSacola((atual) => {
      const nova = { ...atual };
      const qtd = (atual[idx] || 0) + delta;
      if (qtd <= 0) delete nova[idx];
      else nova[idx] = qtd;
      return nova;
    });
  };

  const abrirSacola = () => {
    setCodigoPedido(gerarCodigoPedido());
    setCopiado(false);
    setSacolaAberta(true);
  };

  const fecharSacola = () => setSacolaAberta(false);

  const textoPedido = montarMensagemPedido({
    nomeLoja: loja.nomeExibicao,
    codigo: codigoPedido,
    itens: itensSacola,
    formatarPreco: (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
    nomeCliente,
    entrega,
    observacao,
  });

  const copiarPedido = async () => {
    try {
      await navigator.clipboard.writeText(textoPedido);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

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
        // Cores da loja para a sacola e a barra do pedido (vitrine.css).
        ["--loja-primaria" as string]: loja.corPrimaria || "#1F2937",
        ["--loja-destaque" as string]: loja.corDestaque || "#D97706",
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

                  <button
                    type="button"
                    className="vitrine-card-btn vitrine-card-btn-sacola"
                    onClick={(e) => {
                      e.stopPropagation();
                      mudarQtdSacola(idx, 1);
                    }}
                  >
                    {sacola[idx] ? `✓ No pedido (${sacola[idx]})` : "+ Pôr no pedido"}
                  </button>

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

              <button
                type="button"
                className="vitrine-modal-cta vitrine-modal-cta-sacola"
                onClick={() => {
                  const idx = vitrine.itens.indexOf(itemSelecionado);
                  if (idx >= 0) mudarQtdSacola(idx, 1);
                }}
              >
                + Pôr no pedido
              </button>

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

      {/* Barra do pedido: aparece só quando há peças escolhidas */}
      {qtdSacola > 0 && !sacolaAberta && (
        <div className="vitrine-pedido-barra">
          <div className="vitrine-pedido-barra-resumo">
            <strong>{qtdSacola} {qtdSacola === 1 ? "peça escolhida" : "peças escolhidas"}</strong>
            <span>{formatarPreco(totalSacola(itensSacola))}</span>
          </div>
          <button
            type="button"
            className="vitrine-pedido-barra-btn"
            onClick={abrirSacola}
            style={{ backgroundColor: loja.corPrimaria || "#1F2937" }}
          >
            Revisar pedido →
          </button>
        </div>
      )}

      {/* Pedido: lista, dados e mensagem pronta para o WhatsApp */}
      {sacolaAberta && (
        <div className="vitrine-sacola-overlay" onClick={fecharSacola}>
          <div
            className="vitrine-sacola-panel"
            role="dialog"
            aria-label="Seu pedido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vitrine-sacola-head">
              <h2 className="vitrine-sacola-title" style={{ fontFamily: loja.tipografiaHeading || "inherit" }}>Seu pedido</h2>
              <button className="vitrine-modal-close" onClick={fecharSacola} aria-label="Voltar ao catálogo">
                ✕
              </button>
            </div>

            {itensSacola.length === 0 ? (
              <p className="vitrine-sacola-vazia">
                Nenhuma peça escolhida ainda. Toque em “Pôr no pedido” nas peças que gostar.
              </p>
            ) : (
              <>
                <ul className="vitrine-sacola-lista">
                  {Object.entries(sacola).map(([idx, qtd]) => {
                    const item = vitrine.itens[Number(idx)];
                    if (!item) return null;
                    return (
                      <li key={idx} className="vitrine-sacola-item">
                        <div className="vitrine-sacola-item-info">
                          <span className="vitrine-sacola-item-nome">{item.nome}</span>
                          {item.sku && <span className="vitrine-sacola-item-ref">REF {item.sku}</span>}
                          <span className="vitrine-sacola-item-preco">{formatarPreco(item.precoVenda)}</span>
                        </div>
                        <div className="vitrine-sacola-item-controles">
                          <button type="button" onClick={() => mudarQtdSacola(Number(idx), -1)} aria-label="Diminuir">−</button>
                          <span>{qtd}</span>
                          <button type="button" onClick={() => mudarQtdSacola(Number(idx), 1)} aria-label="Aumentar">+</button>
                          <button
                            type="button"
                            className="vitrine-sacola-remover"
                            onClick={() => setSacola((atual) => {
                              const nova = { ...atual };
                              delete nova[Number(idx)];
                              return nova;
                            })}
                          >
                            Remover
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="vitrine-sacola-total">
                  <span>{qtdSacola} {qtdSacola === 1 ? "peça" : "peças"}</span>
                  <strong>{formatarPreco(totalSacola(itensSacola))}</strong>
                </div>

                <div className="vitrine-sacola-form">
                  <label className="vitrine-sacola-campo">
                    <span>Para quem é o pedido?</span>
                    <input
                      type="text"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </label>

                  <label className="vitrine-sacola-campo">
                    <span>Recebimento</span>
                    <select value={entrega} onChange={(e) => setEntrega(e.target.value as ModoEntrega)}>
                      {(Object.keys(ROTULO_ENTREGA) as ModoEntrega[]).map((modo) => (
                        <option key={modo} value={modo}>{ROTULO_ENTREGA[modo]}</option>
                      ))}
                    </select>
                  </label>

                  <label className="vitrine-sacola-campo">
                    <span>Recado para a loja (opcional)</span>
                    <textarea
                      rows={2}
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      placeholder="Tamanho, cor, melhor horário…"
                    />
                  </label>
                </div>

                <details className="vitrine-sacola-previa">
                  <summary>Prévia da mensagem</summary>
                  <pre className="vitrine-sacola-msg">{textoPedido}</pre>
                </details>

                <div className="vitrine-sacola-acoes">
                  <button
                    type="button"
                    className="vitrine-sacola-copiar"
                    onClick={copiarPedido}
                  >
                    {copiado ? "✓ Mensagem copiada" : "Copiar mensagem"}
                  </button>
                  <Link
                    href={`https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(textoPedido)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vitrine-sacola-enviar"
                    style={{ backgroundColor: loja.corPrimaria || "#1F2937" }}
                  >
                    <span>💬</span> Mandar no WhatsApp
                  </Link>
                </div>

                <p className="vitrine-sacola-aviso">
                  Nada é cobrado aqui: {loja.nomeExibicao} confirma estoque, pagamento e envio pelo WhatsApp.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
