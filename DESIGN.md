---
name: socIA
description: Sistema visual da demonstração web para lojistas de semijoias e moda
colors:
  plum: "#24191f"
  wine: "#4d1f2d"
  paper: "#f5f1ea"
  warm-white: "#fcfaf6"
  ink: "#272326"
  gold: "#b99a62"
  blush: "#e8d6d7"
typography:
  display:
    fontFamily: "Bodoni Moda, Didot, Georgia, serif"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Avenir Next, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
rounded:
  small: "10px"
  surface: "14px"
  pill: "999px"
spacing:
  control: "0.8rem 1.6rem"
  section: "clamp(4rem, 8vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.pill}"
    padding: "{spacing.control}"
  card:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
---

# Design System: socIA

## Overview

**Creative North Star: "A bancada de avaliação"**

A peça e seus números pertencem ao mesmo espaço. A landing usa fotografia de joia, papel mineral e tipografia editorial para atrair; o workspace conserva as cores e reduz a ornamentação para facilitar decisões frequentes.

**Key Characteristics:**

- Fotografia tátil de produto com escala suficiente para mostrar material e acabamento.
- Valores monetários alinhados e apresentados como instrumento de trabalho.
- Ouro como detalhe de precisão, nunca como brilho decorativo geral.

## Colors

O ameixa sustenta ações e regiões de contraste; o papel mineral mantém leitura calma; vinho e ouro sinalizam profundidade e detalhe.

**The Metal Rule.** Use ouro em marca, foco e pequenas medições; ações principais usam ameixa sólido.

## Typography

**Display Font:** Bodoni Moda (Didot, Georgia como fallback).
**Body Font:** Avenir Next (Segoe UI e sans de sistema como fallback).

A display aparece em títulos curtos e preços de destaque. Texto operacional, formulários e números usam a sans; valores usam numerais tabulares.

**The Two Registers Rule.** A voz editorial apresenta a proposta; a voz de interface explica custos e ações sem floreio.

## Layout

Landing: abertura dividida e assimétrica, seções com mudanças de densidade, container de até 1200px. Em telas estreitas, o conteúdo empilha, a fotografia aparece cedo e a calculadora mantém campos e resultado legíveis. Workspace: navegação lateral no desktop e faixa de navegação horizontal contida no viewport no mobile.

**The Price In View Rule.** A primeira tela da landing mostra uma peça e um resumo de preço; a primeira tela do workspace mostra uma ação de trabalho.

## Elevation & Depth

Superfícies são separadas por tom e linhas finas. Cards usam uma sombra ambiente baixa e deslocada; a fotografia fornece a maior profundidade visual.

## Shapes

Superfícies têm cantos discretos de 14px e campos de 10px. Pílulas são reservadas a controles compactos e estados; o CTA editorial da abertura tem canto quase reto.

## Components

Botões primários usam ameixa e texto claro; os secundários são contornados. Campos têm rótulo visível, borda fina e foco dourado. Cards contêm uma tarefa ou resultado, com números e descrições hierarquizados. O recibo do hero usa linhas de medição e valores alinhados.

## Do's and Don'ts

- Use dados de exemplo com identificação visível de demonstração.
- Preserve contraste, foco visível e leitura no celular.
- Não apresente integrações planejadas como ativas.
- Não substitua a fotografia por gradientes genéricos ou uma grade de cards de ícones.
