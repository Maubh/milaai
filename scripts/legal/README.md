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

## Limites

- Texto normalizado não é uma fotografia visual, não é comparação de HTML byte a byte e não executa hidratação.
- Hashes protegem a versão revisada; não provam que a versão inicial é correta.
- Nenhum snapshot prova conformidade jurídica. As práticas reais e mudanças de fornecedores/escopos precisam de revisão.
- O harness de mutações altera arquivos temporariamente: não rodar em paralelo com edição ou outro harness. Usa backup e restauração; baselines inicial e final devem passar.
- Atualizar um snapshot aceita uma nova declaração ao titular. Leia o diff antes de commitar.
