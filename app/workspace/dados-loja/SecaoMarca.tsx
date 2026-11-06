"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextBone } from "@/components/WorkspaceSkeleton";
import { DESCRICAO_TEMPLATE } from "@/lib/vitrine";
import {
  FONTES_RESERVA,
  FONTE_PADRAO,
  LIMITES_ARQUIVO,
  PAPEIS_FONTE,
  base64DeBytes,
  filtrarFontes,
  formatarTamanho,
  formatarWhatsapp,
  mensagemDaMarca,
  nomeDaFonteDoArquivo,
  normalizarCorHex,
  projetarMarca,
  rotuloFonte,
  urlFonteGoogle,
  type CampoFonte,
  type FonteEnviada,
  type FonteGoogle,
  type LeituraMarca,
} from "@/lib/marca";

type EstadoMarca = { status: "loading" } | { status: "erro" } | ({ status: "ready" } & LeituraMarca);
type Aviso = { secao: string; ok: boolean; texto: string } | null;

const DESCRICAO = "Cores, fontes, logo e identidade visual da sua loja. A vitrine usa as cores, as fontes e o logo daqui.";

/** Amostra da cor ao lado do código. */
function Amostra({ cor }: { cor: string }) {
  return <span className="dados-cor-amostra" style={{ backgroundColor: cor }} aria-hidden="true" />;
}

/** Carrega a fonte (Google ou enviada) para a prévia; devolve o nome a usar no CSS. */
function useFonteNaTela(valor: string | null, enviadas: readonly FonteEnviada[]): string {
  const enviada = valor ? enviadas.find((f) => f.valor === valor) : undefined;
  const familia = enviada ? enviada.familia : valor || FONTE_PADRAO;
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = `fonte-previa-${familia.replace(/[^a-z0-9]/gi, "-")}`;
    if (document.getElementById(id)) return;
    if (enviada) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `@font-face{font-family:${JSON.stringify(enviada.familia)};src:url(${JSON.stringify(enviada.url)}) format(${JSON.stringify(enviada.formato === "ttf" ? "truetype" : enviada.formato === "otf" ? "opentype" : enviada.formato)});font-display:swap}`;
      document.head.appendChild(style);
      return;
    }
    const href = urlFonteGoogle(familia);
    if (!href) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [familia, enviada]);
  return familia;
}

function PreviaFonte({ valor, enviadas, texto }: { valor: string | null; enviadas: readonly FonteEnviada[]; texto: string }) {
  const familia = useFonteNaTela(valor, enviadas);
  return <span className="dados-fonte-previa" style={{ fontFamily: `${JSON.stringify(familia)}, system-ui, sans-serif` }}>{texto}</span>;
}

