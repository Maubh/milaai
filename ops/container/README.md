# Hospedagem do site na VPS

Este fluxo move **somente o Next do projeto milaai**, sem mudar telas, planos, login ou integrações. É um procedimento para o operador executar depois da revisão; os comandos de operação não são testes locais.

## Topologia e limites

- Projeto Compose independente `milaai`, em `/docker/milaai`, sem reutilizar o checkout antigo.
- `site`: Node 24 / Next standalone, usuário `node` (1000), porta 3000 **só nas redes Docker**. Não é o Next de webhook do Eve.
- `cloudflared`: sidecar 65532:65532, túnel **novo e exclusivo**, sem portas publicadas. Recebe apenas config e credencial individuais, read-only, fora do snapshot.
- Rede `milaai_site` entre os dois; somente `site` participa também da rede externa **já existente** `mila-eve_default` e consulta `http://mila-eve:4274`.
- Hosts deste site: `milaai.com.br`, `www.milaai.com.br`, **`vitrine.milaai.com.br`**. Preservar o Host e `X-Forwarded-Proto` originais no túnel, sem `httpHostHeader` fixo.
- **Não alterar** `wa.milaai.com.br`, seu túnel, container/rede/configuração/volumes do Eve, nem seus jobs. Não executar `up`, `down`, rebuild ou restart do projeto Eve.
- **`app.milaai.com.br` é outro projeto na Vercel (`mila-eve`)**, não um alias deste site. Seu root redireciona, mas há API de cron própria. Deixar DNS, aplicação e conta Vercel intactos. Não adicionar app a este túnel nem criar redirect wildcard.

A VPS informada tem Node 24, cerca de 5 GB de RAM e 17 GB de disco livres: a topologia de dois processos é pequena, mas o build usa devDependencies e pode ter pico de RAM/CPU. Medir recursos e reservar folga para o Eve antes de construir. Se não houver folga, construir a mesma imagem para a arquitetura da VPS fora dela. Não sacrificar o WhatsApp para um build. Sem preview, blue/green, banco, scheduler ou novo proxy.

## Configuração necessária (nomes, nunca valores no repositório)

Copiar `site.env.example` para **`/docker/milaai/secrets/deploy.env`**, preenchido pelo operador, mode 0600. Esse é o único arquivo de interpolação do Compose (`--env-file`); não fazer `source`, não imprimir `docker compose config` com valores reais e não copiar o arquivo para o checkout/contexto. O shell tem precedência sobre `--env-file`: usar sessão operacional controlada, sem env antigo exportado.

| Nome | Momento | Regra |
| --- | --- | --- |
| `NEXT_PUBLIC_MILA_WA_E164` | build | Mesmo número público da hospedagem atual; nunca usar telefone de lojista. Obrigatório no build Compose. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Mesma chave pública do widget, autorizada para os hosts existentes. Obrigatória: ausência **não** pode remover o desafio. |
| `MILA_AUTH_SECRET` | runtime | Mesmo segredo compartilhado de auth já aceito pelo Eve. Obrigatório. |
| `MILA_INTERNAL_HMAC_SECRET` | runtime | Mesmo segredo da API interna/vitrine; manter o contrato Bearer/HMAC existente. Obrigatório. |
| `TURNSTILE_SECRET_KEY` | runtime | Mesmo segredo Turnstile, correspondente à chave pública. Obrigatório. |
| `MILA_COOKIE_DOMAIN` | runtime, opcional | Preservar o valor atual se houver. Vazio conserva regra apex/www → `.milaai.com.br`. Não usar `-` em produção. |
| `MILA_AUTH_BASE` | runtime, fixo no Compose | `http://mila-eve:4274`: transporte privado de auth, billing, OAuth e APIs de Meta/workspace. Não é URL de navegador/callback. |
| `MILA_INTERNAL_API_URL` | runtime, fixo no Compose | `http://mila-eve:4274`; único uso no site é `GET /api/internal/showcase?slugLoja=…&slugColecao=…`, atendido pelo canal do Eve. Não apontar à porta 3000 do webhook. |
| `MILAAI_SITE_IMAGE` | operação | Tag única da imagem da release revisada. Não sobrescrever a tag anterior. |
| `MILAAI_NODE_IMAGE` | build, opcional | Default `node:24-trixie-slim`; fixar versão/digest aprovado no arquivo privado para repetibilidade. |
| `MILAAI_CLOUDFLARED_IMAGE` | operação | Imagem `cloudflare/cloudflared` com versão/digest aprovado, obrigatória; não usar `latest`. |
| `MILAAI_TUNNEL_CONFIG_FILE` | operação | Caminho absoluto, por exemplo `/docker/milaai/config.yml`. |
| `MILAAI_TUNNEL_CREDENTIALS_FILE` | operação | Caminho absoluto `/docker/milaai/secrets/tunnel.json`, túnel **do site**. |

