import test from "node:test";
import assert from "node:assert/strict";
import { formatarWhatsapp, mensagemDaMarca, normalizarCorHex, projetarMarca } from "../lib/marca-vitrine.ts";

test("marca: projeta só o que a tela conhece; link só do domínio da vitrine", () => {
  const p = projetarMarca({
    ok: true,
    marca: {
      cadastrada: true,
      nome_exibicao: " Ateliê Coral ",
      whatsapp: "+55 (31) 99999-0000",
      cor_primaria: "0f6e6e",
      cor_destaque: "vermelho",
      fonte: "Montserrat",
      link_vitrine: "https://vitrine.milaai.com.br/atelie-coral",
      token: "segredo",
    },
    fontes: ["Montserrat", 3, "Inter"],
    fonte_no_plano: true,
  });
  assert.deepEqual(p.marca, {
    cadastrada: true,
    nome_exibicao: "Ateliê Coral",
    whatsapp: "5531999990000",
    cor_primaria: "#0F6E6E",
    cor_destaque: null,
    fonte: "Montserrat",
    link_vitrine: "https://vitrine.milaai.com.br/atelie-coral",
  });
  assert.deepEqual(p.fontes, ["Montserrat", "Inter"]);
  assert.equal(p.fonteNoPlano, true);
  assert.equal(projetarMarca({ marca: { link_vitrine: "https://outro.site/x" } }).marca.link_vitrine, null);
  assert.equal(projetarMarca(null).marca.cadastrada, false);
});

test("marca: cor no formato do serviço e WhatsApp legível", () => {
  assert.equal(normalizarCorHex("#b76e79"), "#B76E79");
  assert.equal(normalizarCorHex("FA0"), "#FFAA00");
  assert.equal(normalizarCorHex("rosé"), null);
  assert.equal(formatarWhatsapp("5531999990000"), "(31) 99999-0000");
  assert.equal(formatarWhatsapp("3133334444"), "(31) 3333-4444");
  assert.equal(formatarWhatsapp(null), null);
});

test("marca: mensagens dizem o campo e o que fazer", () => {
  assert.match(mensagemDaMarca("first_setup_requires", "whatsapp"), /WhatsApp que recebe os pedidos/);
  assert.match(mensagemDaMarca("invalid_field", "cor_destaque"), /cor de destaque.*#B76E79/);
  assert.match(mensagemDaMarca("plan_pro_required", "fonte"), /Plano Pro/);
  assert.match(mensagemDaMarca(undefined), /Tente de novo/);
});
