# mila.

A mila é uma assistente de negócios para quem vende **joias e semijoias**. A proposta é apoiar, na conversa pelo WhatsApp, decisões sobre custos e margens, organização das informações de cada peça e preparação de textos para venda.

## Estado do projeto

O site apresenta a proposta e um mockup de conversa. O workspace permite explorar peças fictícias dos dois segmentos, ajustar custos em uma calculadora local e editar legendas de exemplo. O que aparece nessas demonstrações não deve ser interpretado como análise de uma peça real nem como validação de seus materiais.

O fluxo de acesso e as integrações dependem da configuração dos serviços correspondentes e das permissões concedidas pela loja. A prévia técnica do repositório ainda usa dados locais em algumas telas; a experiência publicada deve ser conectada aos serviços antes da ativação comercial.

## Identidade e linguagem

- Na apresentação da marca, usar “para quem vende joias e semijoias”. Depois, preferir “peças”, “coleção” e “negócio” quando a distinção não for necessária.
- Nomear corretamente materiais e categorias. Uma peça com banho não deve ser descrita como joia de metal precioso sem confirmação.
- Usar exemplos de ambos os segmentos e sinalizar valores, características e legendas fictícios.
- Usar `mila.` como marca, `m.` como símbolo reduzido e `milaai.com.br` exclusivamente como endereço; não recorrer a dourado, brilhos ou imagens que a façam parecer uma joalheria.

O kit de marca e seus arquivos vetoriais estão em [`design/brand-mila`](design/brand-mila). A direção editorial está em [`ASTRA-DIRECTION.md`](design/brand-mila/ASTRA-DIRECTION.md).

## Desenvolvimento local

```bash
npm install
npm run dev
```

Use `npm run build` para verificar a compilação. Os documentos de especificação anteriores permanecem no repositório como histórico e podem descrever o nome ou o escopo de versões passadas.
