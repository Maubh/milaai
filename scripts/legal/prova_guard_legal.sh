#!/usr/bin/env bash
# Prova que o guard `tests/legal.test.ts` NÃO é decorativo.
#
# A 3ª revisão do Grok 4.7 mostrou que o harness anterior fechava O EXEMPLO e não
# A CLASSE: cada guard era denylist de uma redação específica. Os ataques desta
# lista são os que ele descreveu como "passa na suíte e o titular lê mentira".
#
# ⚠️ NÃO usa `git checkout --` para restaurar: numa versão anterior isso apagou
# trabalho NÃO COMMITADO. Aqui guarda o conteúdo e repõe com `cp`.
set -euo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
cd "$RAIZ"

P="app/(site)/privacidade/page.tsx"
L="lib/legal.ts"
O="/opt/data/profiles/mila/auth/oauth.py"
PRICING="components/PricingSection.tsx"

TMP=".next/prova-guard"
mkdir -p "$TMP"
for f in "$P" "$L" "$O" "$PRICING"; do
  cp "$f" "$TMP/$(basename "$f").bak"
done

SUJOS=()
restaurar() {
  cp "$TMP/page.tsx.bak" "$P"
  cp "$TMP/legal.ts.bak" "$L"
  cp "$TMP/oauth.py.bak" "$O"
  cp "$TMP/PricingSection.tsx.bak" "$PRICING"
  for f in "${SUJOS[@]:-}"; do [ -n "$f" ] && rm -f "$f"; done
  SUJOS=()
}

trap restaurar EXIT
falhas=0
rodar() {
  local status=0
  npm test > "$TMP/test.log" 2>&1 || status=$?
  if [ "$status" -ne 0 ]; then
    local n
    n=$(grep -cE '^✖' "$TMP/test.log" || true)
    if [ "$n" -eq 0 ]; then
      printf 'Falha de infraestrutura, não uma rejeição do guard.\n' >&2
      return 2
    fi
    printf '%s\n' "$n"
  else
    printf '0\n'
  fi
}

verificar() {
  local nome="$1" n
  n=$(rodar)
  if [ "$n" -gt 0 ]; then
    echo "  ✅ PEGOU ($n): $nome"
  else
    echo "  ❌ PASSOU — guarda furado: $nome"
    falhas=$((falhas+1))
  fi
  restaurar
}

echo "=== baseline (precisa ser 0) ==="
n=$(rodar)
echo "  falhas: $n"
[ "$n" -eq 0 ] || exit 1

echo
echo "=== ataques da 3ª rodada (o Grok descreveu como passa-batido) ==="

# (1) o ataque mais sujo: verdade escondida + mentira visível.
python3 - "$P" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = """        <ul>
          {RETENCAO.map((r) => ("""
assert alvo in t, "alvo 1 não encontrado"
novo = """        <div style={{ display: `none` }}>
        <ul>
          {RETENCAO.map((r) => ("""
t = t.replace(alvo, novo, 1)
# fecha o div depois do parágrafo de expurgo e escreve a mentira visível
alvo2 = """            : " Especificamente: a rotina automática de expurgo ainda não está no ar."}
        </p>"""
assert alvo2 in t, "alvo 1b não encontrado"
novo2 = alvo2 + """
        </div>
        <ul>
          <li><strong>Arquivo de diagnóstico</strong> — Eliminado automaticamente ao fim do prazo.</li>
          <li><strong>Histórico da conversa</strong> — Eliminado automaticamente ao fim do prazo.</li>
        </ul>
        <p>O expurgo automático já está no ar e cumpre os prazos sem pedido.</p>"""
p.write_text(t.replace(alvo2, novo2, 1))
PY
verificar "1: verdade em display:\`none\` + mentira visível ('Eliminado automaticamente')"

# (1b) variante sem template string: "None" e hidden={true}
python3 - "$P" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '        <h2>9. Por quanto tempo guardamos</h2>'
assert alvo in t, "alvo 1b não encontrado"
p.write_text(t.replace(alvo, '        <div style={{ display: "None" }} hidden={true}>\n' + alvo, 1))
PY
verificar "1b: display:\"None\" (CSS case-insensitive) + hidden={true}"

# (2) decoy em auth/oauth.py + email/drive de volta
python3 - "$O" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
frase = 'import os\n'
assert frase in t, "alvo 2 não encontrado"
t = ("_DECOY = 'see \"google\" ' + (\".\" * 120) + ' then \"notion\" later'\n" +
     t.replace(frase, frase, 1))
alvo = '"openid",\n            "https://www.googleapis.com/auth/drive.file",'
assert alvo in t, "alvo 2b não encontrado"
t = t.replace(alvo, '"openid",\n            "email",\n            "https://www.googleapis.com/auth/drive",')
p.write_text(t)
PY
verificar "2: decoy no topo do oauth.py + email e drive (Drive inteiro) reais"

