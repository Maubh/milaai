import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("chave de integração: switch real, ligado só pelo vault, sem otimismo", () => {
  const chave = read("../components/IntegrationSwitch.tsx");
  assert.match(chave, /role="switch"/);
  assert.match(chave, /aria-checked=\{checked\}/);
  // Ligar só navega para o fluxo real; a chave continua desligada.
  assert.match(chave, /checked=\{false\}/);
  assert.match(chave, /router\.push\(`\/integrations\/\$\{provider\}`\)/);
  const desligar = read("../components/DisconnectButton.tsx");
  assert.match(desligar, /<IntegrationSwitch\s+checked\b/);
  assert.match(desligar, /\/api\/oauth\/\$\{provider\}\/revoke/);
  assert.match(desligar, /router\.refresh\(\)/);
});

test("chave de integração: só nas linhas conectadas ou disponíveis; Pro e desconhecido sem chave", () => {
  const page = read("../app/workspace/integracoes/page.tsx");
  assert.match(page, /row\.state === "connected" \? \(\s*<DisconnectButton/);
  // Pedido da lojista: sem "Reconectar" genérico em linha conectada saudável.
  assert.doesNotMatch(page, /Reconectar/);
  // Reautorizar só no contexto em que a Meta negou o acesso.
  const meta = read("../components/MetaCatalogManager.tsx");
  assert.match(meta, /\{semPermissao \|\| recusado \? \(\s*<a href="\/integrations\/meta"[^>]*>Reautorizar acesso à Meta<\/a>/);
  assert.match(page, /row\.state === "locked" \? \(\s*<Link href="\/workspace\/plano"[^>]*>\s*Assinar plano Pro/);
  assert.match(page, /row\.state === "available" \? \(\s*<ConnectSwitch/);
});
