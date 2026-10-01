## Plano Arquitetural – Inclusão do Bloco **“Giro e Estoque Parado”** no Balanço Mensal (Dia 1º)  
**Arquivos‑alvo:** `mila_router/balanco_runner.py` & `mila_router/pro_features.py`  

> **Regra de ouro da Mila:** **DETEMINÍSTICO, SEM ALUCINAÇÃO** – se não houver dados confiáveis, nada será inserido no relatório.

---

## 1. Requisitos e Contrato de Dados  

| ID | Requisito | Fonte de Dados | Formato esperado | Condição de inclusão |
|----|-----------|----------------|------------------|----------------------|
| **R‑01** | Identificar *produto(s) ou categoria(s)* com **maior volume de saída** no mês anterior. | `jueri_client.consultar_produtos(tenant_id, termo="vendas")` → lista de dicionários de produtos com campos `produto_id`, `nome`, `categoria`, `quantidade_vendida`. | `top_giro: List[Dict]` – até **3** itens, ordenados por `quantidade_vendida` desc. | Só se houver **pelo menos 1** registro de vendas. |
| **R‑02** | Alertar itens com **estoque crítico** (baixo). | `jueri_client.consultar_produtos(tenant_id, termo="estoque")` → lista com `estoque_atual`, `estoque_minimo`. | `alerta_reposicao: List[Dict]` – itens onde `estoque_atual ≤ estoque_minimo`. Limitado a **5** itens (ou menos). | Só se a lista não for vazia. |
| **R‑03** | Alertar itens com **capital parado** (estoque alto, sem saída recente). | Mesclar duas chamadas: <br>1. `consultar_produtos(..., termo="estoque")` → `estoque_atual`.<br>2. `consultar_produtos(..., termo="vendas")` → `última_venda` (data ou quantidade nos últimos 30 d). | `alerta_estocado: List[Dict]` – itens onde `estoque_atual ≥ 2 × estoque_medio_mensal` **e** `última_venda` > 30 dias ou `quantidade_vendida = 0`. Limitado a **5** itens. | Só se a lista não for vazia. |
| **R‑04** | **Fallback**: Caso o cliente **não tenha ERP conectado** ou alguma chamada retorne erro/​dados insuficientes, **não gerar** este bloco. | Verificar flag `tenant.has_erp` (campo já existente em `memoria`). | – | Se `False` → pular bloco. |
| **R‑05** | **Determinismo**: ordenação, limites e formatação devem ser *sempre* iguais para o mesmo conjunto de dados. | Uso de ordenação explícita (`sorted(..., key=..., reverse=True)`) e limites fixos. | – | – |

### Contrato de Dados (JSON‑like) entre `jueri_client` e o novo módulo

```json
{
  "vendas": [
    {
      "produto_id": "string",
      "nome": "string",
      "categoria": "string",
      "quantidade_vendida": "int",
      "data_ultima_venda": "YYYY-MM-DD"
    }
  ],
  "estoque": [
    {
      "produto_id": "string",
      "nome": "string",
      "categoria": "string",
      "estoque_atual": "int",
      "estoque_minimo": "int",
      "estoque_medio_mensal": "int"
    }
  ]
}
```

- **Campos Obrigatórios**: `produto_id`, `nome`, `categoria`.  
- **Campos Opcionais** (para futuros ERPs): `unidade`, `valor_custo`, etc. O código deve ignorar campos desconhecidos.

---

## 2. Integração Modular  

### 2.1. Estrutura de Pacotes  

```
mila_router/
│
├─ balanco_runner.py          # Orquestração do balanço diário
├─ pro_features.py            # Texto já existente + novo bloco
├─ jueri_client.py            # Cliente Jueri (já existente)
├─ erp/
│   ├─ __init__.py
│   ├─ base.py                # Interface abstrata (ABC) para todos os ERPs
│   ├─ jueri_adapter.py       # Implementação concreta para Jueri
│   ├─ bling_adapter.py       # Stub futuro
│   └─ olist_adapter.py       # Stub futuro
└─ utils/
    └─ formatting.py          # Funções de formatação determinística
```

### 2.2. Camada de **Adapter** (Padrão *Adapter / Strategy*)

```python
# mila_router/erp/base.py
from abc import ABC, abstractmethod
from typing import List, Dict

class ERPAdapter(ABC):
    @abstractmethod
    def vendas_mes(self, tenant_id: str, ano: int, mes: int) -> List[Dict]: ...
    @abstractmethod
    def estoque_atual(self, tenant_id: str) -> List[Dict]: ...
```

