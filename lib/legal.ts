/**
 * Fonte única dos fatos de privacidade da mila. (piloto).
 *
 * ── Por que existir ──────────────────────────────────────────────────────────
 * Mesmo motivo do guard do Google (`lib/google-workspace.ts`): a política
 * publicada dizia coisas que o produto NÃO fazia. Medido em 2026-09-30:
 *
 *   1. `privacy@milaai.com.br` — endereço que não existe. O canal real é
 *      `contato@milaai.com.br`.
 *   2. "Provedor de modelo de IA (LLM) — a definir" — FALSO. Já em produção:
 *      Google (`ag/gemini-3.8-flash`) para visão, TypeSafe/Jev para
 *      classificação de intenção e geração de texto por fallback
 *      (`ag/gemini-3.8-flash-low` → `ocg/qwen3.8-flash` → `ocg/glm-5.3-flash`).
 *   3. Cita Olist e Bling como conectores — ambos devolvem 501 hoje
 *      (`app_credentials: {"olist": false, "bling": false}`).
 *   4. OMITE o Google, que é justamente quem processa imagem e texto. O Google
 *      exige divulgação nominal de como o dado dele é acessado, usado e
 *      armazenado, mais a cláusula de Limited Use.
 *
 * A regra que este arquivo protege: **a página não pode afirmar mais do que o
 * produto entrega**. Se um fato aqui mudar, o teste `tests/legal.test.ts`
 * quebra até a página acompanhar.
 *
 * ── Como editar ─────────────────────────────────────────────────────────────
 * Mude AQUI, nunca direto na página. A página importa daqui. As telas são
 * proibidas de digitar à mão o texto destas listas (o teste verifica).
 */

/** Canal oficial do titular (LGPD art. 41 §1º: agente de pequeno porte dispensa
 * encarregado nomeado, mas o canal tem de existir e funcionar). */
export const CONTATO_PRIVACIDADE = "contato@milaai.com.br";

export const INSTAGRAM = "@usemila.ai";

export const ATUALIZADO_EM = "30 de setembro de 2026";

/** Quem usa o serviço. Deixa explícito que NÃO há consumidor final como titular
 * — é a primeira pergunta de qualquer revisão de LGPD sobre este produto. */
export const TITULARES = [
  "A lojista (dona ou pessoa autorizada da loja) — usuária do serviço.",
  "O representante do fornecedor, quando a lojista o cadastra no caderno.",
];

/** O que a mila faz, em uma linha cada. Sem promessa de futuro: só o que roda. */
export const FUNCOES = [
  "Calcula preço de venda a partir do custo, do imposto e da margem que a lojista informa.",
  "Pesquisa preços praticados por concorrentes e a média do mercado.",
  "Lê notas fiscais (XML ou foto) e extrai os itens.",
  "Mantém o cadastro de fornecedores da loja: contato, pedido mínimo, carência e histórico.",
  "Gera textos para site e catálogo (recursos do plano Pro).",
];

/** Não há decisão automatizada com efeito jurídico (LGPD art. 20). */
export const DECISAO_AUTOMATIZADA = false;

export const DECISAO_AUTOMATIZADA_TEXTO =
  "A mila recomenda; quem decide é a lojista. Não há perfilamento, pontuação, " +
  "ranqueamento de pessoas nem decisão de crédito — não se enquadra no art. 20 da LGPD.";

/** Onde os dados entram e o que é feito com eles. */
export const DADOS_TRATADOS: Array<{ dado: string; destino: string }> = [
  {
    dado: "Mensagens de texto enviadas pela lojista no WhatsApp",
    destino:
      "Classificadas para a mila entender o pedido. O texto classificado passa por " +
      "provedor de IA (abaixo). O payload técnico fica registrado para diagnóstico " +
      "e é excluído sob pedido.",
  },
  {
    dado: "Fotos de peças e de notas fiscais",
    destino:
      "Enviadas a modelo de visão para identificação. O texto extraído é o que " +
      "importa; a imagem em si não é armazenada pela mila.",
  },
  {
    dado: "Descrição da peça e região da loja",
    destino:
      "Usadas na consulta de preço de mercado. Fica em cache o preço agregado, " +
      "para não repetir consulta.",
  },
  {
    dado: "Cadastro de fornecedores (nome, contato, pedido mínimo, carência, histórico)",
    destino:
      "Gravado no caderno da loja. A lojista escolhe onde: Notion (a mila só grava em " +
      "base que já existe) ou planilha criada no Google Drive da própria loja.",
  },
  {
    dado: "Telefone e código de verificação (login)",
    destino:
      "O telefone identifica a loja. O código é de vida curta e guardado apenas em " +
      "hash com salt — a mila não consegue lê-lo.",
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
      "Guardadas em cofre cifrado (AES/Fernet), com a chave de decifragem protegida e " +
      "acesso restrito.",
  },
];

/** Subprocessadores — divulgação NOMINAL. É requisito do Google para o app
 * verificado e boa prática de LGPD (art. 33 exige informar transferência
 * internacional). Todos atuam em nome da mila, por conta dela. */
