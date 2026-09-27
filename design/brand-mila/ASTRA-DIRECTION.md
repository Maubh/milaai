# mila.ai — direção de identidade

26 de setembro de 2026 · Desenvolvimento Astra · Proposta de marca para avaliação.

## Decisão

Uma marca de negócios próxima e adulta, com o desenho arredondado já aprovado e uma assinatura verde mineral. O produto apoia quem vende **joias e semijoias** a tomar decisões concretas no WhatsApp; a identidade deve transmitir clareza, atenção e domínio dos números. A relação com os dois segmentos entra na qualidade dos materiais, no cuidado com fotografia e na composição editorial, sem representar a assistente como uma joalheria.

A primeira logo foi mantida como autoridade visual. Seu `m` com dois arcos e pequena separação diagonal tem mais personalidade que a substituição por uma fonte pronta. O novo símbolo `m.` utiliza exatamente os mesmos dois caminhos do `m` do logotipo. O ponto deriva do ponto entre `mila` e `ai`, com o mesmo diâmetro. Funciona como assinatura compacta para avatar e ícone.

## Cor

| Nome | HEX | Papel |
| --- | --- | --- |
| Verde mineral | `#173F3B` | Assinatura, CTA principal, fundos institucionais, títulos pontuais. |
| Marfim | `#F6F3ED` | Fundo predominante e logotipo inverso. |
| Tinta | `#1E2B28` | Texto corrido, informações e números. |
| Areia | `#D9CBB8` | Superfícies secundárias e apoio editorial. |
| Sálvia | `#8FA89B` | Apoio gráfico discreto, nunca texto claro sobre marfim. |
| Preto / branco | `#000000` / `#FFFFFF` | Reprodução técnica monocromática. |

O verde mineral equilibra sobriedade com calor, conversa bem com metais e materiais naturais e se diferencia do azul tecnológico mais previsível. Sua profundidade comunica uma ferramenta de trabalho com presença tranquila. O marfim preserva a sensação acolhedora que já existia no site. A areia substitui a necessidade de dourado decorativo.

Distribuição sugerida para páginas claras: 75–85% de superfícies marfim/branco, 10–20% de texto e assinatura mineral/tinta, até 5–10% de areia/sálvia. Não são cotas rígidas; servem para evitar que todos os componentes ganhem uma cor diferente. Em peças institucionais, o mineral pode dominar toda a superfície.

Não utilizar vinho, roxo ou dourado metálico como cores da marca. A cor real de uma joia pode aparecer naturalmente em fotografia. Evitar degradês no logotipo, brilhos, sombras, contornos artificiais e efeitos 3D.

### Contraste calculado

- Verde mineral sobre marfim, e inverso: **10,47:1**.
- Tinta sobre marfim: **13,25:1**.
- Verde mineral sobre areia: **7,28:1**.
- Marfim sobre sálvia: **2,30:1**, inadequado para texto. A sálvia fica restrita a apoio gráfico ou exige tinta escura.

Valores obtidos por luminância relativa sRGB. Cor de marca não substitui a cor semântica de erro, alerta ou sucesso. Toda indicação de estado deve ter texto ou ícone junto da cor.

## Logotipo e arquivos

Os SVGs são vetores reais: caminhos Bézier e círculos, sem fonte, texto visual, bitmap embutido, filtros ou recursos externos. O elemento `title` só fornece descrição acessível. O avatar adiciona um retângulo sólido e transformação geométrica.

| Uso | Arquivos em `vectors/` |
| --- | --- |
| Assinatura horizontal principal | `wordmark-mineral.svg` |
| Assinatura horizontal inversa | `wordmark-ivory.svg` |
| Assinatura monocromática | `wordmark-black.svg`, `wordmark-white.svg` |
| Símbolo isolado | `symbol-mineral.svg`, `symbol-ivory.svg`, `symbol-black.svg`, `symbol-white.svg` |
| Avatar quadrado pronto para recorte circular | `avatar-mineral.svg`, `avatar-ivory.svg`, `avatar-black.svg`, `avatar-white.svg` |
| Avatar alternativo solicitado, símbolo mineral em branco | `avatar-mineral-on-white.svg` |