```python
# mila_router/erp/jueri_adapter.py
from .base import ERPAdapter
from mila_router.jueri_client import JueriClient

class JueriAdapter(ERPAdapter):
    def __init__(self):
        self.client = JueriClient()

    def vendas_mes(self, tenant_id, ano, mes):
        # O termo "vendas" traz todas as vendas do período.
        return self.client.consultar_produtos(tenant_id, termo="vendas",
                                              ano=ano, mes=mes)

    def estoque_atual(self, tenant_id):
        return self.client.consultar_produtos(tenant_id, termo="estoque")
```

*Para futuros ERPs*: basta criar `blinq_adapter.py`, `olist_adapter.py` implementando a mesma interface e registrar no **factory**.

### 2.3. **Factory** de Adapters

```python
# mila_router/erp/__init__.py
from .jueri_adapter import JueriAdapter
# from .bling_adapter import BlingAdapter   # futuro
# from .olist_adapter import OlistAdapter   # futuro

_ADAPTER_MAP = {
    "jueri": JueriAdapter,
    # "bling": BlingAdapter,
    # "olist": OlistAdapter,
}

def get_adapter(erp_name: str) -> ERPAdapter:
    cls = _ADAPTER_MAP.get(erp_name)
    if cls is None:
        raise ValueError(f"ERP desconhecido: {erp_name}")
    return cls()
```

### 2.4. Modificação no **balanco_runner.py**

```python
# mila_router/balanco_runner.py
from .pro_features import texto_balanco_do_mes
from .erp import get_adapter
from .memoria import tenant_info   # supõe que tem .has_erp e .erp_name

def gerar_balanco_dia_01(tenant_id, ano, mes):
    # Dados de compras já existentes
    compras = memoria.compras_do_mes(tenant_id, ano, mes)

    # Bloco adicional (giro/estoque) – só se ERP conectado
    extra = ""
    tenant = tenant_info(tenant_id)   # retorna dict com has_erp, erp_name
    if tenant.get("has_erp"):
        adapter = get_adapter(tenant["erp_name"])
        extra = texto_giro_e_estoque(
            tenant_id, ano, mes, adapter
        )   # função nova em pro_features.py

    return texto_balanco_do_mes(compras) + extra
```

### 2.5. Nova Função em **pro_features.py**

```python
# mila_router/pro_features.py
from .utils.formatting import (
    format_top_giro,
    format_alerta_reposicao,
    format_alerta_estocado,
)

def texto_giro_e_estoque(tenant_id, ano, mes, adapter):
    # 1) Dados brutos
    vendas = adapter.vendas_mes(tenant_id, ano, mes)
    estoque = adapter.estoque_atual(tenant_id)

    # 2) Guardar apenas se houver dados suficientes
    if not vendas and not estoque:
        return ""   # nada a acrescentar

    # ------------------------------
    # 2.1) Maior Giro
    top_giro = sorted(
        vendas,
        key=lambda x: x.get("quantidade_vendida", 0),
        reverse=True,
    )[:3]

    # 2.2) Reposição Crítica
    alerta_reposicao = [
        p for p in estoque
        if p.get("estoque_atual", 0) <= p.get("estoque_minimo", 0)
    ][:5]

    # 2.3) Capital Parado
    # cruzar estoque e vendas (última venda >30d ou 0)
    vendas_por_id = {v["produto_id"]: v for v in vendas}
    alerta_estocado = []
    for e in estoque:
        v = vendas_por_id.get(e["produto_id"], {})
        ultima = v.get("data_ultima_venda")
        qtd30 = v.get("quantidade_vendida_30d", 0)

        # regra determinística
        cond1 = e.get("estoque_atual", 0) >= 2 * e.get("estoque_medio_mensal", 0)
        cond2 = (
            (ultima and (datetime.date.today() - datetime.datetime.strptime(ultima, "%Y-%m-%d").date()).days > 30)
            or qtd30 == 0
        )
        if cond1 and cond2:
            alerta_estocado.append(e)

    alerta_estocado = alerta_estocado[:5]

    # ------------------------------
    # 3) Formatação – tudo via utils.formatting (determinístico)
    partes = []
    if top_giro:
        partes.append(format_top_giro(top_giro))
    if alerta_reposicao:
        partes.append(format_alerta_reposicao(alerta_reposicao))
    if alerta_estocado:
        partes.append(format_alerta_estocado(alerta_estocado))

    if not partes:
        return ""   # não há nada relevante

    texto = "\n\n*📊 Giro & Estoque Parado – {:%B/%Y}*\n".format(
        datetime.date(ano, mes, 1)
    ) + "\n".join(partes)

    return texto
```

### 2.6. **utils/formatting.py** – Garantia de Determinismo

