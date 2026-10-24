# Site da mila (milaai.com.br)

Site público e área logada da mila. O agente (WhatsApp, ferramentas, cobrança) vive em Maubh/mila-eve; as regras gerais e os inegociáveis estão no `AGENTS.md` de lá.

## Atualizações na área logada (regra)

Toda mudança que a lojista percebe entra em `lib/releases.ts` na mesma entrega da mudança, venha ela do site ou do Eve (Maubh/mila-eve). Quando um PR do Eve muda algo visível, este repositório recebe junto o PR com a nota.

- **Entra:** recurso novo, melhoria ou correção que ela vê no WhatsApp, no site ou na área logada.
- **Fica de fora:** o que ela não vê (skills, documentação, refatoração, testes, infraestrutura, verificação de contas).
- **Acabamento não é novidade:** tamanho ou altura de botão, alinhamento, espaçamento, cor de borda, ordem de selos e ajustes parecidos não entram no feed. O feed tem só novidades, melhorias e correções que mudam o uso. Quando uma entrega é só acabamento, a versão sobe do mesmo jeito (para o histórico técnico), mas a entrada leva `internal: true`. Ela fica fora da página de Atualizações, do sino, da visão geral e do aviso de não lido, que leem só `PUBLIC_RELEASES`/`LATEST_PUBLIC`. Não invente nota para preencher versão, nem anuncie mudança do próprio feed.
- **Como:** uma versão nova no topo de `RELEASES` (ou um item a mais na versão do dia, se ela ainda não foi publicada), com `type` (`new`, `improvement`, `fix`) e `plan` (`all` ou `pro`, conforme `docs/especificacao_planos.md` do Eve), escrita na linguagem da lojista. Suba a mesma versão em `package.json` e `package-lock.json`.

## Antes de entregar

- `npm test`. Arquivo de fonte alterado ou novo precisa do hash atualizado em `tests/legal-source-lock.json`.
- `tests/releases.test.ts` confere que a versão do `package.json` é a primeira de `RELEASES` (pública ou interna) e que só `PUBLIC_RELEASES` chega à lojista.
