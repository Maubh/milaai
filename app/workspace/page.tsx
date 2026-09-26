"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LocalQr from "@/components/LocalQr";
import { CUSTOS_BASE, PECAS } from "@/lib/demo-data";
import { brl, calculatePrice } from "@/lib/pricing";
import { getVerifiedWaLink } from "@/lib/onboarding";

export default function WorkspaceHome() {
  const [pecaId, setPecaId] = useState(PECAS[0].id);
  const [custos, setCustos] = useState(CUSTOS_BASE);
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    setWaLink(getVerifiedWaLink());
  }, []);

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
      <p className="tag">Área logada · piloto</p>
      <h1 className="work-title">Olá</h1>
      <p className="work-lede">
        Aqui você vê status, integrações e custos. O dia a dia com a mila. continua no WhatsApp — o
        mesmo contato que te mandou o código.
      </p>

      {waLink ? (
        <section className="card work-card" aria-label="Abrir conversa no WhatsApp" style={{ marginBottom: "1.4rem" }}>
          <h2>Falar com a mila.</h2>
          <p style={{ fontSize: "0.93rem", color: "rgba(39,35,38,0.72)" }}>
            Abra a conversa no celular. A mensagem já vem pronta: “Oi, mila.”
          </p>
          <div className="work-actions" style={{ marginTop: "0.85rem" }}>
            <a
              href={waLink}
              className="btn btn-plum"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir WhatsApp
            </a>
            <Link href="/workspace/integracoes" className="btn btn-ghost btn-sm">
              Ver integrações
            </Link>
          </div>
          <div className="handoff-qr" style={{ marginTop: "1rem" }}>
            <LocalQr
              className="qr-concept"
              value={waLink}
              size={160}
              alt="QR Code para abrir a conversa com a mila. no WhatsApp"
            />
            <p className="hint" style={{ margin: 0, fontSize: "0.82rem", color: "rgba(39,35,38,0.68)" }}>
              No computador: escaneie com o celular
            </p>
          </div>
        </section>
      ) : null}

      <div className="work-grid-2">
        <section className="card work-card" aria-label="Peças de exemplo">
          <h2>Peças de exemplo</h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(39,35,38,0.7)" }}>
            Três peças para exercitar o Raio-X. Escolha uma para ver o resumo.
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
          <p className="calc-price num" style={{ fontSize: "2.4rem" }}>
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