export const SUBCONTROLADORES: Array<{
  nome: string;
  papel: string;
  foraDoBrasil: boolean;
}> = [
  {
    nome: "Google",
    papel:
      "Modelo de visão (lê peça e nota fiscal) e geração de texto. Recebe a imagem " +
      "ou o texto necessário à tarefa. Acesso restrito à planilha que a própria mila " +
      "cria no Drive da loja (escopo drive.file) — não acessa o restante do Drive, " +
      "e-mail ou agenda.",
    foraDoBrasil: true,
  },
  {
    nome: "TypeSafe (System One)",
    papel: "Classificação da intenção da mensagem, para a mila entender o pedido.",
    foraDoBrasil: true,
  },
  {
    nome: "Serper",
    papel: "Consulta de preço de concorrentes e média de mercado.",
    foraDoBrasil: true,
  },
  {
    nome: "MegaAPI",
    papel:
      "Transporte da mensagem no WhatsApp (texto e mídia). O WhatsApp/Meta também " +
      "participa do transporte.",
    foraDoBrasil: false,
  },
  {
    nome: "Vercel",
    papel: "Hospedagem do site e do workspace web.",
    foraDoBrasil: true,
  },
  {
    nome: "Cloudflare",
    papel:
      "DNS, túnel, proteção do endpoint e verificação anti-robô no login (Turnstile).",
    foraDoBrasil: true,
  },
  {
    nome: "Asaas",
    papel: "Processamento de pagamento, quando houver cobrança.",
    foraDoBrasil: false,
  },
  {
    nome: "Provedores de IA de apoio (Alibaba, Zhipu)",
    papel:
      "Usados apenas como alternativa quando o provedor principal está indisponível, " +
      "na geração de texto. Recebem o mesmo texto que seria enviado ao principal.",
    foraDoBrasil: true,
  },
];

/**
 * Retenção. Separada em DUAS colunas de propósito: o que já é praticado e o que
 * é alvo. Hoje NÃO existe rotina automática de expurgo — quem exclui é a equipe,
 * sob pedido. Enquanto isso for verdade, `PRATICADO` tem de dizer isso.
 */
export const EXPURGO_AUTOMATICO_ATIVO = false;

export const RETENCAO: Array<{
  item: string;
  alvo: string;
  praticado: string;
}> = [
  {
    item: "Código de verificação (OTP)",
    alvo: "minutos",
    praticado: "Vida curta; expira sozinho.",
  },
  {
    item: "Payload técnico da mensagem (registro para diagnóstico)",
    alvo: "não definido",
    praticado:
      "Mantido até exclusão sob pedido. Não há rotina automática ainda.",
  },
  {
    item: "Histórico operacional da conversa",
    alvo: "até cerca de 90 dias",
    praticado: "Até exclusão sob pedido. Não há rotina automática ainda.",
  },
  {
    item: "Notas fiscais processadas",
    alvo: "até cerca de 180 dias",
    praticado: "Até exclusão sob pedido. Não há rotina automática ainda.",
  },
  {
    item: "Logs técnicos de visão e download",
    alvo: "até cerca de 30 dias",
    praticado:
      "Só metadado (data, modelo, latência, erro) — sem o conteúdo da mensagem. " +
      "Até exclusão sob pedido.",
  },
  {
    item: "Credenciais de integração",
    alvo: "até a lojista desconectar",
    praticado: "Mantidas enquanto a integração estiver conectada.",
  },
];

export const RETENCAO_NOTA =
  "Estes prazos são alvo. Hoje a exclusão é feita pela equipe sob pedido, pelo " +
  "canal de privacidade. A mila não substitui a obrigação da loja de guardar " +
  "documentos fiscais nos prazos legais.";

/**
 * O que NÃO é feito. Cada linha aqui é uma verificação em disco, não uma
 * intenção — o guard reprova se o produto passar a fazer o contrário.
 */
export const NAO_FEITO = [
  "Não vendemos nem cedemos dados a terceiros fora do que está listado acima.",
  "Não usamos o conteúdo da loja para treinar modelo próprio, nem enviamos esse conteúdo a terceiros para treinar modelos de fundação.",
  "Não acessamos dados de clientes finais da loja: não há CRM, nem base de compradores.",
  "Não acessamos e-mail, agenda ou calendário da loja.",
  "O site não usa rastreadores de marketing: sem analytics de terceiros, pixel ou cookie de publicidade.",
];

/** Conectores que a lojista pode conectar HOJE, com estado medido em produção. */
export const CONECTORES_DISPONIVEIS = [
  "Google (Drive/Planilhas) — a mila cria a planilha do caderno na conta da loja. Escopo drive.file: só enxerga o arquivo que ela mesma criou.",
  "Notion — a mila grava o caderno numa base que a loja já tem; não cria base.",
] as const;

/** Construídos, mas ainda sem validação com credencial de produção. Fica em
 * lista própria para o texto poder ser honesto: a tela existe, o teste com
 * conta real não aconteceu. */
export const CONECTORES_VALIDACAO_PENDENTE = [
  "Jueri — a tela de conexão está pronta e a mila responde consultas de estoque; a validação com a credencial real da loja ainda está pendente.",
] as const;

/** Anunciados em algum momento e que NÃO funcionam: a tela genérica de conexão
 * existe, mas o app OAuth não foi criado e a conexão devolve 501. Estado medido
 * em produção: app_credentials olist=false, bling=false.
 *
 * Ficam registrados aqui para o guard impedir que voltem a ser prometidos como
 * disponíveis — foi exatamente o que aconteceu na `PricingSection`. */
export const CONECTORES_NAO_PRONTOs = ["Olist", "Bling"] as const;