O arquivo `wordmark-mineral.svg` é o master para fundos claros. O inverso institucional é `wordmark-ivory.svg` sobre verde mineral. Preto e branco atendem carimbos, produção monocromática e situações técnicas. Não usar versões marfim/branca sobre fundo claro.

### Fidelidade e método

Fonte visual: `design/logo-concepts/01-wordmark.png`, imagem 1774 × 887 px. A área da assinatura foi comparada em recorte 844 × 224 px, origem x=466, y=332.

O desenho foi reconstruído manualmente em curvas Bézier, seguindo a silhueta original e conservando proporção, terminais arredondados, cortes, espaçamento e pequenas assimetrias. Houve uma revisão óptica de espessura. **Não é um rastreio matematicamente exato de cada pixel**, nem uma troca por tipografia comercial. Textura, franjas de transparência e irregularidades de rasterização do PNG foram removidas para produzir contornos limpos e uma cor plana.

Comparação entre as máscaras de alfa acima de 50% do original e do SVG renderizado: 64.987 pixels de interseção / 66.593 de união = **97,59% de sobreposição de silhueta (IoU)**. Essa medida verifica proximidade geométrica; não avalia cor nem reprodução dos ruídos do PNG. Prova visual em `validation/original-vs-vector.png`: original em cima, vetor embaixo.

### Proporção, respiro e tamanho

- Logotipo: viewBox `0 0 844 224`, proporção aproximada 3,77:1. Não esticar, comprimir ou alterar o espaçamento entre letras.
- Símbolo: viewBox `0 68 308 156`. O mesmo `m` do master aparece com ponto proporcional à direita, separado por aproximadamente 22,75 unidades do seu terminal. Não acrescentar outros círculos, balões ou contornos.
- Unidade de proteção `x`: diâmetro do ponto, **41,5 unidades** do master. Reservar pelo menos `1x` em todos os lados do logotipo e do símbolo; idealmente `1,5x` em aplicações institucionais.
- Os arquivos transparentes contêm somente o desenho; o respiro deve ser acrescentado na aplicação. O avatar já inclui sua margem interna.
- Logotipo digital: recomendado a partir de **160 px** de largura; mínimo de referência **128 px**, sujeito à renderização do dispositivo. Para cabeçalho, 144–168 px produz uma presença discreta e legível.
- Símbolo digital: mínimo de referência **32 px de largura**. Avatar completo: **48 px**, preferencialmente 64 px ou mais. Em favicon muito pequeno, usar o símbolo com respiro reduzido e testar a rasterização, sem impor o avatar inteiro.
- Impressão: referência mínima de **25 mm** para o logotipo e **8 mm** para o símbolo. Fazer prova no material e processo escolhidos; relevo, bordado e gravação podem exigir ampliação.
- O avatar usa canvas de **512 × 512**, símbolo escalado em 1,18 e posicionado opticamente. O conjunto cabe dentro de um círculo central de raio 210 px, preservando folga em recortes circulares da plataforma. Não reenquadrar para preencher toda a imagem.

## Tipografia de apoio

**Manrope** em todo o sistema, em continuidade com os títulos atuais do site. Ela acompanha a geometria da marca, tem leitura confortável e evita introduzir uma segunda personalidade tipográfica desnecessária. O logotipo permanece um desenho independente: nunca escrever `mila.ai` em Manrope para tentar reproduzi-lo.

