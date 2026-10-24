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
  assert.equal(hasUnreadRelease(`${major}.${minor}.10`), patch >= 10);
});

test("nas notas, tipo acima do plano e um só selo de plano", async () => {
  const { readFileSync } = await import("node:fs");
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  const css = read("../components/release-updates.css");
  assert.match(css, /\.release-change-tags \{[^}]*flex-direction: column;/);
  assert.doesNotMatch(css, /release-change-plan/);
  const timeline = read("../components/ReleaseTimeline.tsx");
  assert.match(timeline, /release-change-type[\s\S]*<PlanTag>/);
  const tag = read("../components/plan-tag.css");
  assert.doesNotMatch(tag, /data-plan|\[data-/, "Plano Pro e Essencial e Pro com o mesmo estilo");
});
