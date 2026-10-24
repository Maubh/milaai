import test from "node:test";
import assert from "node:assert/strict";
import { acessoConcorrentes } from "../lib/concorrentes-acesso.ts";

test("concorrentes: só true explícito libera; false explícito bloqueia", () => {
  assert.equal(acessoConcorrentes(true, true), "liberado");
  assert.equal(acessoConcorrentes(true, false), "bloqueado");
});

test("concorrentes: falha ou campo ausente não vira conclusão", () => {
  assert.equal(acessoConcorrentes(false, true), "nao_verificado");
  assert.equal(acessoConcorrentes(false, false), "nao_verificado");
  assert.equal(acessoConcorrentes(true, undefined), "nao_verificado");
  assert.equal(acessoConcorrentes(true, null), "nao_verificado");
  assert.equal(acessoConcorrentes(true, "true"), "nao_verificado");
});
