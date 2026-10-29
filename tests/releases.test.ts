import test from "node:test";
import assert from "node:assert/strict";
import { RELEASES, SYSTEM_VERSION } from "../lib/releases.ts";

test("the displayed version has release notes as the newest entry", () => {
  assert.ok(RELEASES.length > 0);
  assert.equal(RELEASES[0].version, SYSTEM_VERSION, "Update release notes together with package.json before publishing");
});

test("release history has unique versions, valid dates and customer-facing changes", () => {
  assert.equal(new Set(RELEASES.map((release) => release.version)).size, RELEASES.length);
  for (const release of RELEASES) {
    assert.match(release.version, /^\d+\.\d+\.\d+$/);
    assert.match(release.date, /^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(`${release.date}T12:00:00Z`);
    assert.equal(date.toISOString().slice(0, 10), release.date);
    assert.ok(release.title.trim() && release.summary.trim());
    assert.ok(release.changes.length > 0);
    for (const change of release.changes) {
      assert.ok(["new", "improvement", "fix"].includes(change.type));
      assert.ok(["all", "pro"].includes(change.plan), `${change.title}: diga se vale para os dois planos ou só para o Pro`);
      assert.ok(change.title.trim() && change.description.trim());
    }
  }
});

test("só versões públicas chegam à lojista; acabamento fica no histórico técnico", async () => {
  const { PUBLIC_RELEASES, LATEST_PUBLIC } = await import("../lib/releases.ts");
  assert.ok(PUBLIC_RELEASES.length > 0 && LATEST_PUBLIC);
  assert.equal(LATEST_PUBLIC, PUBLIC_RELEASES[0]);
  assert.ok(PUBLIC_RELEASES.every((release) => !release.internal));
  assert.deepEqual(PUBLIC_RELEASES, RELEASES.filter((release) => !release.internal));
  // 0.5.1 (botões do diálogo) e 0.5.2 (tags e layout) são acabamento.
  assert.ok(RELEASES.find((release) => release.version === "0.5.1")?.internal);
  assert.ok(RELEASES.find((release) => release.version === "0.5.2")?.internal);
  // Página, sino e visão geral leem só a lista pública; nenhum consumidor usa RELEASES direto.
  const { readFileSync } = await import("node:fs");
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  for (const path of ["../app/workspace/novidades/UpdatesView.tsx", "../components/UpdatesBell.tsx", "../app/workspace/(visao-geral)/OverviewView.tsx", "../components/ReleaseLink.tsx", "../components/ReleaseTimeline.tsx"]) {
    assert.doesNotMatch(read(path), /\bRELEASES\b/, `${path} deve ler PUBLIC_RELEASES/LATEST_PUBLIC`);
  }
  assert.match(read("../components/ReleaseLink.tsx"), /hasUnreadRelease\(localStorage\.getItem/);
});

test("Trello: ajustes de logo e planos ficam internos, integração continua anunciada", async () => {
  const { PUBLIC_RELEASES } = await import("../lib/releases.ts");
  const cosmetic = RELEASES.find((release) => release.version === "0.6.20");
  const integration = RELEASES.find((release) => release.version === "0.6.19");
  assert.ok(cosmetic?.internal);
  assert.ok(!PUBLIC_RELEASES.some((release) => release.version === "0.6.20"));
  assert.ok(integration && !integration.internal);
  assert.ok(PUBLIC_RELEASES.includes(integration));
});

test("Trello: listas e renovação são públicas nos dois planos, sem anunciar acabamento", async () => {
  const { PUBLIC_RELEASES } = await import("../lib/releases.ts");
  const release = PUBLIC_RELEASES.find((entry) => entry.version === "0.6.24");
  assert.ok(release, "a melhoria do Trello precisa chegar às Atualizações");
  assert.ok(release.changes.every((change) => change.plan === "all"));
  assert.ok(release.changes.every((change) => ["new", "improvement"].includes(change.type)));
  const copy = [release.title, release.summary, ...release.changes.flatMap((change) => [change.title, change.description])].join(" ");
  assert.match(copy, /Trello/);
  assert.match(copy, /tarefas/i);
  assert.match(copy, /criar listas \(colunas\)/i);
  assert.match(copy, /criar ou mover cards/i);
  assert.match(copy, /WhatsApp/);
  assert.match(copy, /renova o acesso automaticamente/i);
  assert.match(copy, /autorização for revogada ou o prazo de renovação acabar/i);
  assert.doesNotMatch(copy, /nunca.{0,40}reconect|\blogos?\b|\bUI\b|marquee|acabamento|alinhamento|espaçamento/i);
});

test("não lido compara versões: deploy de acabamento não acende o aviso", async () => {
  const { hasUnreadRelease, LATEST_PUBLIC } = await import("../lib/releases.ts");
  const latest = LATEST_PUBLIC!.version;
  const [major, minor, patch] = latest.split(".").map(Number);
  assert.equal(hasUnreadRelease(null), true);
  assert.equal(hasUnreadRelease("lixo"), true);
  assert.equal(hasUnreadRelease(`${major}.${minor - 1 < 0 ? 0 : minor - 1}.9`), minor > 0);
  assert.equal(hasUnreadRelease(latest), false);
  // Quem já viu uma versão interna mais nova não ganha aviso falso.
  assert.equal(hasUnreadRelease(SYSTEM_VERSION), false);
  assert.equal(hasUnreadRelease(`${major}.${minor}.${patch + 1}`), false);
  assert.equal(hasUnreadRelease(`${major}.${minor}.10`), patch > 10);
});
