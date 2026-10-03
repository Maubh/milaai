/**
 * Fonte única dos fatos de privacidade da mila. (piloto).
 *
 * ── Por que existir ──────────────────────────────────────────────────────────
 * Mesmo motivo do guard do Google (`lib/google-workspace.ts`): a política
 * publicada dizia coisas que o produto NÃO fazia. Medido em 2026-09-30:
 *
 *   1. `privacy@milaai.com.br` — endereço que não existe. O canal real é
 *      `contato@milaai.com.br`.
 *   2. "Provedor de modelo de IA (LLM) — a definir" — FALSO. Em produção:
 *      Google (`ag/gemini-3.8-flash`) para visão, TypeSafe/Jev para
 *      classificação de intenção e fallback de texto para Alibaba/Zhipu
 *      (`ocg/qwen3.8-flash`, `ocg/glm-5.3-flash`).
 *   3. Citava Olist e Bling como conectores e OMITIA o Google — quem de fato
 *      processa imagem e texto, e que exige divulgação nominal.
 *   4. Retenção ("90 dias" de chat, "180 dias" de NF-e) sem rotina de expurgo.
 *
 * ── Correções da 2ª rodada (revisão do Grok 4.7, REQUEST_CHANGES) ────────────
 *   a. Exigia cláusula de **Limited Use** explícita (política do Google para
 *      dado de API) — o texto publicado não tinha.
 *   b. `legítimo interesse` estava no lugar errado: é base do art. 7, não
 *      hipótese do **art. 33**. Trocado por cláusulas-padrão contratuais.
 *   c. Alibaba e Zhipu processam na **China** — precisava ser dito.
 *   d. "não tratamos dados de clientes finais" era exagero: a NF-e traz
 *      destinatário (nome, CPF/CNPJ, endereço) e a mila lê a NF-e.
 *   e. O payload cru da mensagem É gravado (`webhook/receiver.py` chama
 *      `store_inbox`) — antes a página dizia o contrário.
 *
 * ── Correção da 3ª rodada: escopo `email` REMOVIDO (2026-09-30) ──────────────
 * Decisão do Maurício: *"lembra que nao iremos ter o escopo de email mais"*.
 * Medido antes de tirar — nada usava:
 *   - nenhum arquivo lia o endereço da conta (`grep` por `userinfo`, `id_token`,
 *     `['email']` = 0 ocorrências em `auth/`, `mila_router/`, `webhook/`);
 *   - o cofre grava só `access_token`, `refresh_token` e `token_type`;
 *   - a checagem de loja usa o tenant da SESSÃO (`data['t']`), não o e-mail de
 *     quem autorizou;
 *   - nenhum teste/e2e afirmava o escopo.
 *
 * Com isso os escopos do app passam a ser `openid` + `drive.file`: **nenhum
 * sensível e nenhum restrito** — o app publica direto, sem verificação, e a
 * mila deixa de receber endereço de e-mail. A política volta a poder dizer "não
 * acessamos e-mail" sem a ressalva do endereço que a 2ª rodada exigiu.
 *
 * ── Como editar ─────────────────────────────────────────────────────────────
 * Mude AQUI, nunca direto na página. O guard `tests/legal.test.ts` transpila e
 * RENDERIZA as páginas, e exige que cada item destas listas apareça no TEXTO
 * VISÍVEL do HTML.
 */

/** Canal oficial do titular. */
export const CONTATO_PRIVACIDADE = "contato@milaai.com.br";

export const INSTAGRAM = "@usemila.ai";

export const ATUALIZADO_EM = "30 de setembro de 2026";

/**
 * Identificação do controlador. Honesto: a empresa ainda não está constituída.
 * A LGPD (art. 41) e o revisor do Google exigem um responsável identificável —
 * enquanto não houver CNPJ, a equipe fundadora é nomeada como tal.
 */
export const CONTROLADOR_NOME = "equipe fundadora da mila.";
export const CONTROLADOR_CNPJ = null;

/** Quem são os titulares dos dados tratados. */
export const TITULARES = [
  "A lojista (dona ou pessoa autorizada da loja) — usuária do serviço.",
  "O representante do fornecedor, quando a lojista o cadastra no caderno.",
  "O destinatário que aparece na nota fiscal, quando a lojista envia uma nota para leitura.",
];

