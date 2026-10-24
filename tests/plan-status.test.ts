import test from "node:test";
import assert from "node:assert/strict";
import { formatTrialLastDay, isShownCurrentPlan, orderErrorText, readPlanStatus } from "../lib/plan-status.ts";

// Regras comerciais da produção (main): o teste só acaba com trial_ends_at da
// sessão, dá para contratar durante o teste, fatura em atraso vem do billing.
const BEFORE = new Date("2026-10-23T12:00:00Z");
const AFTER = new Date("2026-12-01T12:00:00Z");

test("plano: data do teste vem da sessão; o último dia é o anterior ao instante do fim", () => {
  const com = readPlanStatus({ plan: "pro", billing: "pilot", trial_ends_at: "2026-11-05T03:00:00Z" }, BEFORE);
  assert.equal(com.kind, "trial");
  assert.equal(formatTrialLastDay(com.trialEnd!), "04/11/2026");
});

test("plano: sem data o teste continua aberto e nunca inventa fim", () => {
  for (const trial_ends_at of [null, undefined, "", "amanhã", "2026-13-45"]) {
    const s = readPlanStatus({ plan: "pro", billing: "pilot", trial_ends_at }, AFTER);
    assert.equal(s.trialEnd, null);
    assert.equal(s.kind, "trial", `trial_ends_at=${String(trial_ends_at)}: sem data não há fim de teste`);
  }
  assert.equal(readPlanStatus({ billing: "piloto" }, BEFORE).kind, "trial");
});

test("plano: teste encerra pelo billing ou pela data real; durante o teste dá para contratar", () => {
  assert.equal(readPlanStatus({ billing: "pilot", trial_ends_at: "2026-10-01T03:00:00Z" }, BEFORE).kind, "trial_ended");
  assert.equal(readPlanStatus({ billing: "trial_expirado" }, BEFORE).kind, "trial_ended");
  assert.equal(readPlanStatus({ billing: "pilot", trial_ends_at: "2026-11-05T03:00:00Z" }, BEFORE).hiringLocked, false);
});

test("plano: nome só do plan da sessão, situação à parte", () => {
  const s = readPlanStatus({ plan: "essencial", billing: "pilot" }, BEFORE);
  assert.deepEqual([s.title, s.situation], ["Plano Essencial", "Em teste, sem cobrança"]);
  assert.equal(readPlanStatus({ billing: "pilot" }, BEFORE).title, "Plano não informado");
});

test("plano: founder, cortesia, pago, cancelado e atrasado", () => {
  const founder = readPlanStatus({ role: "founder", billing: "pilot", plan: "essencial" }, AFTER);
  assert.deepEqual([founder.kind, founder.situation, founder.hiringLocked], ["founder", "Cortesia, sem cobrança", true]);
  assert.equal(readPlanStatus({ billing: "cortesia", plan: "pro" }, AFTER).kind, "founder");
  assert.equal(readPlanStatus({ billing: "comped", plan: "pro" }, AFTER).kind, "founder");
  const pago = readPlanStatus({ billing: "pago", plan: "essencial" }, AFTER);
  assert.deepEqual([pago.kind, pago.situation, pago.hiringLocked], ["paid", "Assinatura em dia", false]);
  for (const billing of ["cancelado", "expired"]) assert.deepEqual([readPlanStatus({ billing, plan: "pro" }, AFTER).kind, readPlanStatus({ billing, plan: "pro" }, AFTER).situation], ["canceled", "Assinatura inativa"]);
  const atrasado = readPlanStatus({ billing: "atrasado", plan: "pro", fatura_aberta_url: "https://www.asaas.com/i/abc", pausa_em: "2026-12-10T03:00:00Z" }, AFTER);
  assert.deepEqual([atrasado.kind, atrasado.situation, atrasado.fatura?.url, atrasado.fatura?.pausaEm], ["late", "Pagamento pendente", "https://www.asaas.com/i/abc", "09/12/2026"]);
  const pausado = readPlanStatus({ billing: "atrasado", plan: "pro", acesso_pausado: true }, AFTER);
  assert.deepEqual([pausado.situation, pausado.fatura?.url], ["WhatsApp pausado", null]);
});

test("pedido: erro do backend vira português com o próximo passo, sem código técnico", () => {
  const casos: Array<[number, unknown]> = [[400, "invalid_request"], [502, "upstream_unreachable"], [504, "upstream_timeout"], [401, "no_session"], [0, undefined], [500, "missing_auth_secret"], [422, { x: 1 }]];
  for (const [status, detail] of casos) {
    const texto = orderErrorText(status, detail);
    assert.doesNotMatch(texto, /[a-z]+_[a-z]+/, `${status}: não pode vazar código como ${String(detail)}`);
    assert.match(texto, /tente|Entre de novo|Atualize/i, `${status}: precisa dizer o que fazer`);
  }
  assert.match(orderErrorText(401, "no_session"), /sessão expirou/);
  for (const status of [0, 500, 502, 504]) {
    assert.doesNotMatch(orderErrorText(status), /cobrad/i, "sem confirmação do pagamento, a tela não promete nada sobre cobrança");
  }
});

test("plano: cartão atual só do plan explícito; nenhum no teste, no encerrado ou inativo", () => {
  for (const plan of [null, undefined, "", "ouro"]) {
    const s = readPlanStatus({ billing: "pago", plan }, BEFORE);
    assert.equal(isShownCurrentPlan(s, "pro"), false, `plan=${String(plan)}`);
    assert.equal(isShownCurrentPlan(s, "essencial"), false);
  }
  assert.equal(isShownCurrentPlan(readPlanStatus({ billing: "pago", plan: "pro" }, BEFORE), "pro"), true);
  assert.equal(isShownCurrentPlan(readPlanStatus({ billing: "atrasado", plan: "essencial" }, BEFORE), "essencial"), true);
  for (const billing of ["pilot", "trial_expirado", "cancelado"]) {
    assert.equal(isShownCurrentPlan(readPlanStatus({ billing, plan: "pro" }, BEFORE), "pro"), false, billing);
  }
});