# (2b) escopo proibido montado por concatenação
python3 - "$O" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '"https://www.googleapis.com/auth/drive.file",'
assert alvo in t, "alvo 2c não encontrado"
p.write_text(t.replace(alvo, alvo + '\n            "https://www.googleapis.com/auth/" + "gmail.readonly",'))
PY
verificar "2b: escopo sensível montado por concatenação de string"

# (3) art. 33: trocar o mecanismo por "já firmadas", mantendo as palavras-chave
python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '"é transferência internacional (LGPD, art. 33). Mecanismo: os contratos de "'
assert alvo in t, "alvo 3 não encontrado"
p.write_text(t.replace(alvo, '"é transferência internacional (LGPD, art. 33). Mecanismo: cláusulas-padrão já firmadas com "'))
PY
verificar "3: art. 33 -> 'cláusulas-padrão já firmadas' (mantendo 'transferência internacional' e 'China')"

# (3b) remover a proibição de crédito/scoring do Limited Use
python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '"não os usamos para avaliar crédito, pontuação ou risco de pessoas, nem para "'
assert alvo in t, "alvo 3b não encontrado"
p.write_text(t.replace(alvo, '"nem para "'))
PY
verificar "3b: apaga a proibição de crédito/scoring do Limited Use"

# (4) subprocessador marca "recebe dado do Google" e a página não mostra
python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '    pais: "China",\n    tocaDadoDoGoogle: false,\n  },\n  {\n    nome: "Serper"'
assert alvo in t, "alvo 4 não encontrado"
p.write_text(t.replace(alvo, '    pais: "China",\n    tocaDadoDoGoogle: "conteúdo do Drive",\n  },\n  {\n    nome: "Serper"'))
PY
verificar "4: Zhipu marcado como receptor de dado do Google, sem a página dizer"

python3 - "$P" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = "              )}\n            </li>\n          ))}\n        </ul>"
assert alvo in t, "alvo 4b não encontrado"
p.write_text(t.replace(alvo, "              )}\n            </li>\n          ))}\n        </ul>", 1))
PY

# (5) arquivo concatenado no fim de lib/legal.ts (segunda declaração)
python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
p.write_text(t + '\nexport const CONTATO_PRIVACIDADE = "privacy@milaai.com.br";\n')
PY
verificar "5: arquivo concatenado no fim (2ª declaração de CONTATO_PRIVACIDADE)"

# (6) o Grok v4: mutação em RUNTIME de PROVIDERS["google"]["scopes"]
python3 - "$O" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
marcador = '\n\n'
alvo = '"https://www.googleapis.com/auth/drive.file",\n        ],\n    },\n    "notion"'
if alvo not in t:
    # fallback: acha o fim do bloco google
    i = t.find('"google": {')
    j = t.find('"notion": {', i)
    assert j > i, "não achei o fim do bloco google"
    t = t[:j] + ('# literal acima continua o que o guard lê; isto é o que o app pede\n'
                 'PROVIDERS["google"]["scopes"] = [\n'
                 '    "openid",\n'
                 '    "https://www.googleapis.com/auth/drive.file",\n'
                 '    "email",\n'
                 '    "https://www.googleapis.com/auth/drive",\n'
                 ']\n\n') + t[j:]
else:
    t = t.replace(alvo, alvo.replace('],\n    },', '],\n    },\n}\n# runtime\nPROVIDERS["google"]["scopes"] = ["openid","email","https://www.googleapis.com/auth/drive"]\n_PROV = {', 1))
p.write_text(t)
PY
verificar "6: mutação em runtime de PROVIDERS[\"google\"][\"scopes\"] (Subscript)"

# (7) o Grok v4: spread `{...{style:{display:"none"}}}` + mentira visível
python3 - "$P" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '        <h2>9. Por quanto tempo guardamos</h2>'
assert alvo in t, "alvo 7 não encontrado"
t = t.replace(alvo, alvo + '\n        <div {...{ style: { display: "none" } }}>', 1)
# fecha o div depois do parágrafo de expurgo
alvo2 = '            : " Especificamente: a rotina automática de expurgo ainda não está no ar."}\n        </p>'
assert alvo2 in t, "alvo 7b não encontrado"
t = t.replace(alvo2, alvo2 + '\n        </div>\n        <p>Os dados são automaticamente excluídos ao fim do prazo, sem você pedir.</p>', 1)
p.write_text(t)
PY
verificar "7: spread \`{...{style:{display:none}}}\` + mentira com advérbio antes do verbo"

# ═══ ataques da 5ª rodada (o Grok v4/v5 descreveu como passa-batido) ═══