/** O que a mila faz, em uma linha cada. Sem promessa de futuro. */
export const FUNCOES = [
  "Calcula preço de venda a partir do custo, do imposto e da margem que a lojista informa.",
  "Pesquisa preços praticados por concorrentes e a média do mercado.",
  "Lê notas fiscais (XML ou foto) e extrai os itens.",
  "Mantém o cadastro de fornecedores da loja: contato, pedido mínimo, carência e histórico.",
  "Gera textos para site e catálogo (recursos do plano Pro).",
];

/** Não há decisão 100% automatizada com efeito jurídico (LGPD art. 20). */
export const DECISAO_AUTOMATIZADA = false;

export const DECISAO_AUTOMATIZADA_TEXTO =
  "A mila recomenda; quem decide é a lojista. Não há perfilamento, pontuação, " +
  "ranqueamento de pessoas nem decisão de crédito.";

/** Ressalva honesta: a confirmação antes de ações existe em parte das rotas. */
export const DECISAO_AUTOMATIZADA_RESSALVA =
  "Algumas ações que alteram dados ainda não pedem confirmação separada — " +
  "estamos implantando isso rota a rota. Enquanto não estiver completo, confira " +
  "a prévia antes de confirmar.";

/** Bases legais (LGPD art. 7) de cada tratamento. */
export const BASES_LEGAIS: Array<{ finalidade: string; base: string }> = [
  {
    finalidade: "Prestar o serviço pedido (precificar, ler nota, caderno, conteúdo)",
    base: "Execução de contrato (art. 7, V)",
  },
  {
    finalidade: "Autenticar o acesso por código no WhatsApp",
    base: "Execução de contrato e legítimo interesse em segurança (art. 7, V e IX)",
  },
  {
    finalidade: "Segurança, anti-abuso e limites de tentativa",
    base: "Legítimo interesse (art. 7, IX)",
  },
  {
    finalidade: "Cumprir obrigação legal e atender autoridade",
    base: "Obrigação legal e regulatória (art. 7, II)",
  },
  {
    finalidade: "Medir uso com métricas agregadas ou dados desidentificados",
    base: "Legítimo interesse (art. 7, IX)",
  },
];

/** Onde os dados entram e o que é feito com eles. */
export const DADOS_TRATADOS: Array<{ dado: string; destino: string }> = [
  {
    dado: "Mensagens de texto enviadas pela lojista no WhatsApp",
    destino:
      "Classificadas para a mila entender o pedido, com apoio de provedor de IA. " +
      "O conteúdo da mensagem é registrado em arquivo de diagnóstico para " +
      "investigar erro e é excluído sob pedido.",
  },
  {
    dado: "Fotos de peças e de notas fiscais",
    destino:
      "Enviadas a modelo de visão para identificação do que está na imagem. " +
      "O texto e os dados extraídos ficam no histórico da loja. As imagens não " +
      "são guardadas em pasta própria pela mila; o arquivo de diagnóstico da " +
      "mensagem pode conter a referência recebida.",
  },
  {
    dado: "Descrição da peça e região da loja",
    destino:
      "Usadas na consulta de preço de mercado. Fica em cache o preço agregado, " +
      "para não repetir consulta.",
  },
  {
    dado:
      "Notas fiscais: dados do emitente, itens e o destinatário (nome, CPF/CNPJ, endereço)",
    destino:
      "Lidos para extrair custo e itens. Quando aparecem dados de terceiros " +
      "(destinatário, fornecedor), a loja é a controladora desses dados e a mila " +
      "atua como operadora, para prestar o serviço que a loja pediu.",
  },
  {
    dado: "Cadastro de fornecedores (nome, contato, pedido mínimo, carência, histórico)",
    destino:
      "Gravado no caderno da loja. A lojista escolhe onde: Notion (a mila só " +
      "grava em base que já existe) ou planilha criada no Google Drive da loja. " +
      "A mila não envia mensagens a fornecedores.",
  },
  {
    dado: "Telefone e código de verificação (login)",
    destino:
      "O telefone identifica a loja. O código é de vida curta e guardado apenas " +
      "em hash com salt (SHA-256 + salt aleatório) — a mila não consegue lê-lo.",
  },
  {
    dado: "Dados de cobrança (quando houver plano pago)",
    destino:
      "Processados pela operadora de pagamentos. Dados de cartão são coletados e " +
      "guardados por ela; não passam nem repousam nos servidores da mila.",
  },
  {
    dado: "Credenciais de integração, quando a lojista conecta uma conta",
    destino:
      "Guardadas em cofre cifrado com Fernet (AES-128-CBC + HMAC), com a chave de " +
      "decifragem em arquivo de permissão restrita (600).",
  },
];

