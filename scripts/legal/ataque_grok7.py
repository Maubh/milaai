#!/usr/bin/env python3
"""Ataques da 7a rodada do Grok 4.7: predicado sobre a sentinela da fonte.

Os dois ataques exploram o mesmo furo: o golden da prosa renderiza com a fonte
INSTRUMENTADA, entao um predicado sobre a string da fonte decide o que o browser
mostra sem aparecer em nenhum golden.

uso: ataque_grok7.py <13|14> <raiz do repo>
"""
import pathlib
import sys

RAIZ = pathlib.Path(sys.argv[2])
N = sys.argv[1]
P = RAIZ / "app/(site)/privacidade/page.tsx"
H2 = "        <h2>9. Por quanto tempo guardamos</h2>"


def ataque13() -> None:
    """Predicado sobre o COMPRIMENTO da sentinela.

    `«RETENCAO_NOTA»`.length vale 16; a string real passa de 200. Entao o ramo da
    mentira nem existe no render instrumentado -> golden da prosa intacto. E no
    HTML real a tag nova e `p` (ja no GOLDEN_TAGS), sem atributo novo.
    """
    t = P.read_text(encoding="utf-8")
    assert H2 in t, "alvo 13 nao encontrado"
    mentira = (
        "A guarda termina por conta propria quando o prazo chega, "
        "e voce nao precisa solicitar."
    )
    t = t.replace(
        H2,
        H2
        + "\n        {RETENCAO_NOTA.length > 100 ? (\n"
        + f"          <p>{mentira}</p>\n"
        + "        ) : null}",
        1,
    )
    P.write_text(t, encoding="utf-8")


def ataque14() -> None:
    """`replace` que mira o texto real e nao casa na sentinela.

    A sentinela nao contem o needle, entao o replace vira no-op no render
    instrumentado. No HTML real a negacao some, e os fragmentos congelados
    ("Limited Use", "avaliar credito, pontuacao ou risco", "sob contrato",
    "autorizacao especifica") continuam todos presentes.
    """
    t = P.read_text(encoding="utf-8")
    alvo = "        <p>{GOOGLE_LIMITED_USE}</p>"
    if alvo not in t:
        # busca generica pelo uso da constante
        import re

        m = re.search(r"\n(\s*)<p>\{GOOGLE_LIMITED_USE\}</p>", t)
        assert m, "alvo 14 nao encontrado"
        alvo = m.group(0).strip("\n")
    novo = (
        '        <p>{GOOGLE_LIMITED_USE.replace('
        '"Não usamos esses dados para publicidade, não os vendemos", '
        '"Usamos esses dados para publicidade e os vendemos")}</p>'
    )
    t = t.replace(alvo, novo, 1)
    P.write_text(t, encoding="utf-8")


if __name__ == "__main__":
    {"13": ataque13, "14": ataque14}[N]()
