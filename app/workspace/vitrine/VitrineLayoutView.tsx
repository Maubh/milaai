"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SeletorTemplates from "@/components/SeletorTemplates";
import { TextBone } from "@/components/WorkspaceSkeleton";
import VitrineView from "@/app/vitrine/[slugLoja]/[slugColecao]/VitrineView";
import { mensagemDaMarca } from "@/lib/marca";
import type { ColecaoVitrine, LojaVitrine } from "@/lib/server/vitrine-api";
import { COLECAO_DE_EXEMPLO, DESCRICAO_TEMPLATE, TEMPLATES_VITRINE, normalizarItens, pecasDeExemplo, templateDaVitrine, type TemplateVitrine } from "@/lib/vitrine";
import "@/app/vitrine/vitrine.css";
import "./vitrine-workspace.css";

type Leitura =
  | { status: "loading" }
  | { status: "erro"; detalhe: string | null }
  | { status: "ready"; template: TemplateVitrine; loja: LojaVitrine; vitrine: ColecaoVitrine | null };

/**
 * Página Vitrine da área logada: a lojista escolhe o layout (gravado na marca
 * da loja, o mesmo campo que a mila usa pelo WhatsApp) e vê a coleção mais
 * recente nos três layouts. Sem coleção publicada, a prévia usa peças de
 * exemplo marcadas como tal.
 */
