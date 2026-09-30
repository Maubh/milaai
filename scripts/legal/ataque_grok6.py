#!/usr/bin/env python3
"""Ataques da 6ª rodada do Grok 4.7: canal visível fora do `prosaDe`.

uso: ataque_grok6.py <11|12> <raiz do repo>
"""
import pathlib
import pathlib as _p
import sys

RAIZ = pathlib.Path(sys.argv[2])
N = sys.argv[1]


def ataque11() -> None:
    """Frase visível num data-URI de `<img>`.

    `prosaDe` faz `.replace(/<[^>]+>/g, "\\n")` e não olha atributo. O `%3E`
    evita `>` cru, então o regex de tag engole o `src` inteiro e o golden fica
    idêntico — mas o browser decodifica o data-URI e pinta a frase.
    """
    p = RAIZ / "app/(site)/privacidade/page.tsx"
    t = p.read_text(encoding="utf-8")
    alvo = "        <h2>9. Por quanto tempo guardamos</h2>"
    assert alvo in t, "alvo 11 não encontrado"
    frase = (
        "A guarda termina por conta própria quando o prazo chega, "
        "e você não precisa solicitar."
    )
    svg = (
        "%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='48'%3E"
        f"%3Ctext y='32' font-size='18'%3E{frase}%3C/text%3E%3C/svg%3E"
    )
    t = t.replace(
        alvo,
        f'        <img alt="" src="data:image/svg+xml,{svg}" />\n' + alvo,
        1,
    )
    p.write_text(t, encoding="utf-8")


def ataque12() -> None:
    """Frase nova CONCATENADA dentro de uma string da fonte.

    `instrumentar` troca a string inteira pela sentinela `«GOOGLE_LIMITED_USE»`,
    então a frase acrescentada desaparece do golden da prosa. Este ataque é o que
    motivou o GOLDEN_FONTE.
    """
    p = RAIZ / "lib/legal.ts"
    t = p.read_text(encoding="utf-8")
    alvo = 'incluindo os requisitos de Limited Use.";'
    assert alvo in t, "alvo 12 não encontrado"
    novo = (
        'incluindo os requisitos de Limited Use. " +\n'
        '  "A guarda termina por conta própria quando o prazo chega, '
        'e você não precisa solicitar.";'
    )
    t = t.replace(alvo, novo, 1)
    p.write_text(t, encoding="utf-8")


if __name__ == "__main__":
    {"11": ataque11, "12": ataque12}[N]()
