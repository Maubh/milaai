"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextBone } from "@/components/WorkspaceSkeleton";
import { acessoConcorrentes, type AcessoConcorrentes } from "@/lib/concorrentes-acesso";
import { ProBloqueado } from "@/components/PlanLock";
import {
  contaDoInstagram,
  formatarPercentual,
  formatarReais,
  lerNumeroDigitado,
  lojaSemDados,
  mensagemDeCarga,
  MAX_CONCORRENTES,
  mensagemDeErro,
  normalizarSiteDaLoja,
  siteParaTela,
  projetarConcorrentes,
  projetarDadosLoja,
  type CampoDadosLoja,
  type DadosLoja,
} from "@/lib/dados-loja";
import { formatarWhatsapp, mensagemDaMarca, normalizarCorHex, projetarMarca, type LeituraMarca } from "@/lib/marca-vitrine";
import "./dados-loja.css";

type Tipo = "reais" | "percentual" | "texto" | "textoLongo" | "instagram" | "site";

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
    descricao: "O ponto de partida quando a mila calcula o preço de uma peça. O markup você escolhe a cada peça, na conversa.",
    campos: [
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
      { chave: "site_loja", rotulo: "Site da loja", tipo: "site", ajuda: "O endereço da sua loja na internet, como sualoja.com.br." },
      { chave: "observacoes", rotulo: "Observações", tipo: "textoLongo", ajuda: "Garantia, frete, pronta entrega e outras particularidades." },
    ],
  },
];

