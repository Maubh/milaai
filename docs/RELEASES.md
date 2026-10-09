# Versões e changelog da mila

A mila é atualizada online: a loja não precisa instalar versões nem baixar atualizações. Este changelog registra o que foi publicado, incluindo melhorias, novas funcionalidades e correções de bugs.

A versão exibida na plataforma vem de `package.json`. O histórico público fica em `lib/releases.ts`, do mais recente para o mais antigo, e aparece em `/workspace/novidades`. Começamos com a versão já existente, `0.1.0`, sem inventar versões anteriores.

## Escolher o próximo número

Use `MAJOR.MINOR.PATCH`:

- `0.1.0 → 0.1.1`: correções e ajustes menores.
- `0.1.0 → 0.2.0`: novas funcionalidades ou uma melhoria relevante.
- `1.0.0`: primeira versão estável do produto. Depois disso, mudanças incompatíveis com o comportamento documentado incrementam MAJOR.

O número identifica uma atualização entregue ao usuário; não precisa mudar a cada commit. Agrupe mudanças que serão publicadas juntas. Em versões `0.x`, o produto ainda está em evolução.

## Publicar uma atualização

1. Escolha o número e atualize `package.json` e o lockfile juntos. Por exemplo, `npm version patch --no-git-tag-version` ou `npm version minor --no-git-tag-version`. Esse comando altera arquivos locais; não faz deploy.
2. Insira uma entrada no começo de `RELEASES`, em `lib/releases.ts`, com o mesmo número, data real de publicação, título, resumo e mudanças. Preserve entradas anteriores.
3. Use os tipos `new`, `improvement` ou `fix`. Explique o que muda para a loja. Ajustes cosméticos isolados, como altura dos cards, espaçamento e alinhamento, não viram anúncios próprios. Reserve o histórico para funcionalidades, mudanças de fluxo e correções que afetam o uso. Não publique segredos, detalhes internos de infraestrutura nem promessas de funcionalidades ainda indisponíveis.
4. Execute `node --test --no-warnings tests/releases.test.ts` com Node 24 e os checks aplicáveis às mudanças. O teste detecta versões sem notas correspondentes. Ele também entra em `npm test`; execute os checks antes de publicar.
5. Publique o código e as notas juntos, depois verifique a versão e a página Atualizações no ambiente publicado. Se precisar de histórico Git, crie a tag `vX.Y.Z` no commit publicado.

## Histórico recolhível

Cada versão usa um controle nativo `details`/`summary`, independente das outras. A versão correspondente a `package.json` começa aberta; as anteriores começam fechadas. O usuário pode abrir e fechar qualquer uma pelo mouse ou teclado. Não adicione versões fictícias para preencher a página.

## Indicador de atualizações

O link Atualizações, no canto superior direito, mostra a versão em uso e um ponto quando há uma atualização ainda não lida. No celular, o acesso usa apenas o ícone para manter o cabeçalho compacto. Ao abrir a página, a versão mais recente é marcada como vista no `localStorage` daquele navegador. Não depende de conta administrativa, banco de dados ou serviço externo; não sincroniza a leitura entre dispositivos. Bloquear o armazenamento não impede acessar o histórico.

Novas versões ficam disponíveis depois de carregar a aplicação atualizada. A base atual não força recarregamento nem interrompe o trabalho de uma loja que esteja usando uma aba antiga.
