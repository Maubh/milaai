# Direção de design e implementação — socIA

Este documento é a direção da designer/coordenadora para o worker de implementação. Leia `PRODUCT.md` e `PLAN_REVIEW.md` antes de editar. O projeto ainda só tinha documentação. Crie uma aplicação Next.js com TypeScript neste worktree.

## Conceito

**A bancada de avaliação.** A joia e seus números dividem o mesmo espaço. A landing se comporta como uma apresentação editorial de produto com um instrumento de precificação real. O workspace transforma esse instrumento em rotina: escolher peça, ajustar custos, ler margem e preparar a comunicação.

O layout não deve seguir a sequência genérica hero centralizado → três cards iguais → tabela → CTA. Use uma abertura dividida e uma sequência com mudanças de escala: demonstração do cálculo, bastidores dos custos, fluxo de uso, recursos previstos, planos e perguntas. A composição deve parecer feita para a socIA, não um template SaaS recolorido.

## Sistema visual

- Paleta: ameixa quase preto `#24191F`, vinho profundo `#4D1F2D`, papel mineral `#F5F1EA`, branco quente `#FCFAF6`, tinta `#272326`, ouro envelhecido `#B99A62` apenas nos detalhes, rosa pálido `#E8D6D7` em blocos de apoio.
- Fotografia: `public/images/socia-jewelry-hero.png`, criada para este projeto. Preserve o recorte da joia e a textura do veludo; use `object-position` com cuidado no mobile. É imagem ilustrativa de produto, não inventário real.
- Tipografia: uma display de contraste alto como Bodoni Moda para headlines curtas; uma sans precisa como Geist ou uma sans de sistema para UI, números e texto corrido. Não use Playfair, Cormorant, Inter como display nem letras excessivamente espaçadas em todo o site.
- Layout: grids assimétricos, superfícies de papel e linhas finas de medição; cantos discretos, sem glassmorphism ou icon cards repetidos. Números alinhados, valores monetários legíveis, CTA sólida em ameixa ou papel conforme o fundo.
- Marca textual `soc` + `IA` com a segunda parte em ouro discreto; sem brilho animado.

## Landing `/`

1. Header compacto com marca, links âncora úteis e CTA “Explorar demonstração”. Menu mobile funcional.
2. Primeiro viewport desktop: coluna esquerda em papel mineral com título grande “Sua peça vale mais quando você conhece cada número.”, explicação em uma frase, CTA principal e um pequeno resumo de preço de exemplo identificado como simulação; coluna direita com a foto ocupando a altura da abertura. No mobile, título, CTA e parte significativa da imagem aparecem cedo; sem texto ilegível sobre a foto.
3. “Raio-X da peça”: calculadora local interativa, com custo da peça, embalagem, rateio, taxa de pagamento, imposto e margem desejada. Fórmula explícita: preço sugerido = (custo + embalagem + rateio) / (1 - taxa - imposto - margem). Validar entradas para não dividir por zero; mostrar composição, preço e margem de forma compreensível. Dados iniciais são exemplos, nunca resultado real da usuária.
4. Demonstração de conversa: um trecho de chat autoral mostrando como o mesmo Raio-X seria explicado no WhatsApp, com selo “prévia ilustrativa”. Não copiar UI oficial pixel a pixel nem sugerir que a API já está conectada.
5. Módulos e conectores: apresentar o fluxo planejado de foto/NF-e, radar e conteúdo e Bling/Olist/Google/Notion com etiqueta “previsto” ou “demonstração”; não usar logotipos oficiais sem necessidade.
6. Planos: mostrar valores do README como “planos previstos”, sem “mais escolhido”, anual inventado ou CTA de pagamento. A CTA leva à demonstração.
7. FAQ honesto e footer com links internos funcionais. Remover alegação de criptografia ponta a ponta e de teste grátis confirmado.

## Área logada

- `/login`: entrada de nome e telefone opcionais para personalizar a sessão de demonstração; botão claro “Entrar na demonstração”. Sem OTP falso e sem alegação de sessão segura. Persistir apenas dados não sensíveis localmente, se necessário.
- `/workspace`: shell com navegação e visão geral útil. Inclua peças de exemplo, um resumo de preço, custos base editáveis e ações de continuidade.
- `/workspace/precificacao`: a mesma lógica de cálculo da landing, agora apresentada como ferramenta de trabalho, com ajuste de campos e detalhamento do resultado.
- `/workspace/conteudo`: prévia de legenda de exemplo editável ou copiável, identificada como texto demonstrativo. Não alegar geração por IA real.
- `/workspace/integracoes`: lista de Bling, Olist, Google e Notion com status “Disponível em breve / demonstração” e explicação clara. Nenhum fluxo OAuth fingido.
- Navegação, formulários e botões devem ter comportamento real dentro do protótipo; não usar links `#` sem destino nem botões decorativos.

## Movimento e acessibilidade

- Usar GSAP de forma contida para uma entrada coreografada no primeiro viewport e uma transição/reveal importante na seção do Raio-X. Máximo de três primitivas de movimento; o resto usa estados CSS simples.
- Respeitar `prefers-reduced-motion`; conteúdo permanece legível sem animação. Em React, usar `@gsap/react` com escopo e limpeza.
- Teclado, foco visível, labels, contraste e alvos de toque adequados. Responsividade real em 390px e 1440px.

## Critérios de aceite

- `npm install` e `npm run build` passam; `npm run dev` serve landing, login e workspace.
- Os cálculos mudam quando os campos mudam e lidam com valores inválidos.
- Fluxo landing → login demo → workspace funciona, inclusive no mobile.
- Nenhuma chamada real a WhatsApp/OAuth/API externa nem promessa de conexão concluída.
- Layout completo e visualmente refinado em desktop e mobile; sem overflow horizontal, conteúdo cortado ou links mortos.
- A imagem usada deve ficar no repositório com seu metadado de prompt preservado.
