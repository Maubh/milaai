import { redirect } from "next/navigation";

/** Precificação acontece no WhatsApp. Rotas antigas caem na visão geral. */
export default function PrecificacaoPage() {
  redirect("/workspace");
}
