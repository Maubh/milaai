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
      assert.ok(change.title.trim() && change.description.trim());
    }
  }
});
