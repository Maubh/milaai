/**
 * O site não pode prometer o que a mila não entrega.
 *
 * Furo medido 2026-09-29: o plano Essencial anunciava
 * "Google Workspace (Gmail, Agenda, Tarefas, Drive, Documentos, Planilhas e
 * Apresentações)" e o produto fazia só UMA coisa — escrever na planilha do
 * caderno de fornecedores, com o escopo `auth/drive.file`. Gmail e Agenda
 * acabaram de sair do código (`auth/oauth.py`), então o texto era promessa
 * sem entrega em três telas.
 *
 * ── Histórico: TRÊS versões anteriores foram reprovadas ──────────────────────
 * v1 — filtrava as linhas do FONTE que continham "Google Workspace" e varria só
 *      essas. Burlável: a promessa na linha de BAIXO, ou dentro do VALOR de uma
 *      constante, passava. Também não pegava "documentos" nem "gmail" minúsculo.
 * v2 — varria os valores, mas com lista MANUAL de constantes e um removedor de
 *      comentários que engolia `//` dentro de string. Brechas: "Sheets"/"e-mail"
 *      fora da denylist e um export NOVO que não estava na lista manual.
 * v3 — `import * as` (todo export coberto) + máquina de estados p/ comentários.
 *      O Grok 4.7 achou 5 brechas restantes (todas medidas rodando `npm test`,
 *      todas passando 37/37 antes do conserto):
 *
 *   1. `\bPLANO_GOOGLE\b` casa dentro de COMENTÁRIO. Tirar o uso real e deixar
 *      `// usa PLANO_GOOGLE` satisfazia o teste de ligação;
 *   2. `juntarConcatenacao` só juntava aspas DUPLAS — `'G' + 'mail'` passava;
 *   3. `visitar()` ignorava string curta (`length > 8`): `["Gmail","Agenda"]`
 *      passava;
 *   4. `visitar()` não desce em função: `function f(){ return "lê seu Gmail" }`
 *      passava — e a lib nem era lida como FONTE, só importada;
 *   5. `mascararTecnico` removia `import\s+[^;]+;` — sem ponto-e-vírgula (ASI) o
 *      regex engolia a promessa da LINHA SEGUINTE.
 *
 * ── v4 (esta): o que mudou para fechar cada uma ──────────────────────────────
 *   1. o teste de ligação roda sobre o fonte SEM COMENTÁRIOS e SEM IMPORTS
 *      (`codigoUtil()`): a constante precisa ser USADA, não citada;
 *   2. `juntarConcatenacao` aceita `"`, `'` e crase, inclusive misturados;
 *   3. `visitar()` não usa mais heurística de tamanho: descarta só identificador
 *      (chave técnica, caminho de asset, token `kebab-case`), então string curta
 *      de prosa entra na varredura;
 *   4. os módulos-fonte entram também na varredura de FONTE (`FONTES`), e a
 *      varredura de valor continua por `import * as`;
 *   5. import é removido por LINHA (`semImports`), não até o próximo `;`.
 *
 * ── Falso positivo: o teste é arame farpado, não muro ────────────────────────
 * Se um dia "documentos fiscais" for texto legítimo nestas telas, o teste falha
 * apontando a palavra. Aí a saída é ser explícito — foi o que se fez com a
 * negação honesta ("não acessa seu Gmail nem sua Agenda"), que é transparência e
 * por isso está em allowlist. Nunca afrouxe a denylist inteira por causa disso.
 *
 * ⚠️ Arquivo de copy NOVO não é varrido sozinho: a lista `FONTES` é explícita.
 *    Se a copy passar a morar em outro módulo, adicione-o aqui — de propósito,
 *    porque varrer todo `lib/` traria palavras legítimas e quebraria o teste.
 *
 *   npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

import * as GW from "../lib/google-workspace.ts";
import * as NO from "../lib/notion.ts";

const ler = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

/**
 * Lista recursivamente os arquivos de um diretório (para achar tela nova).
 *
 * O diretório é obrigatório: `app/` e `components/` sempre existem no repo, e um
 * `catch` que devolvesse lista vazia deixaria a varredura passar em SILÊNCIO
 * (fail-open) — o Grok apontou. Melhor quebrar o teste do que varrer nada.
 */
