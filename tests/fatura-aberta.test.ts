import test from "node:test";
import assert from "node:assert/strict";
import { lerFaturaAberta, linkDeFaturaAsaas } from "../lib/fatura-aberta.ts";

test("fatura em aberto: só aparece no atraso", () => {
  assert.equal(lerFaturaAberta({ billing: "pago" }), null);
  assert.equal(lerFaturaAberta(null), null);
});

test("fatura em aberto: link só do Asaas", () => {
  assert.equal(linkDeFaturaAsaas("https://www.asaas.com/i/abc123"), "https://www.asaas.com/i/abc123");
  assert.equal(linkDeFaturaAsaas("https://asaas.com.golpe.io/i/abc"), null);
  assert.equal(linkDeFaturaAsaas("javascript:alert(1)"), null);
});

test("fatura em aberto: antes da pausa mostra o último dia; depois, pausado", () => {
  const pausa = "2026-10-30T03:00:00.000Z"; // 00:00 de 30/10 em Brasília
  const antes = lerFaturaAberta(
    { billing: "atrasado", fatura_aberta_url: "https://www.asaas.com/i/abc123", pausa_em: pausa },
    new Date("2026-10-25T12:00:00Z"),
  )!;
  assert.equal(antes.pausado, false);
  assert.equal(antes.pausaEm, "29/10/2026");
  assert.equal(antes.url, "https://www.asaas.com/i/abc123");
  const depois = lerFaturaAberta({ billing: "atrasado", pausa_em: pausa }, new Date("2026-10-31T12:00:00Z"))!;
  assert.equal(depois.pausado, true);
  assert.equal(depois.url, null);
  assert.equal(lerFaturaAberta({ billing: "atrasado", acesso_pausado: true })!.pausado, true);
});