/** Escopos que a mila pede ao Google. A fonte real é `auth/oauth.py` na VPS —
 *  este array existe para o texto da política poder ser conferido contra o
 *  código, e o guard reprova se o repo passar a mencionar escopo fora daqui.
 *
 *  `email` SAIU em 2026-09-30 (ordem do Maurício). Sem ele a mila não recebe o
 *  endereço da conta — e a política pode dizer "não acessamos e-mail" sem a
 *  ressalva do endereço. `openid` fica: é não-sensível e é como o fluxo sabe
 *  QUAL conta conectou. */
export const GOOGLE_ESCOPOS = [
  "openid",
  "https://www.googleapis.com/auth/drive.file",
] as const;

export const GOOGLE_O_QUE_ACESSA =
  "Ao conectar o Google, a mila recebe um identificador da conta (escopo openid). " +
  "Ela NÃO recebe seu endereço de e-mail. Na prática, quem mantém o vínculo entre " +
  "a conexão e a sua loja é a sessão autenticada no WhatsApp — a mila não usa o " +
  "identificador para saber de qual conta se trata, e a tela não mostra o " +
  "endereço da conta conectada. Acesso a arquivos fica restrito ao escopo " +
  "drive.file: só os arquivos que a própria mila cria. Ela não abre, não lista e " +
  "não altera o restante do seu Drive, não lê sua caixa de e-mail e não acessa " +
  "sua agenda ou seu calendário.";

/**
 * Cláusula de Limited Use — exigida pela Política de Dados de Usuário dos
 * Serviços de API do Google (aplica-se a TODO dado recebido das APIs, inclusive
 * de escopo não sensível como `drive.file`).
 *
 * A revisão do Grok 4.7 apontou o que faltava na 1ª versão: proibição de uso
 * para crédito/scoring, regra de transferência a operadores, acesso humano no
 * padrão do Google (consentimento para o dado específico, não "quando pedir
 * suporte"), e coerência com a seção 7 (o identificador da conta serve para
 * registrar a conexão, não só para o caderno).
 */
export const GOOGLE_LIMITED_USE =
  "Uso de dados do Google. O que a mila recebe das APIs do Google é usado " +
  "somente para fornecer e melhorar as funcionalidades que você vê: criar e " +
  "manter a planilha do caderno de fornecedores que ela mesma cria, e registrar " +
  "a conexão da conta. Não usamos esses dados para publicidade, não os vendemos, " +
  "não os usamos para avaliar crédito, pontuação ou risco de pessoas, nem para " +
  "treinar modelos de inteligência artificial. Esses dados só são repassados a " +
  "prestador que nos atende sob contrato e apenas no necessário para a " +
  "finalidade contratada, para segurança ou para cumprir a lei. Nenhuma pessoa " +
  "lê o conteúdo do seu Drive ou da sua conta sem a sua autorização específica " +
  "para aquela situação — o suporte a que você dá acesso é feito em conversa " +
  "conosco, não pela leitura do seu Drive. O uso segue a Política de Dados de " +
  "Usuário dos Serviços de API do Google, incluindo os requisitos de Limited Use.";

/**
 * Subprocessadores — divulgação NOMINAL. Requisito do Google para o app
 * verificado e boa prática de LGPD. `pais` é obrigatório: o art. 33 exige
 * informar a transferência internacional e para onde.
 */
