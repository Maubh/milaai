"use client";

import { useMemo, useState } from "react";
import { brl, calculatePrice, defaultInputs, sanitizeInputs, type PriceInputs } from "@/lib/pricing";

interface Props {
  variant?: "landing" | "workspace";
  initial?: Partial<PriceInputs>;
  onChange?: (inputs: PriceInputs) => void;
}

const FIELDS: { key: keyof PriceInputs; label: string; hint: string; money: boolean }[] = [
  { key: "custoPeca", label: "Custo da peça (R$)", hint: "Quanto a peça custou para você.", money: true },
  { key: "embalagem", label: "Embalagem (R$)", hint: "Caixa, saquinho, cartão e laço.", money: true },
  { key: "rateio", label: "Rateio por peça (R$)", hint: "Custos fixos divididos pela venda.", money: true },
  { key: "taxaPagamento", label: "Taxa de pagamento (%)", hint: "Maquininha ou parcelamento.", money: false },
  { key: "imposto", label: "Imposto (%)", hint: "Alíquota aplicada sobre a venda.", money: false },
  { key: "margemDesejada", label: "Margem desejada (%)", hint: "Lucro que você quer manter.", money: false },
];

export default function PriceCalculator({ variant = "landing", initial, onChange }: Props) {
  const [inputs, setInputs] = useState<PriceInputs>(() => ({
    ...defaultInputs(),
    ...sanitizeInputs(initial ?? {}),
  }));
  const result = useMemo(() => calculatePrice(inputs), [inputs]);

  function update(key: keyof PriceInputs, raw: string) {
    const next = sanitizeInputs({ ...inputs, [key]: raw });
    setInputs(next);
    onChange?.(next);
  }

  const rows = [
    { label: "Custo da peça", value: result.parcelas.custo },
    { label: "Embalagem", value: result.parcelas.embalagem },
    { label: "Rateio", value: result.parcelas.rateio },
    { label: "Taxa de pagamento", value: result.parcelas.taxas },
    { label: "Imposto", value: result.parcelas.impostos },
    { label: "Sua margem", value: result.parcelas.margem },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className={`calc ${variant === "workspace" ? "calc-work" : ""}`}>
      <div className="calc-form card" aria-label="Campos do Raio-X do Preço">
        <p className="calc-eyebrow">Dados de exemplo · edite à vontade</p>
        <div className="calc-fields">
          {FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label htmlFor={`calc-${variant}-${f.key}`}>{f.label}</label>
              <input
                id={`calc-${variant}-${f.key}`}
                className="num"
                inputMode="decimal"
                type="number"
                min={0}
                max={f.money ? 1000000 : 95}
                step={f.money ? "0.5" : "0.5"}
                value={Number.isFinite(inputs[f.key]) ? inputs[f.key] : 0}
                onChange={(e) => update(f.key, e.target.value)}
              />
              <p className="hint">{f.hint}</p>
            </div>
          ))}
        </div>
        <p className="formula">
          Preço sugerido = (custo + embalagem + rateio) ÷ (1 − taxa − imposto − margem)
        </p>
      </div>

      <div className="calc-result card" aria-live="polite" aria-label="Resultado do cálculo">
        <p className="calc-eyebrow">Composição do preço</p>
        {result.erro ? (
          <p role="alert" className="calc-error">
            {result.erro}
          </p>
        ) : (
          <>
            <p className="calc-price display num">{brl(result.precoSugerido)}</p>
            <p className="calc-sub">
              preço sugerido · margem de <strong className="num">{brl(result.margemReais)}</strong> por peça
            </p>
            <ul className="calc-bars">
              {rows.map((row) => (
                <li key={row.label}>
                  <div className="calc-bar-row">
                    <span>{row.label}</span>
                    <span className="num">{brl(row.value)}</span>
                  </div>
                  <div className="calc-bar-track" aria-hidden="true">
                    <span style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="calc-note">
              Custo direto de <strong className="num">{brl(result.custoTotal)}</strong> por peça. Simulação
              local com dados de exemplo. Não é o resultado da sua loja.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
