export interface PriceInputs {
  custoPeca: number;
  embalagem: number;
  rateio: number;
  taxaPagamento: number; // percent 0..100
  imposto: number; // percent 0..100
  margemDesejada: number; // percent 0..100
}

export interface PriceResult {
  custoTotal: number;
  precoSugerido: number;
  margemReais: number;
  margemEfetiva: number;
  taxaReais: number;
  impostoReais: number;
  parcelas: { custo: number; embalagem: number; rateio: number; taxas: number; impostos: number; margem: number };
  erro: string | null;
}

const DEFAULTS: PriceInputs = {
  custoPeca: 48,
  embalagem: 6.5,
  rateio: 9,
  taxaPagamento: 4.5,
  imposto: 6,
  margemDesejada: 45,
};

export function defaultInputs(): PriceInputs {
  return { ...DEFAULTS };
}

export function sanitizeInputs(raw: Partial<Record<keyof PriceInputs, unknown>>): PriceInputs {
  const coerce = (v: unknown, fallback: number) => {
    const n = typeof v === "string" ? Number(String(v).replace(",", ".")) : Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(1000000, Math.max(0, n));
  };
  const pct = (v: unknown, fallback: number) => Math.min(95, coerce(v, fallback));
  return {
    custoPeca: coerce(raw.custoPeca, DEFAULTS.custoPeca),
    embalagem: coerce(raw.embalagem, DEFAULTS.embalagem),
    rateio: coerce(raw.rateio, DEFAULTS.rateio),
    taxaPagamento: pct(raw.taxaPagamento, DEFAULTS.taxaPagamento),
    imposto: pct(raw.imposto, DEFAULTS.imposto),
    margemDesejada: pct(raw.margemDesejada, DEFAULTS.margemDesejada),
  };
}

/** preço sugerido = (custo + embalagem + rateio) / (1 - taxa - imposto - margem) */
export function calculatePrice(input: PriceInputs): PriceResult {
  const custoTotal = input.custoPeca + input.embalagem + input.rateio;
  const taxa = input.taxaPagamento / 100;
  const imposto = input.imposto / 100;
  const margem = input.margemDesejada / 100;
  const divisor = 1 - taxa - imposto - margem;

  if (custoTotal <= 0) {
    return empty(custoTotal, "Informe ao menos um custo para calcular o preço.");
  }
  if (divisor <= 0) {
    return empty(
      custoTotal,
      "Taxa + imposto + margem somam 100% ou mais. Reduza um dos percentuais para ver o preço.",
    );
  }

  const precoSugerido = custoTotal / divisor;
  const taxaReais = precoSugerido * taxa;
  const impostoReais = precoSugerido * imposto;
  const margemReais = precoSugerido * margem;
  return {
    custoTotal,
    precoSugerido,
    margemReais,
    margemEfetiva: margem,
    taxaReais,
    impostoReais,
    parcelas: {
      custo: input.custoPeca,
      embalagem: input.embalagem,
      rateio: input.rateio,
      taxas: taxaReais,
      impostos: impostoReais,
      margem: margemReais,
    },
    erro: null,
  };
}

function empty(custoTotal: number, erro: string): PriceResult {
  return {
    custoTotal,
    precoSugerido: 0,
    margemReais: 0,
    margemEfetiva: 0,
    taxaReais: 0,
    impostoReais: 0,
    parcelas: { custo: 0, embalagem: 0, rateio: 0, taxas: 0, impostos: 0, margem: 0 },
    erro,
  };
}

export function brl(value: number): string {
  if (!Number.isFinite(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
