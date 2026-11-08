"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { fontesDaVitrine } from "../../../../lib/marca";
import {
  ROTULO_ENTREGA,
  chaveLinha,
  descreverEscolhas,
  gerarCodigoPedido,
  montarMensagemPedido,
  quantidadeSacola,
  totalSacola,
  variacaoFaltando,
  variacoesValidas,
  type Escolhas,
  type ItemSacola,
  type ModoEntrega,
} from "../../../../lib/pedido_vitrine";
import {
  TINTA_CLARA,
  TINTA_ESCURA,
  corDeTextoLegivel,
  corOuReserva,
  tintaSobre,
  type ItemVitrine,
  type TemplateVitrine,
} from "../../../../lib/vitrine";
import type { ColecaoVitrine, LojaVitrine } from "../../../../lib/server/vitrine-api";

export type { ItemVitrine, LojaVitrine };

/** Linha da sacola: a peça e o que a cliente escolheu em cada variação. */
interface LinhaSacola {
  idx: number;
  escolhas: Escolhas;
  qtd: number;
}

interface VitrineViewProps {
  loja: Omit<LojaVitrine, "template"> & { template?: TemplateVitrine };
  vitrine: ColecaoVitrine;
  /** Layout: `classico` (padrão), `editorial` ou `minimalista`. */
  template?: TemplateVitrine;
  /**
   * Vitrine de exemplo (galeria de layouts e prévia): peças ilustrativas, sem
   * preço e sem mandar nada para o WhatsApp.
   */
  exemplo?: boolean;
}

/* Fundo da página e cores de reserva: as mesmas de vitrine.css. */
const FUNDO = TINTA_CLARA;
const PRIMARIA_RESERVA = "#1F2937";
const DESTAQUE_RESERVA = "#B45309";
const TEXTO_PADRAO = "Peças disponíveis à pronta-entrega. Toque em qualquer peça para ver fotos de perto e detalhes.";

function IconeWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.6 20.4 4.9 16.6A8.6 8.6 0 1 1 8 19.4Z" />
      <path d="M9.1 8.2c.3-.5.6-.6 1-.6h.4l1 2.2-.7 1c.5 1.1 1.4 2 2.5 2.5l1-.7 2.2 1v.4c0 .4-.1.7-.6 1-.8.5-2 .5-3.2-.1a8.2 8.2 0 0 1-3.6-3.6c-.6-1.2-.6-2.4-.1-3.1Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconeFechar() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}
function IconeCheck() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
}
function IconeMais() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}

