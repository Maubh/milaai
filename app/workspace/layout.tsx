import { redirect } from "next/navigation";
import { currentSessionToken } from "@/lib/server/mila-oauth";
import { WORKSPACE_LOGIN_REDIRECT, shouldRedirectToLogin } from "@/lib/workspace-gate";
import WorkspaceShell from "@/components/WorkspaceShell";
import "./workspace.css";

export const runtime = "nodejs";
// O gate depende do cookie, então nada aqui pode ser servido de cache:
// sem isto a Vercel guarda o HTML pronto (x-nextjs-prerender) e passa a
// servir a página de uma loja para outra assim que houver dado por loja.
export const dynamic = "force-dynamic";

/**
 * Porta do workspace.
 *
 * O crachá é o cookie HttpOnly (`mila_session`), emitido pelo serviço de auth
 * só depois do código do WhatsApp. Quem não tem cookie é mandado ao login aqui,
 * no servidor — antes de qualquer HTML sair. O `localStorage` deixou de
 * autorizar: ele era a única fechadura e qualquer um o escreve à mão.
 *
 * Sem chamada ao VPS de propósito: validar o token opaco custaria uma ida ao
 * serviço em toda navegação, e o dado real já é fail-closed (as rotas BFF
 * devolvem 401 sem sessão). Aqui só se decide se a porta abre.
 */
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const token = await currentSessionToken();
  if (shouldRedirectToLogin(token)) {
    // Só ausência de crachá cai aqui. Falha do VPS não redireciona: quem trata
    // é a página, mostrando erro — senão o retorno do OAuth (?ok= / ?erro=)
    // morre num bounce e parece um loop de login.
    redirect(WORKSPACE_LOGIN_REDIRECT);
  }
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
