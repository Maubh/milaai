import test from "node:test";
import assert from "node:assert/strict";
import { formatTrialEnd, formatTrialEndShort, isShownCurrentPlan, orderErrorText, readPlanStatus } from "../lib/plan-status.ts";

const BEFORE = new Date("2026-10-23T12:00:00Z");
const AFTER = new Date("2026-12-01T12:00:00Z");

test("plano: data do teste válida vem da sessão, em horário de Brasília", () => {
  const com = readPlanStatus({ plan: "pro", billing: "pilot", trial_ends_at: "2026-11-10T15:00:00Z" }, BEFORE);
  assert.equal(com.kind, "trial");
  assert.equal(com.trialEnd?.toISOString(), "2026-11-10T15:00:00.000Z");
  assert.equal(formatTrialEnd(com.trialEnd!), "10/11/2026 às 12:00");
  assert.equal(formatTrialEndShort(com.trialEnd!), "10/11");
});

test("plano: data ausente ou inválida nunca vira dado na tela", () => {
  for (const trial_ends_at of [null, undefined, "", "amanhã", "2026-13-45"]) {
    const s = readPlanStatus({ plan: "pro", billing: "pilot", trial_ends_at }, BEFORE);
    assert.equal(s.trialEnd, null, `trial_ends_at=${String(trial_ends_at)}: referência do piloto não pode aparecer como data`);
    assert.equal(s.kind, "trial");
  }
});

test("plano: sem data, a regra comercial continua a do piloto", () => {
  assert.equal(readPlanStatus({ billing: "pilot", trial_ends_at: null }, BEFORE).hiringLocked, true);
  const depois = readPlanStatus({ billing: "pilot", trial_ends_at: null }, AFTER);
  assert.equal(depois.kind, "trial_ended");
  assert.equal(depois.hiringLocked, false);
  // Data válida no futuro mantém o teste aberto mesmo depois da referência.
  const estendido = readPlanStatus({ billing: "pilot", trial_ends_at: "2027-01-10T12:00:00Z" }, AFTER);
  assert.deepEqual([estendido.kind, estendido.hiringLocked], ["trial", true]);
});

test("plano: essencial em pilot aparece como Essencial em teste, sem promover para Pro", () => {
  const s = readPlanStatus({ plan: "essencial", billing: "pilot", trial_ends_at: null }, BEFORE);
  assert.equal(s.title, "Plano Essencial", "o nome do plano não carrega a condição comercial");
  assert.equal(s.currentPlan, "essencial", "título e marcador saem do plan da sessão");
  assert.deepEqual([s.kind, s.situation, s.hiringLocked], ["trial", "Em teste, sem cobrança", true]);
  assert.equal(readPlanStatus({ plan: "pro", billing: "pilot" }, BEFORE).title, "Plano Pro");
});

test("plano: nenhum título carrega sufixo de situação", () => {
  for (const session of [{ billing: "pilot", plan: "pro" }, { billing: "comped", plan: "essencial" }, { billing: "pago", plan: "pro" }, { billing: "trial_expirado", plan: "pro" }]) {
    assert.match(readPlanStatus(session, BEFORE).title, /^Plano (Essencial|Pro)$/);
  }
});

test("plano: sem plan na sessão o nome não é deduzido", () => {
  assert.equal(readPlanStatus({ billing: "pilot" }, BEFORE).title, "Plano não informado");
});

test("plano: founder, comped, pago e trial_expirado", () => {
  const founder = readPlanStatus({ role: "founder", billing: "pilot", plan: "essencial" }, AFTER);
  assert.deepEqual([founder.kind, founder.title, founder.situation, founder.hiringLocked], ["founder", "Plano Essencial", "Cortesia, sem cobrança", true]);
  const comped = readPlanStatus({ billing: "comped", plan: "pro" }, AFTER);
  assert.deepEqual([comped.kind, comped.title, comped.hiringLocked], ["founder", "Plano Pro", true]);
  const pago = readPlanStatus({ billing: "pago", plan: "essencial" }, AFTER);
  assert.deepEqual([pago.kind, pago.currentPlan, pago.hiringLocked, pago.title, pago.situation], ["paid", "essencial", false, "Plano Essencial", "Assinatura em dia"]);
  const expirado = readPlanStatus({ billing: "trial_expirado", plan: "essencial", trial_ends_at: "2026-10-01T12:00:00Z" }, BEFORE);
  assert.deepEqual([expirado.kind, expirado.title, expirado.hiringLocked, expirado.situation], ["trial_ended", "Plano Essencial", false, "Teste encerrado"]);
  assert.equal(expirado.trialEnd?.toISOString(), "2026-10-01T12:00:00.000Z");
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

test("plano: sem plan na sessão nenhum cartão vira \"seu plano\"; a regra interna fica igual", () => {
  for (const plan of [null, undefined, "", "ouro"]) {
    const s = readPlanStatus({ billing: "pilot", plan }, BEFORE);
    assert.equal(s.informedPlan, null);
    assert.equal(s.currentPlan, "pro", "a regra de contratação continua com o fallback");
    assert.equal(s.hiringLocked, true);
    assert.equal(isShownCurrentPlan(s, "pro"), false, `plan=${String(plan)}: Pro não pode aparecer como atual`);
    assert.equal(isShownCurrentPlan(s, "essencial"), false);
  }
});

test("plano: o cartão atual só sai do plan explícito e some no teste encerrado", () => {
  const essencial = readPlanStatus({ billing: "pilot", plan: "essencial" }, BEFORE);
  assert.equal(isShownCurrentPlan(essencial, "essencial"), true);
  assert.equal(isShownCurrentPlan(essencial, "pro"), false);
  assert.equal(isShownCurrentPlan(readPlanStatus({ billing: "pago", plan: "pro" }, BEFORE), "pro"), true);
  const encerrado = readPlanStatus({ billing: "trial_expirado", plan: "pro" }, BEFORE);
  assert.equal(isShownCurrentPlan(encerrado, "pro"), false);
  assert.equal(isShownCurrentPlan(encerrado, "essencial"), false);
});
