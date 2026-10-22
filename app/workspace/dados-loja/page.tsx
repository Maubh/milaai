"use client";

import { useEffect, useState } from "react";
import {
  contaDoInstagram,
  formatarMarkup,
  formatarPercentual,
  formatarReais,
  lerNumeroDigitado,
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
  descricao: string;
  campos: Campo[];
}

/** Seções do perfil, na ordem da página. Concorrentes vêm à parte (lista própria). */
const SECOES: Secao[] = [
  {
    id: "custos",
    titulo: "Custos e taxas",
    descricao: "Entram no preço sugerido e na margem de cada peça.",
    campos: [
      { chave: "taxa_cartao_percent", rotulo: "Taxa usada no preço", tipo: "percentual", ajuda: "Taxa da maquininha ou do link de pagamento, em %. Se você oferece parcelado sem juros, use a taxa do maior parcelamento: assim o preço cobre o pior caso." },
      { chave: "custo_embalagem", rotulo: "Custo de embalagem", tipo: "reais", ajuda: "Embalagem e tag por peça, em reais." },
    ],
  },
  {
    id: "precificacao",
    titulo: "Precificação",
    descricao: "O ponto de partida quando a mila calcula o preço de uma peça.",
    campos: [
      { chave: "markup_padrao", rotulo: "Markup padrão", tipo: "markup", ajuda: "Quantas vezes o custo (ex.: 3 para 3x)." },
      { chave: "tipo_banho", rotulo: "Banho padrão", tipo: "texto", ajuda: "Ex.: Ouro 18k, 10 milésimos." },
    ],
  },
  {
    id: "sobre",
    titulo: "Sobre a loja",
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

export default function DadosDaLojaPage() {
  const [dados, setDados] = useState<DadosLoja | null>(null);
  const [concorrentes, setConcorrentes] = useState<string[]>([]);
  const [analiseNoPlano, setAnaliseNoPlano] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ secao: string; ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [r1, r2] = await Promise.all([fetch("/api/dados-loja"), fetch("/api/concorrentes")]);
        const d1 = await r1.json();
        const d2 = await r2.json();
        if (!r1.ok || !d1.ok) {
          setErroCarga(mensagemDeErro(d1.detail));
          return;
        }
        setDados(projetarDadosLoja(d1.dados));
        if (r2.ok && d2.ok) {
          setConcorrentes(projetarConcorrentes(d2.concorrentes));
          setAnaliseNoPlano(d2.analise_no_plano !== false);
        }
      } catch {
        setErroCarga("Não foi possível carregar os dados da loja. Tente de novo em alguns minutos.");
      }
    }
    carregar();
  }, []);

  function abrir(secao: Secao | "concorrentes") {
    setAviso(null);
    if (secao === "concorrentes") {
      const r: Record<string, string> = {};
      for (let i = 0; i < MAX_CONCORRENTES; i++) r[`c${i}`] = concorrentes[i] ? `@${concorrentes[i]}` : "";
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
      setDados(projetarDadosLoja(data.dados));
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
      setConcorrentes(projetarConcorrentes(data.concorrentes));
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

  const cabecalho = (id: string, titulo: string, descricao: string, onEditar: () => void) => (
    <div className="dados-secao-header">
      <div>
        <h2 className="dados-secao-titulo" id={`secao-${id}`}>{titulo}</h2>
        <p className="dados-secao-descricao">{descricao}</p>
      </div>
      {editando !== id ? (
        <button type="button" className="dados-editar" onClick={onEditar} disabled={editando !== null || !dados} aria-describedby={`secao-${id}`}>
          Editar
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="work-wrap workspace-dados-page">
      <h1 className="work-title">Dados da loja</h1>
      <p className="work-lede">
        O que a mila sabe da sua loja e usa nos cálculos, descrições e análises. O que você salvar aqui vale na hora;
        também dá para mudar pelo WhatsApp, é só pedir para a mila.
      </p>

      {erroCarga ? (
        <div className="work-card"><p role="alert">{erroCarga}</p></div>
      ) : !dados ? (
        <div className="work-card"><p>Carregando…</p></div>
      ) : (
        <div className="dados-secoes">
          {SECOES.map((secao) => (
            <section key={secao.id} className="dados-secao" aria-labelledby={`secao-${secao.id}`}>
              {cabecalho(secao.id, secao.titulo, secao.descricao, () => abrir(secao))}
              {editando === secao.id ? (
                <form
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
                  <div className="dados-acoes">
                    <button type="submit" className="dados-salvar" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
                    <button type="button" className="dados-cancelar" onClick={() => { setEditando(null); setAviso(null); }} disabled={salvando}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <dl className="dados-lista">
                    {secao.campos.map((c) => {
                      const v = valorParaTela(c, dados);
                      return (
                        <div key={c.chave} className="dados-item">
                          <dt>{c.rotulo}</dt>
                          <dd className={v ? undefined : "is-vazio"}>{v ?? "Não informado"}</dd>
                        </div>
                      );
                    })}
                  </dl>
                  {avisoDa(secao.id)}
                </>
              )}
            </section>
          ))}

          <section className="dados-secao" aria-labelledby="secao-concorrentes">
            {cabecalho(
              "concorrentes",
              "Concorrentes no Instagram",
              `Até ${MAX_CONCORRENTES} perfis. A análise do nicho lê estes perfis e mostra o formato que mais performa, o post do topo e as hashtags que eles usam.`,
              () => abrir("concorrentes"),
            )}
            {!analiseNoPlano ? (
              <p className="dados-nota">A análise do nicho é do Plano Pro. Você já pode deixar seus concorrentes salvos.</p>
            ) : null}
            {editando === "concorrentes" ? (
              <form
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
                <div className="dados-acoes">
                  <button type="submit" className="dados-salvar" disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</button>
                  <button type="button" className="dados-cancelar" onClick={() => { setEditando(null); setAviso(null); }} disabled={salvando}>Cancelar</button>
                </div>
              </form>
            ) : (
              <>
                {concorrentes.length ? (
                  <ul className="dados-concorrentes">
                    {concorrentes.map((c) => (
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
        </div>
      )}
    </div>
  );
}
