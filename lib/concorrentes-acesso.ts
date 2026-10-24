/**
 * Acesso à seção de concorrentes em Dados da loja (módulo puro).
 *
 * Só a resposta do serviço decide: `analise_no_plano === true` libera a
 * edição e `false` mostra a seção do Pro. Falha de leitura ou campo ausente
 * não vira conclusão: a tela diz "Não verificado" e oferece ler de novo.
 */
export type AcessoConcorrentes = "liberado" | "bloqueado" | "nao_verificado";

export function acessoConcorrentes(respostaOk: boolean, analiseNoPlano: unknown): AcessoConcorrentes {
  if (!respostaOk) return "nao_verificado";
  if (analiseNoPlano === true) return "liberado";
  if (analiseNoPlano === false) return "bloqueado";
  return "nao_verificado";
}
