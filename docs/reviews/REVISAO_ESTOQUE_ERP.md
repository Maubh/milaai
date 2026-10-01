=== REVISAO COM ag/gemini-3.8-flash ===
Aqui está a revisão técnica minuciosa e crítica do módulo, seguida pelo código corrigido para produção.

---

### 1. Diagnóstico Crítico e Brechas Técnicas Encontradas

#### A. Discrepância Fatal de Tipo com a API Jueri v1 (Bug Silencioso)
* **O Erro:** No código analisado:
  ```python
  produtos = jueri_client.consultar_produtos(tenant_id, termo="")
  if not produtos or not isinstance(produtos, list):
      return ""
  ```
* **O Impacto:** O `jueri_client.consultar_produtos` retorna um payload no formato `{"ok": True, "produtos": [...]}` (ou `{"ok": False, "erro": "..."}`). Como o retorno é um `dict`, a validação `isinstance(produtos, list)` avalia sempre para `False`. **O módulo nunca retornará nenhum dado em produção**, silenciando a funcionalidade por completo.

#### B. Falso Positivo Crítico em "Estoque Parado" (Alucinação Heurística)
* **O Erro:** A condição:
  ```python
  elif "movimentacao" not in item and "vendas_recentes" not in item and saldo >= 15:
      is_parado = True
  ```
* **O Impacto:** O endpoint de catálogo de produtos do Jueri v1 **não** inclui telemetria de vendas agregadas (`vendas_recentes`/`movimentacao`) por padrão. Com essa regra cega, **todo produto recém-reposto ou de alto giro com mais de 15 unidades seria incorretamente categorizado como "capital parado"**, gerando avisos alarmantes e sem sentido para os lojistas no WhatsApp.
* **Correção:** Sem dados explícitos de data de última movimentação ou contagem de vendas, saldo alto é apenas volume de estoque, não estoque estagnado. A classificação de parado deve exigir indicadores confiáveis (`dias_sem_venda`, flags explícitas ou presença comprovada de histórico zerado).

#### C. Tratamento Inadequado de Estoque Negativo/Zerado
* **O Erro:** Se um item estiver com saldo `<= 0` (muito comum em ERPs com venda sem estoque ou furos de inventário), o texto gerado exibirá: `resta(m) apenas *-3 un.*`.
* **Correção:** Saldo `<= 0` deve ser tratado como esgotado/ruptura crítica (`0 un. (Esgotado)` ou `Ruptura`), separando itens com poucas unidades de itens já zerados.

#### D. Riscos de Performance e Timeout
* Consultar produtos com `termo=""` sem paginação/limite pode puxar milhares de itens de uma só vez. Embora o processamento em memória seja rápido, a iteração deve ser protegida com geradores/limites seguros e proteção contra payloads corrompidos ou chaves aninhadas (ex: Jueri costuma usar `categoria_nome` ou dicionários aninhados em `categoria`).

---

### 2. Código Corrigido e Otimizado (`mila_router/estoque_analise.py`)

