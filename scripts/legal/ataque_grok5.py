#!/usr/bin/env python3
"""Ataques da 5ª rodada do Grok 4.7, como arquivos (o heredoc inline quebrava o JSX).

uso: ataque_grok5.py <8|9|10> <caminho da pagina da privacidade>
"""
import pathlib
import sys

P = pathlib.Path(sys.argv[2])
N = sys.argv[1]

MENTIRA = (
    "Os dados são automaticamente excluídos ao fim do prazo, sem você pedir."
)
ALVO_H2 = "        <h2>9. Por quanto tempo guardamos</h2>"
ALVO_TAIL = (
    '            : " Especificamente: a rotina automática de expurgo'
    ' ainda não está no ar."}\n        </p>'
)


def ler() -> str:
    return P.read_text(encoding="utf-8")


def gravar(t: str) -> None:
    P.write_text(t, encoding="utf-8")


def ataque8() -> None:
    """'Não há dúvida:' satisfaz a negação exigida pelo laço de expurgo."""
    t = ler()
    assert ALVO_TAIL in t, "alvo 8 não encontrado"
    novo = f"{ALVO_TAIL}\n        <p>Não há dúvida: {MENTIRA}</p>"
    gravar(t.replace(ALVO_TAIL, novo, 1))


def ataque9() -> None:
    """A mesma mentira numa <div> — fora do laço que só olhava <p>."""
    t = ler()
    assert ALVO_H2 in t, "alvo 9 não encontrado"
    novo = f"{ALVO_H2}\n        <div>{MENTIRA}</div>"
    gravar(t.replace(ALVO_H2, novo, 1))


def ataque10() -> None:
    """<style> com classe: não vira atributo, o texto() não aplica CSS.

    Este é o ataque que derrubou minha afirmação de que 'nenhuma sintaxe escapa
    no HTML renderizado'.
    """
    t = ler()
    assert ALVO_H2 in t, "alvo 10 não encontrado"
    assert ALVO_TAIL in t, "alvo 10b não encontrado"
    t = t.replace(
        ALVO_H2,
        '        <style>{`.s{display:none}`}</style>\n        <div className="s">\n' + ALVO_H2,
        1,
    )
    t = t.replace(ALVO_TAIL, f"{ALVO_TAIL}\n        </div>", 1)
    gravar(t)


if __name__ == "__main__":
    {"8": ataque8, "9": ataque9, "10": ataque10}[N]()
