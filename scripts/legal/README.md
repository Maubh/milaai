# Guard de conteúdo jurídico

## Executar

- `npm test`: snapshots de texto real, prosa instrumentada, fonte e vocabulário.
- `npm run build`: tipos e build Next.js.
- `bash scripts/legal/prova_guard_legal.sh`: 22 mutações históricas.
- `python3 scripts/legal/prova_v8.py`: 5 mutações de ambiente/client/OAuth.
- `bash scripts/legal/gerar_golden_legal.sh`: regenerar snapshots de conteúdo, somente após revisão consciente do diff.

Os testes de paridade precisam do OAuth real em `/opt/data/profiles/mila/auth/oauth.py` ou `../auth/oauth.py`. Não certificam paridade na ausência do arquivo.

## O que é protegido

O snapshot real compara texto normalizado de `renderToStaticMarkup` sem substituir valores por sentinelas. O snapshot instrumentado é diagnóstico adicional; não sustenta sozinho a garantia.

Páginas jurídicas e pricing não podem depender de `process`, `window`, `document`, `globalThis`, diretiva client ou hooks de estado/efeito. Pricing é server component.

O leitor AST do OAuth ajuda a diagnosticar a lista de escopos, mas não resolve Python arbitrário. Por isso o hash SHA-256 do código OAuth revisado é obrigatório: qualquer alteração falha até revisão explícita. Esse hash NÃO é regenerado pelo script de copy.

Layouts, componentes de entorno listados e CSS também têm hashes revisados. Alterações exigem revisão explícita e atualização manual consciente, não apenas regenerar texto. Este bloqueio é conservador: até uma alteração legítima de estilo exige revisão.

## Conjunto fechado de fontes

`tests/legal-source-lock.test.ts` também compara o conjunto completo de fontes com `tests/legal-source-lock.json`: app/components/lib/public, arquivos raiz de código/configuração, Python do repositório e módulos de backend listados. Arquivo novo, removido ou alterado falha. Isso cobre helpers importados, novos layouts/CSS, mudança de classes e mutações OAuth fora do arquivo original.

O lock NÃO é regenerado pelo script de copy. Para mudança legítima, é necessária nova revisão do código e atualização consciente do manifesto. O custo é deliberadamente conservador: alterações não relacionadas à copy nos diretórios protegidos também interrompem essa verificação. Ele congela uma versão revisada; não analisa semântica arbitrária e não promete cobrir código externo fora desses diretórios.

- `python3 scripts/legal/prova_v9.py`: cinco mutações de fonte/novo layout/CSS/classe/Python externo.
- `env NODE_ENV=production VERCEL=1 VERCEL_ENV=production npm test`: também conferir os snapshots em modo de produção.

## Limites

- Texto normalizado não é uma fotografia visual, não é comparação de HTML byte a byte e não executa hidratação.
- Hashes protegem a versão revisada; não provam que a versão inicial é correta.
- Nenhum snapshot prova conformidade jurídica. As práticas reais e mudanças de fornecedores/escopos precisam de revisão.
- O harness de mutações altera arquivos temporariamente: não rodar em paralelo com edição ou outro harness. Usa backup e restauração; baselines inicial e final devem passar.
- Atualizar um snapshot aceita uma nova declaração ao titular. Leia o diff antes de commitar.
