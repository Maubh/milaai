import packageJson from "../package.json" with { type: "json" };

export const SYSTEM_VERSION = packageJson.version;

export type ReleaseChange = {
  type: "new" | "improvement" | "fix";
  /** Para quem vale: os dois planos ou só o Pro (`docs/especificacao_planos.md`). */
  plan: "all" | "pro";
  title: string;
  description: string;
};
export type Release = {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: readonly ReleaseChange[];
  /**
   * Só acabamento (tamanho, alinhamento, espaçamento): a versão fica no
   * histórico técnico, mas não vira novidade para a lojista. Fica fora da
   * página, do sino, da visão geral e do aviso de não lido.
   */
  internal?: true;
};

// Newest first. Preserve published entries when adding the next release.
export const RELEASES: readonly Release[] = [
  {
    version: "0.6.28",
    date: "2026-11-01",
    title: "Roteiro de Reels cena a cena e legendas conferidas",
    summary: "A mila monta o Reels com o tempo de cada cena, mostra os posts que fugiram do normal no seu nicho e confere a legenda antes de entregar.",
    changes: [
      {
        type: "new",
        plan: "pro",
        title: "Roteiro de Reels cena a cena",
        description: "Peça um Reels de uma peça e a mila monta o roteiro: o gancho dos 2 primeiros segundos, cada cena com o tempo, o que filmar, o texto na tela e a fala, um final que puxa o replay, a capa e a legenda. Se você prefere não falar para a câmera, o roteiro sai só com texto na tela e o tipo de áudio.",
      },
      {
        type: "improvement",
        plan: "pro",
        title: "Posts fora da curva na análise do nicho",
        description: "Na análise do nicho e do seu perfil, a mila aponta os posts que renderam 3 vezes ou mais o normal da própria conta, em curtidas e comentários ou em visualizações de Reels. Assim aparece o perfil pequeno que acertou num post, e não só quem já tem muitos seguidores.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Legenda conferida antes de chegar a você",
        description: "Antes de entregar uma legenda, a mila confere o que aparece no feed antes do \"mais\", deixa no máximo 5 hashtags (o limite do Instagram) e uma chamada só, e tira caracteres invisíveis que atrapalham quando você copia e cola. Se você pedir mais hashtags, ela explica o limite e entrega só as 5 que conferiu, sem uma lista a mais.",
      },
    ],
  },
  {
    version: "0.6.27",
    date: "2026-10-31",
    title: "Reorganize as colunas do Trello pelo WhatsApp",
    summary: "Mude a ordem das colunas dentro do mesmo quadro do Trello direto na conversa com a mila.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "Colunas na ordem que faz sentido para a sua loja",
        description: "Peça à mila pelo WhatsApp para colocar uma coluna no início ou no fim do quadro, ou antes ou depois de outra coluna do mesmo quadro. Por exemplo: \"coloca Pós-venda depois de Entregue\". Disponível no Essencial e no Pro.",
      },
    ],
  },
  {
    version: "0.6.26",
    date: "2026-10-31",
    title: "Conectar o Trello funciona com a sua conta",
    summary: "A conexão do Trello agora aceita qualquer conta e todos os seus quadros.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Conexão do Trello liberada para qualquer conta",
        description: "Antes, ao conectar o Trello, a tela de autorização podia recusar a sua conta e a conexão não terminava. Agora a mila. pede a autorização direto no Trello, que aceita qualquer conta, e enxerga os quadros de todas as suas áreas de trabalho. Se você já tinha conectado, conecte de novo uma vez em Integrações.",
      },
    ],
  },
  {
    version: "0.6.25",
    date: "2026-10-30",
    title: "Preço sempre calculado com o markup que você informar",
    summary: "Quando você diz seu markup, o preço sai sempre da calculadora, com embalagem e taxa da sua loja.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Preço sai sempre da calculadora, mesmo quando você informa o markup na hora",
        description: "Antes, quando você respondia seu markup na conversa, o preço podia sair como estimativa de cabeça, sem a embalagem e a taxa da sua loja. Agora o preço sai sempre calculado com tudo o que está cadastrado, e o markup que você informou fica salvo para as próximas peças.",
      },
    ],
  },
  {
    version: "0.6.24",
    date: "2026-10-29",
    title: "Listas do Trello pelo WhatsApp e conexão renovada",
    summary: "Crie listas e organize as tarefas no Trello pelo WhatsApp. A conexão agora renova o acesso automaticamente.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "Crie listas e organize os cards pelo WhatsApp",
        description: "Peça à mila para criar listas (colunas), como \"Pós-venda\", no seu quadro do Trello e criar ou mover cards para elas. Assim você organiza as tarefas da loja direto na conversa.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Conexão do Trello com renovação automática",
        description: "A mila renova o acesso automaticamente, sem você precisar reconectar o Trello a cada vencimento. Se a autorização for revogada ou o prazo de renovação acabar, será preciso conectar de novo.",
      },
    ],
  },
  {
    version: "0.6.23",
    date: "2026-10-28",
    title: "A mila lê o seu Notion",
    summary: "Agora a mila abre as páginas, as bases e os cards do seu Notion para usar o que você já planejou lá.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "A mila lê páginas, bases e cards do Notion",
        description: "Peça para a mila abrir algo do seu Notion, como \"entra no Creator Lab Planner, no menu Carrossel, e lê o card O que ninguém te conta\". Ela lê o texto da página e os campos do card e usa isso na conversa. Ela só lê: nada do que você já tem no Notion é alterado, e ela vê só as páginas que você liberou ao conectar.",
      },
    ],
  },
  {
    version: "0.6.22",
    date: "2026-10-28",
    title: "A mila volta a responder depois de uma falha",
    summary: "Corrigimos uma falha que podia fazer a mila pedir para você reenviar a mensagem várias vezes seguidas.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Sem o pedido repetido de reenviar a mensagem",
        description: "Em algumas conversas antigas, a mila respondia a toda mensagem que tinha tido uma oscilação e pedia para você mandar de novo. Agora, quando isso acontece, ela recomeça a conversa sozinha, lembrando o que vocês falaram por último, e responde a sua mensagem.",
      },
    ],
  },
  {
    version: "0.6.21",
    date: "2026-10-28",
    title: "A mila responde normalmente com o Trello",
    summary: "Corrigimos uma falha que podia deixar a mila sem responder depois da chegada do Trello.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "A mila continua respondendo com o Trello disponível",
        description: "Corrigimos uma falha que podia fazer a mila parar de responder às mensagens depois da chegada do Trello. Agora ela atende normalmente, com ou sem o Trello conectado.",
      },
    ],
  },
  {
    version: "0.6.20",
    internal: true,
    date: "2026-10-28",
    title: "Trello mais fácil de identificar",
    summary: "Os planos e as conexões mostram o Trello com mais clareza.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Trello claro nos dois planos e nas conexões",
        description: "A gestão de tarefas no Trello pelo WhatsApp aparece nos planos Essencial e Pro, tanto na página inicial quanto em Meu plano. A logo do Trello também aparece na lista de integrações e na tela de conexão.",
      },
    ],
  },
  {
    version: "0.6.19",
    date: "2026-10-28",
    title: "Trello para gestão de tarefas da loja",
    summary: "Conecte seu Trello à mila e gerencie tarefas, quadros e pendências da sua rotina pelo WhatsApp.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "Trello disponível no Essencial e no Pro",
        description: "Conecte seu Trello e peça à mila para consultar quadros, listar cards, criar e atualizar tarefas da rotina da loja diretamente na conversa. A autorização é feita no painel e vale só para a sua loja.",
      },
    ],
  },
  {
    version: "0.6.18",
    date: "2026-10-27",
    title: "Catálogo Meta mais simples de configurar",
    summary: "O Configurar do catálogo Meta abre só quando você pede, e Sincronizar sempre responde ao toque.",
    changes: [
      {
        type: "improvement",
        plan: "pro",
        title: "Catálogo Meta mais simples de configurar",
        description: "Em Integrações, o painel Configurar do catálogo Meta não abre mais sozinho. Se ainda falta escolher a fonte dos produtos, tocar em Sincronizar abre o Configurar direto na escolha da fonte.",
      },
    ],
  },
  {
    version: "0.6.17",
    date: "2026-10-27",
    title: "Tabela na mesma página do PDF",
    summary: "A mila consegue criar uma tabela na página que acabou de criar para seu PDF no Notion.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Tabela na mesma página do PDF",
        description: "Depois de salvar um PDF no Notion, você pode pedir uma tabela na mesma página. A mila usa a página criada para o PDF como destino. Quando há dúvida sobre o local, ela pede o link da página antes de criar.",
      },
    ],
  },
  {
    version: "0.6.16",
    date: "2026-10-27",
    title: "Notion conectado com um toque",
    summary: "Conectar o Notion pelo celular, com um toque.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Conectar o Notion pelo celular, com um toque",
        description: "Na área de integrações, abra o Notion e toque em Conectar com Notion. Entre na sua conta e marque onde a mila pode guardar o que criar. Não precisa mais criar conexão nem copiar token no computador. Quem já tinha conectado continua conectado.",
      },
    ],
  },
  {
    version: "0.6.15",
    date: "2026-10-27",
    title: "A mila continua de onde vocês pararam",
    summary: "Quando você volta depois de algumas horas, a mila responde mais rápido e continua o assunto que ficou em aberto.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Conversa retomada, resposta mais rápida",
        description: "Depois de algumas horas sem mensagem, a mila começa uma conversa mais leve, que responde mais rápido, e leva junto o fim da conversa anterior. Se ela tinha perguntado algo, como o peso de uma peça, é só responder: ela continua o cálculo de onde parou.",
      },
    ],
  },
  {
    version: "0.6.14",
    date: "2026-10-27",
    title: "Passo a passo do Notion corrigido",
    summary: "O link da ajuda para criar a conexão do Notion abria uma tela que não existe mais.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Link certo para criar a conexão do Notion",
        description: "Na tela de conectar o Notion, o passo a passo agora leva à tela atual de conexões do Notion e avisa que esse passo é feito no computador, porque o app do Notion no celular não tem essa tela.",
      },
    ],
  },
  {
    version: "0.6.13",
    date: "2026-10-27",
    title: "PDF também no Notion",
    summary: "O PDF que você pede à mila agora também pode ficar no seu Notion, além do Google Drive.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Escolha onde salvar o PDF",
        description: "Se você usa o Notion, a mila salva o PDF numa página nova dentro da página que você escolher. Com o Google e o Notion conectados, ela pergunta onde você prefere. O PDF continua só seu.",
      },
    ],
  },
  {
    version: "0.6.12",
    date: "2026-10-27",
    title: "PDF salvo no seu Google Drive",
    summary: "Peça um PDF no WhatsApp e a mila monta e salva no seu Google Drive, com o link para abrir e compartilhar.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "A mila faz PDF",
        description: "Peça a lista dos seus produtos com SKU, a tabela de preços ou um relatório em PDF. A mila monta o arquivo, salva no seu Google Drive e manda o link. O PDF é só seu: abre para você e para quem você compartilhar. Se o Google ainda não estiver conectado, ela manda o link para conectar.",
      },
    ],
  },
  {
    version: "0.6.11",
    date: "2026-10-27",
    title: "Seus arquivos ficam só com você",
    summary: "Tudo o que a mila cria para você como arquivo fica no seu Google ou no seu Notion, e em nenhum outro lugar.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Arquivos só no seu Google ou Notion",
        description: "A mila não usa mais sites de fora para te mandar arquivo. Planilhas e bases ficam no seu Google ou no seu Notion, e ela avisa onde salvou. PDF ainda não sai por aqui: se você pedir, ela oferece o mesmo conteúdo em planilha ou no Notion.",
      },
    ],
  },
  {
    version: "0.6.10",
    date: "2026-10-27",
    title: "Um bom dia é só um bom dia",
    summary: "Quando você só cumprimenta a mila, ela responde e pergunta como pode ajudar, sem começar sozinha uma tarefa que você não pediu.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Cumprimento não dispara tarefa",
        description: "Se você manda só \"bom dia\" ou \"boa tarde\", a mila responde o cumprimento e pergunta como pode ajudar. Se ela tinha te oferecido algo antes, ela pergunta se você quer seguir, em vez de já fazer.",
      },
    ],
  },
  {
    version: "0.6.9",
    date: "2026-10-27",
    title: "A mila responde mais rápido",
    summary: "Em conversas longas, a mila deixou de perder segundos conferindo o histórico antes de cada resposta.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Respostas mais rápidas no WhatsApp",
        description: "A mila responde mais rápido, principalmente em conversas longas, que antes podiam levar quase um minuto para receber resposta.",
      },
    ],
  },
  {
    version: "0.6.8",
    date: "2026-10-27",
    title: "Carrossel, Reels e calendário de posts de volta no Pro",
    summary: "No Plano Pro, a mila volta a montar carrossel slide a slide, roteiro de Reels, planejamento da semana e calendário de posts para o seu Instagram.",
    changes: [
      {
        type: "fix",
        plan: "pro",
        title: "Pedidos de Instagram do Pro atendidos",
        description: "Quando você pede um carrossel slide a slide, um roteiro de Reels, o planejamento da semana ou o calendário de posts, a mila monta o conteúdo. Antes, mesmo no Plano Pro, ela podia responder que esse recurso era do Pro em vez de entregar.",
      },
    ],
  },
  {
    version: "0.6.7",
    date: "2026-10-27",
    title: "Resposta curta quando você se despede",
    summary: "Quando você só agradece ou avisa que vai fazer algo, a mila responde curto, sem aviso de espera e sem puxar outro assunto.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Resposta curta ao seu obrigada",
        description: "Se você agradece, se despede ou diz que vai fazer e depois avisa, a mila responde em uma linha e não manda mais o \"Só um minutinho que já te trago o retorno\".",
      },
    ],
  },
  {
    version: "0.6.6",
    date: "2026-10-27",
    title: "Tela do Google mostra a caixa que precisa marcar",
    summary: "Antes de conectar o Google, a tela avisa para marcar a caixa do Drive, que vem desmarcada na tela do Google.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Aviso para marcar a caixa do Drive",
        description: "Na tela de conexão do Google, a mila avisa para marcar a caixa ao lado do ícone do Drive antes de tocar em Continuar. Sem ela, a mila não consegue criar a sua planilha.",
      },
    ],
  },
  {
    version: "0.6.5",
    date: "2026-10-27",
    title: "A mila responde o seu bom dia",
    summary: "Quando você chega com bom dia, boa tarde ou boa noite, a mila responde com a mesma saudação antes de seguir com o seu pedido.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Bom dia, boa tarde e boa noite de volta",
        description: "Se você cumprimenta a mila com bom dia, boa tarde ou boa noite no WhatsApp, ela responde com a mesma saudação e já segue com o que você pediu.",
      },
    ],
  },
  {
    version: "0.6.4",
    date: "2026-10-27",
    title: "Sessão vencida leva ao login e volta às integrações",
    summary: "Quando a sessão expira nas integrações, a mila leva você ao login e, depois do código, de volta às integrações.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Link das integrações volta às integrações depois do login",
        description: "Se você abrir o link das integrações sem ter entrado, depois do código você chega direto nas integrações, e não na visão geral.",
      },
      {
        type: "fix",
        plan: "all",
        title: "Sessão expirada nas integrações mostra como entrar de novo",
        description: "Quando a sessão expira, as integrações, o botão de desconectar e o catálogo da Meta avisam e levam ao login, em vez de mostrar um erro ou pedir para tentar mais tarde.",
      },
      {
        type: "fix",
        plan: "all",
        title: "Google avisa quando falta a permissão do Drive",
        description: "Se a caixa do Drive ficar desmarcada na tela do Google, a mila avisa na hora o que marcar, em vez de dizer depois, na planilha, que a conexão venceu.",
      },
    ],
  },
  {
    version: "0.6.3",
    date: "2026-10-27",
    title: "Link de conexão leva ao login e volta",
    summary: "Quem abre o link de um conector sem ter entrado no site vai para o login e, depois do código, volta para a tela de conexão.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Conectar o Google pelo link do WhatsApp",
        description: "Se você ainda não entrou no site, o botão de conectar leva ao login e, depois do código, volta para a tela de conexão, em vez de mostrar um erro.",
      },
    ],
  },
  {
    version: "0.6.2",
    date: "2026-10-24",
    internal: true,
    title: "Menu da conta fecha no segundo toque",
    summary: "No Safari e no celular, tocar de novo no avatar fecha o menu da conta, em vez de fechar e reabrir na hora.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Avatar abre e fecha o menu da conta",
        description: "Tocar de novo no avatar fecha o menu da conta.",
      },
    ],
  },
  {
    version: "0.6.1",
    date: "2026-10-24",
    internal: true,
    title: "Dados da loja na mesma largura das outras telas",
    summary: "Os cards de Dados da loja deixam o teto próprio de 860px e ocupam o mesmo container das outras telas, com a borda direita alinhada à da conta no topo.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Cards de Dados da loja na largura da área",
        description: "Os cards ocupam a mesma largura das outras telas, sem sobra à direita no computador.",
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-10-24",
    title: "Site da loja em Dados da loja",
    summary: "Agora você pode guardar o endereço do site da sua loja junto com o nome e o Instagram.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "Site da loja",
        description: "Em Dados da loja, na parte Sobre a loja, informe o endereço do seu site, como sualoja.com.br. Ele fica salvo junto com o nome e o Instagram, e você pode trocar ou apagar quando quiser.",
      },
    ],
  },
  {
    version: "0.5.2",
    date: "2026-10-24",
    internal: true,
    title: "Atualizações só com o que muda o uso e selos de plano iguais",
    summary: "Ajustes de acabamento ficam fora das Atualizações. Nas notas, o tipo fica acima do plano; o Configurar da Meta vira botão ao lado de Sincronizar; no celular, o selo Pro fica junto da marca; página nova abre no topo.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Tipo acima do plano nas notas",
        description: "Novo, Melhoria ou Correção fica sempre acima de Plano Pro ou de Essencial e Pro, com selos de plano no mesmo formato.",
      },
    ],
  },
  {
    version: "0.5.1",
    date: "2026-10-24",
    internal: true,
    title: "Confirmação de desconectar mais fácil de tocar",
    summary: "Ao desconectar uma ferramenta, Cancelar e Desconectar agora têm a mesma altura e, no celular, mais espaço entre eles.",
    changes: [
      {
        type: "fix",
        plan: "all",
        title: "Cancelar e Desconectar com a mesma altura",
        description: "Os botões Cancelar e Desconectar agora têm a mesma altura. No celular, há mais espaço entre eles.",
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-10-24",
    title: "Sua área com cara nova, mensagens prontas e atualizações em tela cheia",
    summary: "A área da sua loja ganhou um visual novo, mais claro no computador e no celular: o que fazer agora aparece na visão geral e as novidades abrem em tela cheia.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Visual novo na área da sua loja",
        description: "A área da sua loja ganhou um visual mais limpo e uma navegação reorganizada, adaptada ao computador e ao celular.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Menu novo, no topo e no celular",
        description: "No computador, Visão geral, Dados da loja, Integrações e Meu plano ficam numa barra no topo, e as novidades no sino ao lado. No celular, os mesmos destinos e as Atualizações ficam na barra de baixo.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Visão geral com mensagens prontas e próximos passos",
        description: "Comece uma conversa com a mila num toque: calcular o preço de uma peça, escrever a descrição de uma peça ou ler uma nota de compra. Logo abaixo, os próximos passos dizem de onde vêm, como o plano ou o catálogo da Meta, e levam direto ao lugar certo.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Atualizações em tela cheia no celular",
        description: "No celular, o sino abre as novidades numa tela inteira, fácil de ler e de fechar, e você volta para o mesmo ponto da página.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Dados da loja mais fácil de editar",
        description: "O botão de editar fica no canto de cada bloco, salvar e cancelar ficam no mesmo lugar, e os campos mostram a unidade: %, R$ ou x. Concorrentes no Instagram mostra o mesmo cadeado quando o seu plano não inclui a análise.",
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-10-23",
    title: "Planilhas feitas pela mila, nota em PDF no balanço e fatura à mão",
    summary: "Peça uma planilha e a mila monta no seu Google ou no seu Notion. A nota em PDF entra sozinha no balanço, e a fatura em aberto aparece em Meu plano.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "A mila monta a planilha que você pedir",
        description: "Peça um fluxo de caixa, um controle de encomendas ou de metas e a mila cria a planilha no seu Google Planilhas, com abas, listas de escolha e fórmulas que fazem as contas sozinhas. Ela confere as fórmulas antes de mandar o link e ajusta a mesma planilha quando você pedir.",
      },
      {
        type: "new",
        plan: "all",
        title: "Tabelas sob medida no Notion",
        description: "Para listas e acompanhamento, como encomendas, cobranças ou revendedoras, a mila cria uma tabela dentro da página do Notion que você escolher.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Você escolhe onde salvar no Notion",
        description: "Antes de salvar o calendário de posts, a lista de fornecedores ou uma tabela nova, a mila mostra as páginas do seu Notion e pergunta em qual você quer guardar.",
      },
      {
        type: "new",
        plan: "pro",
        title: "Nota fiscal em PDF e em foto no balanço",
        description: "A nota de compra do mês em PDF entra sozinha no balanço, como o XML. Mandou uma foto da nota? A mila confere a chave e pergunta se registra a compra antes de gravar. A mesma nota nunca conta duas vezes.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Fatura em aberto em Meu plano",
        description: "Se o pagamento do plano atrasar, Meu plano mostra a fatura em aberto com o botão para pagar e até quando o WhatsApp segue funcionando.",
      },
      {
        type: "fix",
        plan: "all",
        title: "Foto da peça na vitrine pelo WhatsApp",
        description: "Mande a foto e diga qual é a peça: a mila guarda a imagem certa na vitrine. Se o nome servir para mais de uma peça, ela pergunta qual antes de trocar a foto.",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-10-22",
    title: "Dados da loja, concorrentes no Instagram e assinatura pela sua área",
    summary: "Veja e edite o que a mila usa nos seus preços, salve seus concorrentes no Instagram e assine o plano sem sair da sua área.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "Dados da loja num só lugar",
        description: "A nova página Dados da loja mostra a taxa usada no preço, o markup, a embalagem, o banho, o nome, o Instagram e as observações da sua loja. O que você salvar ali a mila usa na hora, e dá para mudar também pelo WhatsApp.",
      },
      {
        type: "new",
        plan: "pro",
        title: "Seus concorrentes no Instagram, salvos",
        description: "Guarde até 3 perfis de concorrentes em Dados da loja ou pelo WhatsApp. A análise do nicho usa esses perfis e sempre diz em quais se baseou.",
      },
      {
        type: "new",
        plan: "pro",
        title: "Leitura do nicho no Instagram",
        description: "Pergunte o que está bombando no ramo e a mila mostra o formato que mais performa nos concorrentes, o post de maior engajamento e as hashtags com o tamanho real de cada uma. São até 4 análises por mês.",
      },
      {
        type: "new",
        plan: "all",
        title: "Assinatura pela sua área",
        description: "Em Meu plano você escolhe o plano e paga no Asaas por Pix, boleto ou cartão. Quando o pagamento cai, o plano entra na hora no WhatsApp e aqui.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Meu plano mostra o que está incluído",
        description: "A lista de cada plano foi revisada para mostrar exatamente o que a mila faz, incluindo a calculadora de custo da peça comprada no bruto.",
      },
    ],
  },
  {
    version: "0.2.1",
    date: "2026-10-20",
    title: "Integrações mais claras e novidades à mão",
    summary: "Conheça as conexões da Mila na página inicial e acompanhe as novidades sem sair da sua área.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Um mapa das ferramentas que você pode conectar",
        description: "A página inicial mostra a Mila no centro das integrações, com conexões animadas e uma descrição do uso de cada ferramenta, como a lista de fornecedores.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Atualizações em um painel lateral",
        description: "O botão Atualizações abre as novidades mais recentes com datas e versões. O histórico completo continua disponível na sua área.",
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-10-15",
    title: "Concorrentes da sua região, pesquisa de fornecedores e integrações",
    summary: "A mila agora mapeia concorrentes na sua cidade, levanta fichas de fornecedores e sincroniza catálogo com ERPs e loja virtual.",
    changes: [
      {
        type: "new",
        plan: "all",
        title: "Mapeamento de concorrentes locais no WhatsApp",
        description: "Basta informar a sua cidade e a mila localiza os concorrentes reais de joias e semijoias da sua região, com nomes, endereços e canais de atendimento direto na conversa.",
      },
      {
        type: "new",
        plan: "pro",
        title: "Pesquisa de fornecedores com ficha completa",
        description: "A mila investiga fornecedores na web e levanta dados de banho, milésimos e tempo de garantia para você organizar suas compras e reposições no Notion ou Google Planilhas.",
      },
      {
        type: "improvement",
        plan: "pro",
        title: "Sincronização de catálogo com fotos reais",
        description: "Cadastre e atualize produtos na Nuvemshop e nos ERPs Jueri e Olist/Tiny enviando as fotos diretamente pelo chat do WhatsApp, com cálculo de margem e códigos SKU organizados.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Painel de conexões mais claro por plano",
        description: "Identificação visual imediata das ferramentas disponíveis para a sua loja e dos conectores exclusivos do Plano Pro.",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-09",
    title: "Sua loja, com tudo mais fácil de encontrar",
    summary: "Uma atualização na navegação e na organização das integrações.",
    changes: [
      {
        type: "improvement",
        plan: "all",
        title: "Um menu mais simples, no computador e no celular",
        description: "O menu lateral recolhe pelo botão, identifica cada ícone e dá mais destaque ao WhatsApp. As opções da conta ficam no seu perfil, e o menu no celular tem uma abertura mais suave.",
      },
      {
        type: "improvement",
        plan: "all",
        title: "Suas ferramentas, mais fáceis de reconhecer",
        description: "As integrações agora mostram os ícones das ferramentas e estão organizadas por uso. Você pode consultar como seus dados são usados em cada ferramenta, separadamente.",
      },
      {
        type: "new",
        plan: "all",
        title: "Um lugar para acompanhar as atualizações",
        description: "A versão da mila aparece junto de Atualizações no topo da tela. Aqui você encontra a data e o resumo do que mudou em cada versão.",
      },
    ],
  },
];

/** O que a lojista vê: página de Atualizações, sino, visão geral e aviso de não lido. */
export const PUBLIC_RELEASES: readonly Release[] = RELEASES.filter((release) => !release.internal);
export const LATEST_PUBLIC: Release | undefined = PUBLIC_RELEASES[0];

function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
}

/**
 * Há novidade não lida quando a última versão vista é anterior à última
 * pública. Comparar por ordem (e não por diferença) evita aviso falso depois
 * de um deploy só de acabamento, inclusive para quem já viu uma versão interna.
 */
export function hasUnreadRelease(lastSeen: string | null) {
  if (!LATEST_PUBLIC) return false;
  if (!lastSeen || !/^\d+\.\d+\.\d+$/.test(lastSeen)) return true;
  return compareVersions(lastSeen, LATEST_PUBLIC.version) < 0;
}

export const RELEASE_PLAN_LABELS: Record<ReleaseChange["plan"], string> = {
  all: "Essencial e Pro",
  pro: "Plano Pro",
};

export const RELEASE_CHANGE_LABELS: Record<ReleaseChange["type"], string> = {
  new: "Novo",
  improvement: "Melhoria",
  fix: "Correção",
};
