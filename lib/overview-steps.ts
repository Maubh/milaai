/**
 * Próximos passos e mensagens prontas da visão geral — puro e testável.
 *
 * Cada passo nasce de um dado explícito de uma leitura que respondeu: campo
 * ausente é desconhecido e não vira conclusão. Cada passo diz de onde vem.
 */

import { GROUPS, visibleCatalog, type ProviderLive } from "./integration-catalog.ts";
import { META_SOURCES } from "./meta-catalog.ts";
import { formatTrialEnd, readPlanStatus, type PlanSession } from "./plan-status.ts";

export type Load<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

export interface Step {
  id: string;
  /** Integração ou assunto de onde o passo vem, visível na tela. */
  origin: string;
  text: string;
  href: string;
  action: string;
}

export const ORIGIN = {
  plan: "Conta · Plano",
  meta: "Meta · Catálogo do Instagram e Facebook",
  integrations: "Integrações da loja",
} as const;

const META_HREF = "/workspace/integracoes#integracao-meta";
const CATALOG = GROUPS.flatMap((g) => g.providers.map((id) => ({ id })));

/**
 * Ferramentas visíveis com conexão confirmada pelo vault. A contagem do tile e
 * a sugestão de conectar a primeira saem daqui, para a tela não se contradizer.
 */
export function connectedTools(providers: readonly ProviderLive[]): { ids: string[]; complete: boolean } {
  const byId = new Map(providers.map((p) => [p.id, p]));
  const visible = visibleCatalog(CATALOG, byId);
  return {
    ids: visible.filter((i) => byId.get(i.id)?.connected === true).map((i) => i.id),
    // Ferramenta que voltou na lista sem `connected` é desconhecida: sem ela, zero não é prova.
    // Fora da lista é não conectada; ids fora do catálogo não entram.
    complete: visible.every((i) => !byId.has(i.id) || typeof byId.get(i.id)?.connected === "boolean"),
  };
}

function planSteps(session: PlanSession, now: Date): Step[] {
  const plan = readPlanStatus(session, now);
  const steps: Step[] = [];
  // A data de referência do piloto decide botões, mas não prova que o teste
  // acabou: só o billing explícito ou uma data real vencida sustentam o aviso.
  const ended = plan.kind === "trial_ended" && (session.billing === "trial_expirado" || (!!plan.trialEnd && now > plan.trialEnd));
  if (ended) steps.push({ id: "plan-ended", origin: ORIGIN.plan, text: "Seu teste terminou. Escolha um plano para continuar.", href: "/workspace/plano", action: "Ver plano" });
  if (plan.kind === "trial" && plan.trialEnd) steps.push({ id: "plan-trial", origin: ORIGIN.plan, text: `Seu teste sem cobrança vai até ${formatTrialEnd(plan.trialEnd)}.`, href: "/workspace/plano", action: "Ver plano" });
  return steps;
}

function metaSteps(providers: readonly ProviderLive[]): Step[] {
  const meta = providers.find((p) => p.id === "meta");
  if (meta?.connected !== true) return [];
  if (meta.product_source === null || (typeof meta.product_source === "string" && !meta.product_source.trim())) {
    return [{ id: "meta-source", origin: ORIGIN.meta, text: "Escolha de onde vêm os produtos do catálogo.", href: META_HREF, action: "Configurar" }];
  }
  const source = META_SOURCES.find((s) => s.id === meta.product_source);
  if (!source) return [];
  if (source.providerId) {
    const tool = providers.find((p) => p.id === source.providerId);
    if (tool?.connected === false) {
      const name = tool.name || source.nome;
      return [{ id: "meta-source-off", origin: ORIGIN.meta, text: `A fonte do catálogo (${name}) não está conectada. Conecte ${name} ou troque a fonte.`, href: META_HREF, action: "Configurar" }];
    }
    if (tool?.connected !== true) return [];
  }
  if (meta.last_sync_at === null) {
    return [{ id: "meta-sync", origin: ORIGIN.meta, text: "Ainda não há registro de sincronização do catálogo.", href: META_HREF, action: "Abrir o catálogo" }];
  }
  return [];
}

export interface StepsReading {
  steps: Step[];
  loading: boolean;
  /** Leituras que ainda não responderam: só elas viram espera na lista. */
  pending: Array<"plan" | "integrations">;
  /** Leituras que falharam, para um aviso só e preciso. */
  failed: Array<"plan" | "integrations">;
}

export function overviewSteps(session: Load<PlanSession>, providers: Load<ProviderLive[]>, now: Date = new Date()): StepsReading {
  const plan = session.status === "ready" ? planSteps(session.data, now) : [];
  const tools = providers.status === "ready" ? providers.data : null;
  const meta = tools ? metaSteps(tools) : [];
  const reach = tools ? connectedTools(tools) : null;
  const empty: Step[] = reach?.complete && !reach.ids.length
    ? [{ id: "integrations-first", origin: ORIGIN.integrations, text: "Nenhuma ferramenta conectada ainda. Conecte a primeira para a mila ler a loja.", href: "/workspace/integracoes", action: "Ver integrações" }]
    : [];
  const ended = plan.filter((s) => s.id === "plan-ended");
  const trial = plan.filter((s) => s.id === "plan-trial");
  const failed: StepsReading["failed"] = [];
  if (session.status === "error") failed.push("plan");
  if (providers.status === "error") failed.push("integrations");
  const pending: StepsReading["pending"] = [];
  if (session.status === "loading") pending.push("plan");
  if (providers.status === "loading") pending.push("integrations");
  return {
    steps: [...ended, ...meta, ...empty, ...trial],
    loading: pending.length > 0,
    pending,
    failed,
  };
}

export function failureText(failed: StepsReading["failed"]): string | null {
  if (failed.length === 2) return "Não deu para ler o plano e as integrações agora.";
  if (failed[0] === "plan") return "Não deu para ler o plano agora.";
  if (failed[0] === "integrations") return "Não deu para ler as integrações agora.";
  return null;
}

/**
 * Mensagens prontas: assunto geral da mila, sem atribuir a uma integração, e só
 * tarefas que os dois planos incluem (Essencial e Pro, `components/PricingSection.tsx`):
 * precificação, descrição de peça para loja virtual e leitura de nota de compra.
 * Conteúdo de Instagram é do Pro e fica de fora.
 */
export const STARTERS = [
  { id: "preco", context: "Mila · Precificação", label: "Calcular o preço de uma peça", text: "Oi, mila. Quero calcular o preço de uma peça." },
  { id: "descricao", context: "Mila · Produtos", label: "Escrever a descrição de uma peça", text: "Oi, mila. Quero escrever a descrição de uma peça para minha loja virtual." },
  { id: "nota", context: "Mila · Compras", label: "Ler uma nota de compra", text: "Oi, mila. Quero que você leia uma nota de compra." },
] as const;

/** O mesmo link verificado, só com outra frase de abertura. Link inválido volta inteiro. */
export function withText(link: string, text: string): string {
  try {
    const url = new URL(link);
    url.searchParams.set("text", text);
    // Espaço como %20, igual ao link padrão (`encodeURIComponent`); "+" literal já sai como %2B.
    url.search = url.searchParams.toString().replace(/\+/g, "%20");
    return url.toString();
  } catch {
    return link;
  }
}
