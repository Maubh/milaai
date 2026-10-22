import test from "node:test";
import assert from "node:assert/strict";
import { vitrineExpirada } from "../lib/vitrine.ts";

test("vitrine expirada: leva só os campos públicos da loja", () => {
  const r = vitrineExpirada({
    ok: false,
    error: "showcase_expired",
    tituloColecao: "Outono",
    loja: {
      nomeExibicao: "Ritrovarsi",
      whatsappContato: "+55 31 99999-0000",
      corPrimaria: "#123456",
      logoUrl: "https://exemplo.test/logo.png",
      custo: 10,
    },
  });
  assert.deepEqual(r, {
    tipo: "expirada",
    loja: {
      nomeExibicao: "Ritrovarsi",
      whatsappContato: "+55 31 99999-0000",
      corPrimaria: "#123456",
      logoUrl: "https://exemplo.test/logo.png",
    },
    tituloColecao: "Outono",
  });
});

test("vitrine expirada: sem loja no corpo, a página ainda abre sem botão", () => {
  assert.deepEqual(vitrineExpirada({}), {
    tipo: "expirada",
    loja: { nomeExibicao: null, whatsappContato: null, corPrimaria: null, logoUrl: null },
    tituloColecao: null,
  });
});

test("vitrine expirada: logo fora de https não é usado", () => {
  assert.equal(vitrineExpirada({ loja: { logoUrl: "javascript:alert(1)" } }).tipo, "expirada");
  assert.equal((vitrineExpirada({ loja: { logoUrl: "http://x.test/a.png" } }) as any).loja.logoUrl, null);
});
