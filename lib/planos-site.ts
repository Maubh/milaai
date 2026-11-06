/** Chave da contratação pelo site e preços dos planos. Sem dependências: a página inicial, a tabela de planos e Meu plano leem daqui. */

/**
 * Contratação pelo site. Fechada desde 06/11/2026: os valores dos planos ainda
 * não estão definidos e só os pilotos, liberados à mão, usam a mila. Fechada,
 * nenhuma tela mostra preço nem botão de contratar, e o Eve recusa o pedido
 * (`CONTRATACAO_PELO_SITE` em `agent/lib/entitlements.ts`, que devolve
 * `409 hiring_paused`). Para reabrir, vire as duas chaves e preencha PRECOS.
 */
export const CONTRATACAO_ABERTA = false;

/** Preço mensal de cada plano, em reais. `null`: não aparece em lugar nenhum. */
export const PRECOS: Record<"essencial" | "pro", string | null> = { essencial: null, pro: null };

/** Contato da equipe enquanto a contratação pelo site está fechada. */
export const CONTATO_MILA = "contato@milaai.com.br";
