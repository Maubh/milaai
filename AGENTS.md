# Site da mila (milaai.com.br)

Site público e área logada da mila. O agente (WhatsApp, ferramentas, cobrança) vive em Maubh/mila-eve; as regras gerais e os inegociáveis estão no `AGENTS.md` de lá.

## Atualizações na área logada (regra)

Toda mudança que a lojista percebe entra em `lib/releases.ts` na mesma entrega da mudança, venha ela do site ou do Eve (Maubh/mila-eve). Quando um PR do Eve muda algo visível, este repositório recebe junto o PR com a nota.

- **Entra:** recurso novo, melhoria ou correção que ela vê no WhatsApp, no site ou na área logada.
- **Fica de fora:** o que ela não vê (skills, documentação, refatoração, testes, infraestrutura, verificação de contas).
- **Como:** uma versão nova no topo de `RELEASES` (ou um item a mais na versão do dia, se ela ainda não foi publicada), com `type` (`new`, `improvement`, `fix`) e `plan` (`all` ou `pro`, conforme `docs/especificacao_planos.md` do Eve), escrita na linguagem da lojista. Suba a mesma versão em `package.json` e `package-lock.json`.

## Antes de entregar

- `npm test`. Arquivo de fonte alterado ou novo precisa do hash atualizado em `tests/legal-source-lock.json`.
- `tests/releases.test.ts` confere que a versão do `package.json` é a primeira de `RELEASES`.