Só os dois `NEXT_PUBLIC_*` e a referência pública da imagem Node entram em `build.args`. Todos os segredos ficam fora de camadas, argumentos e logs do build. Trocar um `NEXT_PUBLIC_*` exige **rebuild**; reiniciar runtime não muda o JS já compilado. `NODE_ENV=production`, `HOSTNAME=0.0.0.0`, `PORT=3000` e telemetria desativada já pertencem à imagem; não herdar `NODE_ENV=production` para omitir devDependencies durante `npm ci`.

O inventário informado da Vercel também contém `ASAAS_API_BASE`, `ASAAS_API_KEY`, `MILA_SITE_URL`, `BLOB_WEBHOOK_PUBLIC_KEY`, `BLOB_STORE_ID`. **Este snapshot não lê esses nomes**: não injetá-los por conveniência. Cobrança e credenciais dos provedores permanecem no Eve. Export de env Vercel pode entregar secrets sensíveis vazios: não tratá-lo como backup completo. Compose recusa build/start sem cada variável necessária, inclusive o par Turnstile, sem afrouxar a aplicação.

## Cookies, redirects, OAuth e cron Meta

- O transporte site → Eve pode ser HTTP privado; URLs de navegador, origens permitidas e callbacks continuam **HTTPS públicos**. Não substituir callbacks dos provedores por `mila-eve:4274`. Não mudar CORS: apex/www já permitidos; vitrine não vira origem autenticada adicional.
- O site continua impondo `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/` e o domínio de sessão já existente. Vitrine permanece host-only, sem ampliar autoridade de cookie ou CSRF.
- Middleware faz HTTP → HTTPS **308** somente nos três hosts do site, inclusive assets. Usa `X-Forwarded-Proto` original para não fazer loop na perna HTTP do túnel. Healthcheck por loopback não redireciona. O túnel não deve reescrever esse header nem forçá-lo a `https` para tráfego público HTTP.
- HSTS preservado exatamente como na Vercel: `max-age=63072000`, sem novos `includeSubDomains` ou `preload`.
- `/onboarding/connect` → `/login/verify` continua 307; workspace sem sessão continua redirecionando ao login; sanitização de links Markdown continua 308, agora usando origem pública para não vazar `localhost` no standalone. O rewrite existente do host vitrine não muda.
- Não há `vercel.json`, Vercel Cron ou rota de cron neste site. **O cron Meta legado do host** faz `42 * * * *` POST a `https://app.milaai.com.br/api/meta/catalog/cron-sync` com `x-mila-cron-secret`; essa rota pertence ao outro projeto. Não chamar, copiar, religar ou reendereçar esse cron nesta migração. Não requer `MILA_CRON_SECRET` nem credenciais Meta neste container. A dependência impede declarar a conta Vercel removível ou a migração de todos os serviços concluída.

## Snapshot revisado, sem commit obrigatório