```python
"""Módulo de inteligência e análise de estoque para a Mila AI.

Processa dados brutos de ERPs (Jueri, Bling, etc.), identifica gargalos,
necessidades de reposição e capital estagnado de forma determinística e resiliente.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def _to_float(valor: Any, padrao: float = 0.0) -> float:
    """Converte valores variados de ERP (None, str com vírgula, int) para float seguro."""
    if valor is None:
        return padrao
    if isinstance(valor, (int, float)):
        return float(valor)
    try:
        texto = str(valor).strip().replace("R$", "").replace(" ", "")
        if "," in texto and "." in texto:
            texto = texto.replace(".", "").replace(",", ".")
        elif "," in texto:
            texto = texto.replace(",", ".")
        return float(texto)
    except (ValueError, TypeError):
        return padrao


def _to_int(valor: Any, padrao: int = 0) -> int:
    """Converte valores com segurança para inteiro, tratando floats em strings."""
    if valor is None:
        return padrao
    try:
        return int(float(_to_float(valor, float(padrao))))
    except (ValueError, TypeError):
        return padrao


def _formatar_moeda(valor: float) -> str:
    """Formata valor float para moeda brasileira (R$ X.XXX,XX)."""
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _extrair_categoria(item: dict[str, Any]) -> str:
    """Extrai nome da categoria tratando tanto strings quanto objetos aninhados do ERP."""
    cat = item.get("categoria") or item.get("grupo") or item.get("departamento")
    if isinstance(cat, dict):
        return str(cat.get("nome") or cat.get("descricao") or "Geral").strip()
    if cat:
        return str(cat).strip()
    return "Geral"


def analisar_estoque_erp(produtos: list[dict[str, Any]]) -> dict[str, Any]:
    """Analisa o catálogo de produtos do ERP de forma resiliente e conservadora.

    Args:
        produtos: Lista de dicionários contendo dados brutos dos produtos.

    Returns:
        dict com categorias agregadas, alertas de reposição e estoque parado.
    """
    if not isinstance(produtos, list) or not produtos:
        return {
            "top_categorias": [],
            "reposicao": [],
            "parados": [],
            "capital_parado_total": 0.0,
        }

    categorias_map: dict[str, dict[str, float]] = {}
    reposicao: list[dict[str, Any]] = []
    parados: list[dict[str, Any]] = []
    capital_parado_total = 0.0

    for item in produtos:
        if not isinstance(item, dict):
            continue

        nome = str(item.get("nome") or item.get("descricao") or "Item Sem Nome").strip()
        codigo = str(item.get("codigo") or item.get("referencia") or item.get("id") or "").strip()
        categoria = _extrair_categoria(item)

        # Resolução defensiva de saldo/quantidade
        saldo_bruto = (
            item.get("saldo")
            if item.get("saldo") is not None
            else item.get("estoque", item.get("quantidade", 0))
        )
        saldo = _to_int(saldo_bruto)

        # Regras financeiras de custo e preço
        custo = _to_float(item.get("custo") or item.get("preco_custo") or item.get("valor_custo", 0.0))
        preco = _to_float(item.get("preco") or item.get("preco_venda") or item.get("valor", custo))

        # Estoque mínimo configurado no ERP
        minimo_bruto = item.get("estoque_minimo") or item.get("minimo")
        estoque_minimo = _to_int(minimo_bruto) if minimo_bruto is not None else None

        # 1. Agregação financeira por categoria (considera apenas saldo positivo)
        if saldo > 0:
            if categoria not in categorias_map:
                categorias_map[categoria] = {"pecas": 0.0, "valor": 0.0}
            categorias_map[categoria]["pecas"] += saldo
            valor_referencia = preco if preco > 0 else custo
            categorias_map[categoria]["valor"] += saldo * valor_referencia

        # 2. Avaliação de Reposição Crítica (Ruptura ou iminência)
        # Saldo <= mínimo configurado OU saldo crítico de até 2 peças
        precisa_reposicao = False
        if estoque_minimo is not None and estoque_minimo > 0:
            if saldo <= estoque_minimo:
                precisa_reposicao = True
        elif saldo <= 2:
            precisa_reposicao = True

        if precisa_reposicao:
            reposicao.append({
                "codigo": codigo,
                "nome": nome,
                "categoria": categoria,
                "saldo": max(saldo, 0),  # Evita expor saldos negativos brutos
                "esgotado": saldo <= 0,
                "estoque_minimo": estoque_minimo if estoque_minimo is not None else 2,
            })

        # 3. Avaliação de Estoque Parado
        # Exige evidência real de estagnação para evitar falsos positivos
        dias_sem_venda = _to_int(item.get("dias_sem_venda", item.get("dias_parado", 0)))
        flag_parado = bool(item.get("parado", False) or item.get("sem_giro", False))
        tem_telemetria_vendas = any(k in item for k in ("movimentacao", "vendas_recentes", "vendas_30d"))
        
        movimentacao = _to_int(
            item.get("movimentacao")
            if item.get("movimentacao") is not None
            else item.get("vendas_recentes", item.get("vendas_30d", -1))
        )

        is_parado = False
        if saldo >= 5:
            if flag_parado or dias_sem_venda >= 45:
                is_parado = True
            elif tem_telemetria_vendas and movimentacao == 0:
                is_parado = True

        if is_parado:
            valor_custo_total = (saldo * custo) if custo > 0 else 0.0
            capital_parado_total += valor_custo_total
            parados.append({
                "codigo": codigo,
                "nome": nome,
                "categoria": categoria,
                "saldo": saldo,
                "custo_unitario": custo,
                "capital_parado": valor_custo_total,
                "dias_sem_venda": dias_sem_venda,
            })

    # Ordenações determinísticas
    top_categorias = sorted(
        [
            (cat, int(dados["pecas"]), round(dados["valor"], 2))
            for cat, dados in categorias_map.items()
        ],
        key=lambda x: x[2],
        reverse=True,
    )

    # Reposição: Itens esgotados e menores saldos primeiro
    reposicao.sort(key=lambda x: (0 if x["esgotado"] else 1, x["saldo"]))

    # Parados: Maior capital imobilizado primeiro
    parados.sort(key=lambda x: x["capital_parado"], reverse=True)

    return {
        "top_categorias": top_categorias[:5],
        "reposicao": reposicao,
        "parados": parados,
        "capital_parado_total": round(capital_parado_total, 2),
    }


def texto_bloco_estoque(tenant_id: str) -> str:
    """Gera o bloco de texto formatado de estoque para o WhatsApp da Mila AI.

    Desempacota respostas do Jueri v1 com segurança e gera saída concisa.
    """
    if not tenant_id or not isinstance(tenant_id, str):
        return ""

    try:
        from mila_router import integracoes, jueri_client
    except ImportError:
        logger.warning("Módulos de integração/ERP indisponíveis.")
        return ""

    try:
        erp = integracoes.erp_conectado(tenant_id)
        if not erp:
            return ""

        produtos: list[dict[str, Any]] = []
        erp_nome = erp if isinstance(erp, str) else str(erp.get("provedor", "")).lower()

        if "jueri" in erp_nome.lower() or erp is True:
            # Resolução do retorno Jueri v1: {"ok": True, "produtos": [...]}
            resposta = jueri_client.consultar_produtos(tenant_id, termo="")
            if isinstance(resposta, dict):
                if not resposta.get("ok", True) and "produtos" not in resposta:
                    logger.warning("Falha na consulta Jueri para tenant %s: %s", tenant_id, resposta.get("erro"))
                    return ""
                produtos = resposta.get("produtos") or resposta.get("itens") or []
            elif isinstance(resposta, list):
                produtos = resposta
        else:
            logger.info("Provedor ERP %s sem coletor configurado.", erp_nome)
            return ""

        if not produtos or not isinstance(produtos, list):
            return ""

        analise = analisar_estoque_erp(produtos)
        top_categorias = analise["top_categorias"]
        reposicao = analise["reposicao"]
        parados = analise["parados"]
        capital_parado_total = analise["capital_parado_total"]

        if not top_categorias and not reposicao and not parados:
            return ""

        linhas: list[str] = ["📦 *Panorama de Estoque*"]

        # 1. Top Categorias
        if top_categorias:
            linhas.append("\n*Distribuição em Estoque:*")
            for cat, qtd, valor in top_categorias[:3]:
                linhas.append(f"• {cat}: {qtd} un. ({_formatar_moeda(valor)})")

        # 2. Alertas de Reposição
        if reposicao:
            linhas.append(f"\n⚠️ *Atenção à Reposição* ({len(reposicao)} itens críticos):")
            for item in reposicao[:4]:
                cod_str = f" [{item['codigo']}]" if item["codigo"] else ""
                if item["esgotado"]:
                    linhas.append(f"• {item['nome']}{cod_str}: *ESGOTADO*")
                else:
                    linhas.append(f"• {item['nome']}{cod_str}: resta(m) apenas *{item['saldo']} un.*")
            
            if len(reposicao) > 4:
                linhas.append(f"  _...e mais {len(reposicao) - 4} itens no limite crítico._")

        # 3. Capital Parado
        if parados:
            linhas.append("\n💤 *Oportunidade de Giro (Estoque Parado):*")
            if capital_parado_total > 0:
                linhas.append(f"Capital imobilizado estimado: *{_formatar_moeda(capital_parado_total)}*")

            for item in parados[:3]:
                cod_str = f" [{item['codigo']}]" if item["codigo"] else ""
                val_str = f" ({_formatar_moeda(item['capital_parado'])})" if item["capital_parado"] > 0 else ""
                linhas.append(f"• {item['nome']}{cod_str}: {item['saldo']} un.{val_str}")

            if len(parados) > 3:
                linhas.append(f"  _...e mais {len(parados) - 3} itens sem movimentação._")

        return "\n".join(linhas)

    except Exception as exc:
        logger.error("Erro ao gerar bloco de estoque para tenant %s: %s", tenant_id, exc, exc_info=True)
        return ""
```