function listar(dir: string): string[] {
  const saida: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      saida.push(...listar(p));
    } else {
      saida.push(p);
    }
  }
  return saida;
}

/** Telas que exibem a promessa (e por isso são varridas inteiras). */
const TELAS: Array<[string, string]> = [
  ["PricingSection", ler("../components/PricingSection.tsx")],
  ["demo-data", ler("../lib/demo-data.ts")],
  ["integrations/[app]", ler("../app/integrations/[app]/page.tsx")],
  ["IntegrationsMarquee", ler("../components/IntegrationsMarquee.tsx")],
];

/**
 * Módulos de copy + telas, todos varridos como FONTE.
 * As libs entram explicitamente: `visitar()` não enxerga o retorno de função, e
 * um texto escondido ali apareceria na tela sem nunca ser lido (brecha 4).
 */
const FONTES: Array<[string, string]> = [
  ...TELAS,
  ["lib/google-workspace", ler("../lib/google-workspace.ts")],
  ["lib/notion", ler("../lib/notion.ts")],
];

/**
 * Remove comentários respeitando strings.
 *
 * Por que não um regex: `"sync // Gmail"` tem `//` DENTRO de uma string. Um
 * regex simples apaga o resto da linha e a promessa desaparece da varredura —
 * foi exatamente a brecha que o Grok apontou na 2ª rodada.
 */
function semComentarios(src: string): string {
  let saida = "";
  let i = 0;
  let estado: "codigo" | "string" | "linha" | "bloco" = "codigo";
  let aspas = "";
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1] ?? "";
    if (estado === "codigo") {
      if (c === "/" && d === "/") { estado = "linha"; i += 2; continue; }
      if (c === "/" && d === "*") { estado = "bloco"; i += 2; continue; }
      if (c === '"' || c === "'" || c === "`") { estado = "string"; aspas = c; }
      saida += c; i++; continue;
    }
    if (estado === "linha") {
      if (c === "\n") { estado = "codigo"; saida += "\n"; }
      i++; continue;
    }
    if (estado === "bloco") {
      if (c === "*" && d === "/") { estado = "codigo"; i += 2; continue; }
      i++; continue;
    }
    // dentro de string: `//` é texto, não comentário
    if (c === "\\") { saida += c + d; i += 2; continue; }
    if (c === aspas) estado = "codigo";
    saida += c; i++;
  }
  return saida;
}

/**
 * Remove imports por LINHA (brecha 5 da 3ª rodada; endurecido na v5).
 *
 * `import\s+[^;]+;` removia tudo até o próximo `;` — num import sem `;` (ASI)
 * isso levava junto a linha seguinte.
 *
 * A 1ª versão daqui usava `^\s*import\b[\s\S]*?from\s+["']...` e o Grok mostrou
 * que ela continua comendo o miolo: com um import de EFEITO COLATERAL no meio,
 * `import "./x"` + código + `import { A } from "y"` casava o `from` da ÚLTIMA
 * linha e apagava as do meio. Cada forma de import é removida pela própria
 * sintaxe, então nenhuma delas atravessa linha que não seja dela.
 */
const semImports = (src: string) =>
  src
    // import { a, b } from "x"  (pode quebrar em várias linhas)
    .replace(/^[ \t]*import\s*\{[\s\S]*?\}\s*from\s*["'][^"']*["'];?/gm, " ")
    // import Nome, { a } from "x"  /  import Nome from "x"  (uma linha)
    .replace(/^[ \t]*import\s+[A-Za-z_$][\w$]*(?:\s*,\s*\{[^}]*\})?\s*from\s*["'][^"']*["'];?/gm, " ")
    // import "x";  (efeito colateral, linha inteira)
    .replace(/^[ \t]*import\s+["'][^"'\n]*["'];?[ \t]*$/gm, " ");

/** Fonte que a lojista de fato vê: sem comentário (não é lido) e sem import. */
const codigoUtil = (src: string) => semImports(semComentarios(src));

/**
 * Apaga identificadores técnicos que NÃO são promessa: caminho de asset
 * (`/integrations/google-sheets.png`), `className`, imports. Sem isso, o próprio
 * nome do arquivo do ícone faria `sheets` disparar — falso positivo.
 *
 * O padrão de `slug:` é restrito às chaves TÉCNICAS (`CHAVE_TECNICA`), não a
 * qualquer `palavra: "valor"`. A versão genérica mascarava copy de verdade: o
 * Grok mostrou que `{ titulo: "e-mail" }` (valor kebab-case) ficava invisível e
 * renderizava na tela.
 */