export default function VitrineLayoutView({ pending = false }: { pending?: boolean }) {
  const params = useSearchParams();
  const [leitura, setLeitura] = useState<Leitura>({ status: "loading" });
  const [escolhido, setEscolhido] = useState<TemplateVitrine | null>(null);
  const [vendo, setVendo] = useState<TemplateVitrine | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const ler = useCallback(async () => {
    setLeitura({ status: "loading" });
    try {
      const r = await fetch("/api/vitrine-previa");
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok !== true || !d.loja) {
        setLeitura({ status: "erro", detalhe: typeof d.detail === "string" ? d.detail : `http_${r.status}` });
        return;
      }
      const template = templateDaVitrine(d.template);
      const vitrine: ColecaoVitrine | null =
        d.vitrine && typeof d.vitrine === "object"
          ? { ...d.vitrine, itens: normalizarItens(d.vitrine.itens) }
          : null;
      setLeitura({ status: "ready", template, loja: { ...d.loja, template }, vitrine: vitrine && vitrine.itens.length ? vitrine : null });
    } catch {
      setLeitura({ status: "erro", detalhe: "falha_rede" });
    }
  }, []);

  useEffect(() => {
    if (!pending) ler();
  }, [pending, ler]);

  // O link da galeria pública chega com ?template=: já vem com ele marcado.
  const sugerido = templateDaVitrine(params?.get("template"));
  const temSugestao = (TEMPLATES_VITRINE as readonly string[]).includes(params?.get("template") ?? "");
  const atual = leitura.status === "ready" ? leitura.template : null;
  const marcado = escolhido ?? (temSugestao ? sugerido : atual) ?? "classico";
  const previa = vendo ?? marcado;

  async function salvar() {
    if (atual === null || marcado === atual) return;
    setSalvando(true);
    setAviso(null);
    try {
      const res = await fetch("/api/marca", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ template: marcado }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) {
        setAviso({ ok: false, texto: mensagemDaMarca(data.detail, data.campo ?? (data.detail === "nothing_to_update" ? "template" : undefined)) });
        return;
      }
      const salvo = templateDaVitrine(data.marca?.template);
      setLeitura((l) => (l.status === "ready" ? { ...l, template: salvo, loja: { ...l.loja, template: salvo } } : l));
      setEscolhido(null);
      setAviso({ ok: true, texto: `Salvo. A sua vitrine já abre no layout ${DESCRICAO_TEMPLATE[salvo].nome}.` });
    } catch {
      setAviso({ ok: false, texto: mensagemDaMarca(null) });
    } finally {
      setSalvando(false);
    }
  }

  const carregando = pending || leitura.status === "loading";

  return (
    <div className="desk-stack vitrine-ws">
      <section className="desk-panel" aria-labelledby="vitrine-ws-titulo" aria-busy={carregando || undefined}>
        <div className="dados-secao-head">
          <h2 id="vitrine-ws-titulo">Layout da vitrine</h2>
          <p>Como as suas peças aparecem no link da vitrine. Os três usam as cores, as fontes e o logo da sua marca, em todos os planos.</p>
        </div>

        {carregando ? (
          <p className="vitrine-ws-carregando"><TextBone w="18ch" /></p>
        ) : leitura.status === "erro" ? (
          <div className="vitrine-ws-erro">
            <p className="ledger-notice" role="alert">
              {leitura.detalhe === "no_session" ? "Sua sessão expirou. Entre de novo para ver a vitrine." : "Não deu para ler a sua vitrine agora."}
            </p>
            <button type="button" className="ledger-button" onClick={ler}>Tentar de novo</button>
          </div>
        ) : (
          <form
            className="vitrine-ws-form"
            onSubmit={(e) => {
              e.preventDefault();
              salvar();
            }}
          >
            <SeletorTemplates
              nome="layout-vitrine"
              legenda="Escolha o layout"
              valor={marcado}
              atual={atual ?? undefined}
              onChange={(t) => {
                setEscolhido(t);
                setVendo(null);
                setAviso(null);
              }}
              disabled={salvando}
            />
            <div className="vitrine-ws-acoes">
              <button type="submit" className="ledger-button ledger-button-primary" disabled={salvando || marcado === atual}>
                {salvando ? "Salvando…" : marcado === atual ? `${DESCRICAO_TEMPLATE[marcado].nome} em uso` : `Usar ${DESCRICAO_TEMPLATE[marcado].nome}`}
              </button>
              <Link href="/workspace/dados-loja" className="ledger-button ledger-button-quiet">Cores, fontes e logo</Link>
            </div>
            {aviso ? (
              <p className={`dados-aviso${aviso.ok ? " is-ok" : " is-erro"}`} role={aviso.ok ? "status" : "alert"}>{aviso.texto}</p>
            ) : null}
          </form>
        )}
      </section>

      {leitura.status === "ready" ? (
        <section className="desk-panel vitrine-ws-previa-painel" aria-labelledby="vitrine-ws-previa">
          <div className="dados-secao-head">
            <h2 id="vitrine-ws-previa">Prévia</h2>
            <p>
              {leitura.vitrine
                ? `A sua coleção mais recente, “${leitura.vitrine.tituloColecao}”, em cada layout. A prévia não manda nada para o WhatsApp.`
                : "Você ainda não publicou uma vitrine: a prévia usa peças de exemplo, marcadas como exemplo, com a sua marca."}
            </p>
          </div>
          <div className="vitrine-ws-abas" role="tablist" aria-label="Layout da prévia">
            {TEMPLATES_VITRINE.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                id={`aba-${t}`}
                aria-selected={previa === t}
                aria-controls="vitrine-ws-quadro"
                tabIndex={previa === t ? 0 : -1}
                className={`vitrine-ws-aba${previa === t ? " is-ativa" : ""}`}
                onClick={() => setVendo(t)}
                onKeyDown={(e) => {
                  const i = TEMPLATES_VITRINE.indexOf(previa);
                  if (e.key === "ArrowRight") setVendo(TEMPLATES_VITRINE[(i + 1) % TEMPLATES_VITRINE.length]);
                  if (e.key === "ArrowLeft") setVendo(TEMPLATES_VITRINE[(i + TEMPLATES_VITRINE.length - 1) % TEMPLATES_VITRINE.length]);
                }}
              >
                {DESCRICAO_TEMPLATE[t].nome}
                {t === marcado ? <span className="vitrine-ws-aba-nota"> (escolhido)</span> : null}
              </button>
            ))}
          </div>
          <div id="vitrine-ws-quadro" role="tabpanel" aria-labelledby={`aba-${previa}`} className="vitrine-ws-quadro">
            <VitrineView
              key={previa}
              loja={leitura.loja}
              template={previa}
              exemplo
              vitrine={
                leitura.vitrine ?? {
                  id: "exemplo",
                  slugColecao: "exemplo",
                  tituloColecao: COLECAO_DE_EXEMPLO,
                  descricao: null,
                  itens: pecasDeExemplo(leitura.loja.corPrimaria),
                }
              }
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
