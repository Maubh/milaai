"use client";

import { useState } from "react";
import Link from "next/link";
import PriceCalculator from "@/components/PriceCalculator";
import { PECAS } from "@/lib/demo-data";
import type { PriceInputs } from "@/lib/pricing";

export default function PrecificacaoPage() {
  const [pecaId, setPecaId] = useState(PECAS[0].id);
  const peca = PECAS.find((p) => p.id === pecaId) ?? PECAS[0];
  const [initial, setInitial] = useState<Partial<PriceInputs>>({
    custoPeca: peca.custoPeca,
    embalagem: peca.embalagem,
    rateio: peca.rateio,
  });

  function trocarPeca(id: string) {
    const next = PECAS.find((p) => p.id === id) ?? PECAS[0];
    setPecaId(next.id);
    setInitial({ custoPeca: next.custoPeca, embalagem: next.embalagem, rateio: next.rateio });
  }

  return (
    <div className="work-wrap">
      <p className="tag">Ferramenta auxiliar · exemplo</p>
      <h1 className="display work-title">Precificação</h1>
      <p className="work-lede">
        A mesma lógica que a conversa usa, aqui como apoio: escolha a peça, ajuste cada campo e leia a
        decomposição. Valores de exemplo, calculados localmente.
      </p>
      <div className="work-actions" role="group" aria-label="Escolher peça de exemplo" style={{ marginBottom: "1.2rem" }}>
        {PECAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === pecaId ? "btn btn-plum btn-sm" : "btn btn-ghost btn-sm"}
            onClick={() => trocarPeca(p.id)}
            aria-pressed={p.id === pecaId}
          >
            {p.nome}
          </button>
        ))}
      </div>
      <PriceCalculator
        key={pecaId}
        variant="workspace"
        initial={{ ...initial, taxaPagamento: 4.5, imposto: 6, margemDesejada: 45 }}
      />
      <div className="work-actions">
        <Link href="/workspace" className="btn btn-plum btn-sm">
          Voltar à visão geral
        </Link>
      </div>
    </div>
  );
}
