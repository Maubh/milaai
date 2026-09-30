/**
 * A política e os termos não podem afirmar o que o produto não faz.
 *
 * ── Furos medidos em 2026-09-30 (antes deste guard) ─────────────────────────
 *   1. `privacy@milaai.com.br` em 4 lugares — endereço que não existe. O canal
 *      real é `contato@milaai.com.br`.
 *   2. "Provedor de modelo de IA (LLM) — a definir" — FALSO. Já em produção:
 *      Google (`ag/gemini-3.8-flash`) para visão, TypeSafe/Jev para
 *      classificação, e fallback de texto para Alibaba/Zhipu
 *      (`ocg/qwen3.8-flash`, `ocg/glm-5.3-flash`).
 *   3. Prometia Olist e Bling como conectores e OMITIA o Google — o Google é
 *      justamente quem processa imagem e texto, e exige divulgação nominal.
 *   4. Retenção ("90 dias" de chat, "180 dias" de NF-e) sem rotina de expurgo:
 *      promessa publicada sem lastro.
 *
 * ── Desenho ─────────────────────────────────────────────────────────────────
 * `lib/legal.ts` é a fonte única. Este guard verifica três coisas:
 *   A. a página IMPORTA a fonte (não duplica texto à mão);
 *   B. fatos sensíveis não reaparecem no texto renderizado (e-mail inexistente,
 *      "a definir", conectores não prontos prometidos, rastreador de marketing);
 *   C. o produto NÃO passou a fazer o que a política nega (rastreadores no site,
 *      acesso a Gmail/Agenda).
 *
 * Diferente do guard do Google, aqui a varredura é sobre o TEXTO FINAL das
 * páginas — não sobre o fonte — porque o risco é o que o usuário lê.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;

function ler(caminho: string): string {
  return readFileSync(join(RAIZ, caminho), "utf8");
}

/** Remove comentários e o conteúdo de `{/* ... *}/` antes de varrer. */
function semComentarios(fonte: string): string {
  let saida = "";
  let i = 0;
  while (i < fonte.length) {
    const dois = fonte.slice(i, i + 2);
    if (dois === "/*") {
      const fim = fonte.indexOf("*/", i + 2);
      i = fim === -1 ? fonte.length : fim + 2;
      continue;
    }
    if (dois === "//") {
      const fim = fonte.indexOf("\n", i);
      i = fim === -1 ? fonte.length : fim;
      continue;
    }
    saida += fonte[i];
    i += 1;
  }
  return saida;
}

const PAGINAS = [
  "app/(site)/privacidade/page.tsx",
  "app/(site)/termos/page.tsx",
] as const;

const FONTE = "lib/legal.ts";

// ─────────────────────────────────────────── A. a página usa a fonte única

