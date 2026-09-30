#!/usr/bin/env bash
# Regenera TODOS os goldens das páginas jurídicas (11ª versão do instrumento).
#
#   GOLDEN_POLITICA / GOLDEN_TERMOS  — prosa fixa (render instrumentado)
#   GOLDEN_TEXTO                     — texto visível do render REAL  ← o decisivo
#   GOLDEN_FONTE                     — valores de lib/legal.ts
#   GOLDEN_TAGS / GOLDEN_ATRIBUTOS   — vocabulário de DOM
#
# Rodar SÓ quando a mudança de texto for decisão consciente. LEIA O DIFF: cada
# linha nova no golden é uma afirmação nova ao titular.
#
# ⚠️ NUNCA usar `git checkout --`/`git restore` para limpar este arquivo: já
# destruiu trabalho aqui. O backup é por `cp` (abaixo).
set -uo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
cd "$RAIZ"

ARQ="tests/legal.test.ts"
BACKUP="$(mktemp)"; cp "$ARQ" "$BACKUP"
DUMP="$(mktemp)"
trap 'cp "$BACKUP" "$ARQ"; rm -f "$BACKUP"' EXIT

# injeta os dumps temporários
cat >> "$ARQ" <<'EOF'

test("TEMP dump golden", async () => {
  const f = await fatos();
  for (const pg of PAGINAS) {
    console.log(`=== GOLDEN_INICIO_${pg.nome} ===`);
    console.log(JSON.stringify(prosaDe(await htmlComSentinela(pg.caminho, f))));
    console.log(`=== GOLDEN_FIM_${pg.nome} ===`);
    console.log(`=== TEXTO_INICIO_${pg.nome} ===`);
    console.log(JSON.stringify(normalizar(await htmlDe(pg.caminho))));
    console.log(`=== TEXTO_FIM_${pg.nome} ===`);
  }
  const todos: Record<string, unknown> = {};
  for (const k of Object.keys(f).sort()) todos[k] = f[k];
  console.log("=== FONTE_INICIO ===");
  console.log(canonico(todos));
  console.log("=== FONTE_FIM ===");
  const v = vocabulario(await htmlDe(PAGINAS[0].caminho));
  console.log("=== VOCAB_INICIO ===");
  console.log(JSON.stringify(v));
  console.log("=== VOCAB_FIM ===");
});
EOF

npm test > "$DUMP.raw" 2>&1 || true

# (a) prosa e (b) texto: uma linha JSON por página
grep -A1 'GOLDEN_INICIO_' "$DUMP.raw" > "$DUMP" || true
grep -A1 'TEXTO_INICIO_' "$DUMP.raw" > "$DUMP.texto" || true
# (c) fonte: bloco multilinha
sed -n '/=== FONTE_INICIO ===/,/=== FONTE_FIM ===/p' "$DUMP.raw" | sed '1d;$d' > "$DUMP.fonte" || true
# (d) vocabulário
grep -A1 '=== VOCAB_INICIO ===' "$DUMP.raw" | tail -1 > "$DUMP.vocab" || true

# Restaura antes de atualizar: o resultado não pode conter o dump temporário.
cp "$BACKUP" "$ARQ"
python3 "$AQUI/atualizar_golden.py" "$DUMP" || exit 1
# Atualização concluída: não sobrescrever o resultado no EXIT.
trap - EXIT
rm -f "$BACKUP"

rm -f "$DUMP.raw" "$DUMP.fonte" "$DUMP.vocab" "$DUMP.texto"
echo "goldens atualizados — LEIA O DIFF ANTES DE COMMITAR"