- Títulos: Manrope 500 ou 600, entrelinha 1,06–1,15, entreletra levemente negativa quando grande.
- Corpo: Manrope 400, 16–18 px no site, entrelinha 1,5–1,65.
- Botões e labels: Manrope 600, 14–16 px. Usar caixa de frase, sem tracking amplo ou caixa alta sistemática.
- Números em tabelas e balanços: algarismos tabulares quando disponíveis; valores monetários alinhados à direita e separadores brasileiros.
- Não usar pesos ultrafinos ou títulos excessivamente pesados. A logo já contém o gesto arredondado; o texto de apoio precisa ser simples e legível.

## Linguagem e imagens

Voz de parceira competente: direta, humana, sem infantilizar a lojista. Mostrar decisões e resultados verificáveis, com números apresentados de forma legível. Frases curtas, verbos concretos e explicações transparentes quando faltam dados.

Fotografia de produto real, com luz lateral suave, textura de papel ou pedra clara, escala honesta e sombra natural. Mostrar joias e semijoias em exemplos distintos, identificando corretamente material, acabamento e categoria; não sugerir que uma peça banhada é uma joia de metal precioso. Preferir closes que mostrem acabamento, fecho e material da peça. Não usar modelos de banco de imagem sorrindo para o celular como linguagem central.

Na primeira apresentação da marca, dizer “para quem vende joias e semijoias”. Depois, usar “peças”, “coleção” e “negócio” para manter a leitura leve. Uma demonstração da Mila deve trazer pelo menos um caso de cada segmento; preços e características de peças fictícias precisam ser identificados como exemplos, nunca como atributos verificados de um produto real.

Elementos gráficos derivados dos arcos do `m` podem aparecer em recortes discretos, desde que não disputem com produto ou conteúdo. O ponto pode organizar uma assinatura editorial; não espalhar pontinhos decorativos em todas as peças.

## Aplicações

- Instagram e WhatsApp: `avatar-mineral.svg` é a opção principal. Em perfis pequenos, somente `m.`; o nome textual do perfil apresenta `mila.ai`.
- Site claro: wordmark mineral no cabeçalho, marfim como fundo, tinta no corpo, CTA mineral. A marca deve ter espaço e aparecer uma vez por área de navegação.
- Fundos escuros e capas: wordmark/símbolo marfim sobre mineral. Informação curta e bem hierarquizada, sem efeitos na assinatura.
- Conteúdo social: grandes números ou uma decisão concreta como protagonista. Alternar marfim e mineral, com fotografias reais quando pertinentes. Não transformar cada post em uma grade de cartões iguais.
- Relatórios: texto tinta em fundo branco/marfim, gráficos com poucos tons distinguíveis e labels diretos. Mineral destaca totais e próximos passos; sálvia/areia apoiam séries secundárias apenas quando o contraste permite.
- ERP e integrações: logos de terceiros mantêm a reprodução permitida por seus próprios guias; evitar recolorir todos com a cor da mila.ai ou sugerir parceria não confirmada.

## O layout atual precisa de redesign?

**Não exige reconstrução estrutural para receber esta marca.** O hero com mensagem à esquerda e demonstração de conversa à direita já apresenta o produto com clareza. Espaço em branco, poucos elementos e evidência do uso no WhatsApp são compatíveis com a direção proposta.

Recomendo uma atualização visual coordenada: aplicar o SVG fiel, substituir os tokens de vinho/ameixa pelo sistema mineral, unificar títulos e corpo em Manrope, revisar contraste, reduzir o destaque das integrações e harmonizar calculadora, preços e FAQ. O mockup de conversa deve continuar funcionando como evidência, sem se tornar um objeto decorativo maior que a proposta de valor.

A avaliação aqui é uma recomendação de direção baseada no código da landing e nos documentos existentes; não substitui uma revisão responsiva em navegador. O `DESIGN.md` e `PRODUCT.md` ainda contêm trechos da marca socIA e não descrevem integralmente o código atual. Devem ser atualizados quando a direção da mila.ai for aprovada, preservando as restrições reais de produto.

Nenhum arquivo da aplicação ou CSS de produção foi alterado nesta entrega de identidade.
