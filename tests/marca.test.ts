import test from "node:test";
import assert from "node:assert/strict";
import {
  familiaValida,
  filtrarFontes,
  formatarTamanho,
  formatarWhatsapp,
  mensagemDaMarca,
  normalizarCorHex,
  projetarFontesGoogle,
  projetarMarca,
  rotuloFonte,
  urlFonteGoogle,
  valorFonte,
} from "../lib/marca.ts";

test("marca: projeta só o que a tela conhece; links só https e vitrine só do domínio", () => {
  const p = projetarMarca({
    ok: true,
    marca: {
      cadastrada: true,
      nome_loja: " Ateliê Coral ",
      whatsapp: "+55 (31) 99999-0000",
      cor_primaria: "0f6e6e",
      cor_destaque: "vermelho",
      fonte_titulo: "DM Serif Text",
      fonte_subtitulo: "arquivo:7",
      fonte_corpo: "Fonte<script>",
      fontes_enviadas: [
        { id: 7, valor: "arquivo:7", familia: "Bella Exclusiva", url: "https://blob.test/f.woff2", formato: "woff2" },
        { id: 8, familia: "Sem link", url: "javascript:alert(1)", formato: "woff2" },
      ],
      logo_url: "https://blob.test/logo.png",
      identidade: [{ id: 1, nome: "Manual.pdf", url: "https://blob.test/m.pdf", tipo: "application/pdf", tamanho: 2048 }, { id: 2, url: "http://inseguro" }],
      link_vitrine: "https://vitrine.milaai.com.br/atelie-coral",
      token: "segredo",
    },
    fonte_no_plano: true,
    armazenamento: true,
  });
  assert.equal(p.marca.nome_loja, "Ateliê Coral");
  assert.equal(p.marca.whatsapp, "5531999990000");
  assert.equal(p.marca.cor_primaria, "#0F6E6E");
  assert.equal(p.marca.cor_destaque, null);
  assert.deepEqual([p.marca.fonte_titulo, p.marca.fonte_subtitulo, p.marca.fonte_corpo], ["DM Serif Text", "arquivo:7", null]);
  assert.deepEqual(p.marca.fontes_enviadas.map((f) => f.familia), ["Bella Exclusiva"], "fonte sem link https não entra");
  assert.deepEqual(p.marca.identidade.map((a) => a.nome), ["Manual.pdf"]);
  assert.equal(p.fonteNoPlano, true);
  assert.equal(p.armazenamento, true);
  assert.equal("token" in p.marca, false);
  assert.equal(projetarMarca({ marca: { link_vitrine: "https://outro.site/x" } }).marca.link_vitrine, null);
  assert.equal(projetarMarca(null).marca.cadastrada, false);
});

test("marca: cor, fonte e nome de família com as regras do serviço", () => {
  assert.equal(normalizarCorHex("#b76e79"), "#B76E79");
  assert.equal(normalizarCorHex("FA0"), "#FFAA00");
  assert.equal(normalizarCorHex("rosé"), null);
  assert.equal(valorFonte("  Playfair   Display "), "Playfair Display");
  assert.equal(valorFonte("arquivo:12"), "arquivo:12");
  assert.equal(valorFonte("arquivo:x"), null);
  assert.equal(familiaValida("  Bella  Exclusiva "), "Bella Exclusiva");
  assert.equal(familiaValida("Fonte<script>"), null);
  assert.equal(urlFonteGoogle("DM Serif Text"), "https://fonts.googleapis.com/css2?family=DM+Serif+Text:wght@400;600;700&display=swap");
  assert.equal(urlFonteGoogle("x<y"), null);
});