```python
# mila_router/utils/formatting.py
import datetime

def _emoji(val):   # helper para visual sempre igual
    return "⚠️" if val else "✅"

def format_top_giro(itens):
    linhas = ["*Top 3 Produtos de Giro*"]
    for i, p in enumerate(itens, 1):
        nome = p.get("nome", "Sem nome")
        qtd = p.get("quantidade_vendida", 0)
        linhas.append(f"{i}. {nome} – {qtd} unidade(s) vendida(s)")
    return "\n".join(linhas)

def format_alerta_reposicao(itens):
    linhas = ["*⚡️ Produtos com Estoque Crítico*"]
    for p in itens:
        nome = p.get("nome", "Sem nome")
        atual = p.get("estoque_atual", 0)
        minimo = p.get("estoque_minimo", 0)
        linhas.append(f"• {nome}: {atual} (mínimo {minimo}) {_emoji(atual <= minimo)}")
    return "\n".join(linhas)

def format_alerta_estocado(itens):
    linhas = ["*💰 Capital Parado – Itens com estoque alto e pouca rotatividade*"]
    for p in itens:
        nome = p.get("nome", "Sem nome")
        estoque = p.get("estoque_atual", 0)
        medio = p.get("estoque_medio_mensal", 0)
        linhas.append(f"• {nome}: {estoque} unidades (média {medio})")
    return "\n".join(linhas)
```

- Cada função devolve **texto puro** (sem *f-strings* que dependam de ordem aleatória).  
- As listas já chegam **ordenadas** ou são limitadas antes da formatação, garantindo que duas execuções com o mesmo input gerem exatamente o mesmo output.

---

## 3. Formatação Determinística da Mensagem no WhatsApp  

1. **Header fixo** – Sempre o mesmo emoji e padrão de data.  
2. **Separadores** – `\n\n` entre blocos (não dependem de quebras dinâmicas).  
3. **Limite de itens** – 3 / 5 / 5 (top‑giro, reposição, estoque parado).  
4. **Ordenação** –  
   - *Giro*: `quantidade_vendida` desc → `nome` asc (tiebreak).  
   - *Reposição*: `estoque_atual` asc → `nome` asc.  
   - *Estocado*: `estoque_atual` desc → `nome` asc.  
5. **Formato de números** – Inteiros sem separadores de milhar (ex.: `1500` → `1 500` só se houver *locale* definido; aqui optamos por manter puro).  
6. **Não há valores monetários** – Caso futuros ERPs forneçam custos, o bloco será **estendido** em nova etapa; por enquanto evitamos cálculos que possam gerar estimativas.  
7 **Unicode estático** – Emojis `*📊*`, `*⚡️*`, `*💰*`, `*✅*`, `*⚠️*` nunca mudam.  

**Exemplo de mensagem final (determinística):**

```
*📊 Balanço de Compras – Março/2024*
...

*📊 Giro & Estoque Parado – 03/2024*

*Top 3 Produtos de Giro*
1. Camiseta Básica – 452 unidade(s) vendida(s)
2. Tênis Esportivo – 320 unidade(s) vendida(s)
3. Blusa de Frio – 215 unidade(s) vendida(s)

*⚡️ Produtos com Estoque Crítico*
• Caneta Azul: 2 (mínimo 5) ⚠️
• Capa de Caderno: 0 (mínimo 3) ⚠️

*💰 Capital Parado – Itens com estoque alto e pouca rotatividade*
• Mochila Escolar: 120 unidades (média 30)
• Garrafa Térmica: 85 unidades (média 22)
```

---

## 4. Estratégia de Testes para **Regressão Zero**  

### 4.1. Tipos de Testes  

| Tipo | Objetivo | Ferramenta | Comentário |
|------|----------|----------|------------|
| **Unitário** | Verificar cada função de formatação, cálculo de top‑giro, filtros de alerta e ordenação. | `pytest` + `pytest-mock` | Mock de `JueriAdapter` para retornar datasets fixos. |
| **Integração** | Garantir que `balanco_runner` encadeia corretamente: `memoria → adapter → pro_features`. | `pytest` + `requests-mock` (se houver HTTP interno). |
| **Contract Test** | Validar que o contrato JSON do `jueri_client` está sendo respeitado (campos obrigatórios). | `schemathesis` ou `pydantic` schema validation. |
| **End‑to‑End (sandbox)** | Simular a geração do texto completo (WhatsApp) com dados reais de teste. | Script de CLI que chama `gerar_balanco_dia_01`. |
| **Performance** | Assegurar que a inclusão do bloco não eleva o tempo de execução > 200 ms (limite SLA). | `pytest-benchmark`. |
| **Determinismo** | **Mesmo input → mesmo output**. Executar a geração 10 vezes consecutivas e comparar hashes. | `hashlib.sha256`. |