export const SUBCONTROLADORES: Array<{
  nome: string;
  papel: string;
  pais: string;
  /**
   * Que dado RECEBIDO DO GOOGLE este prestador toca. Não é booleano.
   *
   * A 3ª revisão do Grok mostrou o furo: `dadoDoGoogle: boolean` era um campo
   * morto — nenhum teste o lia e a página não o renderizava. Então dava para
   * marcar `true` e o titular nunca saber. Aqui o campo é uma união que a
   * página OBRIGA a renderizar (o texto sai na lista de subprocessadores), e o
   * guard confere que cada valor aparece no HTML.
   *
   * `false` = não recebe nada oriundo das APIs do Google.
   */
  tocaDadoDoGoogle: false | "arquivo e conteúdo do Drive" | "foto, nota e texto";
}> = [
  {
    nome: "Google",
    papel:
      "Modelo de visão (lê a foto da peça e da nota) e geração de texto. " +
      "Também guarda a planilha do caderno no Drive da loja, quando ela escolhe " +
      "essa opção.",
    pais: "Estados Unidos",
    tocaDadoDoGoogle: "arquivo e conteúdo do Drive",
  },
  {
    nome: "TypeSafe (System One)",
    papel:
      "Classificação da intenção da mensagem, para a mila entender o pedido. " +
      "Recebe o texto da mensagem.",
    pais: "Estados Unidos",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "Alibaba",
    papel:
      "Modelo de texto alternativo, usado só quando o provedor principal está " +
      "indisponível. Recebe o mesmo texto que seria enviado ao principal.",
    pais: "China",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "Zhipu",
    papel:
      "Segundo modelo de texto alternativo, na mesma condição do anterior. " +
      "Acionado só quando a alternativa gratuita está fora. Recebe o texto da " +
      "mensagem enviada à mila no WhatsApp — não recebe arquivo do seu Drive, " +
      "nem o conteúdo da sua planilha, nem credencial de acesso.",
    pais: "China",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "Serper",
    papel: "Consulta de preço de concorrentes e média de mercado.",
    pais: "Estados Unidos",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "MegaAPI",
    papel:
      "Transporte da mensagem no WhatsApp (texto e mídia). O WhatsApp/Meta " +
      "também participa do transporte.",
    pais: "Brasil",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "Vercel",
    papel: "Hospedagem do site e do workspace web.",
    pais: "Estados Unidos",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "Cloudflare",
    papel:
      "DNS, túnel, proteção do endpoint e verificação anti-robô no login " +
      "(Turnstile).",
    pais: "Estados Unidos",
    tocaDadoDoGoogle: false,
  },
  {
    nome: "Asaas",
    papel: "Processamento de pagamento, quando houver cobrança.",
    pais: "Brasil",
    tocaDadoDoGoogle: false,
  },
];

/**
 * Transferência internacional.
 *
 * A 3ª revisão do Grok mostrou que congelar só as palavras "transferência
 * internacional" e "China" não bastava: dava para trocar o corpo por
 * "cláusulas-padrão já firmadas" e a suíte ficava verde. Os fragmentos que
 * carregam a DECISÃO (mecanismo em formalização, o que se transfere, o que
 * NÃO vai) estão congelados em `tests/legal.test.ts`. A revisão do Grok 4.7 mostrou que a 1ª versão
 * afirmava "usamos cláusulas contratuais-padrão" como se o art. 33 já estivesse
 * fechado — e não há instrumento nenhum nem pessoa jurídica constituída para
 * assinar. O texto passa a ser honesto: a transferência acontece, o mecanismo
 * ainda não está formalizado, e a responsabilidade fica com quem opera.
 */
export const TRANSFERENCIA_INTERNACIONAL =
  "Vários prestadores acima processam dados fora do Brasil — Estados Unidos " +
  "(Google, TypeSafe, Serper, Vercel, Cloudflare) e China (Alibaba, Zhipu). Isso " +
  "é transferência internacional (LGPD, art. 33). Mecanismo: os contratos de " +
  "adesão (termos de serviço) desses fornecedores preveem as salvaguardas de " +
  "proteção de dados, e a formalização das cláusulas-padrão segue pendente " +
  "enquanto a empresa não estiver constituída. Enquanto isso, transferimos o " +
  "mínimo necessário: o texto da mensagem que você envia à mila. Nada de arquivo " +
  "do seu Drive, de credencial da sua conta ou de conteúdo da sua planilha vai " +
  "para os modelos alternativos. Chips de fornecedor chinês aparecem " +
  "nominalmente porque você tem o direito de saber para onde o dado vai.";

/**
 * Retenção. Separada em ALVO × PRATICADO de propósito: hoje NÃO existe rotina
 * automática de expurgo — quem exclui é a equipe, sob pedido.
 */
export const EXPURGO_AUTOMATICO_ATIVO = false;

export const RETENCAO: Array<{ item: string; alvo: string; praticado: string }> = [
  {
    item: "Código de verificação (OTP)",
    alvo: "minutos",
    praticado: "Vida curta; expira sozinho.",
  },
  {
    item: "Arquivo de diagnóstico da mensagem recebida",
    alvo: "não definido",
    praticado: "Mantido até exclusão sob pedido.",
  },
  {
    item: "Histórico operacional da conversa",
    alvo: "até cerca de 90 dias",
    praticado: "Mantido até exclusão sob pedido.",
  },
  {
    item: "Notas fiscais processadas",
    alvo: "até cerca de 180 dias",
    praticado: "Mantido até exclusão sob pedido.",
  },
  {
    item: "Logs técnicos de visão e download",
    alvo: "até cerca de 30 dias",
    praticado:
      "Só metadado (data, modelo, latência, erro) — sem o conteúdo da mensagem.",
  },
  {
    item: "Credenciais de integração",
    alvo: "até a lojista desconectar",
    praticado: "Mantidas enquanto a integração estiver conectada.",
  },
];