export default function VitrineView({ loja, vitrine, template, exemplo = false }: VitrineViewProps) {
  const layout: TemplateVitrine = template ?? loja.template ?? "classico";
  const [itemSelecionado, setItemSelecionado] = useState<ItemVitrine | null>(null);
  const [fotoAtivaIndex, setFotoAtivaIndex] = useState<number>(0);

  // Sacola: uma linha por peça + escolhas (só na sessão da página).
  const [sacola, setSacola] = useState<Record<string, LinhaSacola>>({});
  const [escolhas, setEscolhas] = useState<Escolhas>({});
  const [sacolaAberta, setSacolaAberta] = useState(false);
  const [codigoPedido, setCodigoPedido] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [entrega, setEntrega] = useState<ModoEntrega>("combinar");
  const [observacao, setObservacao] = useState("");
  const [copiado, setCopiado] = useState(false);

  const idBase = useId();
  const fecharRef = useRef<HTMLButtonElement>(null);
  const abriuDeRef = useRef<HTMLElement | null>(null);

  const whatsappLimpo = (loja.whatsappContato || "").replace(/\D/g, "");
  const nomeLoja = loja.nomeExibicao || "a loja";

  const variacoesDe = (item: ItemVitrine) => variacoesValidas(item.variacoes);

  const itensSacola: ItemSacola[] = Object.values(sacola).flatMap((l) => {
    const item = vitrine.itens[l.idx];
    if (!item) return [];
    const variacao = descreverEscolhas(variacoesDe(item), l.escolhas);
    return [{ nome: item.nome, precoVenda: item.precoVenda, sku: item.sku ?? null, qtd: l.qtd, variacao }];
  });
  const qtdSacola = quantidadeSacola(itensSacola);
  const qtdDaPeca = (idx: number) => Object.values(sacola).reduce((soma, l) => soma + (l.idx === idx ? l.qtd : 0), 0);
  const linhasDaPeca = (idx: number) => Object.entries(sacola).filter(([, l]) => l.idx === idx);

  const retirarLinha = (chave: string) => {
    setSacola((atual) => {
      const nova = { ...atual };
      delete nova[chave];
      return nova;
    });
  };

  const mudarQtdLinha = (chave: string, delta: number) => {
    setSacola((atual) => {
      const linha = atual[chave];
      if (!linha) return atual;
      const nova = { ...atual };
      const qtd = linha.qtd + delta;
      if (qtd <= 0) delete nova[chave];
      else nova[chave] = { ...linha, qtd };
      return nova;
    });
  };

  const porNoPedido = (idx: number, escolhidas: Escolhas) => {
    const item = vitrine.itens[idx];
    if (!item) return;
    const vars = variacoesDe(item);
    if (variacaoFaltando(vars, escolhidas)) return;
    const chave = chaveLinha(idx, vars, escolhidas);
    setSacola((atual) => ({
      ...atual,
      [chave]: { idx, escolhas: { ...escolhidas }, qtd: (atual[chave]?.qtd ?? 0) + 1 },
    }));
  };

  const abrirSacola = () => {
    setCodigoPedido(gerarCodigoPedido());
    setCopiado(false);
    setSacolaAberta(true);
  };
  const fecharSacola = () => setSacolaAberta(false);

  const formatarMoeda = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  // Na vitrine de exemplo não existe valor: o lugar do preço diz que é exemplo.
  const formatarPreco = (valor: number) => (exemplo ? "Exemplo" : formatarMoeda(valor));

  const textoPedido = montarMensagemPedido({
    nomeLoja: nomeLoja,
    codigo: codigoPedido,
    itens: itensSacola,
    formatarPreco: formatarMoeda,
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

  const abrirModalItem = (item: ItemVitrine, origem?: HTMLElement | null) => {
    abriuDeRef.current = origem ?? (document.activeElement as HTMLElement | null);
    setItemSelecionado(item);
    setFotoAtivaIndex(0);
    setEscolhas({});
  };

  const fecharModalItem = () => {
    setItemSelecionado(null);
    setFotoAtivaIndex(0);
    abriuDeRef.current?.focus?.();
  };

  // Diálogos: foco no fechar ao abrir, Esc fecha, a página de trás não rola.
  const dialogoAberto = itemSelecionado !== null || sacolaAberta;
  useEffect(() => {
    if (!dialogoAberto) return;
    fecharRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sacolaAberta) fecharSacola();
      else fecharModalItem();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogoAberto, sacolaAberta]);

  const fontes = fontesDaVitrine(loja);
  const primaria = corOuReserva(loja.corPrimaria, PRIMARIA_RESERVA);
  const destaque = corOuReserva(loja.corDestaque, DESTAQUE_RESERVA);

  const linkWhatsApp = (texto: string) => `https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(texto)}`;

  /** Link para o WhatsApp da loja; na vitrine de exemplo, um botão desligado. */
  const BotaoWhatsApp = ({ texto, className, children }: { texto: string; className: string; children: React.ReactNode }) =>
    exemplo || !whatsappLimpo ? (
      <button type="button" className={className} disabled aria-disabled="true" title="Na vitrine de exemplo o WhatsApp fica desligado">
        {children}
      </button>
    ) : (
      <Link href={linkWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </Link>
    );

  const botaoPedido = (item: ItemVitrine, idx: number, className: string) => {
    const comVariacao = variacoesDe(item).length > 0;
    const no = qtdDaPeca(idx);
    return (
      <button
        type="button"
        className={`${className}${no > 0 ? " is-no-pedido" : ""}`}
        aria-label={
          layout === "minimalista"
            ? `${no > 0 ? "No pedido, ver ou retirar" : comVariacao ? "Escolher opções de" : "Pôr no pedido"} ${item.nome}`
            : undefined
        }
        onClick={(e) => {
          // Peça já no pedido ou com variação abre o detalhe: lá a cliente vê o
          // que já pôs, retira ou escolhe as opções.
          if (no > 0 || comVariacao) abrirModalItem(item, e.currentTarget);
          else porNoPedido(idx, {});
        }}
      >
        {no > 0 ? <IconeCheck /> : <IconeMais />}
        <span>{no > 0 ? `No pedido (${no})` : comVariacao ? "Escolher opções" : "Pôr no pedido"}</span>
      </button>
    );
  };

  const destaqueEditorial = layout === "editorial" ? vitrine.itens[0] : undefined;
  const itensDaGrade = destaqueEditorial ? vitrine.itens.slice(1) : vitrine.itens;
  const indice = (item: ItemVitrine) => vitrine.itens.indexOf(item);

  const cartao = (item: ItemVitrine, posicao: number) => {
    const idx = indice(item);
    return (
      <article key={idx} className="vitrine-card">
        <button type="button" className="vitrine-card-abrir" onClick={(e) => abrirModalItem(item, e.currentTarget)} aria-label={`Ver detalhes de ${item.nome}`}>
          <span className="vitrine-card-image-wrap">
            <img src={item.fotoUrl} alt={item.nome} className="vitrine-card-image" loading={posicao < 2 ? "eager" : "lazy"} fetchPriority={posicao === 0 ? "high" : undefined} />
          </span>
          <span className="vitrine-card-texto">
            <span className="vitrine-card-title">{item.nome}</span>
            <span className={`vitrine-card-price${exemplo ? " is-exemplo" : ""}`}>{formatarPreco(item.precoVenda)}</span>
          </span>
        </button>
        <div className="vitrine-card-body">
          {botaoPedido(item, idx, "vitrine-card-btn vitrine-card-btn-sacola")}
          {layout === "classico" ? (
            <BotaoWhatsApp texto={`Olá! Vi a peça "${item.nome}" (${formatarMoeda(item.precoVenda)}) no catálogo e gostaria de saber se está disponível.`} className="vitrine-card-btn vitrine-card-btn-whatsapp">
              <IconeWhatsApp />
              <span>Pedir no WhatsApp</span>
            </BotaoWhatsApp>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <div
      className="vitrine-container"
      data-template={layout}
      style={{
        // Fontes e cores da marca viram tokens; vitrine.css só usa as variáveis.
        fontFamily: fontes.corpo,
        ["--fonte-titulo" as string]: fontes.titulo,
        ["--fonte-subtitulo" as string]: fontes.subtitulo,
        ["--fonte-corpo" as string]: fontes.corpo,
        ["--loja-primaria" as string]: primaria,
        ["--loja-primaria-tinta" as string]: tintaSobre(primaria),
        ["--loja-primaria-texto" as string]: corDeTextoLegivel(primaria, FUNDO, TINTA_ESCURA),
        ["--loja-destaque" as string]: destaque,
        ["--loja-destaque-texto" as string]: corDeTextoLegivel(destaque, FUNDO, TINTA_ESCURA),
      }}
    >
      {fontes.links.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="fontes-vitrine" />
      ))}
      {fontes.fontFace ? <style>{fontes.fontFace}</style> : null}

      <header className="vitrine-header">
        <div className="vitrine-header-inner">
          {loja.logoUrl ? (
            // Com logo, a barra mostra só a logo; o nome da loja fica para leitores de tela.
            <div className="vitrine-brand vitrine-brand-so-logo">
              <img src={loja.logoUrl} alt={`Logo de ${nomeLoja}`} className="vitrine-logo" />
              <h1 className="sr-only">{loja.nomeExibicao}</h1>
            </div>
          ) : (
            <div className="vitrine-brand">
              <div className="vitrine-logo-placeholder" aria-hidden="true">
                {(loja.nomeExibicao || "LO").substring(0, 2).toUpperCase()}
              </div>
              <div className="vitrine-brand-texto">
                <h1 className="vitrine-store-name">{loja.nomeExibicao}</h1>
                <p className="vitrine-collection-subtitle">{vitrine.tituloColecao}</p>
              </div>
            </div>
          )}

          <BotaoWhatsApp texto={`Olá, ${nomeLoja}! Estava vendo seu catálogo (${vitrine.tituloColecao}) e gostaria de tirar uma dúvida.`} className="vitrine-header-contact">
            <IconeWhatsApp />
            <span>Conversar</span>
          </BotaoWhatsApp>
        </div>
      </header>

      {exemplo ? (
        <p className="vitrine-exemplo-aviso" role="note">
          Vitrine de exemplo: peças e valores ilustrativos.
        </p>
      ) : null}

      <section className="vitrine-hero" aria-labelledby={`${idBase}-titulo`}>
        <h2 id={`${idBase}-titulo`} className="vitrine-title">{vitrine.tituloColecao}</h2>
        <p className="vitrine-description">{vitrine.descricao?.trim() || (exemplo ? "Toque numa peça para ver o detalhe." : TEXTO_PADRAO)}</p>
      </section>

      {destaqueEditorial ? (
        <section className="vitrine-destaque" aria-label="Peça em destaque">
          <button type="button" className="vitrine-destaque-abrir" onClick={(e) => abrirModalItem(destaqueEditorial, e.currentTarget)} aria-label={`Ver detalhes de ${destaqueEditorial.nome}`}>
            <img src={destaqueEditorial.fotoUrl} alt={destaqueEditorial.nome} className="vitrine-destaque-image" fetchPriority="high" />
          </button>
          <div className="vitrine-destaque-texto">
            <p className="vitrine-destaque-rotulo">Em destaque</p>
            <h3 className="vitrine-destaque-nome">{destaqueEditorial.nome}</h3>
            {destaqueEditorial.descricao ? <p className="vitrine-destaque-desc">{destaqueEditorial.descricao}</p> : null}
            <p className="vitrine-destaque-preco">{formatarPreco(destaqueEditorial.precoVenda)}</p>
            <div className="vitrine-destaque-acoes">
              {botaoPedido(destaqueEditorial, 0, "vitrine-card-btn vitrine-card-btn-sacola")}
              <button type="button" className="vitrine-card-btn vitrine-card-btn-ver" onClick={(e) => abrirModalItem(destaqueEditorial, e.currentTarget)}>
                Ver a peça
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <main className="vitrine-main">
        {itensDaGrade.length === 0 && !destaqueEditorial ? (
          <p className="vitrine-vazia">Esta coleção ainda não tem peças.</p>
        ) : (
          <div className="vitrine-grid">{itensDaGrade.map(cartao)}</div>
        )}
      </main>

      <footer className="vitrine-footer">
        <p className="vitrine-footer-disclaimer">
          Catálogo exclusivo da loja <strong>{loja.nomeExibicao}</strong>. O atendimento e a entrega são feitos diretamente pela lojista.
        </p>
        <div className="vitrine-footer-brand-wrap">
          <Link href="https://milaai.com.br" target="_blank" rel="noopener noreferrer" className="vitrine-footer-brand-link">
            Criado por <strong>mila.</strong>
          </Link>
        </div>
      </footer>

      {itemSelecionado && (
        <div className="vitrine-modal-overlay" onClick={fecharModalItem}>
          <div className="vitrine-modal-content" role="dialog" aria-modal="true" aria-labelledby={`${idBase}-peca`} onClick={(e) => e.stopPropagation()}>
            <button ref={fecharRef} type="button" className="vitrine-modal-close" onClick={fecharModalItem} aria-label="Fechar detalhes da peça">
              <IconeFechar />
            </button>

            <div className="vitrine-modal-gallery">
              {(() => {
                const todasFotos = itemSelecionado.fotos && itemSelecionado.fotos.length > 0 ? itemSelecionado.fotos : [itemSelecionado.fotoUrl];
                const fotoPrincipal = todasFotos[fotoAtivaIndex] || itemSelecionado.fotoUrl;
                return (
                  <>
                    <div className="vitrine-modal-main-image-wrap">
                      <img src={fotoPrincipal} alt={`${itemSelecionado.nome}, foto ${fotoAtivaIndex + 1} de ${todasFotos.length}`} className="vitrine-modal-main-image" />
                    </div>
                    {todasFotos.length > 1 && (
                      <div className="vitrine-modal-thumbs" role="group" aria-label="Fotos da peça">
                        {todasFotos.map((f, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            className={`vitrine-modal-thumb-btn${fIdx === fotoAtivaIndex ? " active" : ""}`}
                            aria-pressed={fIdx === fotoAtivaIndex}
                            aria-label={`Foto ${fIdx + 1}`}
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

            <div className="vitrine-modal-info">
              <p className="vitrine-modal-sku">{itemSelecionado.sku ? `Ref. ${itemSelecionado.sku}` : "Peça exclusiva"}</p>
              <h2 id={`${idBase}-peca`} className="vitrine-modal-title">{itemSelecionado.nome}</h2>
              <p className="vitrine-modal-price">{formatarPreco(itemSelecionado.precoVenda)}</p>

              {itemSelecionado.descricao && <p className="vitrine-modal-desc">{itemSelecionado.descricao}</p>}

              {variacoesDe(itemSelecionado).map((v) => (
                <fieldset key={v.nome} className="vitrine-variacao">
                  <legend className="vitrine-variacao-nome">{v.nome}</legend>
                  <div className="vitrine-variacao-opcoes">
                    {v.opcoes.map((o) => {
                      const ativa = escolhas[v.nome] === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          className={`vitrine-variacao-opcao${ativa ? " ativa" : ""}`}
                          aria-pressed={ativa}
                          onClick={() => setEscolhas((atual) => ({ ...atual, [v.nome]: o }))}
                        >
                          {ativa ? <IconeCheck /> : null}
                          <span>{o}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              {(() => {
                const idx = indice(itemSelecionado);
                const vars = variacoesDe(itemSelecionado);
                const linhas = linhasDaPeca(idx);
                const faltando = variacaoFaltando(vars, escolhas);
                return (
                  <>
                    {linhas.length > 0 && (
                      <div className="vitrine-modal-no-pedido">
                        <p className="vitrine-modal-no-pedido-titulo">
                          <IconeCheck />
                          <span>Já está no seu pedido</span>
                        </p>
                        <ul className="vitrine-modal-no-pedido-lista">
                          {linhas.map(([chave, linha]) => {
                            const variacao = descreverEscolhas(vars, linha.escolhas);
                            return (
                              <li key={chave} className="vitrine-modal-no-pedido-linha">
                                <span>
                                  {variacao ? `${variacao} · ` : ""}
                                  {linha.qtd} {linha.qtd === 1 ? "unidade" : "unidades"}
                                </span>
                                <button
                                  type="button"
                                  className="vitrine-modal-retirar"
                                  onClick={() => retirarLinha(chave)}
                                  aria-label={`Retirar ${itemSelecionado.nome}${variacao ? ` (${variacao})` : ""} do pedido`}
                                >
                                  Retirar
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    <button
                      type="button"
                      className="vitrine-modal-cta vitrine-modal-cta-sacola"
                      disabled={faltando !== null}
                      onClick={() => {
                        if (idx < 0) return;
                        porNoPedido(idx, escolhas);
                        fecharModalItem();
                      }}
                    >
                      <IconeMais />
                      <span>
                        {faltando
                          ? `Escolha ${faltando.toLowerCase()}`
                          : linhas.length > 0 && vars.length === 0
                            ? "Pôr mais uma no pedido"
                            : "Pôr no pedido"}
                      </span>
                    </button>
                  </>
                );
              })()}

              <BotaoWhatsApp
                texto={`Olá! Vi a peça "${itemSelecionado.nome}" (${formatarMoeda(itemSelecionado.precoVenda)}) no catálogo e gostaria de tirar uma dúvida ou pedir agora.`}
                className="vitrine-modal-cta vitrine-modal-cta-whatsapp"
              >
                <IconeWhatsApp />
                <span>Pedir esta peça pelo WhatsApp</span>
              </BotaoWhatsApp>
            </div>
          </div>
        </div>
      )}

      {qtdSacola > 0 && !sacolaAberta && (
        <div className="vitrine-pedido-barra" role="status">
          <div className="vitrine-pedido-barra-resumo">
            <strong>{qtdSacola} {qtdSacola === 1 ? "peça escolhida" : "peças escolhidas"}</strong>
            {exemplo ? null : <span>{formatarMoeda(totalSacola(itensSacola))}</span>}
          </div>
          <button type="button" className="vitrine-pedido-barra-btn" onClick={abrirSacola}>
            Revisar pedido
          </button>
        </div>
      )}

      {sacolaAberta && (
        <div className="vitrine-sacola-overlay" onClick={fecharSacola}>
          <div className="vitrine-sacola-panel" role="dialog" aria-modal="true" aria-labelledby={`${idBase}-pedido`} onClick={(e) => e.stopPropagation()}>
            <div className="vitrine-sacola-head">
              <h2 id={`${idBase}-pedido`} className="vitrine-sacola-title">Seu pedido</h2>
              <button ref={fecharRef} type="button" className="vitrine-modal-close" onClick={fecharSacola} aria-label="Voltar ao catálogo">
                <IconeFechar />
              </button>
            </div>

            {itensSacola.length === 0 ? (
              <p className="vitrine-sacola-vazia">Nenhuma peça escolhida ainda. Toque em “Pôr no pedido” nas peças que gostar.</p>
            ) : (
              <>
                <ul className="vitrine-sacola-lista">
                  {Object.entries(sacola).map(([chave, linha]) => {
                    const item = vitrine.itens[linha.idx];
                    if (!item) return null;
                    const variacao = descreverEscolhas(variacoesDe(item), linha.escolhas);
                    return (
                      <li key={chave} className="vitrine-sacola-item">
                        <div className="vitrine-sacola-item-info">
                          <span className="vitrine-sacola-item-nome">{item.nome}</span>
                          {variacao && <span className="vitrine-sacola-item-variacao">{variacao}</span>}
                          {item.sku && <span className="vitrine-sacola-item-ref">Ref. {item.sku}</span>}
                          <span className="vitrine-sacola-item-preco">{formatarPreco(item.precoVenda)}</span>
                        </div>
                        <div className="vitrine-sacola-item-controles">
                          <button type="button" onClick={() => mudarQtdLinha(chave, -1)} aria-label={`Diminuir ${item.nome}`}>−</button>
                          <span aria-live="polite">{linha.qtd}</span>
                          <button type="button" onClick={() => mudarQtdLinha(chave, 1)} aria-label={`Aumentar ${item.nome}`}>+</button>
                          <button
                            type="button"
                            className="vitrine-sacola-remover"
                            aria-label={`Remover ${item.nome}`}
                            onClick={() => retirarLinha(chave)}
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
                  <strong>{exemplo ? "Total de exemplo" : formatarMoeda(totalSacola(itensSacola))}</strong>
                </div>

                <div className="vitrine-sacola-form">
                  <label className="vitrine-sacola-campo">
                    <span>Para quem é o pedido?</span>
                    <input type="text" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Seu nome" autoComplete="name" />
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
                    <textarea rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Tamanho, cor, melhor horário…" />
                  </label>
                </div>

                <details className="vitrine-sacola-previa">
                  <summary>Prévia da mensagem</summary>
                  <pre className="vitrine-sacola-msg">{textoPedido}</pre>
                </details>

                <div className="vitrine-sacola-acoes">
                  <button type="button" className="vitrine-sacola-copiar" onClick={copiarPedido}>
                    {copiado ? <IconeCheck /> : null}
                    <span>{copiado ? "Mensagem copiada" : "Copiar mensagem"}</span>
                  </button>
                  <BotaoWhatsApp texto={textoPedido} className="vitrine-sacola-enviar">
                    <IconeWhatsApp />
                    <span>Mandar no WhatsApp</span>
                  </BotaoWhatsApp>
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
