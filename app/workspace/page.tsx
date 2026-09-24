"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { CUSTOS_BASE, PECAS } from "@/lib/demo-data";
import { brl, calculatePrice } from "@/lib/pricing";

export default function WorkspaceHome() {
  const [pecaId, setPecaId] = useState(PECAS[0].id);
  const [custos, setCustos] = useState(CUSTOS_BASE);
  const session = typeof window !== "undefined" ? getSession() : null;

  const peca = PECAS.find((p) => p.id === pecaId) ?? PECAS[0];
  const resumo = useMemo(
    () =>
      calculatePrice({
        custoPeca: peca.custoPeca,
        embalagem: peca.embalagem,
        rateio: peca.rateio,
        ...custos,
      }),
    [peca, custos],
  );

  function setNum(key: keyof typeof CUSTOS_BASE, raw: string) {
    const n = Number(String(raw).replace(",", "."));
    setCustos((c) => ({ ...c, [key]: Number.isFinite(n) ? Math.min(95, Math.max(0, n)) : 0 }));
  }

  return (
    <div className="work-wrap">
      <p className="tag">Demonstração · dados de exemplo</p>
      <h1 className="display work-title">Boa hora para olhar os números{session ? `, ${session.nome}` : ""}.</h1>
      <p className="work-lede">
        Escolha uma peça de exemplo, ajuste os custos base e veja o resumo se atualizar. Tudo roda neste
        navegador — nenhuma integração real está ligada.
      </p>

      <div className="work-grid-2">
        <section className="card work-card" aria-label="Peças de exemplo">
          <h2>Peças de exemplo</h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(39,35,38,0.7)" }}>
            Três peças fictícias para exercitar o Raio-X. Escolha uma para ver o resumo.
          </p>
          <ul className="peca-list">
            {PECAS.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.nome}</strong>
                  <br />
                  <small>{p.categoria}</small>
                </div>
                <button
                  type="button"
                  className={p.id === pecaId ? "btn btn-plum btn-sm" : "btn btn-ghost btn-sm"}
                  onClick={() => setPecaId(p.id)}
                  aria-pressed={p.id === pecaId}
                >
                  {p.id === pecaId ? "Selecionada" : "Escolher"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card work-card" aria-live="polite" aria-label="Resumo de preço">
          <h2>Resumo de preço</h2>
          <p className="calc-price display num" style={{ fontSize: "2.4rem" }}>
            {resumo.erro ? "—" : brl(resumo.precoSugerido)}
          </p>
          <p style={{ fontSize: "0.93rem" }}>
            {resumo.erro ??
              `${peca.nome} · margem de ${brl(resumo.margemReais)} por peça · custo direto de ${brl(resumo.custoTotal)}.`}
          </p>
          <div className="base-costs">
            <div className="field">
              <label htmlFor="base-taxa">Taxa (%)</label>
              <input
                id="base-taxa"
                className="num"
                type="number"
                min={0}
                max={95}
                step="0.5"
                value={custos.taxaPagamento}
                onChange={(e) => setNum("taxaPagamento", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="base-imposto">Imposto (%)</label>
              <input
                id="base-imposto"
                className="num"
                type="number"
                min={0}
                max={95}
                step="0.5"
                value={custos.imposto}
                onChange={(e) => setNum("imposto", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="base-margem">Margem (%)</label>
              <input
                id="base-margem"
                className="num"
                type="number"
                min={0}
                max={95}
                step="0.5"
                value={custos.margemDesejada}
                onChange={(e) => setNum("margemDesejada", e.target.value)}
              />
            </div>
          </div>
          <div className="work-actions">
            <Link href="/workspace/precificacao" className="btn btn-plum btn-sm">
              Abrir precificação
            </Link>
            <Link href="/workspace/conteudo" className="btn btn-ghost btn-sm">
              Preparar legenda
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
