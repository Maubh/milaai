import test from "node:test";
import assert from "node:assert/strict";
import { connectedTools, failureText, ORIGIN, overviewSteps, STARTERS, withText } from "../lib/overview-steps.ts";
import type { ProviderLive } from "../lib/integration-catalog.ts";

const NOW = new Date("2026-10-23T12:00:00Z");
const PILOT = { plan: "essencial", billing: "pilot", trial_ends_at: "2026-11-04T23:14:28Z" };
const ready = <T,>(data: T) => ({ status: "ready" as const, data });
const NUVEM_ON: ProviderLive = { id: "nuvemshop", name: "Nuvemshop", connected: true, app_configured: true };
const meta = (extra: Partial<ProviderLive>): ProviderLive => ({ id: "meta", name: "Meta", connected: true, app_configured: true, ...extra });
const ids = (r: ReturnType<typeof overviewSteps>) => r.steps.map((s) => s.id);

test("passos: sandbox atual (fonte salva, sem registro de sync) e prazo real do teste", () => {
  const r = overviewSteps(ready(PILOT), ready([NUVEM_ON, meta({ product_source: "site_nuvemshop", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(r), ["meta-sync", "plan-trial"]);
  assert.equal(r.steps[0].origin, ORIGIN.meta);
  assert.equal(r.steps[0].href, "/workspace/integracoes#integracao-meta");
  assert.equal(r.steps[1].origin, ORIGIN.plan);
  assert.match(r.steps[1].text, /04\/11\/2026/);
  assert.deepEqual(r.failed, []);
});

test("passos: Meta sem fonte (null explícito) pede só Configurar, sem sync impossível", () => {
  const r = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({ product_source: null, last_sync_at: null })]), NOW);
  assert.deepEqual(ids(r), ["meta-source"]);
  assert.equal(r.steps[0].action, "Configurar");
});

test("passos: campos da Meta ausentes são desconhecidos e não viram passo", () => {
  const r = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({})]), NOW);
  assert.deepEqual(ids(r), []);
  const semSync = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({ product_source: "site_nuvemshop" })]), NOW);
  assert.deepEqual(ids(semSync), []);
});

test("passos: sync registrado não gera passo", () => {
  const r = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({ product_source: "site_nuvemshop", last_sync_at: 1761200000000 })]), NOW);
  assert.deepEqual(ids(r), []);
});