`/docker/milaai` é diretório de operação, **não checkout para `git pull`**. Cada release é um snapshot imutável em `/docker/milaai/releases/<base>-vps-<id>`, com tag de imagem única. Não usar o checkout original que tem arquivos do usuário. Não enviar `node_modules`, `.next`, `.npm`, `.env`, credenciais, `.git` ou arquivos untracked não revisados.

Uma forma de empacotar no ambiente de revisão é usar o archive da base mais o patch e a allowlist explícita de novos arquivos. `WORKTREE` é o checkout delegado; `ARTIFACT` fica **fora** dele. Revisar o diff, a lista nova e o conteúdo antes de transportar.

```sh
BASE=75099a9a92af1b4bed9208aeaaa52e588c72f43b
WORKTREE=/private/tmp/milaai-site-vps
ARTIFACT=/caminho/privado/artefato-da-release
mkdir -p "$ARTIFACT"
git -C "$WORKTREE" archive --format=tar "$BASE" > "$ARTIFACT/base.tar"
git -C "$WORKTREE" diff --binary "$BASE" -- \
  .gitignore README.md middleware.ts next.config.mjs tests/legal-source-lock.json \
  > "$ARTIFACT/reviewed.patch"
tar -C "$WORKTREE" -cf "$ARTIFACT/new-files.tar" \
  .dockerignore app/api/health/route.ts lib/public-site-url.ts \
  ops/container tests/container-deploy.test.ts
```

Registrar base, SHA256 do patch/archives e hashes dos arquivos da release em manifesto **externo à fonte**, conferir na chegada e guardar junto da evidência operacional. Não incluir valores de env. Materializar em diretório novo usando caminhos absolutos; a release desta entrega só altera fontes de texto no patch.

```sh
RELEASE=/docker/milaai/releases/75099a9-vps-ID_REVISADO
# ARTIFACT é o diretório do pacote revisado já conferido na chegada.
mkdir -p "$RELEASE"
tar -xf "$ARTIFACT/base.tar" -C "$RELEASE"
patch -p1 -d "$RELEASE" < "$ARTIFACT/reviewed.patch"
tar -xf "$ARTIFACT/new-files.tar" -C "$RELEASE"
```

Conferir manifesto antes do build. Não marcar `current` nem reutilizar uma release até validá-la. Uma correção posterior produz novo snapshot/tag.

## Preparação operacional (antes do DNS)

1. Registrar destino/TTL/proxy mode dos **três** DNS e respectivos aliases Vercel; confirmar que a versão fallback e env continuam utilizáveis. Registrar situação de app/wa e do Eve para comparação posterior. Não apagar projetos, domínios ou conta Vercel.
2. Confirmar rede `mila-eve_default` existente e resolução Docker `mila-eve:4274`; Compose usa `external: true` e não cria nem assume ciclo de vida do Eve.
3. Criar o túnel do site por fluxo autorizado, fora do checkout. Preencher o placeholder em cópia de `cloudflared.config.yml.example` para `/docker/milaai/config.yml`, usando o **novo** túnel. Não reutilizar config, credenciais ou UUID do túnel wa.
4. Garantir que UID/GID 65532 do sidecar lê os arquivos. Exemplo: credencial individual dono 65532:65532 mode 0400; config sem segredo mode 0644. Diretório `secrets` pode continuar privado (0700), pois só o arquivo é montado. Nada de montar diretório pai ou `.env` no sidecar. Para rootless/userns, verificar mapeamento antes.
5. Validar schema do Compose com `config --quiet` (não imprimir env), ingress do cloudflared e correspondência UUID/config/credencial. Validar que só apex/www/vitrine têm ingress, com catch-all 404. Sem Access challenge indevido para loja, cookies, OAuth ou webhooks existentes.

Fixar `RELEASE` e `ENV_FILE` em todos os comandos; não depender do cwd, do symlink `current` ou de env automático do Compose.

