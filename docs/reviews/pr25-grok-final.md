# Revisão final — PR 25

Revisor: gcli/grok-4.7 via 9Router. Rodada 11.

APPROVE

A correção fecha o bloqueador da v10. No `tests/legal-source-lock.test.ts`, `src` e `pages` entram no mesmo `scan` de `app/components/lib/public`, com `.jsx` já na lista de sufixos; a raiz passa a casar `/\.(?:ts|tsx|jsx|js|mjs|cjs|json)$/` e só então exige `lstatSync(...).isFile()`. `middleware.jsx` e `proxy.jsx` na raiz, `src/middleware.ts` e `pages/privacidade.jsx` (também `src/pages/...`, porque `scan` desce) deixam de ficar fora da união. Diretório ausente não cria chave (`existsSync` no `scan`). Não há regeneração a exigir se essas chaves não existem: chave nova faria `LOCK[p] !== actual[p]`. O `next.config.mjs` mostrado não restringe `pageExtensions`, então o default continua a incluir `jsx`; o próprio config é `.mjs` de raiz e entra no hash.

Não observei as três mutações nem o 73/73. O veredito é só o caminho do código.

Escopo: regressão das frases no render estático do componente e no conjunto de fontes que o Next pode carregar para `/privacidade` e `/termos` (middleware/proxy de raiz ou `src/`, `pages/`/`src/pages`, layouts, CSS, `lib`, `public` nos sufixos listados, config de raiz). OAuth segue no hash integral dos `.py` de `auth/tenancy/webhook/billing/mila_router`, dos `*.py` da raiz do backend e de qualquer `.py` do repo web, com comparação byte a byte dos dois `auth/oauth.py` quando ambos existem.

Limites: não é equivalência visual, hidratação nem conformidade jurídica. `htmlDe` não vê a resposta HTTP; quem fecha esse vetor é o hash, não o golden. A AST de Python continua cega (`except: pass` só cai porque o arquivo inteiro está no hash). `.py` fora dessas árvores não roda sozinho. Pasta `tests` em qualquer nível segue fora do scan e não é ancestral da rota jurídica. JSON/YAML do backend não listados. Symlink na raiz com sufixo da regex não entra e não derruba o teste (`isFile()` em `lstat` é falso), ao contrário do `assert` do `scan`; isso fica de fora do contrato de arquivo regular desta correção, sem execução aqui que mostre o Next a carregá-lo.