export const RETENCAO_NOTA =
  "Estes prazos são alvo, ainda não são automáticos: hoje a exclusão é feita " +
  "pela equipe sob pedido, pelo canal de privacidade. A mila não substitui a " +
  "obrigação da loja de guardar documentos fiscais nos prazos legais.";

/** Isolamento entre lojas: o que já é praticado e o que ainda é meta. */
export const ISOLAMENTO = [
  "Praticado: cada loja é um espaço separado; o acesso é restrito por lista de números autorizados e o registro de sessão é por loja.",
  "Em implantação: registro sistemático de acesso excepcional da equipe fundadora. A estrutura de auditoria existe, mas o registro automático ainda não está ligado.",
] as const;

/** Direitos do titular (LGPD art. 18). */
export const DIREITOS = [
  "confirmação de que tratamos seus dados e acesso a eles",
  "correção de dados incompletos, inexatos ou desatualizados",
  "anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos",
  "portabilidade, quando aplicável",
  "eliminação dos dados tratados com consentimento",
  "informação sobre com quem compartilhamos",
  "informação sobre a possibilidade de não consentir e as consequências disso",
  "revogação do consentimento e oposição a tratamento fundado em legítimo interesse",
] as const;

/** Número da seção de contato — o guard usa para não depender de texto solto. */
export const SECAO_CONTATO = 15;

/**
 * O que NÃO é feito. Cada linha aqui é uma verificação em disco, não uma
 * intenção — o guard reprova se o produto passar a fazer o contrário.
 */
export const NAO_FEITO = [
  "Não vendemos nem cedemos dados a terceiros fora dos prestadores listados acima.",
  "Não usamos o conteúdo da loja para treinar modelo próprio, nem enviamos esse conteúdo a terceiros para treinar modelos de fundação.",
  "Não acessamos o endereço, a caixa de e-mail, a agenda ou o calendário da conta Google da loja.",
  "Não mantemos CRM, histórico de vendas a consumidores finais nem base de compradores da loja.",
  "O site não usa rastreadores de marketing: sem analytics de terceiros, pixel ou cookie de publicidade.",
  "Não há decisão totalmente automatizada que afete a lojista ou seus clientes.",
];

/** Conectores que a lojista pode conectar HOJE, com estado medido em produção. */
export const CONECTORES_DISPONIVEIS = [
  "Google (Drive/Planilhas) — a mila cria a planilha do caderno na conta da loja, com o escopo drive.file (só o arquivo que ela mesma criou).",
  "Notion — a mila grava o caderno numa base que a loja já tem; não cria base.",
  "Olist (Tiny ERP) — conexão direta OAuth para sincronização de catálogo e estoque.",
] as const;

/** Construídos, mas ainda sem validação com credencial de produção. */
export const CONECTORES_VALIDACAO_PENDENTE = [
  "Jueri — a tela de conexão está pronta e a mila responde consultas de estoque; a validação com a credencial real da loja ainda está pendente.",
] as const;

/** Anunciados em algum momento e que NÃO funcionam: a tela genérica de conexão
 *  existe, mas o app OAuth não foi criado e a conexão devolve erro 501.
 *  Estado medido em produção: app_credentials bling=false. */
export const CONECTORES_NAO_PRONTOs = ["Bling"] as const;

/** Frase única que apresenta os não prontos — o guard exige que ela exista. */
export const NAO_PRONTOs_FRASE =
  "Anunciados anteriormente e ainda não disponíveis: Bling. A tela de " +
  "conexão existe, mas o acesso ainda não foi habilitado — não conte com eles " +
  "para a operação da sua loja por enquanto.";


/** Sentinela de fim de arquivo. O guard lê este arquivo para comparar a lista
 *  publicada de escopos com a fonte real do app (`auth/oauth.py`). Se um
 *  arquivo grande for concatenado no fim, o arquivo deixa de terminar aqui e o
 *  teste falha de propósito — em vez de varrer um arquivo mutilado.
 *  (Furo apontado na 3ª revisão do Grok: o corte `"google"`→`"notion"` podia cair
 *  num comentário decoy e ler o bloco errado.) */
export const MILA_LEGAL_FIM = "mila-legal-fim";