test("marca: rótulo de fonte, busca e lista do Google Fonts", () => {
  const enviadas = [{ id: 7, valor: "arquivo:7", familia: "Bella Exclusiva", url: "https://blob.test/f.woff2", formato: "woff2" }];
  assert.equal(rotuloFonte(null, enviadas), "Padrão (Montserrat)");
  assert.equal(rotuloFonte("arquivo:7", enviadas), "Bella Exclusiva (sua fonte)");
  assert.equal(rotuloFonte("Lora", enviadas), "Lora");

  const fontes = projetarFontesGoogle({
    familyMetadataList: [
      { family: "Noto Sans Arabic", subsets: ["arabic"], popularity: 1, category: "Sans Serif" },
      { family: "Lora", subsets: ["latin"], popularity: 30, category: "Serif" },
      { family: "Playfair Display", subsets: ["latin"], popularity: 10, category: "Serif" },
      { family: "Explora", subsets: ["latin"], popularity: 900, category: "Handwriting" },
      { family: "Google Sans", subsets: ["latin"], popularity: 2, category: "Sans Serif", isBrandFont: true },
    ],
  });
  assert.deepEqual(fontes.map((f) => f.familia), ["Playfair Display", "Lora", "Explora"], "só latinas, por popularidade");
  assert.deepEqual(filtrarFontes(fontes, "lo").map((f) => f.familia), ["Lora", "Explora"], "começa com o termo primeiro, depois contém");
  assert.equal(filtrarFontes(fontes, "", 2).length, 2);
  assert.deepEqual(projetarFontesGoogle(null), []);
});

test("marca: textos para a lojista", () => {
  assert.equal(formatarWhatsapp("5531999990000"), "(31) 99999-0000");
  assert.equal(formatarTamanho(2048), "2 KB");
  assert.equal(formatarTamanho(1.5 * 1024 * 1024), "1,5 MB");
  assert.match(mensagemDaMarca("store_name_required"), /nome da loja/);
  assert.match(mensagemDaMarca("invalid_field", "cor_destaque"), /cor de destaque.*#B76E79/);
  assert.match(mensagemDaMarca("invalid_field", "fonte_corpo"), /fonte do corpo/);
  assert.match(mensagemDaMarca("invalid_file_type", "fonte"), /WOFF2/);
  assert.match(mensagemDaMarca("too_many_files", "fonte"), /6 fontes/);
  assert.match(mensagemDaMarca("plan_pro_required", "fonte_titulo"), /Plano Pro/);
  assert.match(mensagemDaMarca(undefined), /Tente de novo/);
});

test("vitrine: carrega as fontes de cada papel; fonte enviada vira @font-face; Montserrat é a reserva", async () => {
  const { fontesDaVitrine } = await import("../lib/marca.ts");
  const padrao = fontesDaVitrine({});
  assert.deepEqual(padrao.links, ["https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"]);
  assert.match(padrao.titulo, /^"Montserrat"/);
  assert.equal(padrao.fontFace, "");

  const f = fontesDaVitrine({
    tipografiaHeading: "Bella Exclusiva",
    tipografiaSubtitulo: "DM Serif Text",
    tipografiaBody: "Lora",
    fontesEnviadas: [
      { familia: "Bella Exclusiva", url: "https://blob.test/bella.woff2", formato: "woff2" },
      { familia: "Nao Usada", url: "https://blob.test/x.ttf", formato: "ttf" },
      { familia: "Ruim", url: "https://blob.test/a) ;}body{x", formato: "woff2" },
    ],
  });
  assert.match(f.titulo, /^"Bella Exclusiva", "Montserrat"/);
  assert.match(f.subtitulo, /^"DM Serif Text"/);
  assert.match(f.corpo, /^"Lora"/);
  assert.equal(f.fontFace, '@font-face{font-family:"Bella Exclusiva";src:url("https://blob.test/bella.woff2") format("woff2");font-display:swap}', "só a fonte enviada em uso, com link seguro");
  assert.equal(f.links.some((l) => l.includes("Bella")), false, "fonte enviada não vai ao Google Fonts");
  assert.ok(f.links.some((l) => l.includes("DM+Serif+Text")) && f.links.some((l) => l.includes("Lora")));
  assert.match(fontesDaVitrine({ tipografiaHeading: "x</style><script>" }).titulo, /^"Montserrat"/, "nome inválido cai na reserva");
});