test("passos: fonte desconectada só com connected=false explícito", () => {
  const off = overviewSteps(ready({ billing: "pago" }), ready([{ ...NUVEM_ON, connected: false }, meta({ product_source: "site_nuvemshop", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(off), ["meta-source-off"]);
  assert.match(off.steps[0].text, /Nuvemshop/);
  // Provedor da fonte fora da lista ou sem `connected`: desconhecido, sem conclusão nem sync.
  const ausente = overviewSteps(ready({ billing: "pago" }), ready([meta({ product_source: "erp_olist", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(ausente), []);
  const indefinido = overviewSteps(ready({ billing: "pago" }), ready([{ id: "olist", name: "Olist" }, meta({ product_source: "erp_olist", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(indefinido), []);
});

test("passos: fonte mila não depende de provedor; fonte não reconhecida não conclui", () => {
  const mila = overviewSteps(ready({ billing: "pago" }), ready([meta({ product_source: "mila", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(mila), ["meta-sync"]);
  const outra = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({ product_source: "other", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(outra), []);
});

test("passos: Meta fora da allowlist ou desconectada não gera passo da Meta", () => {
  const fora = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON]), NOW);
  assert.deepEqual(ids(fora), []);
  const desligada = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({ connected: false, product_source: null })]), NOW);
  assert.deepEqual(ids(desligada), []);
});

test("passos: zero conexões sugere a primeira, pela mesma origem da contagem", () => {
  const lista: ProviderLive[] = [{ ...NUVEM_ON, connected: false }, { id: "jueri", connected: false }];
  const r = overviewSteps(ready({ billing: "pago" }), ready(lista), NOW);
  assert.deepEqual(connectedTools(lista), { ids: [], complete: true });
  assert.deepEqual(ids(r), ["integrations-first"]);
  assert.equal(r.steps[0].origin, ORIGIN.integrations);
  // Meta fora do catálogo visível não conta, e uma conexão visível tira a sugestão.
  assert.deepEqual(connectedTools([NUVEM_ON, { id: "bling", connected: true }]).ids, ["nuvemshop"]);
  assert.deepEqual(ids(overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON]), NOW)), []);
});

test("passos: conexão sem `connected` é desconhecida e não prova zero; lista vazia prova", () => {
  const incerta: ProviderLive[] = [{ id: "google" }, { id: "jueri", connected: false }];
  assert.deepEqual(connectedTools(incerta), { ids: [], complete: false });
  assert.deepEqual(ids(overviewSteps(ready({ billing: "pago" }), ready(incerta), NOW)), []);
  // Ids fora do catálogo não pesam, e a Meta fora da lista segue fora (allowlist).
  assert.deepEqual(connectedTools([{ id: "bling" }, { id: "desconhecido" }]), { ids: [], complete: true });
  assert.deepEqual(connectedTools([]), { ids: [], complete: true });
  assert.deepEqual(ids(overviewSteps(ready({ billing: "pago" }), ready([]), NOW)), ["integrations-first"]);
});

test("passos: fonte em branco conta como vazia explícita", () => {
  const r = overviewSteps(ready({ billing: "pago" }), ready([NUVEM_ON, meta({ product_source: "  ", last_sync_at: null })]), NOW);
  assert.deepEqual(ids(r), ["meta-source"]);
});

test("passos: fallback do piloto não vira teste encerrado factual", () => {
  // Sem data na sessão, a regra usa a referência do piloto; depois dela o kind é trial_ended.
  const depois = new Date("2026-12-01T12:00:00Z");
  const r = overviewSteps(ready({ plan: "essencial", billing: "pilot" }), ready([NUVEM_ON]), depois);
  assert.deepEqual(ids(r), []);
  // E antes dela não há prazo real para anunciar.
  const antes = overviewSteps(ready({ plan: "essencial", billing: "pilot" }), ready([NUVEM_ON]), NOW);
  assert.deepEqual(ids(antes), []);
});

test("passos: teste encerrado com billing explícito ou data real vencida", () => {
  const explicito = overviewSteps(ready({ billing: "trial_expirado" }), ready([NUVEM_ON]), NOW);
  assert.deepEqual(ids(explicito), ["plan-ended"]);
  const vencido = overviewSteps(ready({ billing: "pilot", trial_ends_at: "2026-10-01T12:00:00Z" }), ready([NUVEM_ON]), NOW);
  assert.deepEqual(ids(vencido), ["plan-ended"]);
  assert.equal(vencido.steps[0].href, "/workspace/plano");
});

test("passos: falha de uma leitura mantém os passos da outra, com aviso preciso", () => {
  const semPlano = overviewSteps({ status: "error" }, ready([NUVEM_ON, meta({ product_source: null })]), NOW);
  assert.deepEqual(ids(semPlano), ["meta-source"]);
  assert.deepEqual(semPlano.failed, ["plan"]);
  assert.equal(failureText(semPlano.failed), "Não deu para ler o plano agora.");
  const semConexoes = overviewSteps(ready(PILOT), { status: "error" }, NOW);
  assert.deepEqual(ids(semConexoes), ["plan-trial"]);
  assert.equal(failureText(semConexoes.failed), "Não deu para ler as integrações agora.");
  // Erro nunca vira "zero conexões".
  assert.ok(!ids(semConexoes).includes("integrations-first"));
  const nada = overviewSteps({ status: "error" }, { status: "error" }, NOW);
  assert.deepEqual(ids(nada), []);
  assert.equal(failureText(nada.failed), "Não deu para ler o plano e as integrações agora.");
  assert.equal(failureText([]), null);
});

test("passos: carregando enquanto qualquer leitura não respondeu", () => {
  assert.equal(overviewSteps({ status: "loading" }, ready([NUVEM_ON]), NOW).loading, true);
  assert.equal(overviewSteps(ready(PILOT), { status: "loading" }, NOW).loading, true);
  assert.equal(overviewSteps(ready(PILOT), ready([NUVEM_ON]), NOW).loading, false);
  // O que já respondeu aparece enquanto o resto espera.
  const parcial = overviewSteps({ status: "loading" }, ready([NUVEM_ON, meta({ product_source: null })]), NOW);
  assert.deepEqual(ids(parcial), ["meta-source"]);
  assert.deepEqual(parcial.pending, ["plan"]);
});

test("mensagens prontas: só o text muda, número e host preservados", () => {
  const link = "https://wa.me/5511999999999?text=Oi%2C%20mila.";
  for (const s of STARTERS) {
    const url = new URL(withText(link, s.text));
    assert.equal(url.host, "wa.me");
    assert.equal(url.pathname, "/5511999999999");
    assert.equal(url.searchParams.get("text"), s.text);
    assert.deepEqual([...url.searchParams.keys()], ["text"]);
    assert.match(s.context, /^Mila · /);
    assert.ok(!url.search.includes("+"), "espaço sai como %20");
  }
  assert.equal(withText("não é link", "x"), "não é link");
  // Só tarefas dos dois planos; legenda/Instagram é do Pro.
  assert.deepEqual(STARTERS.map((s) => s.id), ["preco", "descricao", "nota"]);
  assert.ok(STARTERS.every((s) => !/legenda|instagram|reels|carrossel/i.test(`${s.label} ${s.text}`)));
  assert.equal(new URL(withText(link, "1+1 = 2")).searchParams.get("text"), "1+1 = 2");
});