test("legal: as páginas importam a fonte única (não digitam o texto à mão)", () => {
  for (const p of PAGINAS) {
    const src = ler(p);
    assert.match(
      src,
      /from\s+["']@\/lib\/legal["']/,
      `${p} deve importar de @/lib/legal`,
    );
  }
});

test("legal: a fonte única é importada de verdade, não citada em comentário", () => {
  for (const p of PAGINAS) {
    const usavel = semComentarios(ler(p));
    assert.match(
      usavel,
      /from\s+["']@\/lib\/legal["']/,
      `${p}: import só em comentário não conta`,
    );
  }
});

// ─────────────────────────────────────────── B. fatos sensíveis

test("legal: nenhuma página publica o e-mail inexistente privacy@", () => {
  const ofensores: string[] = [];
  for (const p of PAGINAS) {
    const texto = ler(p);
    if (/privacy@/.test(texto)) ofensores.push(p);
  }
  // A própria lib pode mencionar no comentário histórico; o que não pode é
  // o endereço ser EXPORTADO como contato.
  assert.deepEqual(ofensores, [], `privacy@ reapareceu em: ${ofensores.join(", ")}`);
  assert.match(
    ler(FONTE),
    /CONTATO_PRIVACIDADE\s*=\s*"contato@milaai\.com\.br"/,
    "o canal de privacidade tem de ser contato@milaai.com.br",
  );
});

test("legal: o endereço renderizado é sempre o contato@", () => {
  for (const p of PAGINAS) {
    const src = semComentarios(ler(p));
    // O e-mail pode aparecer como literal (mailto) ou vindo da constante; o que
    // não pode é haver QUALQUER literal de e-mail diferente do oficial.
    const emails = [...src.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map((m) => m[0]);
    const estranhos = emails.filter((e) => e !== "contato@milaai.com.br");
    assert.deepEqual(estranhos, [], `${p} publica e-mail fora do oficial: ${estranhos}`);
    assert.match(
      src,
      /CONTATO_PRIVACIDADE/,
      `${p} deve usar CONTATO_PRIVACIDADE em vez de digitar o endereço`,
    );
  }
});

test("legal: não existe mais 'provedor de IA a definir' — os reais estão nomeados", () => {
  for (const p of PAGINAS) {
    const src = semComentarios(ler(p));
    assert.doesNotMatch(
      src,
      /a\s+definir/i,
      `${p} ainda diz "a definir" para o provedor de IA`,
    );
    assert.doesNotMatch(
      src,
      /ainda\s+ser[aá]\s+escolhid/i,
      `${p} ainda promete escolher o provedor depois`,
    );
  }
  const fonte = ler(FONTE);
  for (const provedor of ["Google", "TypeSafe", "Serper"]) {
    assert.match(fonte, new RegExp(provedor), `subprocessador ${provedor} ausente`);
  }
});

test("legal: o Google é divulgado como subprocessador (exigência do Google)", () => {
  const fonte = ler(FONTE);
  assert.match(
    fonte,
    /nome:\s*"Google"/,
    "o Google precisa aparecer NOMINALMENTE como subprocessador",
  );
  // O Google exige que se diga COMO o dado dele é acessado, usado e guardado.
  assert.match(
    fonte,
    /drive\.file/,
    "é preciso declarar o escopo real do acesso ao Google (drive.file)",
  );
  assert.match(
    fonte,
    /não acessa o restante do Drive|nao acessa o restante do Drive/,
    "é preciso declarar o limite do acesso ao Drive",
  );
});

test("legal: conectores não prontos não são prometidos como disponíveis", () => {
  const fonte = ler(FONTE);
  // Olist e Bling: tela existe, app não. Medido: app_credentials false/false.
  for (const nome of ["Olist", "Bling"]) {
    assert.match(fonte, new RegExp(`"${nome}"`), `${nome} deve estar na lista de não prontos`);
  }
  assert.match(
    fonte,
    /CONECTORES_NAO_PRONTOs/,
    "a lista de não prontos deve ser exportada",
  );
  // A promoção ao Pro anunciava "Integração direta Jueri, Bling e Olist".
  const pricing = ler("components/PricingSection.tsx");
  const linha = pricing
    .split("\n")
    .filter((l) => /Bling|Olist/i.test(l) && !/^\s*(\/\/|\*)/.test(l));
  for (const l of linha) {
    assert.match(
      l,
      /ainda não|em breve|não dispon|nao dispon|preparando/i,
      `PricingSection promete conector não pronto sem ressalva: ${l.trim()}`,
    );
  }
});

test("legal: a retenção não promete expurgo automático que não existe", () => {
  const fonte = ler(FONTE);
  assert.match(
    fonte,
    /EXPURGO_AUTOMATICO_ATIVO\s*=\s*false/,
    "enquanto não houver rotina de expurgo, a constante tem de ser false",
  );
  assert.match(
    fonte,
    /Não há rotina automática ainda/,
    "cada prazo precisa dizer que o expurgo é sob pedido",
  );
  // E a página tem de renderizar a ressalva (não basta estar na lib).
  const priv = semComentarios(ler("app/(site)/privacidade/page.tsx"));
  assert.match(
    priv,
    /EXPURGO_AUTOMATICO_ATIVO|rotina automática de expurgo ainda não está no ar/,
    "a página precisa avisar que o expurgo automático não está no ar",
  );
});

test("legal: o site nega rastreadores — então não pode ter rastreador", () => {
  // A política afirma "sem analytics de terceiros, pixel ou cookie de
  // publicidade". Se alguém instalar um, o texto vira mentira.
  const proibidos = [
    "googletagmanager",
    "google-analytics",
    "gtag(",
    "fbq(",
    "hotjar",
    "clarity.ms",
    "posthog",
    "segment.com/analytics",
  ];
  const achados: string[] = [];
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      if (["node_modules", ".next", ".git", "tests"].includes(nome)) continue;
      const caminho = join(dir, nome);
      const st = statSync(caminho);
      if (st.isDirectory()) {
        varrer(caminho);
        continue;
      }
      if (!/\.(tsx?|jsx?|html)$/.test(nome)) continue;
      const txt = readFileSync(caminho, "utf8");
      for (const p of proibidos) {
        if (txt.includes(p)) achados.push(`${relative(RAIZ, caminho)} → ${p}`);
      }
    }
  };
  for (const d of ["app", "components", "lib"]) varrer(join(RAIZ, d));
  assert.deepEqual(
    achados,
    [],
    `a política nega rastreadores, mas o site tem: ${achados.join("; ")}`,
  );
});

test("legal: a política nega acesso a e-mail/agenda do Google — e o produto não os pede", () => {
  for (const p of PAGINAS) {
    const src = semComentarios(ler(p));
    assert.doesNotMatch(
      src,
      /auth\/gmail|auth\/calendar|Gmail API/i,
      `${p} voltou a mencionar acesso a Gmail/Agenda`,
    );
  }
  const google = ler("lib/google-workspace.ts");
  // Os escopos reais: openid/email/drive.file. Nenhum sensível.
  assert.doesNotMatch(
    google,
    /auth\/gmail|auth\/calendar|auth\/spreadsheets|auth\/drive(?!\.file)/,
    "lib/google-workspace.ts voltou a pedir escopo sensível",
  );
});

// ─────────────────────────────────────────── C. coerência entre as duas páginas

test("legal: as duas páginas declaram a mesma data de atualização via fonte", () => {
  for (const p of PAGINAS) {
    const src = semComentarios(ler(p));
    assert.doesNotMatch(
      src,
      /Última atualização:\s*\d/i,
      `${p} tem data digitada à mão — deve vir de ATUALIZADO_EM`,
    );
    assert.match(src, /ATUALIZADO_EM/, `${p} deve usar ATUALIZADO_EM`);
  }
  assert.match(
    ler(FONTE),
    /ATUALIZADO_EM\s*=/,
    "a data única tem de existir na fonte",
  );
});

test("legal: os termos apontam para a política e explicam os papéis", () => {
  const termos = semComentarios(ler("app/(site)/termos/page.tsx"));
  assert.match(termos, /href="\/privacidade"/, "termos devem linkar a política");
  const priv = semComentarios(ler("app/(site)/privacidade/page.tsx"));
  assert.match(
    priv,
    /controladora/,
    "a política precisa distinguir controladora de operadora",
  );
  assert.match(priv, /operadora/, "a política precisa dizer quando a mila é operadora");
});
