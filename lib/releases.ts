import packageJson from "../package.json" with { type: "json" };

export const SYSTEM_VERSION = packageJson.version;

export type ReleaseChange = {
  type: "new" | "improvement" | "fix";
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
    version: "0.2.0",
    date: "2026-10-15",
    title: "Concorrentes da sua região, pesquisa de fornecedores e integrações",
    summary: "A mila agora mapeia concorrentes na sua cidade, levanta fichas de fornecedores e sincroniza catálogo com ERPs e loja virtual.",
    changes: [
      {
        type: "new",
        title: "Mapeamento de concorrentes locais no WhatsApp",
        description: "Basta informar a sua cidade e a mila localiza os concorrentes reais de joias e semijoias da sua região, com nomes, endereços e canais de atendimento direto na conversa.",
      },
      {
        type: "new",
        title: "Pesquisa de fornecedores com ficha completa",
        description: "A mila investiga fornecedores na web e levanta dados de banho, milésimos e tempo de garantia para você organizar suas compras e reposições no Notion ou Google Planilhas.",
      },
      {
        type: "improvement",
        title: "Sincronização de catálogo com fotos reais",
        description: "Cadastre e atualize produtos na Nuvemshop e nos ERPs Jueri e Olist/Tiny enviando as fotos diretamente pelo chat do WhatsApp, com cálculo de margem e códigos SKU organizados.",
      },
      {
        type: "improvement",
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
        title: "Um menu mais simples, no computador e no celular",
        description: "O menu lateral recolhe pelo botão, identifica cada ícone e dá mais destaque ao WhatsApp. As opções da conta ficam no seu perfil, e o menu no celular tem uma abertura mais suave.",
      },
      {
        type: "improvement",
        title: "Suas ferramentas, mais fáceis de reconhecer",
        description: "As integrações agora mostram os ícones das ferramentas e estão organizadas por uso. Você pode consultar como seus dados são usados em cada ferramenta, separadamente.",
      },
      {
        type: "new",
        title: "Um lugar para acompanhar as atualizações",
        description: "A versão da mila aparece junto de Atualizações no topo da tela. Aqui você encontra a data e o resumo do que mudou em cada versão.",
      },
    ],
  },
];

export const RELEASE_CHANGE_LABELS: Record<ReleaseChange["type"], string> = {
  new: "Novo",
  improvement: "Melhoria",
  fix: "Correção",
};