function valorParaTela(campo: Campo, dados: DadosLoja): string | null {
  const v = dados[campo.chave];
  if (campo.tipo === "reais") return formatarReais(v as number | null);
  if (campo.tipo === "percentual") return formatarPercentual(v as number | null);
  if (campo.tipo === "site") return v ? siteParaTela(v as string) : null;
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

const SITE_NAO_SALVO = "O site ainda não foi salvo. Tente de novo em alguns minutos.";

type LeituraDados = { status: "loading" } | { status: "error"; texto: string; detalhe: string | null } | { status: "ready"; dados: DadosLoja };
type LeituraConcorrentes = { status: "loading" } | { status: "ready"; lista: string[]; acesso: AcessoConcorrentes };
type EstadoMarca = { status: "loading" } | { status: "erro" } | ({ status: "ready" } & LeituraMarca);

const DESCRICAO_MARCA = "Nome, WhatsApp, cores e fonte da sua vitrine web. A vitrine usa a cara da sua loja, e a mila também usa estes dados quando cria uma vitrine.";

/** Amostra da cor ao lado do código. */
function Amostra({ cor }: { cor: string }) {
  return <span className="dados-cor-amostra" style={{ backgroundColor: cor }} aria-hidden="true" />;
}

/**
 * Dados da loja como em produção, no shell da proposta A. A página e o
 * esqueleto da rota (`pending`) usam este mesmo markup. As duas leituras são
 * independentes: os custos aparecem mesmo se os concorrentes não responderem.
 */
export default function DadosLojaView({ pending = false }: { pending?: boolean }) {
  const [leitura, setLeitura] = useState<LeituraDados>({ status: "loading" });
  const [conc, setConc] = useState<LeituraConcorrentes>({ status: "loading" });
  const [marca, setMarca] = useState<EstadoMarca>({ status: "loading" });
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

  const lerMarca = useCallback(async () => {
    setMarca({ status: "loading" });
    try {
      const r = await fetch("/api/marca-vitrine");
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok !== true) {
        setMarca({ status: "erro" });
        return;
      }
      setMarca({ status: "ready", ...projetarMarca(d) });
    } catch {
      setMarca({ status: "erro" });
    }
  }, []);

  useEffect(() => {
    if (pending) return;
    lerDados();
    lerConcorrentes();
    lerMarca();
  }, [pending, lerDados, lerConcorrentes, lerMarca]);

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

  function abrir(secao: Secao | "concorrentes" | "marca") {
    setAviso(null);
    if (secao === "marca") {
      const m = marca.status === "ready" ? marca.marca : null;
      setRascunho({
        nome_exibicao: m?.nome_exibicao ?? "",
        whatsapp: formatarWhatsapp(m?.whatsapp ?? null) ?? "",
        cor_primaria: m?.cor_primaria ?? "",
        cor_destaque: m?.cor_destaque ?? "",
        fonte: m?.fonte ?? "",
      });
      setEditando("marca");
      return;
    }
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
      if (["reais", "percentual"].includes(c.tipo)) {
        if (!bruto) continue; // número não se apaga por aqui; só se troca
        const n = lerNumeroDigitado(bruto);
        if (n === null) {
          setAviso({ secao: secao.id, ok: false, texto: `Confira ${c.rotulo.toLowerCase()}: use só números (ex.: 3,99).` });
          return;
        }
        corpo[c.chave] = n;
      } else if (c.tipo === "site") {
        // Vazio limpa. O resto é normalizado aqui, pela mesma regra do serviço,
        // para que "sualoja.com.br" seja aceito sem esquema.
        if (!bruto) {
          corpo[c.chave] = "";
        } else {
          const site = normalizarSiteDaLoja(bruto);
          if (!site) {
            setAviso({ secao: secao.id, ok: false, texto: mensagemDeErro("invalid_field", "site_loja") });
            return;
          }
          if (site === dados.site_loja) continue;
          corpo[c.chave] = site;
        }
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
        const siteNaoAceito = data.detail === "nothing_to_update" && "site_loja" in corpo;
        setAviso({ secao: secao.id, ok: false, texto: siteNaoAceito ? SITE_NAO_SALVO : mensagemDeErro(data.detail, data.campo) });
        return;
      }
      const salvos = projetarDadosLoja(data.dados);
      setLeitura({ status: "ready", dados: salvos });
      // Só diz que salvou o site se o serviço devolveu o site gravado (um
      // serviço sem o campo responderia ok e o descartaria).
      if ("site_loja" in corpo && salvos.site_loja !== (corpo.site_loja || null)) {
        setAviso({ secao: secao.id, ok: false, texto: Object.keys(corpo).length > 1 ? `Os outros dados foram salvos. ${SITE_NAO_SALVO}` : SITE_NAO_SALVO });
        return;
      }
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

  async function salvarMarca() {
    if (marca.status !== "ready") return;
    const m = marca.marca;
    const corpo: Record<string, string> = {};
    const nome = (rascunho.nome_exibicao ?? "").trim();
    if (nome && nome !== (m.nome_exibicao ?? "")) corpo.nome_exibicao = nome;
    const whats = (rascunho.whatsapp ?? "").replace(/\D/g, "");
    if (whats && whats !== (m.whatsapp ?? "").replace(/^55/, "") && whats !== m.whatsapp) corpo.whatsapp = whats;
    for (const campo of ["cor_primaria", "cor_destaque"] as const) {
      const bruto = (rascunho[campo] ?? "").trim();
      if (!bruto) continue;
      const hex = normalizarCorHex(bruto);
      if (!hex) {
        setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca("invalid_field", campo) });
        return;
      }
      if (hex !== m[campo]) corpo[campo] = hex;
    }
    const fonte = (rascunho.fonte ?? "").trim();
    if (marca.fonteNoPlano && fonte && fonte !== (m.fonte ?? "")) corpo.fonte = fonte;
    if (Object.keys(corpo).length === 0) {
      setEditando(null);
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch("/api/marca-vitrine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(data.detail, data.campo) });
        return;
      }
      setMarca({ status: "ready", ...projetarMarca(data) });
      setEditando(null);
      setAviso({ secao: "marca", ok: true, texto: "Salvo. A vitrine e a mila já usam a marca nova." });
    } catch {
      setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(null) });
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
              "Comece pela taxa da maquininha e pelo custo da embalagem: com eles, todo preço que a mila calcular já desconta o que você paga. O markup você escolhe a cada peça, na conversa. O que você salvar aqui vale na hora, e dá para mudar também pelo WhatsApp.",
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
                        inputMode={["reais", "percentual"].includes(c.tipo) ? "decimal" : c.tipo === "site" ? "url" : "text"}
                        autoComplete={c.tipo === "site" ? "url" : undefined}
                        autoCapitalize={c.tipo === "site" ? "none" : undefined}
                        spellCheck={c.tipo === "site" ? false : undefined}
                        placeholder={c.tipo === "site" ? "sualoja.com.br" : undefined}
                        value={rascunho[c.chave] ?? ""}
                        maxLength={c.tipo === "texto" ? 120 : c.tipo === "site" ? 200 : 40}
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
                        <dd className={`ledger-row-value${dados && !v ? " is-vazio" : ""}`}>
                          {!dados ? <TextBone w="12ch" /> : c.tipo === "site" && v && dados.site_loja ? (
                            <a href={dados.site_loja} target="_blank" rel="noopener noreferrer" className="dados-site">{v}</a>
                          ) : v ?? "Não informado"}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {avisoDa(secao.id)}
              </>
            )}
          </section>
        )) : null}

        {leitura.status === "error" ? null : marca.status === "loading" ? (
          <section className="desk-panel dados-secao" aria-labelledby="secao-marca" aria-busy="true">
            {cabecalho("marca", "Marca da vitrine", DESCRICAO_MARCA, null)}
            <dl className="ledger-rows dados-lista">
              <div className="ledger-row dados-item"><dt className="ledger-row-label">Cor principal</dt><dd className="ledger-row-value"><TextBone w="10ch" /></dd></div>
            </dl>
          </section>
        ) : marca.status === "erro" ? (
          <section className="desk-panel dados-secao" aria-labelledby="secao-marca">
            {cabecalho(
              "marca",
              "Marca da vitrine",
              DESCRICAO_MARCA,
              <button type="button" className="ledger-button" onClick={lerMarca} aria-label="Tentar de novo ler a marca da vitrine">Tentar de novo</button>,
              true,
            )}
            <p className="ledger-notice dados-nota" role="status">Não deu para ler a marca da vitrine agora. Ela continua salva.</p>
          </section>
        ) : (
          <section className="desk-panel dados-secao" aria-labelledby="secao-marca">
            {cabecalho("marca", "Marca da vitrine", DESCRICAO_MARCA, editar("marca", "marca da vitrine", () => abrir("marca")), editando === "marca")}
            {editando === "marca" ? (
              <form
                id="form-marca"
                className="dados-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  salvarMarca();
                }}
              >
                <label className="dados-campo">
                  <span className="dados-campo-rotulo">Nome na vitrine</span>
                  <input type="text" maxLength={60} value={rascunho.nome_exibicao ?? ""} onChange={(e) => setRascunho({ ...rascunho, nome_exibicao: e.target.value })} />
                </label>
                <label className="dados-campo">
                  <span className="dados-campo-rotulo">WhatsApp que recebe os pedidos</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(31) 99999-0000"
                    maxLength={20}
                    value={rascunho.whatsapp ?? ""}
                    onChange={(e) => setRascunho({ ...rascunho, whatsapp: e.target.value })}
                  />
                  <span className="dados-campo-ajuda">Os pedidos da sacola da vitrine chegam neste número.</span>
                </label>
                {(["cor_primaria", "cor_destaque"] as const).map((campo) => {
                  const rotulo = campo === "cor_primaria" ? "Cor principal" : "Cor de destaque";
                  const hex = normalizarCorHex(rascunho[campo] ?? "");
                  return (
                    <div key={campo} className="dados-campo">
                      <span className="dados-campo-rotulo" id={`rotulo-${campo}`}>{rotulo}</span>
                      <div className="dados-cor-campo">
                        <input
                          type="color"
                          aria-label={`Escolher ${rotulo.toLowerCase()}`}
                          value={(hex ?? "#1F2937").toLowerCase()}
                          onChange={(e) => setRascunho({ ...rascunho, [campo]: e.target.value.toUpperCase() })}
                        />
                        <input
                          type="text"
                          aria-labelledby={`rotulo-${campo}`}
                          placeholder="#B76E79"
                          maxLength={7}
                          autoCapitalize="characters"
                          spellCheck={false}
                          value={rascunho[campo] ?? ""}
                          onChange={(e) => setRascunho({ ...rascunho, [campo]: e.target.value })}
                        />
                      </div>
                      <span className="dados-campo-ajuda">{campo === "cor_primaria" ? "Botões e detalhes da vitrine." : "Preços e total do pedido."}</span>
                    </div>
                  );
                })}
                {marca.fonteNoPlano ? (
                  <label className="dados-campo">
                    <span className="dados-campo-rotulo">Fonte da marca</span>
                    <select value={rascunho.fonte ?? ""} onChange={(e) => setRascunho({ ...rascunho, fonte: e.target.value })}>
                      <option value="">Padrão (Inter)</option>
                      {marca.fontes.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="dados-campo-ajuda">A fonte da marca é do Plano Pro. No Essencial, a vitrine usa a fonte padrão.</p>
                )}
                {avisoDa("marca")}
              </form>
            ) : (
              <>
                <dl className="ledger-rows dados-lista">
                  <div className="ledger-row dados-item">
                    <dt className="ledger-row-label">Nome na vitrine</dt>
                    <dd className={`ledger-row-value${marca.marca.nome_exibicao ? "" : " is-vazio"}`}>{marca.marca.nome_exibicao ?? "Não informado"}</dd>
                  </div>
                  <div className="ledger-row dados-item">
                    <dt className="ledger-row-label">WhatsApp dos pedidos</dt>
                    <dd className={`ledger-row-value${marca.marca.whatsapp ? "" : " is-vazio"}`}>{formatarWhatsapp(marca.marca.whatsapp) ?? "Não informado"}</dd>
                  </div>
                  {(["cor_primaria", "cor_destaque"] as const).map((campo) => (
                    <div key={campo} className="ledger-row dados-item">
                      <dt className="ledger-row-label">{campo === "cor_primaria" ? "Cor principal" : "Cor de destaque"}</dt>
                      <dd className={`ledger-row-value${marca.marca[campo] ? "" : " is-vazio"}`}>
                        {marca.marca[campo] ? (
                          <span className="dados-cor"><Amostra cor={marca.marca[campo]!} />{marca.marca[campo]}</span>
                        ) : (
                          "Não informada"
                        )}
                      </dd>
                    </div>
                  ))}
                  <div className="ledger-row dados-item">
                    <dt className="ledger-row-label">Fonte</dt>
                    <dd className="ledger-row-value">{marca.marca.fonte ?? (marca.fonteNoPlano ? "Padrão (Inter)" : "Padrão (fonte da marca no Plano Pro)")}</dd>
                  </div>
                  {marca.marca.link_vitrine ? (
                    <div className="ledger-row dados-item">
                      <dt className="ledger-row-label">Link da vitrine</dt>
                      <dd className="ledger-row-value">
                        <a href={marca.marca.link_vitrine} target="_blank" rel="noopener noreferrer" className="dados-site">{marca.marca.link_vitrine.replace("https://", "")}</a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {!marca.marca.cor_primaria ? (
                  <p className="dados-campo-ajuda">Sem as cores da marca, a vitrine sai com cores neutras. Informe aqui ou mande o código da cor para a mila no WhatsApp.</p>
                ) : null}
                {avisoDa("marca")}
              </>
            )}
          </section>
        )}

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
              <>Concorrentes no Instagram <span className="dados-selo-pro"><ProBloqueado /></span></>,
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