const mascararTecnico = (src: string) =>
  semImports(src)
    .replace(/\bclassName=(\{[^}]*\}|"[^"]*")/g, " ")
    .replace(/["'`][^"'`]*\.(png|svg|jpe?g|css|tsx?|ts)["'`]/g, " ")
    .replace(/^[ \t]*(slug|icone|id|status|href|key|cor)\s*:\s*["'][a-z0-9-]+["'],?[ \t]*$/gm, " ");

/**
 * Neutraliza os invólucros que quebram a junção: `("G")+("mail")` e
 * `["G"]+["mail"]` escapavam porque o `+` ficava entre `) `/` (`, ou `] `/`[`.
 * Trocar por espaço não inventa palavra (não cola `f` de `g`) nem esconde nada.
 */
const neutralizar = (src: string) => src.replace(/[()[\]]/g, " ");

/**
 * Junta string concatenada em pedaços: `"lê " + "G" + "mail"` → `"lê Gmail"`.
 *
 * Aceita `"`, `'` e crase (inclusive misturados) e consome as DUAS aspas: sem
 * isso sobra uma aspa no meio e a palavra nunca se forma.
 */
const juntarConcatenacao = (src: string) =>
  neutralizar(src).replace(/(["'`])\s*\+\s*(["'`])/g, "");

/** Tira as negações HONESTAS: elas protegem a lojista e não são promessa. */
const NEGACAO_HONESTA =
  /não (acessa seu Gmail nem sua Agenda|abre nem lista seus outros arquivos do Drive)/gi;
const despirNegacao = (t: string) => t.replace(NEGACAO_HONESTA, " ");

/**
 * Nomes de produto — a denylist ESTRITA, a única segura para varrer o site
 * inteiro. `gmail`, `sheets`, `slides`, `calendar`, `wiki`, `agenda` não têm uso
 * legítimo na loja; medido: 0 ocorrências nos 37 arquivos de app/ + components/.
 */
const NAO_ENTREGUES_PRODUTO =
  /\b(gmail|sheets?|slides?|calendar|calend[áa]rios?|wiki|agendas?)\b/i;

/**
 * Nomes de produto + palavras genéricas da promessa antiga, para os arquivos de
 * COPY (onde cada palavra é escolhida a dedo).
 *
 * Os genéricos NÃO entram na varredura ampla: "Apresentação da mila" (aria-label
 * de seção), "Página não encontrada", "páginas visitadas" e "pelo e-mail de
 * privacidade" são português legítimo — medido, eles quebraram 4 arquivos quando
 * tentei varrer tudo com esta lista. Por isso a varredura ampla usa só a
 * ESTRITA, e esta fica onde a palavra é promessa de produto.
 *
 * `apresenta(?:...)` exige o SUFIXO do substantivo: `apresenta` nu volta a casar
 * o VERBO "apresentamos" (falso positivo medido), e `apresenta\w*` casava
 * "apresentação" de seção. `agenda`/`calendário` aceitam plural.
 */
const NAO_ENTREGUES =
  /\b(gmail|e-?mails?|sheets?|docs|documentos?|apresenta(?:[çc][ãa]o|[çc][õo]es|coes|cao)s?|slides?|wiki|p[áa]ginas?|tarefas?|tasks|calendar|calend[áa]rios?|agendas?)\b/i;

/** Pipeline único, para a varredura de fonte não divergir da de valor. */
const varrer = (src: string) =>
  despirNegacao(juntarConcatenacao(mascararTecnico(semComentarios(src))));

/**
 * Chaves cujo valor é identificador, não copy. `slug: "sheets"` nomeia um arquivo
 * de ícone; marcar isso como promessa seria falso positivo (brecha 3 veio da
 * tentativa de resolver isso por tamanho de string).
 */
const CHAVE_TECNICA = new Set(["slug", "icone", "id", "status", "href", "key", "cor"]);

const ultimaChave = (caminho: string) =>
  caminho.replace(/\[\d+\]$/, "").split(".").pop() ?? "";

/** Valor é identificador? (chave técnica, caminho de asset ou token kebab) */
const ehIdentificador = (caminho: string, v: string) =>
  CHAVE_TECNICA.has(ultimaChave(caminho)) ||
  v.startsWith("/") ||
  /^[a-z0-9-]+$/.test(v);

/** Coleta TODO texto exportado pelos módulos-fonte (sem lista manual). */
function textosExportados(): Array<[string, string]> {
  const achados: Array<[string, string]> = [];
  const visitar = (v: unknown, caminho: string): void => {
    if (typeof v === "string") {
      // Sem heurística de tamanho (brecha 3): string curta de prosa conta.
      if (!ehIdentificador(caminho, v)) achados.push([caminho, v]);
      return;
    }
    if (Array.isArray(v)) { v.forEach((x, i) => visitar(x, `${caminho}[${i}]`)); return; }
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) visitar(x, `${caminho}.${k}`);
    }
  };
  visitar(GW, "google-workspace");
  visitar(NO, "notion");
  return achados;
}

const TEXTOS_DE_UI = textosExportados();

test("google: a lista de ferramentas é só o que o produto usa", () => {
  const nomes = GW.FERRAMENTAS_GOOGLE.map((f) => f.nome).sort();
  assert.deepEqual(nomes, ["Drive", "Planilhas"]);
  for (const f of GW.FERRAMENTAS_GOOGLE) {
    assert.match(f.icone, /^\/integrations\/google-.+\.png$/, f.nome);
    assert.ok(f.uso.length > 10, `uso de ${f.nome} precisa explicar algo`);
    // Cada ícone declarado tem que existir em disco, senão a faixa fica com
    // quadrado vazio / 404 e ninguém percebe.
    assert.ok(readFileSync(new URL(`../public${f.icone}`, import.meta.url)).length > 100,
      `asset ausente: ${f.icone}`);
  }
});

test("google: a varredura de valores não voltou a ficar vazia", () => {
  // Sem isto, um erro no `visitar()` deixaria o teste abaixo passando em vazio.
  assert.ok(TEXTOS_DE_UI.length >= 6, `esperava textos exportados, achei ${TEXTOS_DE_UI.length}`);
  const caminhos = TEXTOS_DE_UI.map(([c]) => c);
  for (const exigido of [".PLANO_GOOGLE", ".GOOGLE_DESC", ".GOOGLE_ESCOPO_NOTA"]) {
    assert.ok(caminhos.some((c) => c.endsWith(exigido)),
      `a varredura de valores precisa incluir ${exigido} (achei ${caminhos.join(", ")})`);
  }
});

test("google: nenhum texto exportado promete ferramenta fora da lista", () => {
  // Cobre TODO export dos módulos-fonte — inclusive um export novo, que na
  // versão v2 passava batido (brecha apontada pelo Grok).
  for (const [caminho, texto] of TEXTOS_DE_UI) {
    const achado = despirNegacao(texto).match(NAO_ENTREGUES);
    assert.equal(achado, null,
      `${caminho} promete "${achado?.[0]}" — o produto não entrega: ${texto}`);
  }
});

test("google: nem no fonte, com comentários fora", () => {
  // Pega a promessa digitada À MÃO numa tela nova (sem passar pelas constantes),
  // e o texto solto no JSX. Comentário não conta: não é lido por ninguém.
  // As libs de copy entram aqui também (brecha 4): `visitar()` só enxerga
  // valores exportados, então texto escondido no corpo de uma função da lib
  // apareceria na tela sem nunca ser lido.
  for (const [nome, src] of FONTES) {
    const achado = varrer(src).match(NAO_ENTREGUES);
    assert.equal(achado, null, `${nome} traz "${achado?.[0]}" como promessa`);
  }
});

/** Constantes que cada arquivo precisa USAR (não só mencionar). */
const EXIGIDAS: Array<[string, string[]]> = [
  ["PricingSection", ["PLANO_GOOGLE"]],
  ["demo-data", ["GOOGLE_DESC", "NOTION_DESC"]],
  ["integrations/[app]", ["GOOGLE_DESC", "GOOGLE_TITULO", "GOOGLE_ESCOPO_NOTA", "FERRAMENTAS_GOOGLE"]],
  ["IntegrationsMarquee", ["FERRAMENTAS_GOOGLE"]],
];

test("google: as telas USAM a fonte única em código, não citam em comentário", () => {
  // Brecha 1: `assert.match(src, /\bPLANO_GOOGLE\b/)` casava dentro de um
  // comentário. Trocar o uso real por texto literal e deixar `// usa PLANO_GOOGLE`
  // mantinha o teste verde — medido. Aqui o fonte passa por `codigoUtil()`
  // (sem comentário E sem import), então só conta USO de verdade.
  for (const [nome, constantes] of EXIGIDAS) {
    const src = TELAS.find(([n]) => n === nome)?.[1];
    assert.ok(src, `tela ${nome} não está em TELAS`);
    const codigo = codigoUtil(src!);
    for (const c of constantes) {
      assert.match(codigo, new RegExp(`\\b${c}\\b`),
        `${nome} precisa USAR ${c} em código (o import e o comentário não contam)`);
    }
  }
});

test("google: nenhuma tela digita à mão o texto da fonte única", () => {
  // Fecha o caso oposto: manter o import e digitar o texto à mão. Se o literal
  // aparecer no fonte, a constante deixou de ser fonte única.
  const valores = [
    GW.GOOGLE_TITULO, GW.GOOGLE_DESC, GW.PLANO_GOOGLE, GW.GOOGLE_ESCOPO_NOTA,
    NO.NOTION_DESC,
  ];
  for (const [nome, src] of TELAS) {
    const limpo = semComentarios(src);
    for (const v of valores) {
      assert.ok(!limpo.includes(v), `${nome} repete à mão o texto da fonte única`);
    }
  }
});

test("google: a tela de conexão explica o limite do escopo", () => {
  // Com `drive.file` a mila vê só o que ela cria. Prometer leitura do Drive
  // inteiro seria falso — e é o que a lojista precisa saber antes de autorizar.
  //
  // As DUAS transparências são verificadas separadamente de propósito: com uma
  // regex de alternativas, apagar só a parte do Gmail/Agenda passava (brecha
  // encontrada por regressão). Cada uma tem que estar lá, textualmente.
  assert.match(GW.GOOGLE_ESCOPO_NOTA, /não abre nem lista seus outros arquivos do Drive/,
    "o aviso precisa dizer que a mila não abre os outros arquivos do Drive");
  assert.match(GW.GOOGLE_ESCOPO_NOTA, /não acessa seu Gmail nem sua Agenda/,
    "o aviso precisa dizer que a mila não acessa Gmail nem Agenda");
  // E o título não pode voltar a sugerir a suíte inteira.
  assert.doesNotMatch(GW.GOOGLE_TITULO, /Workspace/);
  assert.match(GW.GOOGLE_TITULO, /Drive e Planilhas/);
});

test("google: o essencial diz que o caderno fica salvo mesmo sem destino", () => {
  // Decisão do Maurício (2026-09-29): *"Se a loja não escolher nenhum, eh
  // informar que ficará salvo e ele pode consultar a qualquer momento"*.
  assert.match(GW.PLANO_GOOGLE, /salvo e consultável no WhatsApp/);
  assert.match(GW.GOOGLE_DESC, /salvo e consultável no WhatsApp/);
  // E a escolha do destino aparece nas duas telas.
  assert.match(GW.PLANO_GOOGLE, /planilha/i);
  assert.match(GW.PLANO_GOOGLE, /Notion/);
  // A linha do espelho NÃO pode repetir "Caderno de fornecedores": a feature
  // anterior já diz isso, e repetir deixou o plano redundante.
  assert.match(TELAS[0][1], /Caderno de fornecedores validados/,
    "a feature do caderno deve seguir no plano");
  assert.doesNotMatch(GW.PLANO_GOOGLE, /Caderno de fornecedores/,
    "a linha do espelho não repete a feature anterior");
});

test("google: os ícones das ferramentas são exibidos sob o nome da marca", () => {
  // Pedido do Maurício (2026-09-29): o nome "Google Workspace" visível, com os
  // ícones das ferramentas abaixo.
  const src = TELAS[3][1];
  const bloco = src.slice(src.indexOf('id: "google-workspace"'));
  const item = bloco.slice(0, bloco.indexOf('id: "notion"'));
  assert.match(item, /showName: true/, "sem o nome, os ícones ficam sem dono");
  assert.match(item, /tools: FERRAMENTAS_GOOGLE/);
  // E o render usa mesmo os ícones, com nome acessível.
  assert.match(src, /className="marquee-mark-tools"/);
  assert.match(src, /alt=\{t\.nome\}/);
});

test("notion: o site diz que o caderno pode ir para o Notion", () => {
  // Correção do Maurício (2026-09-29): *"mas o caderno tbm pode ser salvo tbm
  // no notion, certo?"* — sim. O site dava a entender que só o Google recebia
  // o caderno, e o Notion era genérico ("Documentos, Wiki, Páginas").
  assert.match(NO.NOTION_DESC, /caderno de fornecedores e as notas de compra/);
  assert.match(NO.NOTION_DESC, /planilha no Google Drive/);
  assert.match(GW.PLANO_GOOGLE, /Notion/);
});

test("notion: a mila NÃO cria a base — e o texto não promete que cria", () => {
  // Medido em `notion_client.py`: existe `listar_bases` e ZERO chamadas a
  // `POST /databases`. Ela pergunta qual base usar. "Viram bases" sugeria que a
  // mila criava uma base por nota — impreciso.
  assert.match(NO.NOTION_DESC, /ela não cria a base/);
  assert.doesNotMatch(NO.NOTION_DESC, /viram bases/);
});

test("google: nenhum arquivo de app/ ou components/ promete o que não entrega", () => {
  // O Grok mostrou que exigir cadastro em TELAS só para quem IMPORTA a fonte
  // deixava passar uma tela nova com promessa HARDCODED:
  //   export function Nova() { return <p>Google Workspace (Gmail, Agenda)</p> }
  // Aqui TODO arquivo de app/ e components/ é varrido, com a denylist ampla
  // (que inclui os genéricos). Medido antes de adotar: 0 falso positivo nos 37
  // arquivos — os genéricos que existem ("Página não encontrada", "documentos
  // fiscais", a pesquisa por "tarefa") vivem em `not-found.tsx` e nas páginas de
  // termos/privacidade, e são legítimos. Se um deles passar a colidir, a saída
  // documentada é ser explícito (allowlist), não afrouxar a denylist.
  const raiz = new URL("..", import.meta.url).pathname;
  const arquivos = [...listar(`${raiz}app`), ...listar(`${raiz}components`)]
    .filter((p) => /\.(tsx|ts)$/.test(p) && !p.includes("node_modules"));
  assert.ok(arquivos.length > 10, `esperava varrer app/ e components/, achei ${arquivos.length}`);

  const falhas: string[] = [];
  for (const caminho of arquivos) {
    const achado = varrerArquivo(caminho).match(NAO_ENTREGUES_PRODUTO);
    if (achado) falhas.push(`${caminho.replace(raiz, "")} → "${achado[0]}"`);
  }
  assert.deepEqual(falhas, [], "promessa sem entrega:\n  " + falhas.join("\n  "));
});

/** Pipeline aplicado a um ARQUIVO (inclui e-mail/mailto, que só existe em copy). */
const varrerArquivo = (caminho: string) => {
  const limpo = varrer(readFileSync(caminho, "utf8"));
  return limpo
    .replace(/mailto:[^\s"'<>]+/g, " ")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, " ")
    .replace(/["'`][a-z0-9-]+["'`]/g, " "); // {lhs: "mila"}
};

test("marquee: só o Google tem sub-ícones; o Notion fica como estava", () => {
  // Pedido do Maurício (2026-09-29): *"no marquee os icones para o google
  // workspace. Para notion nao precisa ter nada"* / *"o notion nao precisa de
  // nenhuma mudanca"*.
  const src = TELAS[3][1];
  const bloco = src.slice(src.indexOf('id: "notion"'));
  const item = bloco.slice(0, bloco.indexOf('id: "outlook"'));
  assert.doesNotMatch(item, /tools/, "o item do Notion na faixa não tem sub-ícones");
  assert.match(item, /name: "Notion"/, "o nome aparece, como nas outras marcas");
  // E o Notion continua na faixa (não pode ser removido).
  assert.match(src, /id: "notion"/);
});