### 4.2. Dados de Teste (Fixture “determinístico”)  

```json
{
  "vendas": [
    {"produto_id":"p1","nome":"Camiseta Básica","categoria":"Roupas","quantidade_vendida":452,"data_ultima_venda":"2024-02-28"},
    {"produto_id":"p2","nome":"Tênis Esportivo","categoria":"Calçados","quantidade_vendida":320,"data_ultima_venda":"2024-02-20"},
    {"produto_id":"p3","nome":"Blusa de Frio","categoria":"Roupas","quantidade_vendida":215,"data_ultima_venda":"2024-02-15"}
  ],
  "estoque": [
    {"produto_id":"p1","nome":"Camiseta Básica","categoria":"Roupas","estoque_atual":50,"estoque_minimo":10,"estoque_medio_mensal":30},
    {"produto_id":"p4","nome":"Caneta Azul","categoria":"Material Office","estoque_atual":2,"estoque_minimo":5,"estoque_medio_mensal":8},
    {"produto_id":"p5","nome":"Capa de Caderno","categoria":"Material Office","estoque_atual":0,"estoque_minimo":3,"estoque_medio_mensal":5},
    {"produto_id":"p6","nome":"Mochila Escolar","categoria":"Bolsas","estoque_atual":120,"estoque_minimo":20,"estoque_medio_mensal":30},
    {"produto_id":"p7","nome":"Garrafa Térmica","categoria":"Utensílios","estoque_atual":85,"estoque_minimo":15,"estoque_medio_mensal":22}
  ]
}
```

- **Cenário 1** – ERP conectado → espera bloco completo.  
- **Cenário 2** – Sem ERP (`has_erp=False`) → output **sem** bloco.  
- **Cenário 3** – Dados incompletos (ex.: só estoque, sem vendas) → bloco com apenas alertas de reposição/estocado, sem top‑giro.  

### 4.3. Pipeline de CI  

1. **Instalação** → `pip install -e .[test]`.  
2. **Rodar testes unitários** → `pytest -q`.  
3. **Verificar determinismo** → script `scripts/check_determinism.py` que gera duas mensagens e compara SHA256. Falha se diferentes.  
4. **Cobertura mínima** → `pytest --cov=mila_router --cov-fail-under=90`.  
5. **Bench** → `pytest --benchmark-only`.  
6. **Deploy guardado** → somente permite *merge* se **todos** os passos acima PASSarem.

### 4.4. Estratégia de **Rollback**  

- O código que injeta o bloco está encapsulado em `texto_giro_e_estoque`.  
- Em caso de falha inesperada em produção, o *feature flag* `ENABLE_GIRO_ESTAQUE` (arquivo `config.py`) pode ser setado para `False`, fazendo o `balanco_runner` retornar apenas o texto antigo.  
- O flag default será `True` a partir da versão **vX.Y** após a validação de regressão.

---

## 📌 Resumo das Ações a Implementar  

| Etapa | Arquivo | Descrição | PR | Testes |
|------|---------|------------|----|--------|
| 1️⃣  | `mila_router/erp/base.py` | Interface ABC para ERPs. | PR‑001 | Unitários |
| 2️⃣  | `mila_router/erp/jueri_adapter.py` | Adapter para Jueri (já existia client). | PR‑002 | Unitários + Integration |
| 3️⃣  | `mila_router/erp/__init__.py` | Factory + mapa de adapters. | PR‑003 | Unitários |
| 4️⃣  | `mila_router/utils/formatting.py` | Funções de formatação determinística. | PR‑004 | Unitários |
| 5️⃣  | `mila_router/pro_features.py` | `texto_giro_e_estoque` + chamadas ao adapter. | PR‑005 | Unitários, Integration, Determinismo |
| 6️⃣  | `mila_router/balanco_runner.py` | Orquestração + flag `has_erp`. | PR‑006 | End‑to‑End, Performance |
| 7️⃣  | `tests/` | Fixtures, mocks, scripts de determinismo. | PR‑007 | Todos |
| 8️⃣  | `config.py` | Feature flag `ENABLE_GIRO_ESTAQUE`. | PR‑008 | Unitários |
| 9️⃣  | `scripts/check_determinism.py` | Verifica idempotência. | PR‑009 | CI pipeline |

Com este plano, o bloco **“Giro e Estoque Parado”** será adicionado ao balanço mensal de forma **determinística**, **modular** (pronto para novos ERPs) e **totalmente testada**, preservando a regra de ouro da Mila: *nada de alucinação, só dados reais*. 🚀
