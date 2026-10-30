# Migração da hospedagem do site — 30/10/2026

Registro posterior à operação executada pelo coordenador GPT6.1 Sol, com base nas evidências por ele informadas. Este documento fica **fora do snapshot imutável implantado**. O worker somente registrou os fatos, sem acessar produção, segredos ou bancos.

## Artefato implantado

- Base: `75099a9`; snapshot com 309 arquivos, SHA256 `819cac1f2df1672e7348ec856b5f5d75538f25933f46207f6bfeee7270e684c2`.
- Archive limpo, sem metadados macOS.
- Release: `/docker/milaai/releases/75099a9-vps-20261030-r2`; `/docker/milaai/current` aponta para esse diretório.
- Imagem: `milaai-site:75099a9-vps-20261030-r2`; manifest `sha256:4074f334727188112a353b66117cebb5a9c49245dca7793f3b91c295e8ccef0c`.
- Sidecar: `cloudflare/cloudflared:2026.10.6`, digest `sha256:004d843fa5fdc3103983fd580ee19fab4a8fa98add31f87249c1659e848c98e0`.
- Site e túnel healthy, ambos não root e sem portas publicadas. Hospedagem Next migrada sem mudança de interface ou uso.

## Validação e corte

- Docker build: exit 0. Imagem final: 42 verificações com `--network none` e mocks, exit 0.
- Origin: Host público, HTTPS, HSTS, assets e sessão sem cookie validados; Turnstile inválido retornou 403.
- Backend: health interno 200; segredo de auth com corpo `{}` retornou `400 invalid_payload` antes de acesso ao banco, sem OTP.
- Corte DNS entre **14:56 e 14:58 UTC**: apex `milaai.com.br`, `www.milaai.com.br` e `vitrine.milaai.com.br` passaram ao túnel exclusivo do site.
- DNS de `app.milaai.com.br` e `wa.milaai.com.br` permaneceram intocados.
- Smoke público: 16 verificações e 8 assets passaram.
- Turnstile no navegador real: token fresco enviado somente a `/api/turnstile`, resposta `200 {ok:true}`, sem submeter formulário nem enviar OTP.
- **Não executados:** login real, checkout, renovação OAuth e sincronização Meta. Os smokes não comprovam esses fluxos ponta a ponta.

## Eve e fallback preservados

- Eve manteve `StartedAt` em `2026-10-30T13:38:05.484Z`, restart count 0 e health 200; hash da configuração do túnel wa permaneceu igual.
- Projeto do site na Vercel, aliases e envs foram preservados para rollback.
- `app.milaai.com.br` continua no projeto legado da Vercel, com cron Meta intocado. A conta e o custo da Vercel **não foram eliminados**.
- Fonte local no worktree permanente `/Users/msvasconcelos/Code/personal/milaai-vps`, branch `feat/site-vps`; sem commit, push ou PR, pois não foram solicitados.

## Rollback manual

Em caso de rollback, o operador deve usar o backup JSON dos registros originais e o script privado `/docker/milaai/backups/switch-dns.cjs` em **modo `rollback`**, no container operacional. O snapshot DNS preserva os destinos e atributos anteriores; o guard de app/wa deve permanecer ativo. Restaurar somente os três hosts do site, conferir a recuperação e manter app/wa intocados. Credenciais, UUID do túnel e IDs de conta não integram este registro.

## Recursos e diagnóstico de disco

Estado informado após a migração:

| Medida | Resultado |
| --- | --- |
| Memória do site / túnel | 77 MiB / 19 MiB |
| Disco VPS | 96 G total, 82 G usados, 15 G disponíveis, 85% ocupado |
| Memória disponível VPS | 4,8 GiB |
| Antes da migração | 83% ocupado, 17 G disponíveis |

O aumento observado foi de aproximadamente 2 GB, sobretudo cache de build. Após o alerta do usuário sobre disco, o diagnóstico **somente leitura** identificou:

- Dados Hermes: 65 G; `profiles`: 43 G.
- Perfil `mauricio`: 32 G, dos quais 26 G em `state-snapshots` (20 diretórios de 14 a 30/out).
- Snapshots de `ritrovarsi`: 3,7 G; snapshots na raiz: 2,8 G.
- Cache de build Docker: 3,523 GB, com 1,305 GB recuperáveis.

As medidas são hierárquicas, não parcelas para somar. **Nada foi apagado:** sem prune, exclusão de snapshots ou alteração de retenção. Qualquer limpeza depende de decisão e tarefa separadas.
