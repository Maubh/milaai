"use client";

import { useState } from "react";
import Link from "next/link";
import { PECAS } from "@/lib/demo-data";

export default function ConteudoPage() {
  const [pecaId, setPecaId] = useState(PECAS[0].id);
  const peca = PECAS.find((p) => p.id === pecaId) ?? PECAS[0];
  const [texto, setTexto] = useState(peca.legenda);
  const [copiado, setCopiado] = useState(false);

  function trocar(id: string) {
    const next = PECAS.find((p) => p.id === id) ?? PECAS[0];
    setPecaId(next.id);
    setTexto(next.legenda);
    setCopiado(false);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="work-wrap">
      <p className="tag">Texto demonstrativo · sem geração automática</p>
      <h1 className="display work-title">Conteúdo da peça</h1>
      <p className="work-lede">
        Uma legenda de exemplo por peça, pronta para editar e copiar. O texto é demonstrativo. Não há
        geração por IA real aqui.
      </p>
      <div className="work-actions" role="group" aria-label="Escolher peça" style={{ marginBottom: "1.2rem" }}>
        {PECAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === pecaId ? "btn btn-plum btn-sm" : "btn btn-ghost btn-sm"}
            onClick={() => trocar(p.id)}
            aria-pressed={p.id === pecaId}
          >
            {p.nome}
          </button>
        ))}
      </div>
      <section className="card work-card" aria-label="Editor de legenda de exemplo">
        <h2>{peca.nome}</h2>
        <p style={{ fontSize: "0.88rem", color: "rgba(39,35,38,0.68)", marginBottom: "0.8rem" }}>
          {peca.categoria} · edite no seu tom antes de publicar.
        </p>
        <div className="field">
          <label htmlFor="legenda">Legenda de exemplo</label>
          <textarea
            id="legenda"
            className="caption-box"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setCopiado(false);
            }}
            rows={8}
          />
          <p className="hint">{texto.length} caracteres · texto demonstrativo.</p>
        </div>
        <div className="copy-row">
          <button type="button" className="btn btn-plum btn-sm" onClick={copiar}>
            {copiado ? "Copiado!" : "Copiar texto"}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              trocar(pecaId);
            }}
          >
            Restaurar exemplo
          </button>
        </div>
        <div className="work-actions">
          <Link href="/conversa" className="btn btn-plum btn-sm">
            Continuar conversa simulada
          </Link>
          <Link href="/workspace/precificacao" className="btn btn-ghost btn-sm">
            Revisar preço
          </Link>
        </div>
      </section>
    </div>
  );
}
