"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextBone } from "@/components/WorkspaceSkeleton";
import { acessoConcorrentes, type AcessoConcorrentes } from "@/lib/concorrentes-acesso";
import {
  contaDoInstagram,
  formatarMarkup,
  formatarPercentual,
  formatarReais,
  lerNumeroDigitado,
  lojaSemDados,
  mensagemDeCarga,
  MAX_CONCORRENTES,
  mensagemDeErro,
  projetarConcorrentes,
  projetarDadosLoja,
  type CampoDadosLoja,
  type DadosLoja,
} from "@/lib/dados-loja";
import "./dados-loja.css";

type Tipo = "reais" | "percentual" | "markup" | "texto" | "textoLongo" | "instagram";

interface Campo {
  chave: CampoDadosLoja;
  rotulo: string;
  tipo: Tipo;
  ajuda?: string;
}

interface Secao {
  id: string;
  titulo: string;
  /** Complemento do nome acessível de "Editar" e "Cancelar". */
  nome: string;
  descricao: string;
  campos: Campo[];
}

/** Seções do perfil, na ordem da página. Concorrentes vêm à parte (lista própria). */
const SECOES: Secao[] = [
  {
    id: "custos",
    titulo: "Custos e taxas",
    nome: "custos e taxas",
    descricao: "Entram no preço sugerido e na margem de cada peça.",
    campos: [
      { chave: "taxa_cartao_percent", rotulo: "Taxa usada no preço (%)", tipo: "percentual", ajuda: "Taxa da maquininha ou do link de pagamento, em %. Se você oferece parcelado sem juros, use a taxa do maior parcelamento: assim o preço cobre o pior caso." },
      { chave: "custo_embalagem", rotulo: "Custo de embalagem (R$)", tipo: "reais", ajuda: "Embalagem e tag por peça, em reais." },
    ],
  },
  {
    id: "precificacao",
    titulo: "Precificação",
    nome: "precificação",
    descricao: "O ponto de partida quando a mila calcula o preço de uma peça.",
    campos: [
      { chave: "markup_padrao", rotulo: "Markup padrão (x)", tipo: "markup", ajuda: "Quantas vezes o custo (ex.: 3 para 3x)." },
      { chave: "tipo_banho", rotulo: "Banho padrão", tipo: "texto", ajuda: "Ex.: Ouro 18k, 10 milésimos." },
    ],
  },
  {
    id: "sobre",
    titulo: "Sobre a loja",
    nome: "dados da loja",
    descricao: "Como a mila apresenta a sua loja nas descrições e legendas.",
    campos: [
      { chave: "nome_loja", rotulo: "Nome da loja", tipo: "texto" },
      { chave: "instagram", rotulo: "Instagram da loja", tipo: "instagram", ajuda: "O @ da sua loja." },
      { chave: "observacoes", rotulo: "Observações", tipo: "textoLongo", ajuda: "Garantia, frete, pronta entrega e outras particularidades." },
    ],
  },
];

function valorParaTela(campo: Campo, dados: DadosLoja): string | null {
  const v = dados[campo.chave];
  if (campo.tipo === "reais") return formatarReais(v as number | null);
  if (campo.tipo === "percentual") return formatarPercentual(v as number | null);
  if (campo.tipo === "markup") return formatarMarkup(v as number | null);
  return (v as string | null) ?? null;
}

function valorParaRascunho(campo: Campo, dados: DadosLoja): string {
  const v = dados[campo.chave];
  if (v === null) return "";
  if (typeof v === "number") return String(v).replace(".", ",");
  return v;
}

function PencilIcon() {
  return <svg className="dados-acao-icone" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>;
}

