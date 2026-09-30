#!/usr/bin/env python3
"""Atualiza os goldens de cotas em tests/legal.test.ts.

uso: atualizar_golden.py <prefixo dos arquivos de dump>

Atualiza:
  GOLDEN_POLITICA / GOLDEN_TERMOS  (prosa fixa, dump .<linhas>)
  GOLDEN_TEXTO[política|termos]    (texto do render real, dump .texto)
  GOLDEN_FONTE                     (valores da fonte, dump .fonte)
  GOLDEN_TAGS / GOLDEN_ATRIBUTOS   (vocabulário de DOM, dump .vocab)
"""
import json
import pathlib
import sys

ALVO = pathlib.Path("tests/legal.test.ts")
BASE = pathlib.Path(sys.argv[1])


def conteudo_golden(texto: str, marca: str) -> str:
    """Devolve o conteúdo entre crases longas a partir de `marca`."""
    i = texto.find(marca)
    assert i > 0, f"nao achei {marca}"
    ini = i + len(marca)
    j = texto.find("`", ini)
    assert j > ini, f"nao achei o fim do golden {marca}"
    return texto[ini:j]


def trocar_golden(texto: str, marca: str, novo: str) -> str:
    i = texto.find(marca)
    assert i > 0, f"nao achei {marca}"
    ini = i + len(marca)
    j = texto.find("`", ini)
    return texto[:ini] + novo + texto[j:]


def trocar_lista(texto: str, marca: str, valores: list) -> str:
    i = texto.find(marca)
    assert i > 0, f"nao achei {marca}"
    ini = i + len(marca)
    j = texto.find("];", ini)
    assert j > ini, f"nao achei o fim da lista {marca}"
    return texto[:ini - 1] + json.dumps(valores) + ";" + texto[j + 2 :]


def valida(v: str, qual: str) -> str:
    assert "`" not in v, f"{qual}: crase no golden"
    assert "${" not in v, f"{qual}: interpolacao no golden"
    return v


def main() -> int:
    t = ALVO.read_text(encoding="utf-8")

    # ── prosa fixa por página (uma linha JSON cada) ──────────────────────────
    prosa = [l for l in (BASE).read_text(encoding="utf-8").split("\n") if l.startswith('"')]
    if len(prosa) == 2:
        for const, linha, marca in (
            ("POLITICA", prosa[0], "const GOLDEN_POLITICA = `"),
            ("TERMOS", prosa[1], "const GOLDEN_TERMOS = `"),
        ):
            v = valida(json.loads(linha), const)
            print(f"{const}: {len(v)} chars")
            t = trocar_golden(t, marca, v)

    # ── texto visível do render REAL ─────────────────────────────────────────
    arq_texto = pathlib.Path(str(BASE) + ".texto")
    if arq_texto.exists():
        linhas = [l for l in arq_texto.read_text(encoding="utf-8").split("\n") if l.startswith('"')]
        if len(linhas) == 2:
            for nome, linha in (("política", linhas[0]), ("termos", linhas[1])):
                v = valida(json.loads(linha), f"TEXTO[{nome}]")
                print(f"GOLDEN_TEXTO[{nome}]: {len(v)} chars")
                t = trocar_golden(t, f'"{nome}": `', v)

    # ── valores da fonte ────────────────────────────────────────────────────
    arq_fonte = pathlib.Path(str(BASE) + ".fonte")
    if arq_fonte.exists():
        fonte = arq_fonte.read_text(encoding="utf-8").rstrip("\n")
        if fonte:
            valida(fonte, "FONTE")
            print(f"GOLDEN_FONTE: {len(fonte)} chars")
            t = trocar_golden(t, "const GOLDEN_FONTE = `", fonte)

    # ── vocabulário de DOM ──────────────────────────────────────────────────
    arq_vocab = pathlib.Path(str(BASE) + ".vocab")
    if arq_vocab.exists():
        linha = arq_vocab.read_text(encoding="utf-8").strip()
        if linha:
            v = json.loads(linha)
            print(f"TAGS: {len(v['tags'])} | ATRIBUTOS: {len(v['atributos'])}")
            t = trocar_lista(t, "const GOLDEN_TAGS: string[] = [", v["tags"])
            t = trocar_lista(t, "const GOLDEN_ATRIBUTOS: string[] = [", v["atributos"])

    ALVO.write_text(t, encoding="utf-8")
    print("goldens atualizados — LEIA O DIFF ANTES DE COMMITAR")
    return 0


if __name__ == "__main__":
    sys.exit(main())