/** Busca no Google Fonts + fontes enviadas pela lojista. */
function EscolhaFonte({
  campo,
  rotulo,
  ajuda,
  valor,
  onChange,
  google,
  enviadas,
  nomeLoja,
  fonteEnviada,
  onVoltarPadrao,
}: {
  campo: CampoFonte;
  rotulo: string;
  ajuda: string;
  valor: string;
  onChange: (v: string) => void;
  google: readonly FonteGoogle[];
  enviadas: readonly FonteEnviada[];
  nomeLoja: string;
  /** Família da fonte enviada que está em uso neste papel: a escolha do Google fica bloqueada. */
  fonteEnviada?: string | null;
  onVoltarPadrao?: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState(false);
  const resultados = useMemo(() => filtrarFontes(google, busca, 30), [google, busca]);
  const minhas = enviadas.filter((f) => !busca.trim() || f.familia.toLowerCase().includes(busca.trim().toLowerCase()));
  const escolher = (v: string) => {
    onChange(v);
    setBusca("");
    setAberta(false);
  };
  const idLista = `lista-${campo}`;
  const campoRef = useRef<HTMLDivElement>(null);
  // A lista fecha com Esc, com clique/toque fora dela ou com o botão "Fechar lista" (no celular não há Esc).
  useEffect(() => {
    if (!aberta) return;
    const fechaFora = (e: PointerEvent) => {
      if (campoRef.current && !campoRef.current.contains(e.target as Node)) setAberta(false);
    };
    const fechaEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(false);
    };
    document.addEventListener("pointerdown", fechaFora);
    document.addEventListener("keydown", fechaEsc);
    return () => {
      document.removeEventListener("pointerdown", fechaFora);
      document.removeEventListener("keydown", fechaEsc);
    };
  }, [aberta]);
  return (
    <div
      ref={campoRef}
      className="dados-campo dados-fonte-campo"
      onBlur={(e) => {
        // Foco saindo do campo inteiro (Tab) fecha a lista; foco que fica nas opções não.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAberta(false);
      }}
    >
      <span className="dados-campo-rotulo" id={`rotulo-${campo}`}>Fonte do {rotulo.toLowerCase()}</span>
      <div className="dados-fonte-escolhida">
        <PreviaFonte valor={valor || null} enviadas={enviadas} texto={rotuloFonte(valor || null, enviadas)} />
        {valor ? (
          <button type="button" className="ledger-button ledger-button-quiet" onClick={() => escolher("")}>Usar a padrão</button>
        ) : null}
      </div>
      {fonteEnviada ? (
        <div className="dados-fonte-bloqueio" role="note">
          <span>
            Esta vitrine usa a sua fonte enviada <strong>{fonteEnviada}</strong>. Para escolher uma do Google Fonts, volte para a padrão antes.
          </span>
          <button type="button" className="ledger-button" onClick={onVoltarPadrao}>Voltar para a padrão</button>
        </div>
      ) : null}
      <input
        type="search"
        role="combobox"
        disabled={Boolean(fonteEnviada)}
        aria-labelledby={`rotulo-${campo}`}
        aria-expanded={aberta}
        aria-controls={idLista}
        placeholder="Buscar no Google Fonts (ex.: Playfair)"
        value={busca}
        onFocus={() => setAberta(true)}
        onChange={(e) => {
          setBusca(e.target.value);
          setAberta(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAberta(false);
        }}
      />
      {aberta ? (
        <ul
          className="dados-fonte-lista"
          id={idLista}
          role="listbox"
          aria-label={`Fontes para o ${rotulo.toLowerCase()}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {minhas.map((f) => (
            <li key={f.valor}>
              <button type="button" role="option" aria-selected={valor === f.valor} onClick={() => escolher(f.valor)}>
                {f.familia} <small>sua fonte</small>
              </button>
            </li>
          ))}
          {resultados.map((f) => (
            <li key={f.familia}>
              <button type="button" role="option" aria-selected={valor === f.familia} onClick={() => escolher(f.familia)}>
                {f.familia} <small>{f.categoria}</small>
              </button>
            </li>
          ))}
          {minhas.length + resultados.length === 0 ? <li className="dados-fonte-vazio">Nenhuma fonte com esse nome.</li> : null}
        </ul>
      ) : null}
      {aberta ? (
        <button type="button" className="ledger-button ledger-button-quiet dados-fonte-fechar" aria-controls={idLista} onClick={() => setAberta(false)}>
          Fechar lista
        </button>
      ) : null}
      <span className="dados-campo-ajuda">
        {ajuda} Prévia: <PreviaFonte valor={valor || null} enviadas={enviadas} texto={nomeLoja} />
      </span>
    </div>
  );
}

export interface SecaoMarcaProps {
  pending: boolean;
  podeEditar: boolean;
  editando: string | null;
  setEditando: (v: string | null) => void;
  salvando: boolean;
  setSalvando: (v: boolean) => void;
  setAviso: (a: Aviso) => void;
  avisoDa: (id: string) => React.ReactNode;
  cabecalho: (id: string, titulo: React.ReactNode, descricao: string, acao: React.ReactNode, larga?: boolean) => React.ReactNode;
  editar: (id: string, nome: string, onEditar: () => void) => React.ReactNode;
}

/**
 * Seção "Marca" de Dados da loja. O nome é o da loja e o WhatsApp dos pedidos
 * é o da lojista; aqui ela escolhe cores e fontes e envia logo, identidade
 * visual e fontes próprias. Envio e remoção de arquivo valem na hora (não
 * dependem do "Editar").
 */
export default function SecaoMarca(p: SecaoMarcaProps) {
  const [estado, setEstado] = useState<EstadoMarca>({ status: "loading" });
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [google, setGoogle] = useState<FonteGoogle[]>([...FONTES_RESERVA]);
  const [enviando, setEnviando] = useState<string | null>(null);
  const inputLogo = useRef<HTMLInputElement>(null);
  const inputIdentidade = useRef<HTMLInputElement>(null);
  const inputFonte = useRef<HTMLInputElement>(null);
  // Papel (título, subtítulo ou corpo) do próximo arquivo de fonte escolhido.
  const papelUpload = useRef<CampoFonte | null>(null);

  const ler = useCallback(async () => {
    setEstado({ status: "loading" });
    try {
      const r = await fetch("/api/marca");
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok !== true) {
        setEstado({ status: "erro" });
        return;
      }
      setEstado({ status: "ready", ...projetarMarca(d) });
    } catch {
      setEstado({ status: "erro" });
    }
  }, []);

  useEffect(() => {
    if (!p.pending) ler();
  }, [p.pending, ler]);

  const editandoAqui = p.editando === "marca";
  useEffect(() => {
    if (!editandoAqui || estado.status !== "ready" || !estado.fonteNoPlano) return;
    let vivo = true;
    fetch("/api/google-fonts")
      .then((r) => r.json())
      .then((d) => {
        if (vivo && Array.isArray(d?.fontes) && d.fontes.length) setGoogle(d.fontes);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [editandoAqui, estado]);

  if (estado.status === "loading") {
    return (
      <section className="desk-panel dados-secao" aria-labelledby="secao-marca" aria-busy="true">
        {p.cabecalho("marca", "Marca", DESCRICAO, null)}
        <dl className="ledger-rows dados-lista">
          <div className="ledger-row dados-item"><dt className="ledger-row-label">Cor principal</dt><dd className="ledger-row-value"><TextBone w="10ch" /></dd></div>
        </dl>
      </section>
    );
  }
  if (estado.status === "erro") {
    return (
      <section className="desk-panel dados-secao" aria-labelledby="secao-marca">
        {p.cabecalho("marca", "Marca", DESCRICAO, <button type="button" className="ledger-button" onClick={ler} aria-label="Tentar de novo ler a marca">Tentar de novo</button>, true)}
        <p className="ledger-notice dados-nota" role="status">Não deu para ler a marca agora. Ela continua salva.</p>
      </section>
    );
  }

  const { marca, fonteNoPlano, armazenamento } = estado;
  const nomeLoja = marca.nome_loja ?? "Sua loja";

  function abrir() {
    p.setAviso(null);
    setRascunho({
      cor_primaria: marca.cor_primaria ?? "",
      cor_destaque: marca.cor_destaque ?? "",
      fonte_titulo: marca.fonte_titulo ?? "",
      fonte_subtitulo: marca.fonte_subtitulo ?? "",
      fonte_corpo: marca.fonte_corpo ?? "",
    });
    p.setEditando("marca");
  }

  async function salvar() {
    const corpo: Record<string, string> = {};
    for (const campo of ["cor_primaria", "cor_destaque"] as const) {
      const bruto = (rascunho[campo] ?? "").trim();
      if (!bruto) continue;
      const hex = normalizarCorHex(bruto);
      if (!hex) {
        p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca("invalid_field", campo) });
        return;
      }
      if (hex !== marca[campo]) corpo[campo] = hex;
    }
    if (fonteNoPlano) {
      for (const { campo } of PAPEIS_FONTE) {
        // Vazio = padrão: grava a Montserrat explicitamente para trocar uma fonte escolhida antes.
        const novo = (rascunho[campo] ?? "").trim() || FONTE_PADRAO;
        const atual = marca[campo] ?? FONTE_PADRAO;
        if (novo !== atual) corpo[campo] = novo;
      }
    }
    if (Object.keys(corpo).length === 0) {
      p.setEditando(null);
      return;
    }
    p.setSalvando(true);
    try {
      const res = await fetch("/api/marca", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(data.detail, data.campo) });
        return;
      }
      setEstado({ status: "ready", ...projetarMarca(data) });
      p.setEditando(null);
      p.setAviso({ secao: "marca", ok: true, texto: "Salvo. A vitrine e a mila já usam a marca nova." });
    } catch {
      p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(null) });
    } finally {
      p.setSalvando(false);
    }
  }

  async function enviar(tipo: "logo" | "identidade" | "fonte", arquivo: File, familia?: string, papel?: CampoFonte | null) {
    const limite = LIMITES_ARQUIVO[tipo];
    if (arquivo.size > limite.bytes) {
      p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca("file_too_large", tipo) });
      return;
    }
    setEnviando(tipo);
    p.setAviso(null);
    try {
      const conteudo = base64DeBytes(new Uint8Array(await arquivo.arrayBuffer()));
      const res = await fetch("/api/marca/arquivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, conteudo, nome: arquivo.name, ...(familia ? { familia } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(data.detail, data.campo) });
        return;
      }
      let marcaAtual = projetarMarca(data);
      setEstado({ status: "ready", ...marcaAtual });
      if (tipo === "fonte" && papel && familia) {
        // Fonte enviada para um papel: já passa a ser a fonte desse papel.
        const nova = marcaAtual.marca.fontes_enviadas.find((f) => f.familia === familia);
        if (nova) {
          const r = await fetch("/api/marca", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [papel]: nova.valor }) });
          const d = await r.json().catch(() => ({}));
          if (r.ok && d.ok === true) {
            marcaAtual = projetarMarca(d);
            setEstado({ status: "ready", ...marcaAtual });
          }
        }
      }
      const rotuloPapel = papel ? PAPEIS_FONTE.find((x) => x.campo === papel)?.rotulo.toLowerCase() : null;
      p.setAviso({
        secao: "marca",
        ok: true,
        texto: tipo === "logo" ? "Logo salvo." : tipo === "fonte" ? (rotuloPapel ? `Fonte enviada e em uso no ${rotuloPapel}.` : "Fonte enviada. Escolha onde usar em Editar.") : "Arquivo salvo.",
      });
    } catch {
      p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(null) });
    } finally {
      setEnviando(null);
    }
  }

  async function remover(tipo: "logo" | "identidade" | "fonte", id?: number) {
    setEnviando(`remover-${tipo}-${id ?? ""}`);
    p.setAviso(null);
    try {
      const res = await fetch("/api/marca/arquivo/remover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id === undefined ? { tipo } : { tipo, id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(data.detail, data.campo) });
        return;
      }
      setEstado({ status: "ready", ...projetarMarca(data) });
    } catch {
      p.setAviso({ secao: "marca", ok: false, texto: mensagemDaMarca(null) });
    } finally {
      setEnviando(null);
    }
  }

  const arquivoEscolhido = (tipo: "logo" | "identidade" | "fonte") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (tipo === "fonte") {
      // O nome sai do arquivo: a lojista só escolhe o papel e o arquivo.
      enviar("fonte", arquivo, nomeDaFonteDoArquivo(arquivo.name, marca.fontes_enviadas.map((f) => f.familia)), papelUpload.current);
      return;
    }
    enviar(tipo, arquivo);
  };

  const ocupado = enviando !== null || p.salvando;

  return (
    <section className="desk-panel dados-secao" aria-labelledby="secao-marca">
      {p.cabecalho("marca", "Marca", DESCRICAO, p.editar("marca", "marca", abrir), editandoAqui)}
      {editandoAqui ? (
        <form
          id="form-marca"
          className="dados-form"
          onSubmit={(e) => {
            e.preventDefault();
            salvar();
          }}
        >
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
          {fonteNoPlano ? (
            PAPEIS_FONTE.map((papel) => (
              <EscolhaFonte
                key={papel.campo}
                campo={papel.campo}
                rotulo={papel.rotulo}
                ajuda={papel.ajuda}
                valor={rascunho[papel.campo] ?? ""}
                onChange={(v) => setRascunho((r) => ({ ...r, [papel.campo]: v }))}
                google={google}
                enviadas={marca.fontes_enviadas}
                nomeLoja={nomeLoja}
                fonteEnviada={
                  (rascunho[papel.campo] ?? "").startsWith("arquivo:")
                    ? marca.fontes_enviadas.find((f) => f.valor === rascunho[papel.campo])?.familia ?? "sua fonte"
                    : null
                }
                onVoltarPadrao={() => setRascunho((r) => ({ ...r, [papel.campo]: "" }))}
              />
            ))
          ) : (
            <p className="dados-campo-ajuda">As fontes da marca são do Plano Pro. No Essencial, a vitrine usa a {FONTE_PADRAO}.</p>
          )}
          {p.avisoDa("marca")}
        </form>
      ) : (
        <>
          <dl className="ledger-rows dados-lista">
            {(["cor_primaria", "cor_destaque"] as const).map((campo) => (
              <div key={campo} className="ledger-row dados-item">
                <dt className="ledger-row-label">{campo === "cor_primaria" ? "Cor principal" : "Cor de destaque"}</dt>
                <dd className={`ledger-row-value${marca[campo] ? "" : " is-vazio"}`}>
                  {marca[campo] ? <span className="dados-cor"><Amostra cor={marca[campo]!} />{marca[campo]}</span> : "Não informada"}
                </dd>
              </div>
            ))}
            {PAPEIS_FONTE.map((papel) => (
              <div key={papel.campo} className="ledger-row dados-item">
                <dt className="ledger-row-label">Fonte do {papel.rotulo.toLowerCase()}</dt>
                <dd className="ledger-row-value">
                  <PreviaFonte valor={marca[papel.campo]} enviadas={marca.fontes_enviadas} texto={rotuloFonte(marca[papel.campo], marca.fontes_enviadas)} />
                </dd>
              </div>
            ))}
            <div className="ledger-row dados-item">
              <dt className="ledger-row-label">Layout da vitrine</dt>
              <dd className="ledger-row-value">
                {DESCRICAO_TEMPLATE[marca.template].nome}
                {" · "}
                <Link href="/workspace/vitrine" className="dados-site">Escolher layout e ver prévia</Link>
              </dd>
            </div>
            {marca.link_vitrine ? (
              <div className="ledger-row dados-item">
                <dt className="ledger-row-label">Link da vitrine</dt>
                <dd className="ledger-row-value">
                  <a href={marca.link_vitrine} target="_blank" rel="noopener noreferrer" className="dados-site">{marca.link_vitrine.replace("https://", "")}</a>
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="dados-campo-ajuda dados-marca-nota">
            A vitrine usa o nome da loja ({nomeLoja}) e os pedidos chegam no seu WhatsApp{marca.whatsapp ? `, ${formatarWhatsapp(marca.whatsapp)}` : ""}.
            {!fonteNoPlano ? ` As fontes da marca são do Plano Pro; no Essencial, a vitrine usa a ${FONTE_PADRAO}.` : ""}
          </p>
        </>
      )}

      <div className="dados-marca-arquivos">
        {!armazenamento ? <p className="ledger-notice dados-nota" role="status">O envio de arquivos ainda não está ligado.</p> : null}

        <div className="dados-marca-bloco">
          <h3>Logo</h3>
          <div className="dados-marca-logo">
            {marca.logo_url ? <img src={marca.logo_url} alt={`Logo de ${nomeLoja}`} /> : <span className="dados-vazio">Nenhum logo enviado.</span>}
          </div>
          <div className="dados-marca-acoes">
            <button type="button" className="ledger-button" disabled={!armazenamento || ocupado} onClick={() => inputLogo.current?.click()}>
              {enviando === "logo" ? "Enviando…" : marca.logo_url ? "Trocar logo" : "Enviar logo"}
            </button>
            {marca.logo_url ? (
              <button type="button" className="ledger-button ledger-button-quiet" disabled={ocupado} onClick={() => remover("logo")}>Tirar logo</button>
            ) : null}
            <input ref={inputLogo} type="file" accept={LIMITES_ARQUIVO.logo.aceita} hidden onChange={arquivoEscolhido("logo")} aria-label="Arquivo do logo" />
          </div>
          <span className="dados-campo-ajuda">PNG, JPG ou WebP, até 1,5 MB. Fundo transparente fica melhor.</span>
        </div>

        <div className="dados-marca-bloco">
          <h3>Identidade visual</h3>
          {marca.identidade.length ? (
            <ul className="dados-marca-lista">
              {marca.identidade.map((a) => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" rel="noopener noreferrer">{a.nome}</a>
                  <small>{formatarTamanho(a.tamanho)}</small>
                  <button type="button" className="ledger-button ledger-button-quiet" disabled={ocupado} onClick={() => remover("identidade", a.id)} aria-label={`Tirar ${a.nome}`}>Tirar</button>
                </li>
              ))}
            </ul>
          ) : (
            <span className="dados-vazio">Manual da marca, paleta ou padrões, se você tiver.</span>
          )}
          <div className="dados-marca-acoes">
            <button
              type="button"
              className="ledger-button"
              disabled={!armazenamento || ocupado || marca.identidade.length >= LIMITES_ARQUIVO.identidade.maximo}
              onClick={() => inputIdentidade.current?.click()}
            >
              {enviando === "identidade" ? "Enviando…" : "Enviar arquivo"}
            </button>
            <input ref={inputIdentidade} type="file" accept={LIMITES_ARQUIVO.identidade.aceita} hidden onChange={arquivoEscolhido("identidade")} aria-label="Arquivo de identidade visual" />
          </div>
          <span className="dados-campo-ajuda">
            PDF, PNG, JPG ou WebP, até 3 MB cada, até {LIMITES_ARQUIVO.identidade.maximo} arquivos. A vitrine não lê estes arquivos sozinha: peça à mila no WhatsApp para ler o seu manual em PDF. Ela sugere as cores e as fontes que achar nele e só aplica depois do seu ok.
          </span>
        </div>

        {fonteNoPlano ? (
          <div className="dados-marca-bloco">
            <h3>Suas fontes</h3>
            {marca.fontes_enviadas.length ? (
              <ul className="dados-marca-lista">
                {marca.fontes_enviadas.map((f) => (
                  <li key={f.id}>
                    <PreviaFonte valor={f.valor} enviadas={marca.fontes_enviadas} texto={f.familia} />
                    <small>{f.formato.toUpperCase()}</small>
                    <button type="button" className="ledger-button ledger-button-quiet" disabled={ocupado} onClick={() => remover("fonte", f.id)} aria-label={`Tirar a fonte ${f.familia}`}>Tirar</button>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="dados-vazio">Se a sua fonte não está no Google Fonts, envie o arquivo dela aqui.</span>
            )}
            <div className="dados-marca-acoes">
              {PAPEIS_FONTE.map((papel) => (
                <button
                  key={papel.campo}
                  type="button"
                  className="ledger-button"
                  disabled={!armazenamento || ocupado || marca.fontes_enviadas.length >= LIMITES_ARQUIVO.fonte.maximo}
                  onClick={() => {
                    papelUpload.current = papel.campo;
                    inputFonte.current?.click();
                  }}
                >
                  {enviando === "fonte" && papelUpload.current === papel.campo ? "Enviando…" : `Enviar fonte do ${papel.rotulo.toLowerCase()}`}
                </button>
              ))}
              <input ref={inputFonte} type="file" accept={LIMITES_ARQUIVO.fonte.aceita} hidden onChange={arquivoEscolhido("fonte")} aria-label="Arquivo da fonte" />
            </div>
            <span className="dados-campo-ajuda">
              WOFF2, WOFF, TTF ou OTF, até 2 MB. A fonte fica pública no link da vitrine: envie só fontes que você tem licença para usar na web.
            </span>
          </div>
        ) : null}
        {!editandoAqui ? p.avisoDa("marca") : null}
      </div>
    </section>
  );
}