```sh
RELEASE=/docker/milaai/releases/75099a9-vps-ID_REVISADO
ENV_FILE=/docker/milaai/secrets/deploy.env

docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" config --quiet
docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" build site
# DNS ainda aponta para a hospedagem anterior.
docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" up -d --no-build site
docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" ps
# Só liveness do processo, sem consulta a banco ou provedor.
docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" exec -T site \
  node -e "fetch('http://127.0.0.1:3000/api/health').then(async r => { if(r.status !== 200) process.exit(1); console.log(r.status, await r.json()); }).catch(() => process.exit(1))"
docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" up -d --no-build cloudflared
docker compose --env-file "$ENV_FILE" -f "$RELEASE/ops/container/compose.yml" ps
```

Não publicar porta temporária para provar funcionamento. Um smoke pré-DNS pode ser feito com cliente HTTP efêmero na rede Docker do site, Host de um dos três domínios e `X-Forwarded-Proto: https`, usando apenas health/páginas públicas/sessão sem cookie. Nunca executar `smoke.ts` conectado ao Eve: ele cria seu próprio servidor com mocks e NÃO serve para produção.

## Cutover e validação pelo operador

Só mudar DNS depois de imagem aprovada, secrets completos, site healthy e sidecar conectado. Apontar **somente os três hosts do site** ao túnel novo, preservando app/wa e anotando estado anterior para rollback. Confirmar TLS do edge, HTTPS redirect, cache e Host preservados; manter cookies, `/api/*` e workspace fora de regra de cache global (não criar Cache Everything).

Checklist sem efeitos de lojista:

- HTTPS `/`, `/login`, `/login/verify`, `/privacidade`, `/termos`, `/exclusao-de-dados`: 200; CSS, `/_next/static/*`, imagens e favicon carregam.
- HTTP para os três hosts e para assets: 308 ao mesmo host/caminho/query em HTTPS. HTTPS não entra em loop. HSTS: `max-age=63072000`.
- `/workspace` sem cookie: 307 para login; `/api/session` sem cookie: 401, `private, no-store`. Não criar sessão nem usar cookie real em teste.
- `/onboarding/connect`: 307 a `/login/verify`. URL com `*` do Markdown: 308 em origem pública, nunca localhost/http. Vitrine host conserva o rewrite: comprovar funcionalmente com fixture **local**, não ler vitrine de lojista para validar infraestrutura.
- Turnstile em `/login` completa e habilita botão. Callback apenas guarda token; opcionalmente consumir um token fresco somente em `/api/turnstile` e observar `{ok:true}` sem imprimir o token. **Não submeter formulário**: o submit seguinte enviaria OTP. Token inválido deve retornar 403 `{ok:false}`. Rota é stateless, sem cookie, DB ou OTP, mas chama o verificador externo; só operador autorizado faz esse smoke.
- Conectividade auth/internal: comprovar DNS/rede e, se necessário, rota de rejeição de payload comprovadamente anterior a DB; não mandar telefone/código, fazer pedido, sincronizar catálogo ou chamar cron. Health local não prova backend. Confirmar contrato no código antes de qualquer sonda.
- Comparar estado/restart count/config do Eve e registros app/wa com baseline: inalterados. Não introduzir chamadas que dependam de credencial ou dado real nos testes automatizados.

Depois do smoke, registrar snapshot/tag/digests/manifesto/checklist e atualizar `/docker/milaai/current` ao diretório já validado. Não apagar rollback nem env Vercel. A validação não comprova login, renovação OAuth, checkout, pagamento ou sincronização ponta a ponta: esses fluxos não foram executados por este procedimento sem efeitos.

## Operação e rollback

`restart: unless-stopped` trata saída de processo e reinício do Docker; `init: true`, comando Node direto e `stop_grace_period: 45s` entregam SIGTERM e tempo de encerramento. Logs `json-file` rodam com teto 10 MB × 3 por serviço; manter `info`, sem imprimir headers/tokens e sem debug em produção.

