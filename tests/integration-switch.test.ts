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
  // Confirmação em diálogo nativo, com Cancelar como foco inicial; a chave só muda depois do revoke.
  assert.match(desligar, /<dialog\b/);
  assert.match(desligar, /showModal\(\)/);
  assert.match(desligar, /autoFocus>\s*Cancelar/);
  assert.doesNotMatch(desligar, /disconnect-confirm/);
});

test("chave de integração: só nas linhas conectadas ou disponíveis; Pro e desconhecido sem chave", () => {
  const page = read("../app/workspace/integracoes/page.tsx");
  assert.match(page, /row\.state === "connected" \? \(\s*<DisconnectButton/);
  // Pedido da lojista: sem "Reconectar" genérico em linha conectada saudável.
  assert.doesNotMatch(page, /Reconectar/);
  // Reautorizar só no contexto em que a Meta negou o acesso.
  const meta = read("../components/MetaCatalogManager.tsx");
  assert.match(meta, /\{semPermissao \? \(\s*<a href="\/integrations\/meta"[^>]*>Reautorizar acesso à Meta<\/a>/);
  assert.doesNotMatch(meta, /status === 403/);
  assert.match(page, /row\.state === "locked" \? \(\s*<Link href="\/workspace\/plano"[^>]*>\s*Assinar plano Pro/);
  assert.match(page, /row\.state === "available" \? \(\s*<ConnectSwitch/);
});

test("cadeado só no Pro bloqueado pelo plano, com texto acessível e sem duplicar o selo", () => {
  const page = read("../app/workspace/integracoes/page.tsx");
  assert.match(page, /tier=\{row\.requiresPro \? \(row\.state === "locked" \? <ProBloqueado \/> : "Pro"\) : null\}/);
  assert.doesNotMatch(page, /Exige Pro/);
  const cadeado = read("../components/PlanLock.tsx");
  assert.match(cadeado, /aria-hidden="true"/);
  assert.match(cadeado, /Pro<span className="sr-only">, bloqueado no seu plano<\/span>/);
  const dados = read("../app/workspace/dados-loja/DadosLojaView.tsx");
  assert.equal(dados.match(/<ProBloqueado \/>/g)?.length, 1);
  assert.match(dados, /conc\.acesso === "bloqueado" \?[\s\S]*?<span className="dados-selo-pro"><ProBloqueado \/><\/span>/);
});

test("catálogo da Meta: Configurar é ação secundária com moldura, junto de Sincronizar", () => {
  const meta = read("../components/MetaCatalogManager.tsx");
  const css = read("../components/meta-catalog.css");
  const acoes = meta.slice(meta.indexOf('className="meta-catalog-summary-actions"'), meta.indexOf("Sincronizar\"}"));
  assert.match(acoes, /className="ledger-button meta-catalog-configure"[\s\S]*aria-expanded=\{configAberta\}[\s\S]*Configurar/);
  assert.doesNotMatch(acoes, /ledger-button-quiet/);
  assert.match(acoes, /ledger-button ledger-button-primary meta-catalog-sync/);
  // Barra única, mesma altura: grade, não flex com quebra distribuída.
  assert.match(css, /\.meta-catalog-summary-actions \{ display: grid;[^}]*align-items: stretch;/);
});
