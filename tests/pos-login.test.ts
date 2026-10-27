import test from "node:test";
import assert from "node:assert/strict";
import { consumirDestinoPosLogin, destinoPermitido, guardarDestinoPosLogin } from "../lib/pos-login.ts";

function storageFalso() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

test("pós-login: o link de assinatura volta para a tela de plano uma vez", () => {
  const s = storageFalso();
  guardarDestinoPosLogin("/workspace/plano", s);
  assert.equal(consumirDestinoPosLogin(s), "/workspace/plano");
  assert.equal(consumirDestinoPosLogin(s), "/workspace", "o destino é consumido");
});

test("pós-login: destino fora da lista vira o início do workspace", () => {
  const s = storageFalso();
  guardarDestinoPosLogin("https://exemplo.com", s);
  assert.equal(consumirDestinoPosLogin(s), "/workspace");
  s.setItem("mila_pos_login", "//exemplo.com");
  assert.equal(consumirDestinoPosLogin(s), "/workspace", "valor plantado no storage não redireciona");
});

test("pós-login: o link de um conector volta para a tela do conector", () => {
  const s = storageFalso();
  guardarDestinoPosLogin("/integrations/google", s);
  assert.equal(consumirDestinoPosLogin(s), "/integrations/google");
  guardarDestinoPosLogin("/integrations/qualquer", s);
  assert.equal(consumirDestinoPosLogin(s), "/workspace", "conector fora da lista não vira destino");
});

test("pós-login: a área de integrações é destino; caminho livre não", () => {
  const s = storageFalso();
  guardarDestinoPosLogin("/workspace/integracoes", s);
  assert.equal(consumirDestinoPosLogin(s), "/workspace/integracoes");
  assert.equal(destinoPermitido("/workspace/integracoes"), true);
  assert.equal(destinoPermitido("/workspace/integracoes?x=1"), false);
  assert.equal(destinoPermitido("https://exemplo.com"), false);
  assert.equal(destinoPermitido(null), false);
});