**Healthcheck não reinicia container travado**: apenas marca `unhealthy`. `depends_on: service_healthy` é gate inicial, não monitor contínuo do site. Em falha, operador investiga e decide rollback; não adicionar autoheal ou reiniciar Eve. O cache de imagem Next é efêmero no layer gravável do usuário node, sem dados de negócio nem volume compartilhado.

- Falha de DNS/túnel/site na primeira migração: restaurar exatamente os três registros anteriores (destino, TTL/proxy mode) para Vercel. Não mudar app/wa. Confirmar recuperação de health/páginas/Turnstile. DNS/cache pode causar janela transitória; não apagar a hospedagem fallback durante observação.
- Falha de release posterior: manter túnel e usar snapshot + tag de imagem **anteriores**, env compatível e o mesmo nome Compose `milaai`. Executar `MILAAI_SITE_IMAGE="$PREVIOUS_IMAGE" docker compose --env-file "$ENV_FILE" -f "$PREVIOUS_RELEASE/ops/container/compose.yml" up -d --no-build site`, com ambos os caminhos absolutos e a tag anterior registrada. O override explícito da imagem evita reutilizar por engano a tag nova do `deploy.env`. Guardar a referência anterior antes da troca. Nunca reconstruir a tag antiga por cima.
- Se for preciso parar o novo stack após voltar DNS, parar apenas serviços deste projeto por `docker compose ... stop cloudflared site`. Não executar comandos em outros projetos, não remover rede externa nem volumes do Eve. Não usar prune global para liberar espaço: preservar imagens e snapshots de rollback.

Vercel continua fallback do site e continua hospedando o legado `app`; esta entrega **não elimina seu custo/conta**. Decidir retirada de alias/projeto site só em tarefa posterior, após janela de observação e sem interromper app/cron.

## Verificação local sintética

Node 24 e dependências já instaladas (ou `npm ci --include=dev` em ambiente de teste sem secrets). Não copiar `.env` real. O build não faz consulta a backend e recebe apenas valores públicos sintéticos. Executar no checkout delegado, não no original. **Testes e build devem rodar sequencialmente**: a suíte jurídica gera arquivos em `.next/legal-guard` e um build paralelo pode apagar esse diretório.

```sh
ROOT=/private/tmp/milaai-site-vps
NODE_BIN=/caminho/para/node24/bin
TEST_HOME=$(mktemp -d)
env -i HOME="$TEST_HOME" PATH="$NODE_BIN:/usr/bin:/bin" \
  MILA_BACKEND_DIR="$ROOT/tests/absent-synthetic-backend" npm --prefix "$ROOT" test
env -i HOME="$TEST_HOME" PATH="$NODE_BIN:/usr/bin:/bin" NEXT_TELEMETRY_DISABLED=1 \
  NEXT_PUBLIC_MILA_WA_E164=5500000000000 \
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=synthetic-turnstile-site-key npm --prefix "$ROOT" run build
env -i HOME="$TEST_HOME" PATH="$NODE_BIN:/usr/bin:/bin" \
  node --no-warnings "$ROOT/ops/container/smoke.ts"
rm -rf "$TEST_HOME"
```

`container-deploy.test.ts` verifica standalone/nonroot/devDependencies, allowlists, segredos fora do build/contexto/sidecar, redes/ports, fail-closed e contratos HTTPS/cookie/CSRF/health. `smoke.ts` inicia Next standalone só em loopback e mock HTTP próprio; verifica páginas/assets/redirects/HSTS, OTP simulado, cookie, sessão, OAuth, billing, Meta, vitrine expirada/rewrite e SIGTERM. Não herda env do chamador, não acessa Cloudflare/WhatsApp/DB; Turnstile sem segredo falha fechado antes de rede. O teste backend jurídico preexistente sinaliza ausência de backend real; não fornecer produção para fazê-lo passar.
