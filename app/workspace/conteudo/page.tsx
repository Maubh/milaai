import { redirect } from "next/navigation";

/** Conteúdo e legendas acontecem no WhatsApp. Rotas antigas caem na visão geral. */
export default function ConteudoPage() {
  redirect("/workspace");
}
