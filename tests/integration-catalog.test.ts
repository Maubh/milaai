import test from "node:test";
import assert from "node:assert/strict";
import { rowStatus } from "../lib/integration-catalog.ts";

// O plano vem só da resposta do vault; a URL não participa (sem ?plan=).
const LIVE = { id: "jueri", connected: false, app_configured: true };

test("integrações: vault essencial bloqueia o que exige Pro, com selo e sem estado", () => {
  const row = rowStatus("jueri", LIVE, "essencial");
  assert.equal(row.state, "locked");
  assert.equal(row.requiresPro, true);
  assert.equal(row.status, null);
});

test("integrações: vault pro libera a ferramenta configurada", () => {
  const row = rowStatus("jueri", LIVE, "pro");
  assert.equal(row.state, "available");
  assert.deepEqual(row.status, { label: "Disponível", tone: "neutral" });
});

test("integrações: vault sem plano fica não verificado, nunca disponível", () => {
  const row = rowStatus("jueri", LIVE, null);
  assert.equal(row.state, "unknown");
  assert.deepEqual(row.status, { label: "Não verificado", tone: "neutral" });
  // O que não depende do plano segue o vault.
  assert.equal(rowStatus("google", { id: "google", connected: false, app_configured: true }, null).state, "available");
});

test("integrações: conectado pelo vault vale em qualquer plano", () => {
  for (const plan of ["essencial", "pro", null]) {
    assert.equal(rowStatus("jueri", { ...LIVE, connected: true }, plan).state, "connected");
  }
});