function CloseIcon() {
  return <svg className="dados-acao-icone" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

type LeituraDados = { status: "loading" } | { status: "error"; texto: string; detalhe: string | null } | { status: "ready"; dados: DadosLoja };
type LeituraConcorrentes = { status: "loading" } | { status: "ready"; lista: string[]; acesso: AcessoConcorrentes };

/**
 * Dados da loja como em produção, no shell da proposta A. A página e o
 * esqueleto da rota (`pending`) usam este mesmo markup. As duas leituras são
 * independentes: os custos aparecem mesmo se os concorrentes não responderem.
 */
export default function DadosLojaView({ pending = false }: { pending?: boolean }) {
  const [leitura, setLeitura] = useState<LeituraDados>({ status: "loading" });
  const [conc, setConc] = useState<LeituraConcorrentes>({ status: "loading" });
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ secao: string; ok: boolean; texto: string } | null>(null);

  const lerDados = useCallback(async () => {
    setLeitura({ status: "loading" });
    try {
      const r = await fetch("/api/dados-loja");
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        const detalhe = typeof d.detail === "string" ? d.detail : `http_${r.status}`;
        setLeitura({ status: "error", texto: mensagemDeCarga(d.detail), detalhe });
        return;
      }
      setLeitura({ status: "ready", dados: projetarDadosLoja(d.dados) });
    } catch {
      setLeitura({ status: "error", texto: mensagemDeCarga(null), detalhe: "falha_rede" });
    }
  }, []);

  const lerConcorrentes = useCallback(async () => {
    setConc({ status: "loading" });
    try {
      const r = await fetch("/api/concorrentes");
      const d = await r.json().catch(() => ({}));
      const ok = r.ok && d.ok === true;
      setConc({ status: "ready", lista: ok ? projetarConcorrentes(d.concorrentes) : [], acesso: acessoConcorrentes(ok, d.analise_no_plano) });
    } catch {
      setConc({ status: "ready", lista: [], acesso: "nao_verificado" });
    }
  }, []);

  useEffect(() => {
    if (pending) return;
    lerDados();
    lerConcorrentes();
  }, [pending, lerDados, lerConcorrentes]);

  const dados = leitura.status === "ready" ? leitura.dados : null;

  // O botão do topo troca ao abrir e fechar: o foco vai para o primeiro campo
  // e, ao sair da edição, volta ao lápis do mesmo card.
  const ultimoEditado = useRef<string | null>(null);
  useEffect(() => {
    if (editando) {
      ultimoEditado.current = editando;
      document.querySelector<HTMLElement>(`#form-${editando} input, #form-${editando} textarea`)?.focus();
      return;
    }
    const id = ultimoEditado.current;
    ultimoEditado.current = null;
    if (id) document.querySelector<HTMLElement>(`#secao-${id} ~ .dados-secao-acao button`)?.focus();
  }, [editando]);

  function abrir(secao: Secao | "concorrentes") {
    setAviso(null);
    if (secao === "concorrentes") {
      const lista = conc.status === "ready" ? conc.lista : [];
      const r: Record<string, string> = {};
      for (let i = 0; i < MAX_CONCORRENTES; i++) r[`c${i}`] = lista[i] ? `@${lista[i]}` : "";
      setRascunho(r);
      setEditando("concorrentes");
      return;
    }
    const r: Record<string, string> = {};
    for (const c of secao.campos) r[c.chave] = dados ? valorParaRascunho(c, dados) : "";
    setRascunho(r);
    setEditando(secao.id);
  }

  async function salvarSecao(secao: Secao) {
    if (!dados) return;
    const corpo: Record<string, unknown> = {};
    for (const c of secao.campos) {
      const bruto = (rascunho[c.chave] ?? "").trim();
      const atual = valorParaRascunho(c, dados);
      if (bruto === atual) continue;
      if (["reais", "percentual", "markup"].includes(c.tipo)) {
        if (!bruto) continue; // número não se apaga por aqui; só se troca
        const n = lerNumeroDigitado(bruto);
        if (n === null) {
          setAviso({ secao: secao.id, ok: false, texto: `Confira ${c.rotulo.toLowerCase()}: use só números (ex.: 3,99).` });
          return;
        }
        corpo[c.chave] = n;
      } else if (c.tipo === "instagram") {
        if (!bruto) continue;
        const conta = contaDoInstagram(bruto);
        if (!conta) {
          setAviso({ secao: secao.id, ok: false, texto: mensagemDeErro("invalid_field", "instagram") });
          return;
        }
        corpo[c.chave] = conta;
      } else {
        corpo[c.chave] = bruto;
      }
    }
    if (Object.keys(corpo).length === 0) {
      setEditando(null);
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch("/api/dados-loja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAviso({ secao: secao.id, ok: false, texto: mensagemDeErro(data.detail, data.campo) });
        return;
      }
      setLeitura({ status: "ready", dados: projetarDadosLoja(data.dados) });
      setEditando(null);
      setAviso({ secao: secao.id, ok: true, texto: "Salvo. A mila já usa os dados novos." });
    } catch {
      setAviso({ secao: secao.id, ok: false, texto: mensagemDeErro(null) });
    } finally {
      setSalvando(false);
    }
  }

  async function salvarConcorrentes() {
    const lista: string[] = [];
    for (let i = 0; i < MAX_CONCORRENTES; i++) {
      const bruto = (rascunho[`c${i}`] ?? "").trim();
      if (!bruto) continue;
      const conta = contaDoInstagram(bruto);
      if (!conta) {
        setAviso({ secao: "concorrentes", ok: false, texto: mensagemDeErro("invalid_username") });
        return;
      }
      if (!lista.includes(conta)) lista.push(conta);
    }
    setSalvando(true);
    try {
      const res = await fetch("/api/concorrentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concorrentes: lista }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAviso({ secao: "concorrentes", ok: false, texto: mensagemDeErro(data.detail) });
        return;
      }
      setConc({ status: "ready", lista: projetarConcorrentes(data.concorrentes), acesso: "liberado" });
      setEditando(null);
      setAviso({ secao: "concorrentes", ok: true, texto: "Salvo. As próximas análises do nicho usam estes perfis." });
    } catch {
      setAviso({ secao: "concorrentes", ok: false, texto: mensagemDeErro(null) });
    } finally {
      setSalvando(false);
    }
  }

  const avisoDa = (id: string) =>
    aviso?.secao === id ? (
      <p className={`dados-aviso${aviso.ok ? " is-ok" : " is-erro"}`} role={aviso.ok ? "status" : "alert"}>
        {aviso.texto}
      </p>
    ) : null;

  /**
   * Cabeçalho de card: a ação fica sempre no canto superior direito. Com ação
   * curta, título e ação dividem a primeira linha; com ação "larga" (texto, ou
   * Salvar + fechar), no celular a ação fica sozinha na primeira linha, à
   * direita, e o título ganha a linha seguinte inteira. A descrição vem embaixo.
   */
  const cabecalho = (id: string, titulo: React.ReactNode, descricao: string, acao: React.ReactNode, larga = false) => (
    <div className="dados-secao-head" data-acao={larga ? "larga" : undefined}>
      <h2 id={`secao-${id}`}>{titulo}</h2>
      {acao ? <div className="dados-secao-acao">{acao}</div> : null}
      <p>{descricao}</p>
    </div>
  );

  // Lápis de 44px no celular, "Editar" no desktop; o nome diz sempre qual card.
  const editar = (id: string, nome: string, onEditar: () => void) =>
    editando !== id ? (
      // Chaves distintas: sem elas o React reaproveita este botão como "Salvar" e o
      // clique em "Editar" termina enviando o form recém-aberto.
      <button key="editar" type="button" className="ledger-button dados-acao" onClick={onEditar} disabled={editando !== null || !dados} aria-label={`Editar ${nome}`}>
        <PencilIcon /><span className="dados-acao-texto">Editar</span>
      </button>
    ) : (
      <>
        {/* Fora do form, associado pelo id: Enter no campo e a validação continuam do form. */}
        <button key="salvar" type="submit" form={`form-${id}`} className="ledger-button ledger-button-primary" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
        <button key="cancelar" type="button" className="ledger-button ledger-button-quiet dados-acao" onClick={() => { setEditando(null); setAviso(null); }} disabled={salvando} aria-label={`Cancelar edição de ${nome}`}>
          <CloseIcon /><span className="dados-acao-texto">Cancelar</span>
        </button>
      </>
    );

  const carregando = leitura.status === "loading" || conc.status === "loading";

  return (
    <div className="ledger-page dados-page">
      {carregando && !pending ? <p className="sr-only" role="status">Carregando os dados da loja…</p> : null}
      <header className="ledger-page-head">
        <div>
          <h1 className="ledger-title">Dados da loja</h1>
          <p className="ledger-lede">O que a mila usa nos preços, descrições e análises da sua loja.</p>
        </div>
      </header>

      <div className="desk-stack">
        {leitura.status === "error" ? (
          <section className="desk-panel dados-estado" role="alert">
            {cabecalho(
              "erro",
              leitura.texto,
              "Seus dados continuam salvos. Tente de novo em instantes; enquanto isso, a mila segue usando tudo normalmente no WhatsApp.",
              <button type="button" className="ledger-button ledger-button-primary" onClick={lerDados}>Tentar de novo</button>,
              true,
            )}
            {leitura.detalhe ? <p className="dados-estado-codigo">Código: {leitura.detalhe}</p> : null}
          </section>
        ) : null}

        {dados && conc.status === "ready" && conc.acesso !== "nao_verificado" && lojaSemDados(dados, conc.lista) ? (
          <section className="desk-panel dados-estado">
            {cabecalho(
              "vazio",
              "A mila ainda não conhece os números da sua loja",
              "Comece pela taxa da maquininha e pelo markup: com eles, todo preço que a mila sugerir já sai com a sua margem. O que você salvar aqui vale na hora, e dá para mudar também pelo WhatsApp.",
              <button type="button" className="ledger-button ledger-button-primary" onClick={() => abrir(SECOES[0])}>Informar custos e taxas</button>,
              true,
            )}
          </section>
        ) : null}

        {leitura.status !== "error" ? SECOES.map((secao) => (
          <section key={secao.id} className="desk-panel dados-secao" aria-labelledby={`secao-${secao.id}`}>
            {cabecalho(secao.id, secao.titulo, secao.descricao, editar(secao.id, secao.nome, () => abrir(secao)), editando === secao.id)}
            {editando === secao.id && dados ? (
              <form
                id={`form-${secao.id}`}
                className="dados-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  salvarSecao(secao);
                }}
              >
                {secao.campos.map((c) => (
                  <label key={c.chave} className="dados-campo">
                    <span className="dados-campo-rotulo">{c.rotulo}</span>
                    {c.tipo === "textoLongo" ? (
                      <textarea
                        value={rascunho[c.chave] ?? ""}
                        maxLength={1000}
                        rows={3}
                        onChange={(e) => setRascunho({ ...rascunho, [c.chave]: e.target.value })}
                      />
                    ) : (
                      <input
                        type="text"
                        inputMode={["reais", "percentual", "markup"].includes(c.tipo) ? "decimal" : "text"}
                        value={rascunho[c.chave] ?? ""}
                        maxLength={c.tipo === "texto" ? 120 : 40}
                        onChange={(e) => setRascunho({ ...rascunho, [c.chave]: e.target.value })}
                      />
                    )}
                    {c.ajuda ? <span className="dados-campo-ajuda">{c.ajuda}</span> : null}
                  </label>
                ))}
                {avisoDa(secao.id)}
              </form>
            ) : (
              <>
                <dl className="ledger-rows dados-lista">
                  {secao.campos.map((c) => {
                    const v = dados ? valorParaTela(c, dados) : null;
                    return (
                      <div key={c.chave} className="ledger-row dados-item">
                        <dt className="ledger-row-label">{c.rotulo}</dt>
                        <dd className={`ledger-row-value${dados && !v ? " is-vazio" : ""}`}>{!dados ? <TextBone w="12ch" /> : v ?? "Não informado"}</dd>
                      </div>
                    );
                  })}
                </dl>
                {avisoDa(secao.id)}
              </>
            )}
          </section>
        )) : null}

        {leitura.status === "error" ? null : conc.status === "loading" ? (
          <section className="desk-panel dados-secao" aria-labelledby="secao-concorrentes" aria-busy="true">
            {cabecalho("concorrentes", "Concorrentes no Instagram", `Até ${MAX_CONCORRENTES} perfis. A análise do nicho lê estes perfis e mostra o formato que mais performa, o post do topo e as hashtags que eles usam.`, null)}
            <ul className="dados-concorrentes"><li><TextBone w="16ch" /></li><li><TextBone w="13ch" /></li></ul>
          </section>
        ) : conc.acesso === "nao_verificado" ? (
          // Sem resposta clara do serviço: nem libera, nem afirma bloqueio, nem mostra lista vazia.
          <section className="desk-panel dados-secao" aria-labelledby="secao-concorrentes">
            {cabecalho(
              "concorrentes",
              "Concorrentes no Instagram",
              `Até ${MAX_CONCORRENTES} perfis. A análise do nicho lê estes perfis e mostra o formato que mais performa, o post do topo e as hashtags que eles usam.`,
              <>
                <span className="ledger-state" data-tone="neutral">Não verificado</span>
                <button type="button" className="ledger-button" onClick={lerConcorrentes} aria-label="Tentar de novo ler os concorrentes">Tentar de novo</button>
              </>,
              true,
            )}
            <p className="ledger-notice dados-nota" role="status">Não deu para confirmar agora se o seu plano inclui a análise de concorrentes.</p>
          </section>
        ) : conc.acesso === "bloqueado" ? (
          // Só a análise do nicho (Pro) usa os concorrentes: no Essencial a
          // seção aparece bloqueada, sem edição (o serviço também recusa).
          <section className="desk-panel dados-secao is-bloqueada" aria-labelledby="secao-concorrentes">
            {cabecalho(
              "concorrentes",
              <>Concorrentes no Instagram <span className="dados-selo-pro">Pro</span></>,
              `No Plano Pro, a mila lê até ${MAX_CONCORRENTES} perfis de concorrentes e mostra o formato que mais performa, o post do topo e as hashtags que eles usam.`,
              <Link href="/workspace/plano" className="ledger-button" aria-label="Assinar plano Pro para salvar concorrentes">Assinar plano Pro <Arrow /></Link>,
              true,
            )}
          </section>
        ) : (
          <section className="desk-panel dados-secao" aria-labelledby="secao-concorrentes">
            {cabecalho(
              "concorrentes",
              "Concorrentes no Instagram",
              `Até ${MAX_CONCORRENTES} perfis. A análise do nicho lê estes perfis e mostra o formato que mais performa, o post do topo e as hashtags que eles usam.`,
              editar("concorrentes", "concorrentes", () => abrir("concorrentes")),
              editando === "concorrentes",
            )}
            {editando === "concorrentes" ? (
              <form
                id="form-concorrentes"
                className="dados-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  salvarConcorrentes();
                }}
              >
                {Array.from({ length: MAX_CONCORRENTES }, (_, i) => (
                  <label key={i} className="dados-campo">
                    <span className="dados-campo-rotulo">Concorrente {i + 1}</span>
                    <input
                      type="text"
                      placeholder="@perfil"
                      value={rascunho[`c${i}`] ?? ""}
                      maxLength={80}
                      onChange={(e) => setRascunho({ ...rascunho, [`c${i}`]: e.target.value })}
                    />
                  </label>
                ))}
                {avisoDa("concorrentes")}
              </form>
            ) : (
              <>
                {conc.lista.length ? (
                  <ul className="dados-concorrentes">
                    {conc.lista.map((c) => (
                      <li key={c}>
                        <a href={`https://www.instagram.com/${c}/`} target="_blank" rel="noopener noreferrer">@{c}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dados-vazio">Nenhum concorrente salvo.</p>
                )}
                {avisoDa("concorrentes")}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
