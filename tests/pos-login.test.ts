import test from "node:test";
import assert from "node:assert/strict";
import { consumirDestinoPosLogin, guardarDestinoPosLogin } from "../lib/pos-login.ts";

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
