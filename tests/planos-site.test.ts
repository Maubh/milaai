import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTATO_MILA, CONTRATACAO_ABERTA, PRECOS } from "../lib/planos-site.ts";
import { orderErrorText } from "../lib/plan-status.ts";

// Valores dos planos ainda não definidos (06/11/2026): contratação pelo site
// fechada e nenhum preço na página inicial, na tabela de planos e em Meu plano.

test("planos: contratação fechada e sem preço enquanto os valores não são definidos", () => {
  assert.equal(CONTRATACAO_ABERTA, false);
  assert.deepEqual(PRECOS, { essencial: null, pro: null });
});

test("planos: nenhuma tela traz preço fixo no código", () => {
  for (const arq of ["components/landing/Landing.tsx", "components/PricingSection.tsx", "app/workspace/plano/PlanView.tsx"]) {
    const fonte = readFileSync(arq, "utf8");
    assert.doesNotMatch(fonte, /R\$\s?(39|69)\b|price:\s*"\d+"|lp-num">\d+</, `${arq} tem preço fixo`);
  }
});

test("planos: pedido recusado pelo Eve vira aviso com o contato da equipe", () => {
  const texto = orderErrorText(409, "hiring_paused");
  assert.match(texto, /ainda não abriu/);
  assert.ok(texto.includes(CONTATO_MILA));
});
