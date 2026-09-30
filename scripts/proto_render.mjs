// Protótipo: transpilar TSX em memória e renderizar a página legal.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const RAIZ = "/opt/data/profiles/mila/home/projects/milaai";
const req = createRequire(join(RAIZ, "package.json"));
const ts = req("typescript");
const React = req("react");
const { renderToStaticMarkup } = req("react-dom/server");

const CACHE = join(RAIZ, ".next", "legal-guard-proto");
rmSync(CACHE, { recursive: true, force: true });
mkdirSync(CACHE, { recursive: true });

const nomeSaida = (rel) => rel.replace(/[\/.]/g, "_") + ".mjs";

/** Transpila um arquivo do projeto para .mjs dentro do cache. */
function transpilar(rel) {
  const abs = join(RAIZ, rel);
  const fonte = readFileSync(abs, "utf8");
  const js = ts.transpileModule(fonte, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      esModuleInterop: true,
    },
    fileName: abs,
  }).outputText;
  const comAlias = js.replace(
    /from\s+["']@\/([\w./-]+)["']/g,
    (_m, p) => `from "./${nomeSaida(p + ".ts")}"`,
  );
  const comLink = comAlias.replace(/from\s+["']next\/link["']/g, `from "./_link.mjs"`);
  writeFileSync(join(CACHE, nomeSaida(rel)), comLink, "utf8");
}

for (const d of ["lib/legal.ts", "lib/google-workspace.ts", "lib/notion.ts"]) {
  try {
    transpilar(d);
  } catch (e) {
    console.log("skip", d, e.message.split("\n")[0]);
  }
}

writeFileSync(
  join(CACHE, "_link.mjs"),
  `import React from "react";\nexport default function Link(p){return React.createElement("a",{href:p.href},p.children);}\n`,
);

for (const p of ["app/(site)/privacidade/page.tsx", "app/(site)/termos/page.tsx"]) {
  try {
    transpilar(p);
    const mod = await import(pathToFileURL(join(CACHE, nomeSaida(p))).href);
    const html = renderToStaticMarkup(React.createElement(mod.default));
    const txt = html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
    console.log("OK", p, "|", html.length, "chars HTML |", txt.length, "de texto");
    console.log("   Google?", txt.includes("Google"), "| drive.file?", txt.includes("drive.file"), "| China?", txt.includes("China"), "| Limited Use?", txt.includes("Limited Use"));
    console.log("   contato@?", txt.includes("contato@milaai.com.br"), "| privacy@?", txt.includes("privacy@"), "| 'a definir'?", /a definir/i.test(txt));
    console.log("   amostra:", txt.slice(60, 300));
  } catch (e) {
    console.log("FALHOU", p, "->", e.message.split("\n")[0]);
  }
}
