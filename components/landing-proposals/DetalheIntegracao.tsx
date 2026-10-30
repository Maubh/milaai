import { GOOGLE_DESC } from "@/lib/google-workspace";
import type { IntegracaoPublica } from "@/lib/landing-proposals";
import { NOTION_DESC } from "@/lib/notion";
import { PlusIcon } from "./Icons";

/** Texto completo da fonte única de Google e Notion, recolhido num disclosure nativo. */
export default function DetalheIntegracao({ id }: { id: IntegracaoPublica["id"] }) {
  if (id !== "google" && id !== "notion") return null;
  return (
    <details className="lp-detalhe">
      <summary>
        <span>{id === "google" ? "Detalhes do Google" : "Detalhes do Notion"}</span>
        <PlusIcon size={16} className="lp-detalhe-icone" />
      </summary>
      <p>{id === "google" ? GOOGLE_DESC : NOTION_DESC}</p>
    </details>
  );
}