# (8) "Não há dúvida:" satisfazendo a negação do laço de expurgo
python3 "$AQUI/ataque_grok5.py" 8 "$P"
verificar "8: mentira com 'Não há dúvida:' satisfazendo a negação"

# (9) a mesma mentira numa <div>, fora do alcance do laço que só olhava <p>
python3 "$AQUI/ataque_grok5.py" 9 "$P"
verificar "9: mentira em <div> (fora da checagem que só olhava <p>)"

# (10) <style> com classe: não vira atributo e o texto() não aplica CSS.
#      Foi este que derrubou minha afirmação de que "nenhuma sintaxe escapa".
python3 "$AQUI/ataque_grok5.py" 10 "$P"
verificar "10: <style> com classe escondendo (o furo da minha afirmação falsa)"

# ═══ ataques da 6ª rodada (canais que o prosaDe/julgamento não viam) ═══

# (11) frase visível num data-URI de <img> (o regex de tag engole o src)
python3 "$AQUI/ataque_grok6.py" 11 "$RAIZ"
verificar "11: frase visível embutida em data-URI de <img>"

# (12) frase CONCATENADA dentro de string da fonte (vira sentinela e some do golden)
python3 "$AQUI/ataque_grok6.py" 12 "$RAIZ"
verificar "12: frase nova concatenada dentro de string da fonte (GOLDEN_FONTE)"

# ═══ ataques da 7ª rodada (predicado sobre a sentinela da fonte) ═══

# (13) `{RETENCAO_NOTA.length > 100 ? <p>mentira</p> : null}` — no render
#      instrumentado a sentinela tem 16 chars e o ramo da mentira nem existe.
python3 "$AQUI/ataque_grok7.py" 13 "$RAIZ"
verificar "13: predicado sobre o comprimento da sentinela (ramo da mentira fora do golden)"

# (14) `{GOOGLE_LIMITED_USE.replace("não os vendemos", "e os vendemos")}` — a
#      sentinela não contém o needle, o replace vira no-op; no HTML real a
#      negação some e os fragmentos congelados continuam presentes.
python3 "$AQUI/ataque_grok7.py" 14 "$RAIZ"
verificar "14: replace que mira o texto real mas não casa na sentinela"

echo
echo "=== ataques das rodadas anteriores (regressão) ==="

python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = 'praticado: "Mantido até exclusão sob pedido.",'
assert alvo in t, "alvo r1 não encontrado"
p.write_text(t.replace(alvo, 'praticado: "Removido sozinho ao fim do prazo alvo, sem pedido.",'))
PY
verificar "r1: praticado='Removido sozinho…' (expurgo via texto)"

python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = '"O conteúdo da mensagem é registrado em arquivo de diagnóstico para "'
assert alvo in t, "alvo r2 não encontrado"
p.write_text(t.replace(alvo, '"O conteúdo da mensagem não é registrado; o payload é descartado na hora. Não há "'))
PY
verificar "r2: texto nega o store_inbox"

python3 - "$L" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = 'export const CONTATO_PRIVACIDADE = "contato@milaai.com.br";'
assert alvo in t, "alvo r3 não encontrado"
p.write_text(t.replace(alvo, 'export const CONTATO_PRIVACIDADE = ["privacy", "milaai.com.br"].join("@");'))
PY
verificar "r3: contato montado em runtime (join)"

python3 - "$PRICING" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text()
alvo = 'CONECTORES_NAO_PRONTOs.join(" e ") +\n  " ainda não)";'
assert alvo in t, "alvo r4 não encontrado"
t = t.replace(alvo, '"")";').replace(
    'export const PLANO_ERP =\n  "Integração direta com ERP (Jueri disponível; " +\n  ',
    'export const PLANO_ERP =\n  "Integração direta Jueri, Bling e Olist (entrada de notas e estoque)";\nconst _U =\n  ')
p.write_text(t)
PY
verificar "r4: pricing promete 'Jueri, Bling e Olist' sem ressalva"

printf 'export const GA = "G-XXXX";\nwindow.gtag("config", GA);\n' > lib/analytics.ts
SUJOS+=("lib/analytics.ts")
verificar "r5: rastreador (gtag) plantado em lib/analytics.ts"

echo
echo "=== baseline final (precisa ser 0) ==="
n=$(rodar)
echo "  falhas: $n"
[ "$n" -eq 0 ] || exit 1
echo
if [ "$falhas" -eq 0 ]; then
  echo "RESULTADO: todos os ataques foram pegos."
else
  echo "RESULTADO: $falhas ataque(s) passaram — o guard precisa de conserto."
fi
trap - EXIT
rm -rf "$TMP"
exit "$falhas"
