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
};

// Newest first. Preserve published entries when adding the next release.
export const RELEASES: readonly Release[] = [
  {
    version: "0.5.1",
    date: "2026-10-24",
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

export const RELEASE_PLAN_LABELS: Record<ReleaseChange["plan"], string> = {
  all: "Essencial e Pro",
  pro: "Plano Pro",
};

export const RELEASE_CHANGE_LABELS: Record<ReleaseChange["type"], string> = {
  new: "Novo",
  improvement: "Melhoria",
  fix: "Correção",
};
