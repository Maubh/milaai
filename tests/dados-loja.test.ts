import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  contaDoInstagram,
  formatarMarkup,
  formatarPercentual,
  formatarReais,
  lerNumeroDigitado,
  lojaSemDados,
  mensagemDeCarga,
  mensagemDeErro,
  normalizarSiteDaLoja,
  projetarConcorrentes,
  projetarDadosLoja,
  siteParaTela,
} from "../lib/dados-loja.ts";

test("dados da loja: projeta só os campos conhecidos, com o tipo certo", () => {
  const d = projetarDadosLoja({
    nome_loja: " Irali semijoias ",
    taxa_cartao_percent: 17,
    custo_embalagem: 13,
    markup_padrao: null,
    tipo_banho: "",
    token: "segredo",
    observacoes: 5,
  });
  assert.deepEqual(d, {
    nome_loja: "Irali semijoias",
    instagram: null,
    site_loja: null,
    custo_embalagem: 13,
    taxa_cartao_percent: 17,
    markup_padrao: null,
    tipo_banho: null,
    observacoes: null,
  });
  assert.equal("token" in d, false, "campo desconhecido nunca chega à tela");
  assert.equal(projetarDadosLoja(null).nome_loja, null);
});

test("dados da loja: número digitado aceita vírgula, R$, % e x", () => {
  assert.equal(lerNumeroDigitado("3,99"), 3.99);
  assert.equal(lerNumeroDigitado("R$ 6,00"), 6);
  assert.equal(lerNumeroDigitado("17%"), 17);
  assert.equal(lerNumeroDigitado("3x"), 3);
  assert.equal(lerNumeroDigitado("1.234,56"), 1234.56);
  assert.equal(lerNumeroDigitado("3.5"), 3.5);
  assert.equal(lerNumeroDigitado(""), null);
  assert.equal(lerNumeroDigitado("três"), null);
  assert.equal(lerNumeroDigitado("-2"), null);
});

test("dados da loja: formata em reais, % e x; vazio continua vazio", () => {
  assert.equal(formatarReais(13)?.replace(/\s/g, " "), "R$ 13,00");
  assert.equal(formatarPercentual(3.99), "3,99%");
  assert.equal(formatarMarkup(3), "3x");
  assert.equal(formatarPercentual(null), null);
});

test("dados da loja: @ do Instagram e lista de concorrentes", () => {
  assert.equal(contaDoInstagram("@Occhio.Blu"), "occhio.blu");
  assert.equal(contaDoInstagram("https://www.instagram.com/loja_x/?hl=pt"), "loja_x");
  assert.equal(contaDoInstagram("loja com espaço"), null);
  assert.deepEqual(projetarConcorrentes(["A", "a", "b", "c", "d", 5, "x y"]), ["a", "b", "c"]);
  assert.deepEqual(projetarConcorrentes("a"), []);
});

test("dados da loja: mensagem de erro nomeia o campo e o limite", () => {
  assert.match(mensagemDeErro("invalid_field", "taxa_cartao_percent"), /taxa usada no preço.*entre 0% e 20%/);
  assert.match(mensagemDeErro("no_session"), /sessão expirou/);
  assert.match(mensagemDeErro("qualquer"), /Tente de novo/);
});

test("dados da loja: página no menu e rotas sem repassar a resposta crua do serviço", () => {
  const shell = readFileSync(new URL("../components/WorkspaceShell.tsx", import.meta.url), "utf8");
  assert.match(shell, /href: "\/workspace\/dados-loja", label: "Dados da loja"/);
  for (const rota of ["../app/api/dados-loja/route.ts", "../app/api/concorrentes/route.ts"]) {
    const src = readFileSync(new URL(rota, import.meta.url), "utf8");
    assert.match(src, /requireSameOrigin/, `${rota}: POST precisa da guarda de mesma origem`);
    assert.doesNotMatch(src, /NextResponse\.json\(data/, `${rota}: não repassa o corpo do serviço sem projeção`);
  }
});

test("dados da loja: erro de carga não fala em salvar; loja sem nenhum dado é detectada", () => {
  assert.doesNotMatch(mensagemDeCarga("upstream_timeout"), /salvar/);
  assert.match(mensagemDeCarga("no_session"), /sessão expirou/);
  const vazio = projetarDadosLoja({});
  assert.equal(lojaSemDados(vazio, []), true);
  assert.equal(lojaSemDados(vazio, ["loja_x"]), false, "concorrente salvo já não é loja vazia");
  assert.equal(lojaSemDados({ ...vazio, taxa_cartao_percent: 17 }, []), false);
});

test("dados da loja: no Essencial a seção de concorrentes fica bloqueada com o selo Pro", () => {
  // Proposta A: a tela mora em DadosLojaView (compartilhada com o esqueleto da rota),
  // o bloqueio só vale com `analise_no_plano === false` explícito e o CTA é o mesmo
  // das integrações bloqueadas ("Assinar plano Pro").
  const src = readFileSync(new URL("../app/workspace/dados-loja/DadosLojaView.tsx", import.meta.url), "utf8");
  assert.match(src, /conc\.acesso === "bloqueado" \? \(/);
  assert.match(src, /dados-selo-pro"><ProBloqueado \/></);
  assert.match(src, /href="\/workspace\/plano"[^>]*>Assinar plano Pro </);
  assert.match(mensagemDeErro("plan_pro_required"), /Plano Pro/);
});

test("dados da loja: site aceita domínio sem esquema e só vira link se for http(s)", () => {
  assert.equal(normalizarSiteDaLoja("sualoja.com.br"), "https://sualoja.com.br");
  assert.equal(normalizarSiteDaLoja(" WWW.SuaLoja.com.br/ "), "https://www.sualoja.com.br");
  assert.equal(normalizarSiteDaLoja("http://sualoja.com.br/colecao"), "http://sualoja.com.br/colecao");
  for (const ruim of ["sualoja", "sua loja.com.br", "javascript:alert(1)", "ftp://sualoja.com.br", "https://localhost", "https://a:b@sualoja.com.br"]) {
    assert.equal(normalizarSiteDaLoja(ruim), null, ruim);
  }
  assert.equal(projetarDadosLoja({ site_loja: "https://sualoja.com.br" }).site_loja, "https://sualoja.com.br");
  assert.equal(projetarDadosLoja({ site_loja: "javascript:alert(1)" }).site_loja, null, "o que não é site nunca vira link");
  assert.equal(projetarDadosLoja({}).site_loja, null, "serviço sem o campo: não informado");
  assert.equal(siteParaTela("https://www.sualoja.com.br/colecao"), "www.sualoja.com.br/colecao");
  assert.match(mensagemDeErro("invalid_field", "site_loja"), /site da loja.*sualoja\.com\.br/);
});
